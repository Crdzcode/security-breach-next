'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { getSocket } from '@/lib/socket';
import type { Socket } from 'socket.io-client';

// ─────────────────────────────────────────────────────────────────────────────
// Contexto
// ─────────────────────────────────────────────────────────────────────────────

type SocketCtx = {
  socket: Socket | null;
  connected: boolean;
};

const SocketContext = createContext<SocketCtx | null>(null);

// ─────────────────────────────────────────────────────────────────────────────
// Provider
//
// socket é estado React — não um ref capturado em useMemo.
// Isso garante que consumidores re-renderizam quando a conexão muda,
// inclusive em hot reload onde o singleton já pode estar conectado.
// ─────────────────────────────────────────────────────────────────────────────

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    const s = getSocket();

    const onConnect    = () => { setSocket(s); setConnected(true); };
    const onDisconnect = () => setConnected(false);

    // Ao reconectar, re-entra na sala sem precisar de senha.
    // O server valida apenas codename + roomId (já autenticados previamente).
    const onReconnect = () => {
      const raw    = sessionStorage.getItem('myPlayer');
      const roomId = sessionStorage.getItem('roomId') || localStorage.getItem('roomId') || '';

      if (raw && roomId) {
        const { codename } = JSON.parse(raw) as { codename: string };
        console.log(`[socket] reconectando "${codename}" na sala ${roomId}`);
        s.emit('client:rejoin', { codename, roomId });
      } else if (roomId) {
        console.log(`[socket] watcher reconectando na sala ${roomId}`);
        s.emit('client:watch_room', roomId);
      }
    };

    s.on('connect',    onConnect);
    s.on('disconnect', onDisconnect);
    s.io.on('reconnect', onReconnect);

    if (s.connected) {
      // Socket já estava conectado (singleton reaproveitado após hot reload)
      setSocket(s);
      setConnected(true);
    } else {
      s.connect();
    }

    return () => {
      s.off('connect',    onConnect);
      s.off('disconnect', onDisconnect);
      s.io.off('reconnect', onReconnect);
      // NÃO desconectar — manter vivo entre rotas
    };
  }, []);

  return (
    <SocketContext.Provider value={{ socket, connected }}>
      {children}
    </SocketContext.Provider>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Hook
// ─────────────────────────────────────────────────────────────────────────────

export function useSocket() {
  const ctx = useContext(SocketContext);
  if (!ctx) throw new Error('useSocket must be used inside SocketProvider');
  return ctx;
}
