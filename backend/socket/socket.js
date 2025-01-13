// socket.js

import { Server } from "socket.io";
import express from "express";
import http from "http";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000"],
    methods: ["GET", "POST"],
  },
});

// Map to store room information for each group
const groupRoomMap = {};

// Map to store socket IDs of online users
export const userSocketMap = {};

export const getReceiverSocketId = (receiverId) => userSocketMap[receiverId];

// Function to get the room name for a given group ID
const getGroupRoomName = (groupId) => `group-${groupId}`;

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  if (userId !== "undefined") {
    userSocketMap[userId] = socket.id;
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  }

  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
    delete userSocketMap[userId];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });

  // Join the room when a user connects
  socket.on("joinGroupRoom", (groupId) => {
    const roomName = getGroupRoomName(groupId);
    socket.join(roomName);
    groupRoomMap[userId] = roomName;
  });

  // Leave the room when a user disconnects
  socket.on("leaveGroupRoom", () => {
    const roomName = groupRoomMap[userId];
    if (roomName) {
      socket.leave(roomName);
      delete groupRoomMap[userId];
    }
  });

  // Private message handler
  socket.on("privateMessage", ({ receiverId, message }) => {
    const receiverSocketId = getReceiverSocketId(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("privateMessage", { senderId: userId, message });
    }
  });

  // Group message handler
  socket.on("groupMessage", ({ groupId, message }) => {
    const roomName = getGroupRoomName(groupId);
    io.to(roomName).emit("groupMessage", { senderId: userId, message });
    console.log(`User ${socket.id} joined room ${roomName}`);
  });
});

export { io, app, server, getGroupRoomName };
