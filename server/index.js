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
    // Get list of sockets already in the room, BEFORE we add ourselves
    const room = io.sockets.adapter.rooms.get(roomId);
    const existingUsers = room ? Array.from(room) : [];

    socket.join(roomId);
    console.log(`${socket.id} joined room: ${roomId}`);

    // Tell the NEW user who is already here
    socket.emit("existing-users", existingUsers);

    // Tell EXISTING users that a new person joined
    socket.to(roomId).emit("user-joined", socket.id);
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