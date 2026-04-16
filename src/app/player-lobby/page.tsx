'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Scanlines } from '@/components/Scanlines';
import type { PlayerSelf } from '@/types/game';
import styles from './page.module.css';

const STAT_LABELS = [
  { key: 'strength',     label: 'FORÇA' },
  { key: 'intelligence', label: 'INTELIGÊNCIA' },
  { key: 'dexterity',    label: 'DESTREZA' },
] as const;

function modifierClass(mod: string) {
  if (mod === '+1') return styles.modBuff;
  if (mod === '-1') return styles.modDebuff;
  return styles.modNeutral;
}

function modifierLabel(mod: string) {
  if (mod === '+1') return '+1 ▲';
  if (mod === '-1') return '-1 ▼';
  return ' 0 ─';
}

export default function PlayerLobbyPage() {
  const router = useRouter();
  const [player, setPlayer] = useState<PlayerSelf | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('myPlayer');
    if (!raw) {
      router.replace('/');
      return;
    }
    try {
      setPlayer(JSON.parse(raw) as PlayerSelf);
    } catch {
      router.replace('/');
    }
  }, [router]);

  if (!player) return null;

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.container}>
        {/* ── Foto ── */}
        <div className={styles.photoWrap}>
          <Image
            src={player.image}
            alt={player.displayName}
            width={200}
            height={200}
            className={styles.photo}
            priority
          />
          <span className={styles.onlineDot}>●</span>
        </div>

        {/* ── Identidade ── */}
        <div className={styles.identity}>
          <h1 className={styles.displayName}>{player.displayName}</h1>
          <p className={styles.codename}>[{player.codename}]</p>
        </div>

        {/* ── Atributos ── */}
        <div className={styles.statsBlock}>
          <h2 className={styles.statsTitle}>&gt;&gt; ATRIBUTOS</h2>
          {STAT_LABELS.map(({ key, label }) => {
            const mod = player.modifiers[key];
            return (
              <div key={key} className={styles.statRow}>
                <span className={styles.statLabel}>{label}</span>
                <span className={`${styles.modifier} ${modifierClass(mod)}`}>
                  {modifierLabel(mod)}
                </span>
              </div>
            );
          })}
        </div>

        {/* ── Status ── */}
        <p className={styles.waiting}>⌛ Aguardando início do jogo...</p>
      </div>
    </div>
  );
}
