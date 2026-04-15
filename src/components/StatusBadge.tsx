import type { AgentStatus, StatusTranslation } from '@/types/game';

const STATUS_MAP: Record<AgentStatus, StatusTranslation> = {
  alive: {
    class: 'online',
    text: 'ONLINE',
    specialCharacter: '[●]',
  },
  hiding: {
    class: 'ausente',
    text: 'DESCONHECIDO',
    specialCharacter: '[■]',
  },
  deceased: {
    class: 'offline',
    text: 'OFFLINE',
    specialCharacter: '[☼]',
  },
  arrested: {
    class: 'ausente',
    text: 'SINAL BLOQUEADO',
    specialCharacter: '[▣]',
  },
  downed: {
    class: 'ausente',
    text: 'FALHA CRÍTICA',
    specialCharacter: '[!]',
  },
};

interface StatusBadgeProps {
  agentName: string;
  status: AgentStatus;
}

export function StatusBadge({ agentName, status }: StatusBadgeProps) {
  const s = STATUS_MAP[status];
  return (
    <span className={`status-${s.class}`}>
      {s.specialCharacter} AGENTE {agentName} — {s.text}
    </span>
  );
}
