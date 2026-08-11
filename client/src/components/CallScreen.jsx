import VideoTile from "./VideoTile";

function CallScreen({
  roomId,
  localVideoRef,
  remoteVideoRef,
  isMicOn,
  isCameraOn,
  toggleMic,
  toggleCamera,
  onLeave,
}) {
  return (
    <div className="call-screen">
      <p className="room-label">Room: {roomId}</p>
      <div className="video-grid">
        <VideoTile videoRef={localVideoRef} label="You" muted />
        <VideoTile videoRef={remoteVideoRef} label="Participant" />
      </div>
      <div className="controls">
        <button onClick={toggleMic}>{isMicOn ? "Mute" : "Unmute"}</button>
        <button onClick={toggleCamera}>
          {isCameraOn ? "Camera Off" : "Camera On"}
        </button>
        <button onClick={onLeave} className="leave-btn">
          Leave Call
        </button>
      </div>
    </div>
  );
}

export default CallScreen;