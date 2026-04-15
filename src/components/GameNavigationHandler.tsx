'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from './SocketProvider';
import type {
  GameStartedPayload,
  BlackjackStartPayload,
  TurnReportPayload,
  GameUpdatePayload,
  AutopsyResultPayload,
} from '@/types/game';

// ─────────────────────────────────────────────────────────────────────────────
// Centraliza navegação dirigida pelo servidor.
// Montado uma vez no layout — não renderiza nada.
//
// isPlayer() usa sessionStorage (por-aba) — garante que a tela de TV
// (que nunca seta myPlayer em sessionStorage) não seja redirecionada.
// ─────────────────────────────────────────────────────────────────────────────

export function GameNavigationHandler() {
  const { socket } = useSocket();
  const router = useRouter();

  useEffect(() => {
    if (!socket) return;

    const isPlayer = () => !!sessionStorage.getItem('myPlayer');
    const isAt = (path: string) => window.location.pathname === path;

    const onGameStarted = (payload: GameStartedPayload) => {
      if (!isPlayer()) return;
      sessionStorage.setItem('gameStarted', JSON.stringify(payload));
      router.push('/agent-data');
    };

    const onBlackjackStart = (payload: BlackjackStartPayload) => {
      if (!isPlayer()) return;
      sessionStorage.setItem('bjStart', JSON.stringify(payload));
      if (payload.isSalvaguarda) {
        if (!isAt('/salvaguarda')) router.push('/salvaguarda');
      } else {
        if (!isAt('/blackjack')) router.push('/blackjack');
      }
    };

    // Fim de rodada — jogador vai para tela individual de espera (/round-end)
    // A tela pública de report (/report-screen) é responsabilidade do lobby TV
    const onTurnReport = (payload: TurnReportPayload) => {
      if (!isPlayer()) return;
      sessionStorage.setItem('turnReport', JSON.stringify(payload));
      router.push('/round-end');
    };

    const onGameUpdate = (payload: GameUpdatePayload) => {
      if (!isPlayer()) return;
      if (payload.phase === 'action') {
        // Persiste estado da rodada (lido por actions-menu, salvaguarda e spectate)
        sessionStorage.setItem('currentRound', String(payload.round));
        sessionStorage.setItem('roundPlayers', JSON.stringify(payload.players));
        // Limpa estado de ações da rodada anterior para que /actions-menu monte corretamente
        sessionStorage.removeItem('actionsUsed');

        // Rota baseada no status atual do jogador
        const raw = sessionStorage.getItem('myPlayer');
        if (!raw) return;
        const myCodename = (JSON.parse(raw) as { codename: string }).codename;
        const me = payload.players.find((p) => p.codename === myCodename);

        if (me && (me.status === 'deceased' || me.status === 'arrested' || me.status === 'downed' || me.status === 'hiding')) {
          // Downed com salvaguarda recebem server:blackjack_start em seguida (override para /salvaguarda)
          if (!isAt('/spectate')) router.push('/spectate');
        } else {
          if (!isAt('/actions-menu')) router.push('/actions-menu');
        }
      }
    };

    const onAutopsyResult = (payload: AutopsyResultPayload) => {
      if (!isPlayer()) return;
      // Histórico persistente para a seção de autópsias do V.I.P.
      const raw = sessionStorage.getItem('autopsyLog');
      const log: AutopsyResultPayload[] = raw ? JSON.parse(raw) : [];
      log.push(payload);
      sessionStorage.setItem('autopsyLog', JSON.stringify(log));
      // Modal de exibição imediata — lido e removido no round-end
      sessionStorage.setItem('pendingAutopsyModal', JSON.stringify(payload));
    };

    const onVipAutoEscaped = () => {
      if (!isPlayer()) return;
      sessionStorage.setItem('vipEscapeNotice', '1');
    };

    socket.on('server:game_started',      onGameStarted);
    socket.on('server:blackjack_start',   onBlackjackStart);
    socket.on('server:turn_report',       onTurnReport);
    socket.on('server:game_update',       onGameUpdate);
    socket.on('server:autopsy_result',    onAutopsyResult);
    socket.on('server:vip_auto_escaped',  onVipAutoEscaped);

    return () => {
      socket.off('server:game_started',      onGameStarted);
      socket.off('server:blackjack_start',   onBlackjackStart);
      socket.off('server:turn_report',       onTurnReport);
      socket.off('server:game_update',       onGameUpdate);
      socket.off('server:autopsy_result',    onAutopsyResult);
      socket.off('server:vip_auto_escaped',  onVipAutoEscaped);
    };
  }, [socket, router]);

  return null;
}
