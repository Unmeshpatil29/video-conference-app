function VideoTile({ videoRef, label, muted = false }) {
  return (
    <div className="video-tile">
      <video ref={videoRef} autoPlay playsInline muted={muted} />
      <span className="tag">{label}</span>
    </div>
  );
}

export default VideoTile;