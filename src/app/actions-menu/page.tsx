'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type {
  GameStartedPayload,
  AbilityGroup,
  Ability,
  PlayerPublic,
  VoteUpdatePayload,
  GameUpdatePayload,
  AutopsyResultPayload,
} from '@/types/game';
import styles from './page.module.css';

// Habilidades que requerem selecionar alvo
const NEEDS_TARGET = new Set([
  'Presas da Serpente',
  'Fatiar e picar',
  'Atirar pra matar',
  'Sabotagem',
  'Autópsia',
  'Preso em nome da lei',
  'Primeiros socorros',
]);

// Habilidades que só podem ter alvos mortos
const TARGETS_DEAD = new Set(['Autópsia']);

// Habilidades ofensivas: não pode acertar teammate
const OFFENSIVE = new Set([
  'Presas da Serpente',
  'Fatiar e picar',
  'Atirar pra matar',
  'Sabotagem',
  'Preso em nome da lei',
]);

function getValidTargets(
  abilityName: string,
  players: PlayerPublic[],
  myCodename: string,
  teammates: string[],
): PlayerPublic[] {
  if (TARGETS_DEAD.has(abilityName)) {
    return players.filter((p) => p.status === 'deceased' && p.codename !== myCodename && !p.wasAutopsied);
  }
  if (OFFENSIVE.has(abilityName)) {
    return players.filter(
      (p) =>
        p.status === 'alive' &&
        p.codename !== myCodename &&
        !teammates.includes(p.codename),
    );
  }
  // Primeiros socorros: alvos vivos OU caídos (downed)
  if (abilityName === 'Primeiros socorros') {
    return players.filter(
      (p) => (p.status === 'alive' || p.status === 'downed') && p.codename !== myCodename,
    );
  }
  // Cura e investigação: qualquer jogador vivo exceto si mesmo
  return players.filter((p) => p.status === 'alive' && p.codename !== myCodename);
}

