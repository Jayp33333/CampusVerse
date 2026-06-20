import { useEffect, useState } from "react";
import { Room } from "colyseus.js";

interface Props {
  room: Room;
}

export function RespawnOverlay({ room }: Props) {
  const [seconds, setSeconds] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const tick = () => {
      const self = (room.state.players as any).get(room.sessionId);
      if (!self?.dead || !self.respawnAt) {
        setVisible(false);
        return;
      }

      const remaining = Math.max(0, self.respawnAt - Date.now());
      if (remaining <= 0) {
        setVisible(false);
        return;
      }

      setVisible(true);
      setSeconds(Math.ceil(remaining / 1000));
    };

    tick();
    const id = window.setInterval(tick, 100);
    return () => clearInterval(id);
  }, [room]);

  if (!visible) return null;

  return (
    <div className="respawn-overlay" role="status">
      <p className="respawn-overlay-title">You were knocked out</p>
      <p className="respawn-overlay-timer">
        Respawning in <b>{seconds}</b>
      </p>
    </div>
  );
}
