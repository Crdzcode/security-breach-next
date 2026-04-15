'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type {
  BlackjackStartPayload,
  BlackjackHitPayload,
  BlackjackResultPayload,
  BlackjackUpdatePayload,
  Card,
  Modifier,
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

function modifierHint(mod: Modifier): string {
  if (mod === '+1') return 'VANTAGEM (+1): se perder, você joga novamente';
  if (mod === '-1') return 'DESVANTAGEM (-1): precisa vencer duas vezes';
  return 'PADRÃO (0): uma vitória é suficiente';
}

export default function BlackjackPage() {
  const { socket } = useSocket();
  const router = useRouter();

  const [session, setSession] = useState<BlackjackStartPayload | null>(null);
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [result, setResult] = useState<BlackjackResultPayload | null>(null);
  const [roundUpdate, setRoundUpdate] = useState<BlackjackUpdatePayload | null>(null);
  const [actionDone, setActionDone] = useState(false);
  const [hasInteracted, setHasInteracted] = useState(false);
  const [awaitingRetry, setAwaitingRetry] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('bjStart');
    if (!raw) { router.replace('/actions-menu'); return; }
    const data = JSON.parse(raw) as BlackjackStartPayload;
    setSession(data);
    setPlayerHand(data.playerHand);
    setDealerHand(data.dealerHand);
    setPlayerScore(data.playerScore);
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    // New round within same session (retry on loss / need multiple wins)
    const onNewRound = (payload: BlackjackStartPayload) => {
      sessionStorage.setItem('bjStart', JSON.stringify(payload));
      setSession(payload);
      setPlayerHand(payload.playerHand);
      setDealerHand(payload.dealerHand);
      setPlayerScore(payload.playerScore);
      setResult(null);
      setRoundUpdate(null);
      setActionDone(false);
      setAwaitingRetry(false);
      // hasInteracted intentionally NOT reset — player already used this ability
    };

    const onHit = (payload: BlackjackHitPayload) => {
      setPlayerHand(payload.playerHand);
      setPlayerScore(payload.playerScore);
    };

    const onUpdate = (payload: BlackjackUpdatePayload) => {
      setPlayerHand(payload.playerHand);
      setDealerHand(payload.dealerHand);
      setPlayerScore(payload.playerScore);
      setRoundUpdate(payload);
      setActionDone(true);
    };

    const onResult = (payload: BlackjackResultPayload) => {
      setPlayerHand(payload.playerHand);
      setDealerHand(payload.dealerHand);
      setPlayerScore(payload.playerScore);
      setResult(payload);
      setActionDone(true);
      if (payload.retryAvailable) {
        setAwaitingRetry(true);
      }
      if (
        payload.outcome === 'success' &&
        session?.abilityName === 'Primeiros socorros'
      ) {
        sessionStorage.setItem('firstAidConsumed', '1');
      }
    };

    socket.on('server:blackjack_start',  onNewRound);
    socket.on('server:blackjack_hit',    onHit);
    socket.on('server:blackjack_update', onUpdate);
    socket.on('server:blackjack_result', onResult);

    return () => {
      socket.off('server:blackjack_start',  onNewRound);
      socket.off('server:blackjack_hit',    onHit);
      socket.off('server:blackjack_update', onUpdate);
      socket.off('server:blackjack_result', onResult);
    };
  }, [socket]);

  function hit() {
    if (!socket || actionDone) return;
    setHasInteracted(true);
    socket.emit('client:blackjack_hit');
  }

  function stand() {
    if (!socket || actionDone) return;
    setHasInteracted(true);
    socket.emit('client:blackjack_stand');
  }

  function cancel() {
    if (!socket || hasInteracted) return;
    socket.emit('client:blackjack_cancel');
    // Server decrements actionsUsed — mirror on client so /actions-menu shows correct count
    const stored = parseInt(sessionStorage.getItem('actionsUsed') ?? '1', 10);
    sessionStorage.setItem('actionsUsed', String(Math.max(0, stored - 1)));
    router.push('/actions-menu');
  }

  function getDestination(): string {
    const raw = sessionStorage.getItem('gameStarted');
    const maxActions = raw && (JSON.parse(raw) as { yourClass: string }).yourClass === 'V.I.P' ? 2 : 1;
    const actionsUsed = parseInt(sessionStorage.getItem('actionsUsed') ?? String(maxActions), 10);
    return actionsUsed < maxActions ? '/actions-menu' : '/waiting-screen';
  }

  if (!session) return null;

  const dealerScore = handScore(dealerHand);

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.container}>

        {/* ── Header ── */}
        <header className={styles.header}>
          <h1 className={styles.title}>&gt;&gt; BLACKJACK &lt;&lt;</h1>
          <p className={styles.abilityLabel}>
            {session.abilityName}
            {session.targetCodename && (
              <span className={styles.target}> → {session.targetCodename}</span>
            )}
          </p>
          {session.winsNeeded > 1 && (
            <p className={styles.winProgress}>
              Vitórias: {session.winsAchieved}/{session.winsNeeded}
            </p>
          )}
          <p className={styles.modHint}>{modifierHint(session.modifier)}</p>
        </header>

        {/* ── Dealer hand ── */}
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

        <div className={styles.divider}>────────────────────────</div>

        {/* ── Player hand ── */}
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

        {/* ── Resultado intermediário (empate ou desvantagem, rodada continua) ── */}
        {roundUpdate && !result && (
          <div className={`${styles.result} ${roundUpdate.roundOutcome === 'win' ? styles.success : styles.failure}`}>
            <p className={styles.resultOutcome}>
              {roundUpdate.roundOutcome === 'win'
                ? `[ VITÓRIA ${roundUpdate.winsAchieved}/${roundUpdate.winsNeeded} ]`
                : '[ EMPATE ]'}
            </p>
            {roundUpdate.winsNeeded > 1 && (
              <p className={styles.winProgress}>
                Vitórias: {roundUpdate.winsAchieved}/{roundUpdate.winsNeeded}
              </p>
            )}
            <button
              className={styles.continueBtn}
              onClick={() => {
                if (!socket) return;
                socket.emit('client:blackjack_continue');
              }}
            >
              [PRÓXIMA RODADA]
            </button>
          </div>
        )}

        {/* ── Retry intermediário (vantagem +1, primeira tentativa falhou) ── */}
        {result && awaitingRetry && (
          <div className={`${styles.result} ${styles.failure}`}>
            <p className={styles.resultOutcome}>[ TENTATIVA 1 — FALHOU ]</p>
            <p className={styles.resultDesc}>{result.description}</p>
            <p className={styles.retryHint}>VANTAGEM ATIVA — segunda chance disponível</p>
            <button
              className={styles.retryBtn}
              onClick={() => {
                if (!socket) return;
                socket.emit('client:blackjack_retry');
              }}
            >
              [TENTAR NOVAMENTE]
            </button>
          </div>
        )}

        {/* ── Resultado final (sucesso ou falha definitiva) ── */}
        {result && !awaitingRetry && (
          <div className={`${styles.result} ${result.outcome === 'success' ? styles.success : styles.failure}`}>
            <p className={styles.resultOutcome}>
              {result.outcome === 'success' ? '[ SUCESSO ]' : '[ FALHA ]'}
            </p>
            <p className={styles.resultDesc}>{result.description}</p>
            <button
              className={styles.continueBtn}
              onClick={() => {
                const dest = getDestination();
                if (dest === '/waiting-screen' && socket) {
                  socket.emit('client:vote_end_turn');
                  sessionStorage.setItem('didVoteEndTurn', '1');
                }
                router.push(dest);
              }}
            >
              [CONTINUAR]
            </button>
          </div>
        )}

        {/* ── Action buttons ── */}
        {!actionDone && (
          <div className={styles.actions}>
            {!hasInteracted && (
              <button className={styles.cancelBtn} onClick={cancel}>
                [CANCELAR]
              </button>
            )}
            <button className={styles.hitBtn} onClick={hit}>[HIT]</button>
            <button className={styles.standBtn} onClick={stand}>[STAND]</button>
          </div>
        )}

      </div>
    </div>
  );
}
