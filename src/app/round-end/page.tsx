'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { PlayerSelf, TurnReportPayload, WinnerSide, AutopsyResultPayload, AgentClass } from '@/types/game';
import styles from './page.module.css';

const STATUS_LABEL: Record<string, string> = {
  alive:    '● VIVO',
  hiding:   '■ AUSENTE',
  deceased: '✕ ELIMINADO',
  arrested: '▣ SINAL BLOQUEADO',
  downed:   '[!] FALHA CRÍTICA',
};

const STATUS_CLASS: Record<string, string> = {
  alive:    'statusAlive',
  hiding:   'statusHiding',
  deceased: 'statusDeceased',
  arrested: 'statusArrested',
  downed:   'statusDowned',
};

export default function RoundEndPage() {
  const router = useRouter();
  const { socket } = useSocket();

  const [player, setPlayer]         = useState<PlayerSelf | null>(null);
  const [winner, setWinner]         = useState<WinnerSide>(null);
  const [votes, setVotes]           = useState({ votes: 0, needed: 0 });
  const [hasVoted, setHasVoted]     = useState(false);
  const [myStatus, setMyStatus]     = useState<string>('alive');
  const [autopsyModal, setAutopsyModal] = useState<AutopsyResultPayload | null>(null);
  const [vipEscapeNotice, setVipEscapeNotice] = useState(false);
  const [classReveal, setClassReveal]   = useState<Record<string, AgentClass> | null>(null);
  const [reportPlayers, setReportPlayers] = useState<TurnReportPayload['players']>([]);

  useEffect(() => {
    // Dados do próprio jogador
    const rawPlayer = sessionStorage.getItem('myPlayer');
    if (!rawPlayer) { router.replace('/'); return; }
    const p = JSON.parse(rawPlayer) as PlayerSelf;
    setPlayer(p);

    // Status atualizado após a rodada (do turn_report)
    const rawReport = sessionStorage.getItem('turnReport');
    if (rawReport) {
      const report = JSON.parse(rawReport) as TurnReportPayload;
      setWinner(report.winner);
      setReportPlayers(report.players);
      const me = report.players.find((x) => x.codename === p.codename);
      if (me) setMyStatus(me.status);
      if (report.classReveal) setClassReveal(report.classReveal);
    }

    // Autopsy modal — one-time, removed on dismiss
    const rawAutopsy = sessionStorage.getItem('pendingAutopsyModal');
    if (rawAutopsy) {
      setAutopsyModal(JSON.parse(rawAutopsy) as AutopsyResultPayload);
    }

    // VIP passive escape notice — one-time flag
    const escapeFlag = sessionStorage.getItem('vipEscapeNotice');
    if (escapeFlag) {
      setVipEscapeNotice(true);
      sessionStorage.removeItem('vipEscapeNotice');
    }
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const onVote = (payload: { votes: number; needed: number }) => setVotes(payload);

    socket.on('server:next_round_vote', onVote);
    return () => { socket.off('server:next_round_vote', onVote); };
  }, [socket]);

  function voteNextRound() {
    if (!socket || hasVoted) return;
    socket.emit('client:vote_next_round');
    setHasVoted(true);
  }

  function dismissAutopsy() {
    sessionStorage.removeItem('pendingAutopsyModal');
    setAutopsyModal(null);
  }

  if (!player) return null;

  const statusKey = myStatus in STATUS_LABEL ? myStatus : 'alive';

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

      {/* ── Autopsy modal overlay ── */}
      {autopsyModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalBox}>
            <p className={styles.modalHeader}>[!] RELATÓRIO FORENSE</p>
            <p className={styles.modalTarget}>{autopsyModal.targetDisplayName}</p>
            <p className={styles.modalCause}>
              Causa: {autopsyModal.causeOfDeath === 'envenenamento' ? 'ENVENENAMENTO' : 'ATAQUE FÍSICO'}
            </p>
            <p className={styles.modalDesc}>{autopsyModal.description}</p>
            <button className={styles.modalCloseBtn} onClick={dismissAutopsy}>
              [FECHAR RELATÓRIO]
            </button>
          </div>
        </div>
      )}

      <div className={styles.container}>

        {/* Foto */}
        <div className={styles.photoWrap}>
          <Image
            src={player.image}
            alt={player.displayName}
            width={160}
            height={160}
            className={`${styles.photo} ${myStatus === 'deceased' ? styles.photoDeceased : ''}`}
            priority
          />
        </div>

        {/* Identidade */}
        <div className={styles.identity}>
          <h1 className={styles.displayName}>{player.displayName}</h1>
          <p className={styles.codename}>[{player.codename}]</p>
        </div>

        {/* Status após a rodada */}
        <p className={`${styles.statusBadge} ${styles[STATUS_CLASS[statusKey]]}`}>
          {STATUS_LABEL[statusKey]}
        </p>

        {/* VIP passive escape notice */}
        {vipEscapeNotice && (
          <div className={styles.vipEscapeNotice}>
            <p className={styles.vipEscapeTitle}>▶ PROTOCOLO DE PROTEÇÃO ATIVADO</p>
            <p className={styles.vipEscapeDesc}>
              Você escapou automaticamente de um ataque letal. Esta proteção foi consumida e não estará disponível novamente.
            </p>
          </div>
        )}

        {/* Resultado do jogo se encerrou */}
        {winner && (
          <div className={`${styles.winnerBanner} ${winner === 'assassins' ? styles.danger : styles.safe}`}>
            {winner === 'assassins'
              ? 'OS ASSASSINOS VENCERAM'
              : 'OS INOCENTES VENCERAM'}
          </div>
        )}

        {/* Votação para próxima rodada — apenas jogadores vivos votam */}
        {!winner && myStatus === 'alive' && (
          <div className={styles.voteBlock}>
            {votes.needed > 0 && (
              <p className={styles.voteCount}>
                Votos: {votes.votes}/{votes.needed}
              </p>
            )}
            <button
              className={styles.voteBtn}
              disabled={hasVoted}
              onClick={voteNextRound}
            >
              {hasVoted ? '[VOTO ENVIADO]' : '[VOTAR PRÓXIMA RODADA]'}
            </button>
          </div>
        )}

        <p className={styles.hint}>
          {winner
            ? 'Jogo encerrado.'
            : myStatus !== 'alive'
              ? 'Aguardando demais agentes...'
              : hasVoted
                ? 'Aguardando demais agentes...'
                : 'Vote para iniciar a próxima rodada.'}
        </p>

        {/* Class reveal section — only on game over */}
        {winner && classReveal && reportPlayers.length > 0 && (
          <div className={styles.classReveal}>
            <p className={styles.classRevealTitle}>▶ IDENTIDADES REVELADAS</p>
            <div className={styles.classRevealList}>
              {reportPlayers.map((p) => {
                const cls = classReveal[p.codename] as AgentClass | undefined;
                return (
                  <div key={p.codename} className={styles.classRevealRow}>
                    <span className={styles.classRevealName}>{p.displayName}</span>
                    <span className={`${styles.classRevealBadge} ${cls ? CLASS_COLOR[cls] : ''}`}>
                      {cls ? CLASS_LABEL[cls] : '???'}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
