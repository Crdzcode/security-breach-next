"use client";

import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { getSocket } from "@/lib/socket";

type SocketCtx = {
  socket: ReturnType<typeof getSocket> | null;
  connected: boolean;
  ping: (payload: unknown) => void;
};

const SocketContext = createContext<SocketCtx | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [connected, setConnected] = useState(false);
  const socketRef = useRef<ReturnType<typeof getSocket> | null>(null);
  useEffect(() => {
    // 🚨 Aqui é 100% garantido que estamos no CLIENTE (browser)
    const socket = getSocket();
    socketRef.current = socket;

    const onConnect = () => setConnected(true);
    const onDisconnect = () => setConnected(false);

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);

    if (!socket.connected) {
      socket.connect();
    }

    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      // NÃO dar socket.disconnect() aqui, para manter vivo entre rotas
    };
  }, []);

  const value = useMemo(
    () => ({
      socket: socketRef.current,
      connected,
      ping: (payload: unknown) => {
        const s = socketRef.current;
        if (!s) {
          console.warn("Socket not initialized yet");
          return;
        }
        s.emit("client:ping", payload, (ack: any) => {
          console.log("[ack]", ack);
        });
      },
    }),
    [connected]
  );

  return <SocketContext.Provider value={value}>{children}</SocketContext.Provider>;
}

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) {
    throw new Error("useSocket must be used inside SocketProvider");
  }
  return ctx;
}
