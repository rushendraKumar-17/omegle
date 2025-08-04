import express from 'express';
import { createServer } from 'http';
import { Server } from 'socket.io';
import { config } from 'dotenv';

config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

const chatQueue = new Set();
const callQueue = new Set();
const chatPairs = new Map();
const PORT = process.env.PORT || 8000;

app.get('/', (_, res) => {
  res.send('<h1>🔧 Stranger Chat/Call Server is Running</h1>');
});

io.on('connection', (socket) => {
  console.log(`🔌 Connected: ${socket.id}`);

  // ------ 🗣️ Connect to Chat ------
  socket.on("connect-to-chat", () => {
    if (chatQueue.has(socket.id)) return; // prevent duplicates
    console.log(`🗨️ ${socket.id} wants to chat`);

    const waiting = [...chatQueue].find(id => id !== socket.id);
    if (waiting) {
      chatQueue.delete(waiting);
      chatPairs.set(socket.id, waiting);
      chatPairs.set(waiting, socket.id);

      socket.emit('connected-to-chat', { peerId: waiting, myId: socket.id });
      io.to(waiting).emit('connected-to-chat', { peerId: socket.id, myId: waiting });

      console.log(`🔗 Chat Paired: ${socket.id} & ${waiting}`);
    } else {
      chatQueue.add(socket.id);
      console.log(`⏳ ${socket.id} added to chat queue`);
    }
  });

  // ------ 📞 Connect to Call ------
  socket.on("connect-to-call", () => {
    if (callQueue.has(socket.id)) return; // prevent duplicates
    console.log(`📞 ${socket.id} wants to call`);

    const waiting = [...callQueue].find(id => id !== socket.id);
    if (waiting) {
      callQueue.delete(waiting);
      socket.emit('connected-to-call', { peerId: waiting });
      io.to(waiting).emit('connected-to-call', { peerId: socket.id,initiate:true });

      console.log(`🔗 Call Paired: ${socket.id} & ${waiting}`);
    } else {
      callQueue.add(socket.id);
      console.log(`⏳ ${socket.id} added to call queue`);
    }
  });
  socket.on('signal', ({ to, data }) => {
    io.to(to).emit('signal', { from: socket.id, data });
  });

  // ------ 💬 Message Forwarding ------
  socket.on("send-message", ({ receiver, message, time }) => {
    io.to(receiver).emit("new-message", {
      sender: socket.id,
      message,
      time: time || new Date().toISOString()
    });
  });

  // ------ ❌ Disconnect Handling ------
  socket.on('disconnect', () => {
    console.log(`❌ Disconnected: ${socket.id}`);
    chatQueue.delete(socket.id);
    callQueue.delete(socket.id);

    const pairedId = chatPairs.get(socket.id);
    if (pairedId) {
      io.to(pairedId).emit('user-disconnected', { peerId: socket.id });
      chatPairs.delete(pairedId);
      chatPairs.delete(socket.id);
      chatQueue.add(pairedId); // Requeue the peer if desired
      console.log(`🔄 Requeued ${pairedId}`);
    }
  });
});

server.listen(PORT, () => {
  console.log(`🚀 Server running at http://localhost:${PORT}`);
});
