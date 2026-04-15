'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import type {
  BlackjackStartPayload,
  BlackjackHitPayload,
  BlackjackResultPayload,
  Card,
} from '@/types/game';
import styles from './page.module.css';

function cardLabel(card: Card): string {
  if (card.hidden) return '[?]';
  return `${card.rank}${card.suit}`;
}

function handScore(hand: Card[]): number {
  let score = 0;
  let aces = 0;
  for (const c of hand) {
    if (c.hidden) continue;
    if (['J', 'Q', 'K'].includes(c.rank)) score += 10;
    else if (c.rank === 'A') { score += 11; aces++; }
    else score += parseInt(c.rank, 10);
  }
  while (score > 21 && aces > 0) { score -= 10; aces--; }
  return score;
}

export default function SalvaguardaPage() {
  const { socket } = useSocket();
  const router = useRouter();

  const [session, setSession]       = useState<BlackjackStartPayload | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [result, setResult]         = useState<BlackjackResultPayload | null>(null);
  const [actionDone, setActionDone] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('bjStart');
    if (!raw) { router.replace('/spectate'); return; }
    const data = JSON.parse(raw) as BlackjackStartPayload;
    setSession(data);
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setPlayerScore(data.playerScore);
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const onNewRound = (payload: BlackjackStartPayload) => {
      sessionStorage.setItem('bjStart', JSON.stringify(payload));
      setSession(payload);
      setPlayerHand(payload.playerHand);
      setDealerHand(payload.dealerHand);
      setPlayerScore(payload.playerScore);
      setResult(null);
      setActionDone(false);
    };

    const onHit = (payload: BlackjackHitPayload) => {
      setPlayerHand(payload.playerHand);
      setPlayerScore(payload.playerScore);
    };

    const onResult = (payload: BlackjackResultPayload) => {
      setPlayerHand(payload.playerHand);
      setDealerHand(payload.dealerHand);
      setPlayerScore(payload.playerScore);
      setResult(payload);
      setActionDone(true);
    };

    socket.on('server:blackjack_start',  onNewRound);
    socket.on('server:blackjack_hit',    onHit);
    socket.on('server:blackjack_result', onResult);

    return () => {
      socket.off('server:blackjack_start',  onNewRound);
      socket.off('server:blackjack_hit',    onHit);
      socket.off('server:blackjack_result', onResult);
    };
  }, [socket]);

  function hit() {
    if (!socket || actionDone) return;
    socket.emit('client:blackjack_hit');
  }

  function stand() {
    if (!socket || actionDone) return;
    socket.emit('client:blackjack_stand');
  }

  if (!session) return null;

  const dealerScore = handScore(dealerHand);

  return (
    <div className={styles.page}>
      <div className={styles.glitchOverlay} />

      <div className={styles.container}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <p className={styles.alert}>[!] FALHA CRÍTICA DETECTADA [!]</p>
          <h1 className={styles.title}>PROTOCOLO DE SALVAGUARDA</h1>
          <p className={styles.subtitle}>Sistema comprometido — sobrevivência em risco</p>
        </header>

        {/* ── Dealer ── */}
        <section className={styles.handSection}>
          <h2 className={styles.handTitle}>
            DEALER{actionDone ? ` — ${dealerScore}` : ''}
          </h2>
          <div className={styles.cards}>
            {dealerHand.map((c, i) => (
              <span
                key={`d${i}`}
                className={`${styles.card} ${c.hidden ? styles.cardHidden : ''}`}
                style={{ animationDelay: `${i * 0.12}s` }}
              >
                {cardLabel(c)}
              </span>
            ))}
          </div>
        </section>

        <div className={styles.divider}>══════════════════════</div>

        {/* ── Player ── */}
        <section className={styles.handSection}>
          <h2 className={styles.handTitle}>VOCÊ — {playerScore}</h2>
          <div className={styles.cards}>
            {playerHand.map((c, i) => (
              <span
                key={`p${i}`}
                className={styles.card}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                {cardLabel(c)}
              </span>
            ))}
          </div>
        </section>

        {/* ── Result ── */}
        {result && (
          <div className={`${styles.result} ${result.outcome === 'success' ? styles.success : styles.failure}`}>
            <p className={styles.resultOutcome}>
              {result.outcome === 'success' ? '[ PROTOCOLO EXECUTADO ]' : '[ FALHA TOTAL ]'}
            </p>
            <p className={styles.resultDesc}>{result.description}</p>
            <button
              className={styles.continueBtn}
              onClick={() => {
                // Jogador salvo não age neste turno — vai aguardar
                router.push(result.outcome === 'success' ? '/waiting-screen' : '/spectate');
              }}
            >
              [CONTINUAR]
            </button>
          </div>
        )}

        {/* ── Actions ── */}
        {!actionDone && (
          <div className={styles.actions}>
            <button className={styles.hitBtn} onClick={hit}>[HIT]</button>
            <button className={styles.standBtn} onClick={stand}>[STAND]</button>
          </div>
        )}

      </div>
    </div>
  );
}
