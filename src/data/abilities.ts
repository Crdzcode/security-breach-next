import type { AbilitySet, MissionBriefings } from '@/types/game';

// ─── Briefings de missão por classe ──────────────────────────────────────────

export const missionBriefings: MissionBriefings = {
  innocent:
    'Você é um inocente tentando sobreviver em meio ao caos. Sua missão é colaborar com os demais inocentes para restaurar o sistema de segurança da base. Quando todas as tarefas forem concluídas, a verdade virá à tona e os assassinos serão expostos. Até lá, você está no escuro. Não sabe quem é aliado e quem é ameaça. Qualquer um pode ser um assassino disfarçado — ou até mesmo alguém tentando te proteger. Fique atento, observe, colabore com o grupo, mas nunca baixe a guarda. Sua sobrevivência é tão importante quanto sua participação nas tarefas. Não confie cegamente em ninguém. No fim das contas, só os vivos vencem.',
  assassin:
    'Você é um assassino infiltrado, e sua missão é eliminar o V.I.P. O problema? Você não sabe quem ele é — ainda. Precisa observar, deduzir, manipular e se infiltrar entre os inocentes, fingindo ajudar nas tarefas para não levantar suspeitas. Pode até colaborar em alguns momentos, se for necessário manter as aparências. Você e seu(s) parceiro(s) devem agir com inteligência: sabotar sutilmente, sem chamar atenção, e atacar no momento certo. Se o V.I.P morrer, vocês vencem. Mas se forem descobertos antes disso, serão caçados sem piedade. Em um jogo onde todos desconfiam de todos, a mentira é sua arma mais letal. Disfarce é sobrevivência. E assassinato, libertação.',
  cop: 'Você é um policial infiltrado na base. Seu dever é proteger o V.I.P a todo custo e eliminar os assassinos antes que eles descubram sua identidade ou, pior ainda, a identidade do V.I.P. Apenas você, o outro policial e o V.I.P sabem da existência um do outro. Ninguém mais deve saber quem você é, nem mesmo os inocentes. Você deve agir com cautela, mantendo sua cobertura enquanto investiga quem entre os jogadores é uma ameaça. Se os assassinos descobrirem quem você é, sua vida estará em risco, e a queda do V.I.P será apenas questão de tempo. Use sua intuição, sua frieza, e sua estratégia. O futuro depende da sua habilidade em se esconder à vista de todos — e agir no momento certo.',
  vip: 'Você é o V.I.P. Sua identidade é secreta e você é a peça mais importante da resistência. Apenas os policiais sabem quem você é, e você sabe quem são eles. Sua missão é sobreviver sem levantar suspeitas, enquanto colabora secretamente com os policiais. Você tem acesso a uma lista com possíveis assassinos e, a cada rodada, pode eliminar um nome inocente dessa lista, se aproximando cada vez mais da verdade. Os assassinos vencerão se conseguirem te matar, mas o problema é que eles não sabem quem você é — e é exatamente assim que deve continuar. Fingir ser apenas mais um inocente será a sua melhor defesa. Um movimento em falso e tudo estará perdido. Cuidado em quem confia, mantenha-se invisível, e sobreviva.',
};

// ─── Habilidades por classe ───────────────────────────────────────────────────

export const innocentAbilities: AbilitySet = {
  dexterity: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Esconde-esconde',
      description:
        'Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso.',
    },
  ],
  intelligence: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Ligar os pontos',
      description:
        'Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso. A informação obtida será dada de forma vaga, como uma dica.',
    },
  ],
  strength: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Lute ou morra',
      description:
        'Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso.',
    },
  ],
};

