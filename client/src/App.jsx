import { useState } from "react";
import "./App.css";
import { useWebRTC } from "./hooks/useWebRTC";
import JoinScreen from "./components/JoinScreen";
import CallScreen from "./components/CallScreen";

function App() {
  const {
    isConnected,
    joined,
    localVideoRef,
    remoteVideoRef,
    joinRoom,
    isMicOn,
    isCameraOn,
    toggleMic,
    toggleCamera,
    leaveCall,
  } = useWebRTC();

  const [roomId, setRoomId] = useState("");

  const handleJoin = (id) => {
    setRoomId(id);
    joinRoom(id);
  };

  return (
    <div className="app">
      <div className="app-header">
        <h2>Video Conference App</h2>
        <span className={`status ${isConnected ? "connected" : ""}`}>
          {isConnected ? "Connected" : "Disconnected"}
        </span>
      </div>

      {!joined ? (
        <JoinScreen onJoin={handleJoin} />
      ) : (
        <CallScreen
          roomId={roomId}
          localVideoRef={localVideoRef}
          remoteVideoRef={remoteVideoRef}
          isMicOn={isMicOn}
          isCameraOn={isCameraOn}
          toggleMic={toggleMic}
          toggleCamera={toggleCamera}
          onLeave={leaveCall}
        />
      )}
    </div>
  );
}

export default App;