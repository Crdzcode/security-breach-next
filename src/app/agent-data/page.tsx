'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import type { GameStartedPayload } from '@/types/game';
import styles from './page.module.css';

// ─── Cor do codinome por classe ───────────────────────────────────────────────
const CODENAME_COLOR: Record<string, string> = {
  Inocente: 'white',
  Assassino: '#f00',
  Policial: '#4af',
  'V.I.P': '#ff0',
};

// ─── Hook: efeito typewriter ──────────────────────────────────────────────────
function useTypewriter(fullText: string, delayMs = 25) {
  const [displayed, setDisplayed] = useState('');

  useEffect(() => {
    if (!fullText) return;
    let index = 0;
    setDisplayed('');

    const id = setInterval(() => {
      setDisplayed((prev) => prev + fullText.charAt(index));
      index++;
      if (index >= fullText.length) clearInterval(id);
    }, delayMs);

    return () => clearInterval(id);
  }, [fullText, delayMs]);

  return displayed;
}

// ─── Página principal ─────────────────────────────────────────────────────────
export default function AgentDataPage() {
  const router = useRouter();
  const [data, setData] = useState<GameStartedPayload | null>(null);

  useEffect(() => {
    const raw = sessionStorage.getItem('gameStarted');
    if (!raw) {
      router.replace('/login-fail');
      return;
    }
    try {
      setData(JSON.parse(raw) as GameStartedPayload);
    } catch {
      router.replace('/login-fail');
    }
  }, [router]);

  const description = useTypewriter(data?.profile.description ?? '');

  if (!data) return null;

  const { yourClass, teammates, missionBriefing, abilityGroups, profile } = data;
  const codenameColor = CODENAME_COLOR[yourClass] ?? '#0ff';

  return (
    <div className={styles.page}>
      <div className={styles.scanlines} aria-hidden="true" />

      <div className={styles.hud}>
        {/* ── Cabeçalho ── */}
        <div className={styles.agentHeader}>
          <Image
            src={profile.image}
            alt={profile.displayName}
            width={256}
            height={256}
            className={styles.agentPhoto}
          />
          <div className={styles.agentInfo}>
            <span className={styles.codename} style={{ color: codenameColor }}>
              {profile.codename.toUpperCase()}
            </span>
            <h1>Nome: {profile.displayName}</h1>
            <p>Classe: {yourClass}</p>
          </div>
        </div>

        {/* ── Descrição ── */}
        <div className={styles.section}>
          <h2>&gt;&gt; DESCRIÇÃO</h2>
          <p className={styles.description}>{description}</p>
        </div>

        {/* ── Habilidades ── */}
        <div className={styles.section}>
          <h2>&gt;&gt; HABILIDADES</h2>
          {abilityGroups.map((group) => (
            <div key={group.statType} className={styles.skill}>
              <p className={styles.skillHeader}>
                {group.statType} ({group.modifier})
              </p>
              <div className={styles.bar}>
                <div className={styles.fill} />
              </div>
              {group.abilities.map((ability) => (
                <div key={ability.name}>
                  <span className={styles.abilityName}>• {ability.name}</span>
                  <span className={styles.abilityDesc}>{ability.description}</span>
                </div>
              ))}
            </div>
          ))}
        </div>

        {/* ── Equipe ── */}
        <div className={styles.section}>
          <h2>&gt;&gt; EQUIPE</h2>
          {yourClass === 'Inocente' ? (
            <p className={styles.alone}>
              Você está <strong>SOZINHO</strong>, não confie em ninguém...
            </p>
          ) : (
            <ul className={styles.teamList}>
              {teammates.map((codename, i) => (
                <li key={codename}>
                  <span className={styles.online}>[ONLINE]</span>{' '}
                  {codename.charAt(0).toUpperCase() + codename.slice(1)}
                  {yourClass === 'Policial' && i === 0 && (
                    <strong className={styles.vipLabel}> [V.I.P]</strong>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* ── Briefing da missão ── */}
        <div className={styles.section}>
          <h2>&gt;&gt; BRIEFING DA MISSÃO</h2>
          <p className={styles.missionText}>{missionBriefing}</p>
        </div>

        {/* ── Botão de missão ── */}
        <div className={styles.section}>
          <button
            className={styles.startButton}
            onClick={() => router.push('/actions-menu')}
          >
            [INICIAR MISSÃO]
          </button>
        </div>
      </div>
    </div>
  );
}
