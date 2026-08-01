import { useEffect, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);

  useEffect(() => {
  socket.on("connect", () => setIsConnected(true));
  socket.on("disconnect", () => setIsConnected(false));

  socket.on("user-joined", (userId) => {
    console.log("New user joined the room:", userId);
  });

  socket.on("existing-users", (userIds) => {
    console.log("Users already in the room:", userIds);
  });

  return () => {
    socket.off("connect");
    socket.off("disconnect");
    socket.off("user-joined");
    socket.off("existing-users");
  };
}, []);

  const handleJoinRoom = () => {
    if (roomId.trim() === "") return;
    socket.emit("join-room", roomId);
    setJoined(true);
  };

  return (
    <div>
      <h2>Video Conference App</h2>
      <p>Status: {isConnected ? "Connected ✅" : "Disconnected ❌"}</p>

      {!joined ? (
        <div>
          <input
            value={roomId}
            onChange={(e) => setRoomId(e.target.value)}
            placeholder="Enter meeting ID"
          />
          <button onClick={handleJoinRoom}>Join Room</button>
        </div>
      ) : (
        <p>You are in room: {roomId}</p>
      )}
    </div>
  );
}

export default App;