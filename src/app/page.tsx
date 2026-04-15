'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { LoginSuccessPayload, AdminLoginSuccessPayload } from '@/types/game';
import styles from './page.module.css';

function LoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const { socket } = useSocket();

  const [codename, setCodename] = useState('');
  const [password, setPassword] = useState('');
  const [roomId, setRoomId]     = useState('');
  const [loading, setLoading]   = useState(false);

  const pendingCodename = useRef('');

  // Pré-preenche roomId a partir do parâmetro ?room= da URL
  useEffect(() => {
    const fromUrl = params.get('room')?.toUpperCase() ?? '';
    if (fromUrl) setRoomId(fromUrl);
  }, [params]);

  // Limpa apenas a sessão desta aba — sessionStorage é por-aba, não afeta outras abas
  useEffect(() => { sessionStorage.clear(); }, []);

  useEffect(() => {
    if (!socket) return;

    const onSuccess = (data: LoginSuccessPayload) => {
      // Persiste snapshot em sessionStorage (isolado por aba — sem conflito entre jogadores)
      sessionStorage.setItem('player',        pendingCodename.current.toLowerCase());
      sessionStorage.setItem('roomId',        data.roomId);
      sessionStorage.setItem('myPlayer',      JSON.stringify(data.player));
      sessionStorage.setItem('lobbySnapshot', JSON.stringify(data.players));
      router.push('/player-lobby');
    };

    const onAdminSuccess = (data: AdminLoginSuccessPayload) => {
      sessionStorage.setItem('player',   'admin');
      sessionStorage.setItem('myPlayer', JSON.stringify({ codename: data.codename, role: 'admin' }));
      router.push('/admin');
    };

    const onFailure = () => {
      setLoading(false);
      router.push('/login-fail');
    };

    socket.on('server:login_success',       onSuccess);
    socket.on('server:admin_login_success', onAdminSuccess);
    socket.on('server:login_failure',       onFailure);

    return () => {
      socket.off('server:login_success',       onSuccess);
      socket.off('server:admin_login_success', onAdminSuccess);
      socket.off('server:login_failure',       onFailure);
    };
  }, [socket, router]);

  function handleSubmit(e: { preventDefault(): void }) {
    e.preventDefault();
    if (!socket || loading) return;
    pendingCodename.current = codename;
    setLoading(true);
    socket.emit('client:login', {
      codename,
      password,
      roomId: roomId.trim().toUpperCase() || undefined,
    });
  }

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />
      <div className={styles.terminal}>
        <h1 className={styles.title}>&gt;&gt;TERMINAL DE ACESSO&lt;&lt;</h1>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="CODINOME"
            value={codename}
            onChange={(e) => setCodename(e.target.value)}
            required
            autoComplete="off"
          />
          <input
            className={styles.input}
            type="password"
            placeholder="SENHA"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <input
            className={styles.input}
            type="text"
            placeholder="CÓDIGO DA SALA (deixe em branco se for admin)"
            value={roomId}
            onChange={(e) => setRoomId(e.target.value.toUpperCase())}
            maxLength={6}
            autoComplete="off"
          />
          <button className={styles.button} type="submit" disabled={loading}>
            {loading ? '[AUTENTICANDO...]' : '[INICIAR LOGIN]'}
          </button>
        </form>
        <p className={styles.warning}>⚠ Sistema de rastreamento ativo. Acesso monitorado.</p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div>
        <Scanlines variant="green" />
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
