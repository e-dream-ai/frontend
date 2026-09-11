import { useEffect } from "react";
import type { Socket } from "socket.io-client";
import useSocket from "@/hooks/useSocket";
import {
  JOIN_DREAM_ROOM_EVENT,
  LEAVE_DREAM_ROOM_EVENT,
} from "@/constants/remote-control.constants";

function createRoomSubscriptions(socket: Socket) {
  const counts = new Map<string, number>();
  const join = (uuid: string) => socket.emit(JOIN_DREAM_ROOM_EVENT, uuid);
  const leave = (uuid: string) => socket.emit(LEAVE_DREAM_ROOM_EVENT, uuid);
  const rejoin = () => counts.forEach((_, uuid) => join(uuid));

  socket.on("connect", rejoin);

  return {
    add(uuid: string) {
      const count = counts.get(uuid) ?? 0;
      counts.set(uuid, count + 1);
      if (count === 0 && socket.connected) join(uuid);
    },
    remove(uuid: string) {
      const count = (counts.get(uuid) ?? 1) - 1;
      if (count > 0) {
        counts.set(uuid, count);
        return;
      }

      counts.delete(uuid);
      if (socket.connected) leave(uuid);
    },
    get isEmpty() {
      return counts.size === 0;
    },
    dispose() {
      socket.off("connect", rejoin);
    },
  };
}

type RoomSubscriptions = ReturnType<typeof createRoomSubscriptions>;

const subscriptions = new WeakMap<Socket, RoomSubscriptions>();

function getRoomSubscriptions(socket: Socket) {
  const existing = subscriptions.get(socket);
  if (existing) return existing;

  const created = createRoomSubscriptions(socket);
  subscriptions.set(socket, created);
  return created;
}

export function useDreamRooms(uuids: readonly string[]) {
  const { socket } = useSocket();
  const roomsKey = [...new Set(uuids)].sort().join(",");

  useEffect(() => {
    if (!socket || !roomsKey) return;

    const roomIds = roomsKey.split(",");
    const rooms = getRoomSubscriptions(socket);
    roomIds.forEach((uuid) => rooms.add(uuid));

    return () => {
      roomIds.forEach((uuid) => rooms.remove(uuid));
      if (!rooms.isEmpty) return;

      rooms.dispose();
      subscriptions.delete(socket);
    };
  }, [socket, roomsKey]);
}
