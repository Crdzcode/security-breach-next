import type { AgentsData } from '@/types/game';
import {
  innocentAbilities,
  assassinAbilities,
  copAbilities,
  vipAbilities,
  missionBriefings,
} from './abilities';

// ─── Dados dos agentes ────────────────────────────────────────────────────────
// Imagens em /public/agents/ → referenciadas como /agents/<nome>.png

export const agentsData: AgentsData = {
  pietra: {
    agentStatus: 'deceased',
    agentImage: '/agents/pietra.png',
    agentName: 'PIETRA',
    agentFullName: 'Pietra Leal',
    agentClass: 'Inocente',
    agentDescription:
      'Pietra é observadora, com olhos atentos que raramente deixam um detalhe escapar. Ela percebe o que passa despercebido para muitos, mas sua memória curta a obriga a agir rápido e com astúcia. Quando quer, pode ser sutilmente manipuladora, distorcendo situações a seu favor com um charme disfarçado e um sorriso indecifrável.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: assassinAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: assassinAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: assassinAbilities.dexterity },
    ],
    agentTeam: ['emelly'],
    missionBriefing: missionBriefings.innocent,
  },
  pedro: {
    agentStatus: 'deceased',
    agentImage: '/agents/pedro.png',
    agentName: 'PEDRO',
    agentFullName: 'Pedro Henrique',
    agentClass: 'Inocente',
    agentDescription:
      'Pedro é o tipo de pessoa que transforma qualquer sala em um palco, usando o humor como disfarce para sua sagacidade. Suas piadas são cuidadosamente calculadas, muitas vezes escondendo perguntas maliciosas que jogam verde para colher maduro. Embora pense de forma afiada, sua execução pode ser mais lenta — e quando se trata de força física, prefere escapar com palavras do que com músculos.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  luiza: {
    agentStatus: 'alive',
    agentImage: '/agents/luiza.png',
    agentName: 'LUIZA',
    agentFullName: 'Luiza Tavares',
    agentClass: 'Inocente',
    agentDescription:
      'Luiza é pequena e ágil, movendo-se com a leveza de quem já nasceu para não ser notada. Sua aparência doce e inofensiva é sua arma mais afiada — o tipo de pessoa que todos subestimam, até ser tarde demais. Afinal, são sempre as facas menores que causam os cortes mais profundos.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  amanda: {
    agentStatus: 'alive',
    agentImage: '/agents/amanda.png',
    agentName: 'AMANDA',
    agentFullName: 'Amanda Verri',
    agentClass: 'Inocente',
    agentDescription:
      'Amanda é inteligente e espirituosa, com uma mente afiada para detalhes e uma língua afiada para piadas. No entanto, sua furtividade nem sempre acompanha sua esperteza — tropeços e barulhos indesejados podem denunciar sua presença. Mas quando se trata de enxergar o que ninguém mais viu, ela está sempre um passo à frente.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '+1', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '0', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  maria: {
    agentStatus: 'alive',
    agentImage: '/agents/maria.png',
    agentName: 'MARIA',
    agentFullName: 'Maria Eduarda',
    agentClass: 'Inocente',
    agentDescription:
      'Maria é uma combinação rara de inteligência, agilidade e dissimulação. Ela se move com leveza e fala com convicção, capaz de mentir com naturalidade quando necessário. Seu amplo conhecimento lhe dá vantagem em praticamente qualquer situação, e sua furtividade a torna quase invisível quando precisa desaparecer.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  caio: {
    agentStatus: 'alive',
    agentImage: '/agents/caio.png',
    agentName: 'CAIO',
    agentFullName: 'Caio Quelhas',
    agentClass: 'V.I.P',
    agentDescription:
      'Caio é aquele que sempre tem uma piada na ponta da língua e uma saída pronta para qualquer situação. Ágil e sociável, consegue escapar de enrascadas com um sorriso e uma frase bem colocada. Seu físico leve e atlético o ajuda a fugir, escalar ou enfrentar o que for preciso — e se não der pra fugir com o corpo, ele escapa com lábia.',
    agentAbilities: [
      { type: 'Força', buff: '0', habilities: vipAbilities.strength },
      { type: 'Inteligência', buff: '-1', habilities: vipAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: vipAbilities.dexterity },
    ],
    agentTeam: ['luis', 'gustavo'],
    missionBriefing: missionBriefings.vip,
  },
  luis: {
    agentStatus: 'alive',
    agentImage: '/agents/luis.png',
    agentName: 'LUIS',
    agentFullName: 'Luis Felipe',
    agentClass: 'Policial',
    agentDescription:
      'Luis tem o dom da conversa e o charme de quem sabe exatamente o que dizer. Ele se mistura facilmente com qualquer grupo e evita conflitos com habilidade. Sua agilidade e preparo físico o ajudam a escapar de situações perigosas, mas é sua sociabilidade que o mantém quase sempre longe de encrenca.',
    agentAbilities: [
      { type: 'Força', buff: '0', habilities: copAbilities.strength },
      { type: 'Inteligência', buff: '-1', habilities: copAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: copAbilities.dexterity },
    ],
    agentTeam: ['caio', 'gustavo'],
    missionBriefing: missionBriefings.cop,
  },
  gustavo: {
    agentStatus: 'alive',
    agentImage: '/agents/gustavo.png',
    agentName: 'GUSTAVO',
    agentFullName: 'Gustavo Leal',
    agentClass: 'Policial',
    agentDescription:
      'Gustavo é pura força e velocidade. Seu físico o torna uma ameaça em qualquer confronto físico, e ele domina desafios que exigem movimento e resistência. No entanto, sua mente nem sempre acompanha sua força — situações que exigem raciocínio rápido podem deixá-lo para trás. Furtividade não é seu ponto forte, e seu jeito atrapalhado costuma denunciá-lo antes mesmo de agir.',
    agentAbilities: [
      { type: 'Força', buff: '+1', habilities: copAbilities.strength },
      { type: 'Inteligência', buff: '-1', habilities: copAbilities.intelligence },
      { type: 'Dextreza', buff: '0', habilities: copAbilities.dexterity },
    ],
    agentTeam: ['caio', 'luis'],
    missionBriefing: missionBriefings.cop,
  },
  richard: {
    agentStatus: 'alive',
    agentImage: '/agents/richard.png',
    agentName: 'RICHARD',
    agentFullName: 'Richard Duarte',
    agentClass: 'Inocente',
    agentDescription:
      'Richard é forte, inteligente e focado. Ele fala pouco, mas cada palavra carrega peso. Seu corpo atlético o torna capaz de lidar com qualquer situação física com facilidade, mas sua tendência a ser chamativo e direto pode comprometer sua discrição. Quando age, é com força e precisão — mas raramente sem ser notado.',
    agentAbilities: [
      { type: 'Força', buff: '+1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '-1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  emelly: {
    agentStatus: 'deceased',
    agentImage: '/agents/emelly.png',
    agentName: 'EMELLY',
    agentFullName: 'Emelly Rosa',
    agentClass: 'Assassino',
    agentDescription:
      'Emelly é uma sombra silenciosa. Inteligente, reservada e extremamente atenta, ela observa tudo e todos com um olhar afiado. Sua habilidade de se manter discreta e sua natureza introspectiva fazem dela quase invisível quando deseja. Cada passo é calculado, cada silêncio é estratégico — e quando ela fala, é porque vale a pena ouvir.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: assassinAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: assassinAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: assassinAbilities.dexterity },
    ],
    agentTeam: ['pietra'],
    missionBriefing: missionBriefings.assassin,
  },
  caetano: {
    agentStatus: 'deceased',
    agentImage: '/agents/caetano.png',
    agentName: 'CAETANO',
    agentFullName: 'Caetano',
    agentClass: 'Inocente',
    agentDescription:
      'Caetano é o tipo de pessoa que some antes mesmo do problema chegar. Ágil e escorregadio, ele transforma qualquer situação numa chance de improviso cômico. Suas mentiras beiram o absurdo, mas ditas com tanta confiança que é difícil duvidar. Frágil e sem força física, evita confrontos diretos com o mesmo talento que usa para escapar: lábia afiada e um senso de humor que distrai até o perigo.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  vitoria: {
    agentStatus: 'hiding',
    agentImage: '/agents/vitoria.png',
    agentName: 'VITÓRIA',
    agentFullName: 'Vitória Carone',
    agentClass: 'Inocente',
    agentDescription:
      'Vitória é o tipo de pessoa que entra em cena com energia contagiante, resolvendo problemas no impulso e no braço. Carismática e direta, se destaca tanto na ação quanto nas conversas. Mas quando a situação exige silêncio e precisão, sua presença vira ruído — desastrada demais para a furtividade, barulhenta demais para passar despercebida.',
    agentAbilities: [
      { type: 'Força', buff: '+1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '-1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  hallan: {
    agentStatus: 'alive',
    agentImage: '/agents/unknown.png',
    agentName: 'HALLAN',
    agentFullName: 'Hallan Gabriel',
    agentClass: 'Inocente',
    agentDescription: 'Nenhuma informação encontrada sobre o agente.',
    agentAbilities: [
      { type: 'Força', buff: '+1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '-1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  sabrina: {
    agentStatus: 'alive',
    agentImage: '/agents/unknown.png',
    agentName: 'SABRINA',
    agentFullName: 'Sabrina Machado',
    agentClass: 'Inocente',
    agentDescription: 'Nenhuma informação encontrada sobre o agente.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  kaiky: {
    agentStatus: 'hiding',
    agentImage: '/agents/unknown.png',
    agentName: 'KAIKY',
    agentFullName: 'Kaiky Motisuki',
    agentClass: 'Inocente',
    agentDescription: 'Nenhuma informação encontrada sobre o agente.',
    agentAbilities: [
      { type: 'Força', buff: '-1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '+1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  yasmim: {
    agentStatus: 'hiding',
    agentImage: '/agents/unknown.png',
    agentName: 'YASMIM',
    agentFullName: 'Yasmim Nascimento',
    agentClass: 'Inocente',
    agentDescription: 'Nenhuma informação encontrada sobre o agente.',
    agentAbilities: [
      { type: 'Força', buff: '0', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '+1', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '-1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
  fellipe: {
    agentStatus: 'hiding',
    agentImage: '/agents/unknown.png',
    agentName: 'FELLIPE',
    agentFullName: 'Fellipe Oliveira',
    agentClass: 'Inocente',
    agentDescription: 'Nenhuma informação encontrada sobre o agente.',
    agentAbilities: [
      { type: 'Força', buff: '+1', habilities: innocentAbilities.strength },
      { type: 'Inteligência', buff: '0', habilities: innocentAbilities.intelligence },
      { type: 'Dextreza', buff: '-1', habilities: innocentAbilities.dexterity },
    ],
    agentTeam: [],
    missionBriefing: missionBriefings.innocent,
  },
};

// ─── Agentes ativos na partida atual ─────────────────────────────────────────

export const agentsPlaying: string[] = [
  'pietra',
  'pedro',
  'luiza',
  'amanda',
  'caio',
  'luis',
  'gustavo',
  'emelly',
  'caetano',
  'fellipe',
];

// ─── Relatório da última noite ────────────────────────────────────────────────

export const lastNightReport =
  '23:00 — Nenhuma movimentação detectada. \n00:00 - Atividade detectada. 8 Tarefas feitas \n02:00 - Atividade incomum detectada. 0 pessoas foram presas. \n04:00 - Atividade incomum detectada. 3 intenções assassinas.\n07:00 — Despertadores acionados. Dia amanheceu. \n\nResumo da noite: Nenhuma atividade incomum detectada.';
