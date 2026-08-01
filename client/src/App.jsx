import { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

const socket = io("http://localhost:5000");

// STUN server config — helps find each browser's public address (from our earlier discussion)
const rtcConfig = {
  iceServers: [{ urls: "stun:stun.l.google.com:19302" }],
};

function App() {
  const [isConnected, setIsConnected] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [joined, setJoined] = useState(false);
  const [localStream, setLocalStream] = useState(null);

  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const peerConnectionRef = useRef(null); // holds the RTCPeerConnection, doesn't need re-render on change

  useEffect(() => {
    socket.on("connect", () => setIsConnected(true));
    socket.on("disconnect", () => setIsConnected(false));

    // Someone already in the room -> they initiate the offer to the new user
    socket.on("user-joined", async (newUserId) => {
      console.log("New user joined:", newUserId);
      const pc = createPeerConnection(newUserId);
      const offer = await pc.createOffer();
      await pc.setLocalDescription(offer);
      socket.emit("offer", { to: newUserId, offer });
    });

    socket.on("existing-users", (userIds) => {
      console.log("Existing users:", userIds);
      // We don't initiate here — we wait for their offer instead
    });

    // Received an offer -> create our peer connection, answer back
    socket.on("offer", async ({ from, offer }) => {
      const pc = createPeerConnection(from);
      await pc.setRemoteDescription(new RTCSessionDescription(offer));
      const answer = await pc.createAnswer();
      await pc.setLocalDescription(answer);
      socket.emit("answer", { to: from, answer });
    });

    // Received an answer -> finalize our side of the connection
    socket.on("answer", async ({ answer }) => {
      await peerConnectionRef.current.setRemoteDescription(
        new RTCSessionDescription(answer)
      );
    });

    // Received an ICE candidate -> add it to our connection
    socket.on("ice-candidate", async ({ candidate }) => {
      if (candidate) {
        await peerConnectionRef.current.addIceCandidate(
          new RTCIceCandidate(candidate)
        );
      }
    });

    return () => {
      socket.off("connect");
      socket.off("disconnect");
      socket.off("user-joined");
      socket.off("existing-users");
      socket.off("offer");
      socket.off("answer");
      socket.off("ice-candidate");
    };
  }, [localStream]); // re-run if localStream changes, so closures have the latest stream

  useEffect(() => {
    if (joined && localStream && localVideoRef.current) {
      localVideoRef.current.srcObject = localStream;
    }
  }, [joined, localStream]);

  // Creates a new RTCPeerConnection, wires up all the necessary events
  const createPeerConnection = (remoteSocketId) => {
    const pc = new RTCPeerConnection(rtcConfig);
    peerConnectionRef.current = pc;

    // Send our camera/mic tracks out through this connection
    localStream.getTracks().forEach((track) => {
      pc.addTrack(track, localStream);
    });

    // Whenever WebRTC finds a new ICE candidate, send it to the other person
    pc.onicecandidate = (event) => {
      if (event.candidate) {
        socket.emit("ice-candidate", {
          to: remoteSocketId,
          candidate: event.candidate,
        });
      }
    };

    // When the remote person's video/audio arrives, show it
    pc.ontrack = (event) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    return pc;
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: true,
        audio: true,
      });
      setLocalStream(stream);
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
          <p>You re in room: {roomId}</p>
          <video ref={localVideoRef} autoPlay playsInline muted width="300" />
          <video ref={remoteVideoRef} autoPlay playsInline width="300" />
        </div>
      )}
    </div>
  );
}

export default App;