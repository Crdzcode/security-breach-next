import io from "socket.io-client";
type Socket = ReturnType<typeof io>;

const URL = process.env.NEXT_PUBLIC_WS_URL ?? "http://localhost:3001";

let socket: Socket | null = null;

/** Retorna a mesma instância sempre (evita múltiplas conexões). */
export function getSocket(): Socket {
  if (!socket) {
    socket = io(URL, {
      transports: ["websocket", "polling"],  // websocket primeiro, polling como fallback
      autoConnect: false,                    // conectamos manualmente
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
    });
  }
  return socket;
}
