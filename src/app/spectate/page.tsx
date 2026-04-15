'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { PlayerSelf, TurnReportPayload } from '@/types/game';
import styles from './page.module.css';

const STATUS_HINT: Record<string, string> = {
  deceased: 'Agente eliminado. Operação encerrada.',
  arrested: 'Sinal bloqueado. Agente detido — indisponível por esta rodada.',
  downed:   'Sistema em falha crítica. Aguardando protocolo de resgate.',
  hiding:   'Agente oculto. Missão encoberta ativa por esta rodada.',
};

export default function SpectatePage() {
  const { socket } = useSocket();
  const router = useRouter();

  const [player, setPlayer]     = useState<PlayerSelf | null>(null);
  const [myStatus, setMyStatus] = useState<string>('deceased');

  useEffect(() => {
    const raw = sessionStorage.getItem('myPlayer');
    if (!raw) { router.replace('/'); return; }
    const p = JSON.parse(raw) as PlayerSelf;
    setPlayer(p);

    // Determine current status from the most recent roundPlayers snapshot
    const rawPlayers = sessionStorage.getItem('roundPlayers');
    if (rawPlayers) {
      const players = JSON.parse(rawPlayers) as Array<{ codename: string; status: string }>;
      const me = players.find((x) => x.codename === p.codename);
      if (me) setMyStatus(me.status);
    }
  }, [router]);

  useEffect(() => {
    if (!socket) return;

    const onTurnReport = (payload: TurnReportPayload) => {
      sessionStorage.setItem('turnReport', JSON.stringify(payload));
      router.push('/round-end');
    };

    socket.on('server:turn_report', onTurnReport);
    return () => { socket.off('server:turn_report', onTurnReport); };
  }, [socket, router]);

  if (!player) return null;

  const isDeceased = myStatus === 'deceased';
  const isDowned   = myStatus === 'downed';
  const isArrested = myStatus === 'arrested';
  const isHiding   = myStatus === 'hiding';

  const pageClass = isDeceased ? styles.pageDead
    : isDowned   ? styles.pageDanger
    : isHiding   ? styles.pageHiding
    : styles.pageArrested;

  const msgClass = isDeceased ? styles.msgDead
    : isDowned   ? styles.msgDanger
    : isHiding   ? styles.msgHiding
    : styles.msgArrested;

  return (
    <div className={`${styles.page} ${pageClass}`}>
      <Scanlines variant="green" />

      <div className={styles.container}>

        {/* Photo */}
        <div className={styles.photoWrap}>
          <Image
            src={player.image}
            alt={player.displayName}
            width={160}
            height={160}
            className={`${styles.photo} ${isDeceased ? styles.photoDeceased : ''} ${isDowned ? styles.photoDowned : ''} ${isHiding ? styles.photoHiding : ''}`}
            priority
          />
          {isDeceased && <div className={styles.xOverlay}>✕</div>}
          {isDowned   && <div className={styles.dangerOverlay}>[!]</div>}
          {isArrested && <div className={styles.barsOverlay} />}
          {isHiding   && <div className={styles.hidingOverlay}>[■]</div>}
        </div>

        {/* Identity */}
        <h1 className={styles.name}>{player.displayName}</h1>
        <p className={styles.codename}>[{player.codename}]</p>

        {/* Status message */}
        <p className={`${styles.statusMsg} ${msgClass}`}>
          {STATUS_HINT[myStatus] ?? STATUS_HINT['deceased']}
        </p>

        <p className={styles.waiting}>Aguardando fim de turno...</p>

      </div>
    </div>
  );
}
