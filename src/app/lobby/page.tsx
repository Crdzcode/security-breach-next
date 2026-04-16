'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { QRCodeSVG } from 'qrcode.react';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { PlayerPublic, RoomStatePayload, GameUpdatePayload, TurnReportPayload } from '@/types/game';
import styles from './page.module.css';

function formatTime(seconds: number): string {
  const s = Math.max(0, Math.floor(seconds));
  const m = Math.floor(s / 60);
  return `${String(m).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
}

function LobbyContent() {
  const { socket, connected } = useSocket();
  const searchParams           = useSearchParams();
  const router                 = useRouter();

  const [roomId, setRoomId]           = useState('');
  const [inputCode, setInputCode]     = useState('');
  const [players, setPlayers]         = useState<PlayerPublic[]>([]);
  const [watching, setWatching]       = useState(false);
  const [phase, setPhase]             = useState('lobby');
  const [round, setRound]             = useState(0);
  const [turnDuration, setTurnDuration] = useState(0);
  const [roundStartAt, setRoundStartAt] = useState(0);
  const [remaining, setRemaining]     = useState(0);
  const watchedRoomRef                = useRef('');
  const timerRef                      = useRef<ReturnType<typeof setInterval> | null>(null);
  // roomId ref para uso dentro de closures de socket
  const roomIdRef                     = useRef('');

  // Load roomId: URL param > sessionStorage (player) > localStorage (TV fallback)
  useEffect(() => {
    const fromUrl     = searchParams.get('room')?.toUpperCase() ?? '';
    const fromSession = sessionStorage.getItem('roomId') ?? '';
    const fromLocal   = localStorage.getItem('roomId')   ?? '';
    const id = fromUrl || fromSession || fromLocal;
    setRoomId(id);
    roomIdRef.current = id;
  }, [searchParams]);

  // Mantém roomIdRef sempre em sincronia com o state (cobre handleWatch e qualquer outra mutação)
  // e persiste no localStorage para que o handler de reconexão consiga re-entrar na sala
  useEffect(() => {
    roomIdRef.current = roomId;
    if (roomId) localStorage.setItem('roomId', roomId);
  }, [roomId]);

  // Countdown timer tick
  useEffect(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    if (phase !== 'action' || !roundStartAt || !turnDuration) return;

    const tick = () => {
      const elapsed = (Date.now() - roundStartAt) / 1000;
      setRemaining(turnDuration - elapsed);
    };
    tick();
    timerRef.current = setInterval(tick, 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [phase, roundStartAt, turnDuration]);

  // Socket listeners
  useEffect(() => {
    if (!socket || !roomId || watchedRoomRef.current === roomId) return;

    watchedRoomRef.current = roomId;

    const onRoomState = (data: RoomStatePayload) => {
      setPlayers(data.players);
      setPhase(data.phase);
      setRound(data.round);
      setTurnDuration(data.turnDuration);
      setRoundStartAt(data.roundStartAt);
      setWatching(true);
    };

    const onGameUpdate = (data: GameUpdatePayload) => {
      setPlayers(data.players);
      setPhase(data.phase);
      setRound(data.round);
      if (data.turnDuration !== undefined) setTurnDuration(data.turnDuration);
      if (data.roundStartAt !== undefined) setRoundStartAt(data.roundStartAt);
    };

    // Fim de rodada → navega para a tela pública de relatório
    const onTurnReport = (data: TurnReportPayload) => {
      sessionStorage.setItem('turnReport', JSON.stringify(data));
      const rid = roomIdRef.current;
      router.push(`/report-screen${rid ? `?room=${rid}` : ''}`);
    };

    const onJoined = (p: PlayerPublic) => {
      setPlayers((prev) => {
        const idx = prev.findIndex((x) => x.codename === p.codename);
        if (idx !== -1) {
          const next = [...prev];
          next[idx] = { ...next[idx], isConnected: true };
          return next;
        }
        return [...prev, p];
      });
    };

    const onDisconnected = ({ codename }: { codename: string }) => {
      setPlayers((prev) =>
        prev.map((p) => (p.codename === codename ? { ...p, isConnected: false } : p)),
      );
    };

    socket.on('server:room_state',          onRoomState);
    socket.on('server:game_update',         onGameUpdate);
    socket.on('server:turn_report',         onTurnReport);
    socket.on('server:player_joined',       onJoined);
    socket.on('server:player_disconnected', onDisconnected);

    socket.emit('client:watch_room', roomId);

    return () => {
      socket.off('server:room_state',          onRoomState);
      socket.off('server:game_update',         onGameUpdate);
      socket.off('server:turn_report',         onTurnReport);
      socket.off('server:player_joined',       onJoined);
      socket.off('server:player_disconnected', onDisconnected);
      watchedRoomRef.current = '';
    };
  }, [socket, roomId]);

  function handleWatch(e: { preventDefault(): void }) {
    e.preventDefault();
    const code = inputCode.trim().toUpperCase();
    if (!code) return;
    watchedRoomRef.current = '';
    setPlayers([]);
    setWatching(false);
    setPhase('lobby');
    setRound(0);
    setRoomId(code);
  }

  const onlineCount = players.filter((p) => p.isConnected).length;
  const isPlaying   = phase !== 'lobby';

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.container}>
        {/* ── Header ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>&gt;&gt; SALA DE ESPERA &lt;&lt;</h1>
          {roomId ? (
            <div className={styles.roomBadge}>
              <span className={styles.codeLabel}>SALA</span>
              <span className={styles.code}>{roomId}</span>
              <div className={styles.qrWrap}>
                <QRCodeSVG
                  value={`${process.env.NEXT_PUBLIC_APP_URL ?? (typeof window !== 'undefined' ? window.location.origin : '')}/?room=${roomId}`}
                  size={100}
                  bgColor="#000000"
                  fgColor="#00ff00"
                  level="M"
                />
                <span className={styles.qrLabel}>▲ ESCANEIE PARA ENTRAR</span>
              </div>
            </div>
          ) : (
            <form className={styles.codeForm} onSubmit={handleWatch}>
              <input
                className={styles.codeInput}
                type="text"
                placeholder="CÓDIGO DA SALA"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value.toUpperCase())}
                maxLength={6}
                autoComplete="off"
              />
              <button className={styles.codeBtn} type="submit" disabled={!connected}>
                [ENTRAR]
              </button>
            </form>
          )}
        </header>

        {/* ── Game status strip (shown when game is running) ── */}
        {isPlaying && (
          <div className={styles.gameStrip}>
            <span className={styles.roundBadge}>RODADA {round}</span>
            {phase === 'action' && turnDuration > 0 && (
              <span className={`${styles.timer} ${remaining < 30 ? styles.timerWarning : ''}`}>
                ⏱ {formatTime(remaining)}
              </span>
            )}
            {phase === 'resolving' && (
              <span className={styles.phaseLabel}>RESOLVENDO...</span>
            )}
            {phase === 'report' && (
              <span className={styles.phaseLabel}>RELATÓRIO</span>
            )}
            {phase === 'game_over' && (
              <span className={styles.phaseDanger}>JOGO ENCERRADO</span>
            )}
          </div>
        )}

        {/* ── Counter ── */}
        <p className={styles.counter}>
          AGENTES ONLINE: <strong>{onlineCount}</strong> / {players.length}
        </p>

        {/* ── Player grid ── */}
        <div className={styles.playerGrid}>
          {players.map((p) => (
            <div
              key={p.codename}
              className={`${styles.playerCard} ${!p.isConnected ? styles.playerCardOff : ''} ${p.status === 'deceased' ? styles.playerCardDeceased : ''}`}
            >
              <div className={styles.photoWrap}>
                <Image
                  src={p.image}
                  alt={p.displayName}
                  width={160}
                  height={160}
                  className={styles.photo}
                />
                <span className={p.isConnected ? styles.dot : styles.dotOff}>
                  {p.isConnected ? '●' : '○'}
                </span>
              </div>
              <p className={styles.playerName}>{p.displayName}</p>
              <p className={styles.playerCode}>{p.codename}</p>
            </div>
          ))}

          {watching && players.length === 0 && (
            <p className={styles.empty}>Nenhum agente conectado ainda.</p>
          )}
        </div>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          {!isPlaying && (
            <p className={styles.waiting}>⌛ Aguardando o administrador iniciar o jogo...</p>
          )}
          {roomId && (
            <p className={styles.hint}>
              Código da sala: <strong>{roomId}</strong>
            </p>
          )}
        </footer>
      </div>
    </div>
  );
}

export default function LobbyPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <Scanlines variant="green" />
        <div className={styles.container} />
      </div>
    }>
      <LobbyContent />
    </Suspense>
  );
}
