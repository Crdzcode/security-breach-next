'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { PlayerPublic, TurnReportPayload, GameUpdatePayload, AgentClass } from '@/types/game';
import styles from './page.module.css';

const WINNER_MSG = {
  assassins: '██ OS ASSASSINOS VENCERAM ██',
  innocents: '██ OS INOCENTES VENCERAM ██',
};

const STATUS_COLOR: Record<string, string> = {
  alive:    styles.statusAlive,
  hiding:   styles.statusHiding,
  deceased: styles.statusDeceased,
  arrested: styles.statusArrested,
  downed:   styles.statusDowned,
};

const STATUS_SYMBOL: Record<string, string> = {
  alive:    '●',
  hiding:   '■',
  deceased: '✕',
  arrested: '▣',  // SINAL BLOQUEADO
  downed:   '[!]',
};

// Tela pública (TV) — exibe o relatório da rodada em landscape
// Jogadores vão para /round-end após a rodada

function ReportScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { socket } = useSocket();

  const [report, setReport]   = useState<TurnReportPayload | null>(null);
  const [roomId, setRoomId]   = useState('');
  const [votes, setVotes]     = useState({ votes: 0, needed: 0 });

  useEffect(() => {
    const raw = sessionStorage.getItem('turnReport');
    if (!raw) { router.replace('/'); return; }
    setReport(JSON.parse(raw) as TurnReportPayload);

    const fromUrl     = searchParams.get('room')?.toUpperCase() ?? '';
    const fromSession = sessionStorage.getItem('roomId')         ?? '';
    const fromLocal   = localStorage.getItem('roomId')           ?? '';
    const id = fromUrl || fromSession || fromLocal;
    setRoomId(id);
    // Persiste para que o handler de reconexão consiga re-entrar na sala
    if (id) localStorage.setItem('roomId', id);
  }, [router, searchParams]);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.emit('client:watch_room', roomId);

    const onNextRoundVote = (payload: { votes: number; needed: number }) =>
      setVotes(payload);

    const onGameUpdate = (payload: GameUpdatePayload) => {
      if (payload.phase === 'action') {
        router.replace(`/lobby?room=${roomId}`);
      }
    };

    socket.on('server:next_round_vote', onNextRoundVote);
    socket.on('server:game_update',     onGameUpdate);

    return () => {
      socket.off('server:next_round_vote', onNextRoundVote);
      socket.off('server:game_update',     onGameUpdate);
    };
  }, [socket, roomId, router]);

  if (!report) return null;

  const { round, log, players, winner, classReveal, tasksRemaining } = report;

  const CLASS_LABEL: Record<AgentClass, string> = {
    'Inocente':  'INOCENTE',
    'Assassino': 'ASSASSINO',
    'Policial':  'POLICIAL',
    'V.I.P':     'V.I.P',
  };

  const CLASS_COLOR: Record<AgentClass, string> = {
    'Inocente':  styles.classInocente,
    'Assassino': styles.classAssassino,
    'Policial':  styles.classPolicial,
    'V.I.P':     styles.classVip,
  };

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.layout}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>&gt;&gt; RELATÓRIO — RODADA {round} &lt;&lt;</h1>
          {winner && (
            <div className={`${styles.winnerBanner} ${winner === 'assassins' ? styles.danger : styles.safe}`}>
              {WINNER_MSG[winner]}
            </div>
          )}
        </header>

        {/* ── Main two-column ── */}
        <div className={styles.main}>

          {/* Left: Activity log */}
          <section className={styles.logPanel}>
            <h2 className={styles.panelTitle}>&gt;&gt; REGISTRO DE ATIVIDADES</h2>
            <pre className={styles.log}>
              {log.length > 0
                ? log.map((entry, i) => `[${String(i + 1).padStart(2, '0')}] ${entry}`).join('\n')
                : '— Nenhuma atividade registrada neste turno.'}
            </pre>
          </section>

          {/* Right: Player photo grid */}
          <section className={styles.agentsPanel}>
            <h2 className={styles.panelTitle}>&gt;&gt; STATUS DE CAMPO</h2>
            <div className={styles.photoGrid}>
              {players.map((p: PlayerPublic) => (
                <div key={p.codename} className={`${styles.agentCard} ${STATUS_COLOR[p.status] ?? styles.statusAlive}`}>
                  <div className={styles.photoWrap}>
                    <Image
                      src={p.image}
                      alt={p.displayName}
                      width={72}
                      height={72}
                      className={`${styles.photo} ${p.status === 'deceased' ? styles.photoDeceased : ''}`}
                    />
                    <span className={styles.statusSymbol}>{STATUS_SYMBOL[p.status] ?? '●'}</span>
                  </div>
                  <span className={styles.agentName}>{p.displayName}</span>
                  <span className={styles.agentCodename}>[{p.codename}]</span>
                  {winner && classReveal && classReveal[p.codename] && (
                    <span className={`${styles.classBadge} ${CLASS_COLOR[classReveal[p.codename] as AgentClass]}`}>
                      {CLASS_LABEL[classReveal[p.codename] as AgentClass]}
                    </span>
                  )}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* ── Footer ── */}
        <footer className={styles.footer}>
          {!winner && votes.needed > 0 && (
            <span className={styles.voteCount}>
              Votos: {votes.votes}/{votes.needed}
            </span>
          )}
          {tasksRemaining > 0 && (
            <span className={styles.tasksCount}>
              TAREFAS: {tasksRemaining} restantes
            </span>
          )}
          <span className={styles.footerMsg}>
            {winner
              ? 'Jogo encerrado. Protocolo de segurança desativado.'
              : 'Aguardando votação dos agentes para próxima rodada...'}
          </span>
        </footer>

      </div>
    </div>
  );
}

export default function ReportScreenPage() {
  return (
    <Suspense fallback={
      <div className={styles.page}>
        <Scanlines variant="green" />
      </div>
    }>
      <ReportScreenContent />
    </Suspense>
  );
}
