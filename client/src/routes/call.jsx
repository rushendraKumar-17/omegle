import React, { useRef, useEffect, useState, useCallback } from "react";
import Peer from "simple-peer";
import { emit, getSocket, on } from "../services/socket";

const Call = () => {
  const socket = getSocket();
  const localVideoRef = useRef();
  const remoteVideoRef = useRef();
  const [stream, setStream] = useState(null);
  const [strangerConnected, setStrangerConnected] = useState(false);
  const peerRef = useRef(null);
  const [myId, setMyId] = useState(socket.id);
  const [remotePeerId, setRemotePeerId] = useState(null);
  const [isStreamReady, setIsStreamReady] = useState(false);
  const pendingPeerCreation = useRef(null);

  // 📹 Get camera and micaa
  const getUserStream = async () => {
    try {
      const media = await navigator.mediaDevices.getUserMedia({ audio: true, video: true });
      setStream(media);
      setIsStreamReady(true);
      if (localVideoRef.current) localVideoRef.current.srcObject = media;
      
      console.log("🎥 Local media stream acquired", media);
      emit("connect-to-call");
      return media;
    } catch (err) {
      console.error("⚠️ Failed to get media:", err);
      return null;
    }
  };

  // 👤 Create initiator peer
  const createInitiatorPeer = (peerId, mediaStream) => {
    try {
      console.log("Creating initiator peer with stream:", mediaStream);
      const peer = new Peer({ initiator: true,  stream: mediaStream });
      peerRef.current = peer;

      peer.on("signal", (signal) => {
        console.log("📡 Sending signal to:", peerId);
        emit("signal", { to: peerId, data: signal });
      });

      peer.on("stream", (remote) => {
        console.log("📺 Received remote stream");
        if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
      });

      peer.on("error", (err) => console.error("❌ Peer error:", err));
      peer.on("close", () => {
        console.log("📴 Peer closed");
        setStrangerConnected(false);
      });

      return peer;
    } catch (err) {
      console.error("❌ Failed to create peer:", err);
      return null;
    }
  };

  // 👤 Create receiver peer
  const createReceiverPeer = (remotePeerId, mediaStream) => {
    console.log("Creating receiver peer with stream:", mediaStream);
    
    const peer = new Peer({ initiator: false, trickle: false, stream: mediaStream });

    peerRef.current = peer;

    peer.on("signal", (signal) => {
      console.log("📡 Sending signal to:", remotePeerId);
      emit("signal", { to: remotePeerId, data: signal });
    });

    peer.on("stream", (remote) => {
      console.log("📺 Received remote stream");
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remote;
    });

    peer.on("error", (err) => console.error("❌ Peer error:", err));
    peer.on("close", () => {
      console.log("📴 Peer closed");
      setStrangerConnected(false);
    });

    return peer;
  };

  // 📡 Handle incoming signal - useCallback to prevent stale closures
  const handleSignal = useCallback(({ from, data }) => {
    console.log("📡 Received signal from:", from);
    
    if (!peerRef.current) {
      // Create receiver peer if it doesn't exist
      if (isStreamReady && stream) {
        createReceiverPeer(from, stream);
      } else {
        console.error("❌ No stream available for peer creation");
        return;
      }
    }
    
    try {
      peerRef.current.signal(data);
    } catch (err) {
      console.error("❌ Error processing signal:", err);
    }
  }, [stream, isStreamReady]); // Include both stream and isStreamReady as dependencies

  // 🔗 Handle pairing as initiator - useCallback to prevent stale closures
  const handleConnectedToCall = useCallback(({ peerId, initiate }) => {
    console.log("🔗 Connected to:", peerId, "Initiate:", initiate);
    console.log("Stream ready:", isStreamReady, "Stream:", stream);
    setStrangerConnected(true);
    setRemotePeerId(peerId);
    
    if (initiate) {
      if (isStreamReady && stream) {
        console.log("Creating initiator peer connection with stream");
        createInitiatorPeer(peerId, stream);
      } else {
        console.log("Stream not ready, storing peer creation request");
        pendingPeerCreation.current = { peerId, initiate: true };
      }
    }
  }, [stream, isStreamReady]); // Include both stream and isStreamReady as dependencies

  // Effect to handle pending peer creation when stream becomes ready
  useEffect(() => {
    if (isStreamReady && stream && pendingPeerCreation.current) {
      const { peerId, initiate } = pendingPeerCreation.current;
      console.log("Stream now ready, creating pending peer connection");
      
      if (initiate) {
        createInitiatorPeer(peerId, stream);
      }
      
      pendingPeerCreation.current = null; // Clear pending request
    }
  }, [isStreamReady, stream]);

  // Cleanup function
  const cleanup = useCallback(() => {
    // Stop all tracks in the stream
    if (stream) {
      stream.getTracks().forEach(track => {
        track.stop();
        console.log("🛑 Stopped track:", track.kind);
      });
    }

    // Destroy peer connection
    if (peerRef.current) {
      peerRef.current.destroy();
      peerRef.current = null;
    }

    // Clear video elements
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
  }, [stream]);

  // Initialize call and set up listeners
  useEffect(() => {
    // let mounted = true;

    const initCall = async () => {
      const mediaStream = await getUserStream();
      // if (!mounted) return;
    };

    initCall();

    // return () => {
    //   mounted = false;
    //   cleanup();
    // };
  }, []); // Run once on mount

  // Set up socket listeners when handlers change
  useEffect(() => {
    on("connected-to-call", handleConnectedToCall);
    on("signal", handleSignal);

    return () => {
      const socket = getSocket();
      socket.off("connected-to-call", handleConnectedToCall);
      socket.off("signal", handleSignal);
    };
  }, [handleConnectedToCall, handleSignal]); // Re-register when handlers change

  // Handle stream changes
  useEffect(() => {
    if (stream && peerRef.current) {
      // Replace tracks in existing peer connection
      const videoTrack = stream.getVideoTracks()[0];
      const audioTrack = stream.getAudioTracks()[0];
      
      if (videoTrack && peerRef.current._pc) {
        const sender = peerRef.current._pc.getSenders().find(s => 
          s.track && s.track.kind === 'video'
        );
        if (sender) {
          sender.replaceTrack(videoTrack).catch(err => 
            console.error("Error replacing video track:", err)
          );
        }
      }
      
      if (audioTrack && peerRef.current._pc) {
        const sender = peerRef.current._pc.getSenders().find(s => 
          s.track && s.track.kind === 'audio'
        );
        if (sender) {
          sender.replaceTrack(audioTrack).catch(err => 
            console.error("Error replacing audio track:", err)
          );
        }
      }
    }
  }, [stream]); // Now properly depends on stream

  return (
    <div className="video-container">
      <div className="video-wrapper">
        <video autoPlay muted ref={localVideoRef} className="video" />
      </div>

      <div className="video-wrapper remote-video">
        <video autoPlay ref={remoteVideoRef} className="video" />

        {!strangerConnected && (
          <div className="loader-overlay">
            <div className="loader"></div>
            <p>Searching for a stranger...</p>
          </div>
        )}
      </div>

      <div>Chat</div>
    </div>
  );
};

export default Call;