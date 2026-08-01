import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState(null);
  const localVideoRef = useRef(null);

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));
    socket.on("user-joined", (userId) => console.log("New user joined:", userId));
    socket.on("existing-users", (userIds) => console.log("Existing users:", userIds));

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user-joined");
      socket.off("existing-users");
    };
  }, []);

  // NEW: whenever localStream OR joined changes, try attaching the stream
  useEffect(() => {
    if (joined && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [joined, localStream]);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream); // just save it to state, don't touch the DOM directly here
    } catch (err) {
      console.error("Error accessing camera/mic:", err);
    }
  };

  const handleJoinRoom = async () => {
    if (roomId.trim() === "") return;
    await startCamera();
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
        <div>
          <p>You're in room: {roomId}</p>
          <video ref={localVideoRef} autoPlay playsInline muted width="300" />
        </div>
      )}
    </div>
  );
}

export default App;