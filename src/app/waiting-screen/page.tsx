'use client';

import { useEffect, useState } from 'react';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { VoteUpdatePayload } from '@/types/game';
import styles from './page.module.css';

export default function WaitingScreenPage() {
  const { socket } = useSocket();
  const [votes, setVotes] = useState({ votes: 0, needed: 0 });
  const [hasVoted, setHasVoted] = useState(false);

  // Players arriving from actions-menu already voted; players from blackjack did not
  useEffect(() => {
    const flag = sessionStorage.getItem('didVoteEndTurn');
    if (flag === '1') {
      setHasVoted(true);
      sessionStorage.removeItem('didVoteEndTurn');
    }
  }, []);

  useEffect(() => {
    if (!socket) return;

    const onVoteUpdate = (payload: VoteUpdatePayload) => setVotes(payload);
    socket.on('server:vote_update', onVoteUpdate);

    return () => { socket.off('server:vote_update', onVoteUpdate); };
  }, [socket]);

  function voteEndTurn() {
    if (!socket || hasVoted) return;
    socket.emit('client:vote_end_turn');
    setHasVoted(true);
  }

  const pct = votes.needed > 0 ? Math.round((votes.votes / votes.needed) * 100) : 0;

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.container}>
        <h1 className={styles.title}>&gt;&gt; AGUARDANDO &lt;&lt;</h1>

        <p className={styles.status}>Ação registrada. Aguardando outros agentes...</p>

        {votes.needed > 0 && (
          <div className={styles.voteBox}>
            <p className={styles.voteLabel}>
              Votos para encerrar turno: {votes.votes}/{votes.needed}
            </p>
            <div className={styles.bar}>
              <div className={styles.fill} style={{ width: `${pct}%` }} />
            </div>
          </div>
        )}

        {!hasVoted && (
          <button className={styles.voteBtn} onClick={voteEndTurn}>
            [VOTAR FIM DE TURNO]
          </button>
        )}

        {hasVoted && (
          <p className={styles.voted}>✓ Seu voto foi registrado.</p>
        )}

        <div className={styles.blink}>_ _</div>
      </div>
    </div>
  );
}
