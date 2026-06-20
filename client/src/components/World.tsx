import { useEffect, useState } from "react";
import { Room } from "colyseus.js";
import { getStateCallbacks } from "../network/colyseus";
import { Ground } from "./Ground";
import { LocalPlayer } from "./LocalPlayer";
import { RemotePlayer } from "./RemotePlayer";

interface Props {
  room: Room;
}

// Reacts to players joining/leaving and renders local + remote avatars.
export function World({ room }: Props) {
  const [remoteIds, setRemoteIds] = useState<string[]>([]);
  const [me, setMe] = useState<{ name: string; color: string } | null>(null);

  useEffect(() => {
    const players: any = room.state.players;
    const $ = getStateCallbacks(room);

    const refresh = () => {
      const ids: string[] = [];
      players.forEach((_: any, key: string) => {
        if (key !== room.sessionId) ids.push(key);
      });
      setRemoteIds(ids);

      const self = players.get(room.sessionId);
      if (self) setMe({ name: self.name, color: self.color });
    };

    const offAdd = $(room.state).players.onAdd(() => refresh());
    const offRemove = $(room.state).players.onRemove(() => refresh());
    refresh();

    return () => {
      offAdd?.();
      offRemove?.();
    };
  }, [room]);

  return (
    <>
      <Ground />

      {me && <LocalPlayer room={room} name={me.name} color={me.color} />}

      {remoteIds.map((id) => {
        const state = (room.state.players as any).get(id);
        if (!state) return null;
        return <RemotePlayer key={id} state={state} />;
      })}
    </>
  );
}
