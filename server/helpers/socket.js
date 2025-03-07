const { Server } = require("socket.io");
const http = require("http");
const express = require("express");
const { connection } = require("mongoose");

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

function getReceiverSocketId(userId) {
  return userSocketMap[userId];
}

const userSocketMap = {};

io.on("connection", (socket) => {
  console.log("a user connected", socket.id);

  const userId = socket.handshake.query.userId;
  userSocketMap[userId] = socket.id;

  socket.on("disconnect", () => {
    console.log("a user disconnnected", socket.id);
  });
});

module.exports = { io, app, server, getReceiverSocketId };
