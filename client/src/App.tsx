import { useEffect, useRef, useState } from "react";
import { Canvas } from "@react-three/fiber";
import { Sky } from "@react-three/drei";
import { Room } from "colyseus.js";
import { joinCampus, getStateCallbacks } from "./network/colyseus";
import { World } from "./components/World";

export default function App() {
  const [name, setName] = useState("");
  const [joinedName, setJoinedName] = useState<string | null>(null);
  const [room, setRoom] = useState<Room | null>(null);
  const [status, setStatus] = useState("");
  const [count, setCount] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!joinedName) return;
    let active = true;
    let joined: Room | null = null;
    setStatus("Connecting to campus...");

    joinCampus(joinedName)
      .then((r) => {
        if (!active) {
          r.leave();
          return;
        }
        joined = r;
        setRoom(r);
        setStatus("Connected");

        const players: any = r.state.players;
        const $ = getStateCallbacks(r);
        const updateCount = () => setCount(players.size);
        $(r.state).players.onAdd(() => updateCount());
        $(r.state).players.onRemove(() => updateCount());
        updateCount();

        r.onLeave(() => setStatus("Disconnected"));
      })
      .catch((e) => {
        console.error(e);
        setStatus("Failed to connect — is the server running on :2567?");
      });

    return () => {
      active = false;
      joined?.leave();
    };
  }, [joinedName]);

  const enterCampus = () => {
    const trimmed = name.trim();
    if (trimmed.length > 0) setJoinedName(trimmed.slice(0, 16));
  };

  // Name-entry screen, shown before joining.
  if (!joinedName) {
    return (
      <div className="login">
        <div className="login-card">
          <h1>CampusVerse</h1>
          <p>Enter your name to join the campus</p>
          <input
            ref={inputRef}
            autoFocus
            maxLength={16}
            placeholder="Your name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && enterCampus()}
          />
          <button onClick={enterCampus} disabled={name.trim().length === 0}>
            Enter Campus
          </button>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="hud">
        <div><b>CampusVerse</b> — playing as <b>{joinedName}</b></div>
        <div>Move: <b>WASD</b> / Arrow keys</div>
        <div>Jump: <b>Space</b></div>
        <div>Rotate camera: <b>Q</b> / <b>E</b> or drag mouse</div>
        <div>Students online: <b>{count}</b></div>
      </div>
      <div className="status">{status}</div>

      <Canvas shadows camera={{ position: [0, 6, 9], fov: 60 }}>
        <Sky sunPosition={[100, 20, 100]} />
        <ambientLight intensity={0.6} />
        <directionalLight
          position={[10, 20, 10]}
          intensity={1.2}
          castShadow
          shadow-mapSize-width={2048}
          shadow-mapSize-height={2048}
        />
        {room && <World room={room} />}
      </Canvas>
    </>
  );
}
