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

    s.on('connect',    onConnect);
    s.on('disconnect', onDisconnect);

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
