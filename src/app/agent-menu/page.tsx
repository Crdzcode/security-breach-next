'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Scanlines } from '@/components/Scanlines';
import { agentsData } from '@/data/agents';
import type { Agent } from '@/types/game';
import styles from './page.module.css';

export default function AgentMenuPage() {
  const router = useRouter();
  const [agent, setAgent] = useState<Agent | null>(null);

  useEffect(() => {
    const player = sessionStorage.getItem('player');

    if (!player || player === 'null') {
      router.replace('/login-fail');
      return;
    }

    // Consome o player key — esta tela é de uso único por sessão
    sessionStorage.removeItem('player');

    const data = agentsData[player.toLowerCase()];
    if (!data) {
      router.replace('/login-fail');
      return;
    }

    setAgent(data);
  }, [router]);

  if (!agent) return null;

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />
      <div className={styles.terminal}>
        <h1 className={styles.title}>&gt;&gt;TERMINAL DE ACESSO&lt;&lt;</h1>
        <Image
          src={agent.agentImage}
          alt={agent.agentFullName}
          width={160}
          height={160}
          className={styles.photo}
        />
        <p className={styles.agentName}>
          Bem-vindo(a), <strong>{agent.agentFullName}</strong>
        </p>
        <p className={styles.info}>
          Identidade verificada. Protocolo de monitoramento ativo.
          <br />
          Todas as ações serão registradas.
          <br />
          Aguarde instruções do sistema.
        </p>
      </div>
    </div>
  );
}
