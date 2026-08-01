const express = require("express");
const http = require("http");
const cors = require("cors");
const { Server } = require("socket.io");
require("dotenv").config();

const app = express();
app.use(cors());

const server = http.createServer(app);

// Attach Socket.io to the same HTTP server
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173", // your React app's URL
    methods: ["GET", "POST"],
  },
});

// This runs every time a new browser connects
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  socket.on("join-room", (roomId) => {
    const room = io.sockets.adapter.rooms.get(roomId);
    const existingUsers = room ? Array.from(room) : [];

    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);

    socket.emit("existing-users", existingUsers);
    socket.to(roomId).emit("user-joined", socket.id);
  });

  // NEW: relay WebRTC signaling messages directly to a specific person
  socket.on("offer", ({ to, offer }) => {
    io.to(to).emit("offer", { from: socket.id, offer });
  });

  socket.on("answer", ({ to, answer }) => {
    io.to(to).emit("answer", { from: socket.id, answer });
  });

  socket.on("ice-candidate", ({ to, candidate }) => {
    io.to(to).emit("ice-candidate", { from: socket.id, candidate });
  });

  socket.on("disconnect", () => {
    console.log("A user disconnected:", socket.id);
  });
});
app.get("/", (req, res) => {
  res.send("Server is running");
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});