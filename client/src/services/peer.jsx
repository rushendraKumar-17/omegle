import { useState, useEffect, useRef } from 'react';
import Peer from 'simple-peer';

const usePeerConnection = (stream, roomId, socket, isInitiator = false) => {
  const [remoteStream, setRemoteStream] = useState(null);
  const peerRef = useRef(null);

  useEffect(() => {
    if (!stream || !roomId || !socket) return;

    console.log('🎬 Setting up peer. Initiator:', isInitiator);

    const peer = new Peer({
      initiator: isInitiator,
      trickle: false,
      stream,
    });

    peerRef.current = peer;

    peer.on('signal', (signalData) => {
      console.log('📡 Emitting signal');
      socket.emit('signal', { roomId, signal: signalData });
    });

    peer.on('stream', (remote) => {
      console.log('🎥 Received remote stream');
      setRemoteStream(remote);
    });

    peer.on('error', (err) => {
      console.error('❌ Peer error:', err);
    });

    peer.on('close', () => {
      console.log('📴 Peer connection closed');
      setRemoteStream(null);
      peerRef.current = null;
    });

    return () => {
      console.log('🧹 Cleaning up peer');
      peer.destroy();
    };
  }, [stream, roomId, socket, isInitiator]);

  useEffect(() => {
    const handleSignal = ({ signal }) => {
      console.log('📨 Received signal');
      if (peerRef.current) {
        peerRef.current.signal(signal);
      }
    };

    socket.on('signal', handleSignal);

    return () => {
      socket.off('signal', handleSignal);
    };
  }, [socket]);

  return {
    peer: peerRef.current,
    remoteStream,
    destroy: () => {
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    },
  };
};

export default usePeerConnection;
