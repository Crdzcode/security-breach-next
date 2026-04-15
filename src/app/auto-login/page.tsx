'use client';

import { useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { LoginSuccessPayload } from '@/types/game';

// ─────────────────────────────────────────────────────────────────────────────
// /auto-login?codename=x&password=y&roomId=z
//
// Página de login automático para testes.
// Lê os parâmetros da URL e emite client:login imediatamente ao conectar.
// ─────────────────────────────────────────────────────────────────────────────

export default function AutoLoginPage() {
  const router       = useRouter();
  const params       = useSearchParams();
  const { socket }   = useSocket();
  const [status, setStatus] = useState('Conectando...');
  const sentRef      = useRef(false);

  const codename = params.get('codename') ?? '';
  const password = params.get('password') ?? '';
  const roomId   = params.get('roomId')   ?? '';

  useEffect(() => {
    if (!socket || sentRef.current) return;
    if (!codename || !password || !roomId) {
      setStatus('[ERRO] Parâmetros ausentes: codename, password e roomId são obrigatórios.');
      return;
    }

    sentRef.current = true;

    const onSuccess = (data: LoginSuccessPayload) => {
      sessionStorage.setItem('player',        codename.toLowerCase());
      sessionStorage.setItem('roomId',        data.roomId);
      sessionStorage.setItem('myPlayer',      JSON.stringify(data.player));
      sessionStorage.setItem('lobbySnapshot', JSON.stringify(data.players));
      router.replace('/player-lobby');
    };

    const onFailure = ({ message }: { message: string }) => {
      setStatus(`[ERRO] ${message}`);
      sentRef.current = false;
    };

    socket.once('server:login_success',  onSuccess);
    socket.once('server:login_failure',  onFailure);

    setStatus(`Autenticando ${codename}...`);
    socket.emit('client:login', { codename, password, roomId: roomId.toUpperCase() });

    return () => {
      socket.off('server:login_success', onSuccess);
      socket.off('server:login_failure', onFailure);
    };
  }, [socket, codename, password, roomId, router]);

  return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
      <Scanlines variant="green" />
      <p style={{ position: 'relative', zIndex: 1, fontSize: '1rem', opacity: 0.8 }}>{status}</p>
    </div>
  );
}
