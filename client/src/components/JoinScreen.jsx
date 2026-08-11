import { useState } from "react";

function JoinScreen({ onJoin }) {
  const [roomId, setRoomId] = useState("");

  return (
    <div className="join-box">
      <input
        value={roomId}
        onChange={(e) => setRoomId(e.target.value)}
        placeholder="Enter meeting ID"
      />
      <button onClick={() => onJoin(roomId)}>Join Room</button>
    </div>
  );
}

export default JoinScreen;