export default function ActionsMenuPage() {
  const { socket } = useSocket();
  const router = useRouter();

  const [gameData, setGameData]         = useState<GameStartedPayload | null>(null);
  const [players, setPlayers]           = useState<PlayerPublic[]>([]);
  const [round, setRound]               = useState(1);
  const [actionsUsed, setActionsUsed]   = useState(0);
  const [maxActions, setMaxActions]     = useState(1);
  const [votes, setVotes]               = useState({ votes: 0, needed: 0 });
  const [hasVoted, setHasVoted]         = useState(false);
  const [firstAidConsumed, setFirstAidConsumed] = useState(false);
  const [lockedTargets, setLockedTargets] = useState<Set<string>>(new Set());
  const [autopsyLog, setAutopsyLog] = useState<AutopsyResultPayload[]>([]);

  // Ability selection state
  const [pendingAbility, setPendingAbility]   = useState<{ ability: Ability; group: AbilityGroup } | null>(null);
  const [pendingTarget, setPendingTarget]     = useState<string | null>(null);
  const [targetPickerOpen, setTargetPickerOpen] = useState(false);

  useEffect(() => {
    const raw = sessionStorage.getItem('gameStarted');
    if (!raw) { router.replace('/login-fail'); return; }
    const data = JSON.parse(raw) as GameStartedPayload;
    setGameData(data);
    setMaxActions(data.yourClass === 'V.I.P' ? 2 : 1);
    setFirstAidConsumed(sessionStorage.getItem('firstAidConsumed') === '1');

    const rawAutopsy = sessionStorage.getItem('autopsyLog');
    if (rawAutopsy) setAutopsyLog(JSON.parse(rawAutopsy) as AutopsyResultPayload[]);

    // Restaura actionsUsed ao voltar do blackjack (VIP com 2 ações)
    const storedActions = sessionStorage.getItem('actionsUsed');
    if (storedActions) setActionsUsed(parseInt(storedActions, 10));

    // GameNavigationHandler persiste o round atual antes de navegar
    const storedRound = sessionStorage.getItem('currentRound');
    if (storedRound) setRound(parseInt(storedRound, 10));

    // GameNavigationHandler persiste os jogadores atuais antes de navegar
    const storedPlayers = sessionStorage.getItem('roundPlayers');
    if (storedPlayers) setPlayers(JSON.parse(storedPlayers) as PlayerPublic[]);
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const onVoteUpdate = (payload: VoteUpdatePayload) => setVotes(payload);
    const onGameUpdate = (payload: GameUpdatePayload) => {
      if (payload.phase === 'action') {
        setPlayers(payload.players);
        setRound(payload.round);
        setActionsUsed(0);
        sessionStorage.removeItem('actionsUsed');
        setLockedTargets(new Set());
        setHasVoted(false);
        setVotes({ votes: 0, needed: payload.players.filter((p) => p.status === 'alive').length });
      }
    };
    const onActionRefund = () => {
      setActionsUsed((prev) => {
        const next = Math.max(0, prev - 1);
        sessionStorage.setItem('actionsUsed', String(next));
        return next;
      });
    };

    socket.on('server:vote_update',   onVoteUpdate);
    socket.on('server:game_update',   onGameUpdate);
    socket.on('server:action_refund', onActionRefund);

    return () => {
      socket.off('server:vote_update',   onVoteUpdate);
      socket.off('server:game_update',   onGameUpdate);
      socket.off('server:action_refund', onActionRefund);
    };
  }, [socket]);

  function useAbility(ability: Ability, group: AbilityGroup) {
    if (ability.isPassive) return;
    if (actionsUsed >= maxActions) return;

    if (NEEDS_TARGET.has(ability.name)) {
      setPendingAbility({ ability, group });
      setTargetPickerOpen(true);
    } else {
      emitAction(ability, group, null);
    }
  }

  function confirmTarget() {
    if (!pendingAbility) return;
    emitAction(pendingAbility.ability, pendingAbility.group, pendingTarget);
    setTargetPickerOpen(false);
    setPendingAbility(null);
    setPendingTarget(null);
  }

  function emitAction(ability: Ability, group: AbilityGroup, target: string | null) {
    if (!socket) return;
    socket.emit('client:use_ability', {
      abilityName: ability.name,
      statType: group.statType,
      targetCodename: target,
    });
    setActionsUsed((prev) => {
      const next = prev + 1;
      sessionStorage.setItem('actionsUsed', String(next));
      return next;
    });
    if (target) {
      setLockedTargets((prev) => new Set(prev).add(target));
    }
  }

  function voteEndTurn() {
    if (!socket || hasVoted) return;
    socket.emit('client:vote_end_turn');
    setHasVoted(true);
    // Signal to waiting-screen that this player already voted
    sessionStorage.setItem('didVoteEndTurn', '1');
    router.push('/waiting-screen');
  }

  if (!gameData) return null;

  const myCodename   = typeof window !== 'undefined' ? sessionStorage.getItem('player') : null;
  const validTargets = pendingAbility
    ? getValidTargets(pendingAbility.ability.name, players, myCodename ?? '', gameData.teammates)
        .filter((p) => !lockedTargets.has(p.codename))
    : [];

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      {/* Target picker overlay */}
      {targetPickerOpen && (
        <div className={styles.overlay}>
          <div className={styles.picker}>
            <h3 className={styles.pickerTitle}>Selecione o alvo</h3>
            <ul className={styles.pickerList}>
              {validTargets.map((p) => (
                <li key={p.codename}>
                  <button
                    className={`${styles.pickerBtn} ${pendingTarget === p.codename ? styles.pickerBtnActive : ''}`}
                    onClick={() => setPendingTarget(p.codename)}
                  >
                    {p.displayName}
                  </button>
                </li>
              ))}
            </ul>
            <div className={styles.pickerActions}>
              <button className={styles.confirmBtn} disabled={!pendingTarget} onClick={confirmTarget}>
                [CONFIRMAR]
              </button>
              <button className={styles.cancelBtn} onClick={() => { setTargetPickerOpen(false); setPendingAbility(null); }}>
                [CANCELAR]
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={styles.container}>
        {/* ── Perfil do jogador ── */}
        <div className={styles.profile}>
          <Image
            src={gameData.profile.image}
            alt={gameData.profile.displayName}
            width={60}
            height={60}
            className={styles.profilePhoto}
          />
          <div className={styles.profileInfo}>
            <span className={styles.profileName}>{gameData.profile.displayName}</span>
            <span className={styles.profileClass}>[{gameData.yourClass}]</span>
          </div>
          <div className={styles.meta}>
            <span>RODADA {round}</span>
            <span className={actionsUsed >= maxActions ? styles.noActions : styles.hasActions}>
              AÇÕES: {actionsUsed}/{maxActions}
            </span>
          </div>
        </div>

        {/* Ability groups */}
        <div className={styles.groups}>
          {gameData.abilityGroups.map((group, idx) => (
            <div key={`${group.statType}-${idx}`} className={styles.group}>
              <h2 className={styles.groupTitle}>
                {group.isSurvivalGroup
                  ? 'SOBREVIVÊNCIA'
                  : <>{group.statType} <span className={styles.modifier}>({group.modifier})</span></>
                }
              </h2>
              <div className={styles.abilities}>
                {group.abilities.map((ability) => {
                  const passive  = ability.isPassive ?? false;
                  const faConsumed = ability.name === 'Primeiros socorros' && firstAidConsumed;
                  const disabled = actionsUsed >= maxActions || passive || faConsumed;
                  return (
                    <div key={ability.name} className={`${styles.abilityCard} ${passive ? styles.passive : ''}`}>
                      <div className={styles.abilityHeader}>
                        <span className={styles.abilityName}>• {ability.name}</span>
                        {passive && <span className={styles.passiveTag}>[PASSIVA]</span>}
                      </div>
                      <p className={styles.abilityDesc}>{ability.description}</p>
                      {!passive && (
                        <button
                          className={styles.useBtn}
                          disabled={disabled}
                          onClick={() => useAbility(ability, group)}
                        >
                          [USAR]
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Autópsia log — visível apenas para V.I.P */}
        {gameData.yourClass === 'V.I.P' && autopsyLog.length > 0 && (
          <div className={styles.autopsySection}>
            <h2 className={styles.autopsySectionTitle}>[ RELATÓRIOS FORENSES ]</h2>
            {autopsyLog.map((entry, i) => (
              <div key={i} className={styles.autopsyEntry}>
                <p className={styles.autopsyTarget}>• {entry.targetDisplayName}</p>
                <p className={styles.autopsyCause}>
                  {entry.causeOfDeath === 'envenenamento' ? 'Causa: envenenamento' : 'Causa: ataque físico'}
                </p>
                <p className={styles.autopsyDesc}>{entry.description}</p>
              </div>
            ))}
          </div>
        )}

        {/* Vote section */}
        <div className={styles.voteSection}>
          {votes.needed > 0 && (
            <p className={styles.voteCount}>
              Votos para encerrar turno: {votes.votes}/{votes.needed}
            </p>
          )}
          <button
            className={styles.voteBtn}
            disabled={hasVoted}
            onClick={voteEndTurn}
          >
            {hasVoted ? '[VOTO ENVIADO]' : '[VOTAR FIM DE TURNO]'}
          </button>
        </div>
      </div>
    </div>
  );
}
