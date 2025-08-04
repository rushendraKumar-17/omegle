import { io } from "socket.io-client";

let socketInstance;

export const getSocket = () => {
  if (!socketInstance) {
    socketInstance = io(import.meta.env.VITE_BACKEND_URL);
    console.log("connected to socket",import.meta.env.VITE_BACKEND_URL);
  }
  return socketInstance;
};

export const emit = (eventName, data) => {
  getSocket().emit(eventName, data);
  console.log("Emitted event",eventName);
};

export const on = (eventName, callback) => {
  getSocket().on(eventName, callback);
};

