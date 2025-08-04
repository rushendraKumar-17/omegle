import React, { useEffect, useState } from 'react';
import { emit, getSocket } from '../services/socket';

const formatTime = (date) => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const Chat = () => {
  const socket = getSocket();
  const [remoteUser, setRemoteUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [myId, setMyId] = useState(null);

  const sendMessage = () => {
    if (!message.trim()) return;
    const time = new Date().toISOString();
    const newMessage = { sender: myId, message, time };
    emit("send-message", { receiver: remoteUser, message, time });
    setMessages(prev => [...prev, newMessage]);
    setMessage("");
  };

  useEffect(() => {
    emit("connect-to-chat", {});
    socket.on("connected-to-chat", ({ peerId, myId }) => {
      setRemoteUser(peerId);
      setMyId(myId);
    });

    socket.on("new-message", (data) => {
      // If time is missing (not sent by server), add it
      if (!data.time) data.time = new Date().toISOString();
      setMessages(prev => [...prev, data]);
    });

    socket.on("user-disconnected", ({ peerId }) => {
      console.log("User disconnected");
      setRemoteUser(null);
      emit("connect-to-chat",{});
    })
    return () => {
      socket.off("connected-to-chat");
      socket.off("new-message");
    };
  }, []);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div style={styles.container}>
      <h2>{remoteUser ? "Connected "  : "Connecting..."}</h2>
      <div style={styles.chatBox}>
        {messages.map((msg, i) => (
          <div
            key={i}
            style={{
              ...styles.message,
              alignSelf: msg.sender === myId ? 'flex-end' : 'flex-start',
              backgroundColor: msg.sender === myId ? '#dcf8c6' : '#f1f0f0'
            }}
          >
            <div style={styles.meta}>
              <span style={{fontWeight: 'bold'}}>
                {msg.sender === myId ? "You" : "Stranger"}
              </span>
              <span style={styles.time}>
                {formatTime(msg.time)}
              </span>
            </div>
            <div>{msg.message}</div>
          </div>
        ))}
      </div>
      <div style={styles.inputWrapper}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message"
          style={styles.input}
        />
        <button onClick={sendMessage} style={styles.button}>Send</button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    maxWidth: 500,
    margin: '0 auto',
    display: 'flex',
    flexDirection: 'column',
    height: '100vh'
  },
  chatBox: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    border: '1px solid #ccc',
    padding: 10,
    marginBottom: 10,
    overflowY: 'auto',
    borderRadius: 8,
    backgroundColor: '#fafafa'
  },
  message: {
    padding: 10,
    borderRadius: 16,
    maxWidth: '70%',
    marginBottom: 8,
    wordBreak: 'break-word',
  },
  meta: {
    fontSize: 12,
    color: '#555',
    marginBottom: 4,
    display: 'flex',
    justifyContent: 'space-between'
  },
  time: {
    marginLeft: 10,
    fontStyle: 'italic'
  },
  inputWrapper: {
    display: 'flex',
    gap: 8,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    border: '1px solid #ccc'
  },
  button: {
    padding: '10px 16px',
    borderRadius: 8,
    border: 'none',
    backgroundColor: '#4caf50',
    color: '#fff',
    cursor: 'pointer'
  }
};

export default Chat;