export const assassinAbilities: AbilitySet = {
  dexterity: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Esconde-esconde',
      description:
        'Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso.',
    },
    {
      name: 'Presas da Serpente',
      description:
        'Habilidade de ataque furtivo que envenena o alvo. O modificador diz quantas chances a mais você tem de conseguir envenenar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso.',
    },
  ],
  intelligence: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Ligar os pontos',
      description:
        'Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso.',
    },
    {
      name: 'Sabotagem',
      description:
        'Habilidade de sabotagem. O modificador diz quantas chances a mais você tem de conseguir sabotar uma tarefa com sucesso. Se o modificador for negativo, você tem menos chances de conseguir sabotar uma tarefa com sucesso.',
    },
  ],
  strength: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Lute ou morra',
      description:
        'Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso.',
    },
    {
      name: 'Fatiar e picar',
      description:
        'Habilidade de ataque. O modificador diz quantas chances a mais você tem de conseguir atacar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso.',
    },
  ],
};

export const copAbilities: AbilitySet = {
  dexterity: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Esconde-esconde',
      description:
        'Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso.',
    },
    {
      name: 'Atirar pra matar',
      description:
        'Habilidade de ataque. O modificador diz quantas chances a mais você tem de conseguir atacar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir atacar com sucesso.',
    },
  ],
  intelligence: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Ligar os pontos',
      description:
        'Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso.',
    },
    {
      name: 'Autópsia',
      description:
        'Habilidade utilizada para extrair informações do corpo de alguém que foi assassinado. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso.',
    },
  ],
  strength: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Lute ou morra',
      description:
        'Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso.',
    },
    {
      name: 'Preso em nome da lei',
      description:
        'Habilidade de prisão. O modificador diz quantas chances a mais você tem de conseguir prender um jogador. Se o modificador for negativo, você tem menos chances de conseguir prender um jogador.',
    },
  ],
};

export const vipAbilities: AbilitySet = {
  dexterity: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Esconde-esconde',
      description:
        'Habilidade utilizada para se esconder. O modificador diz quantas chances a mais você tem de conseguir se esconder com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso.',
    },
    {
      name: 'Olhos sempre abertos - Uso único e passivo',
      description:
        'Habilidade utilizada para fugir de um ataque letal. O modificador diz quantas chances a mais você tem de conseguir escapar com sucesso. Se o modificador for negativo, você tem menos chances de conseguir se esconder com sucesso.',
    },
    {
      name: 'Treinamento Especial - Passiva',
      description: 'Habilidade passiva que permite com que você possa realizar duas ações por turno.',
    },
  ],
  intelligence: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Ligar os pontos',
      description:
        'Habilidade utilizada para tentar deduzir informações sobre uma situação ou jogador. O modificador diz quantas chances a mais você tem de conseguir deduzir informações com sucesso. Se o modificador for negativo, você tem menos chances de conseguir deduzir informações com sucesso.',
    },
    {
      name: 'Primeiros socorros',
      description:
        'Habilidade de cura. O modificador diz quantas chances a mais você tem de conseguir curar um jogador. Se o modificador for negativo, você tem menos chances de conseguir curar um jogador.',
    },
    {
      name: 'Antídoto',
      description:
        'Habilidade de remover envenenamento. O modificador diz quantas chances a mais você tem de conseguir curar um jogador. Se o modificador for negativo, você tem menos chances de conseguir curar um jogador.',
    },
    {
      name: 'Lista Restrita',
      description:
        'Habilidade que remove um nome de um inocente da lista de possíveis assassinos. O modificador diz quantas chances a mais você tem de conseguir remover um nome da lista. Se o modificador for negativo, você tem menos chances de conseguir remover um nome da lista.',
    },
  ],
  strength: [
    {
      name: 'Labuta',
      description:
        'Habilidade utilizada para realizar uma tarefa. O modificador diz quantas chances a mais você tem de conseguir completar a tarefa com sucesso. Se o modificador for negativo, você tem menos chances de completar a tarefa com sucesso.',
    },
    {
      name: 'Lute ou morra',
      description:
        'Habilidade de salvaguarda. O modificador diz quantas chances a mais você tem de conseguir escapar da morte. Se o modificador for negativo, você tem menos chances de conseguir escapar com sucesso.',
    },
  ],
};
