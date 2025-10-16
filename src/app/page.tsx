"use client";
import { useSocket } from "@/components/SocketProvider";

export default function Home() {
  const { connected, ping, socket } = useSocket();

  return (
    <main style={{ padding: 24 }}>
      <h1>Next.js + Socket.IO</h1>
      <p>Status: {connected ? "online" : "offline"}</p>

      <button onClick={() => ping({ msg: "olá do Next", t: Date.now() })}>
        Enviar client:ping (com ACK)
      </button>

      <button onClick={() => socket?.emit("join_room", { roomId: "room1", name: "NextUser" })}>
        join_room
      </button>
    </main>
  );
}
