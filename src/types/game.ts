// ─── Primitivos ───────────────────────────────────────────────────────────────

export type AgentStatus   = 'alive' | 'hiding' | 'deceased' | 'arrested' | 'downed';
export type AgentClass    = 'Inocente' | 'Assassino' | 'Policial' | 'V.I.P';
export type StatType      = 'Força' | 'Inteligência' | 'Dextreza';
export type Modifier      = '+1' | '0' | '-1';
export type GamePhase     = 'lobby' | 'action' | 'resolving' | 'report' | 'game_over';
export type WinnerSide    = 'assassins' | 'innocents' | null;
export type CardSuit      = '♠' | '♥' | '♦' | '♣';
export type CardRank      = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

// ─── Habilidades ──────────────────────────────────────────────────────────────

export interface Ability {
  name: string;
  description: string;
  isPassive?: boolean;
}

export interface AbilityGroup {
  statType: StatType;
  modifier: Modifier;
  abilities: Ability[];
  isSurvivalGroup?: boolean;
}

// Legado — mantido para páginas ainda não migradas
export interface AgentSkill {
  type: StatType;
  buff: Modifier;
  habilities: Ability[];
}

export interface AbilitySet {
  dexterity: Ability[];
  intelligence: Ability[];
  strength: Ability[];
}

// ─── Agente (legado — tela de briefing antiga) ────────────────────────────────

export interface Agent {
  agentStatus: AgentStatus;
  agentImage: string;
  agentName: string;
  agentFullName: string;
  agentClass: AgentClass;
  agentDescription: string;
  agentAbilities: AgentSkill[];
  agentTeam: string[];
  missionBriefing: string;
}

export type AgentsData = Record<string, Agent>;

// ─── Jogador público (sem classe) ─────────────────────────────────────────────

export interface PlayerPublic {
  codename: string;
  displayName: string;
  image: string;
  status: AgentStatus;
  hasVotedEndTurn: boolean;
  isConnected: boolean;
  wasAutopsied?: boolean;
}

/** Dados do próprio jogador — inclui modificadores (não visíveis para os outros) */
export interface PlayerSelf extends PlayerPublic {
  modifiers: { strength: Modifier; intelligence: Modifier; dexterity: Modifier };
}

// ─── Baralho ──────────────────────────────────────────────────────────────────

export interface Card {
  rank: CardRank;
  suit: CardSuit;
  hidden?: boolean;
}

// ─── Status de relatório ──────────────────────────────────────────────────────

export type StatusClass = 'online' | 'ausente' | 'offline';

export interface StatusTranslation {
  class: StatusClass;
  text: string;
  specialCharacter: string;
}

export type StatusTranslationMap = Record<AgentStatus, StatusTranslation>;

// ─── Informações de missão ────────────────────────────────────────────────────

export interface MissionBriefings {
  innocent: string;
  assassin: string;
  cop: string;
  vip: string;
}

// ─────────────────────────────────────────────────────────────────────────────
// Payloads: Servidor → Cliente
// ─────────────────────────────────────────────────────────────────────────────

export interface LoginSuccessPayload {
  player: PlayerSelf;        // próprio jogador com modificadores
  roomId: string;
  players: PlayerPublic[];   // snapshot completo da sala
  phase: GamePhase;
  round: number;
}

export interface RoomStatePayload {
  roomId: string;
  phase: GamePhase;
  round: number;
  players: PlayerPublic[];
  turnDuration: number;
  roundStartAt: number;
}

export interface AdminLoginSuccessPayload {
  codename: string;
  rooms: RoomPublic[];
}

export interface RoomPublic {
  id: string;
  playerCount: number;
  phase: GamePhase;
  round: number;
  players: PlayerPublic[];
}

export interface GameStartedPayload {
  yourClass: AgentClass;
  teammates: string[];
  missionBriefing: string;
  abilityGroups: AbilityGroup[];
  profile: {
    codename: string;
    displayName: string;
    image: string;
    description: string;
    modifiers: { strength: Modifier; intelligence: Modifier; dexterity: Modifier };
  };
}

export interface BlackjackStartPayload {
  playerHand: Card[];
  dealerHand: Card[];       // mão completa: [carta_visível, {hidden:true}]
  playerScore: number;
  modifier: Modifier;
  winsNeeded: number;
  winsAchieved: number;
  abilityName: string;
  targetCodename: string | null;
  isSalvaguarda?: boolean;
}

export interface BlackjackHitPayload {
  card: Card;
  playerHand: Card[];
  playerScore: number;
}

export interface BlackjackUpdatePayload {
  playerHand: Card[];
  dealerHand: Card[];
  playerScore: number;
  dealerScore: number;
  roundOutcome: 'win' | 'draw' | 'lose';
  winsAchieved: number;
  winsNeeded: number;
  continuing: boolean;
}

export interface BlackjackResultPayload {
  outcome: 'success' | 'failure';
  playerScore: number;
  dealerScore: number;
  playerHand: Card[];
  dealerHand: Card[];
  description: string;
  retryAvailable?: boolean;
}

export interface AutopsyResultPayload {
  targetCodename: string;
  targetDisplayName: string;
  causeOfDeath: 'envenenamento' | 'ataque_físico';
  killerStatType: StatType;
  description: string;
}

export interface TurnReportPayload {
  round: number;
  log: string[];
  players: PlayerPublic[];
  winner: WinnerSide;
  classReveal?: Record<string, AgentClass>;
  tasksRemaining: number;
}

export interface VoteUpdatePayload {
  votes: number;
  needed: number;
}

export interface GameUpdatePayload {
  phase: GamePhase;
  round: number;
  players: PlayerPublic[];
  turnDuration?: number;
  roundStartAt?: number;
}

// ─── Legado ───────────────────────────────────────────────────────────────────

/** @deprecated Substituído por LoginSuccessPayload */
export interface LoginSuccessResponse {
  disableGame: string;
  data: unknown;
}

export interface LoginPayload {
  codename: string;
  password: string;
  roomId?: string;
}
