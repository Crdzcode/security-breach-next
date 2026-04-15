#!/usr/bin/env node
// ─────────────────────────────────────────────────────────────────────────────
// scripts/open-test-tabs.js
//
// Uso:
//   node scripts/open-test-tabs.js <ROOM_ID>
//
// O que faz:
//   - Abre 10 abas, uma para cada jogador (auto-login via /auto-login)
//   - Abre +1 aba com o lobby público (/lobby) já com o código da sala
//
// Requisitos:
//   - Next.js rodando em http://localhost:3000
//   - Windows (usa `start`) — troque por `open` no macOS ou `xdg-open` no Linux
// ─────────────────────────────────────────────────────────────────────────────

const { execSync } = require('child_process');

const BASE_URL = process.env.NEXT_URL ?? 'http://localhost:3000';

// Primeiros 10 jogadores não-admin (codename + senha de users.ts)
const PLAYERS = [
  { codename: 'pietra',   password: 'Ts1Exgr9' },
  { codename: 'caetano',  password: 'K0fTDuLv' },
  { codename: 'pedro',    password: 'cU6FAXAy' },
  { codename: 'luiza',    password: 'AHTbzy81' },
  { codename: 'amanda',   password: 'b3hYFIGY' },
  { codename: 'maria',    password: 'fpOOJplG' },
  { codename: 'caio',     password: 'wKUsdsUZ' },
  { codename: 'luis',     password: 'RtZo9ZhV' },
  { codename: 'gustavo',  password: 'hFqBDG0v' },
  { codename: 'emelly',   password: '1yfEw4Vy' },
];

const roomId = process.argv[2];

if (!roomId) {
  console.error('Uso: node scripts/open-test-tabs.js <ROOM_ID>');
  process.exit(1);
}

const code = roomId.trim().toUpperCase();

function openUrl(url) {
  const platform = process.platform;
  try {
    if (platform === 'win32') {
      execSync(`start "" "${url}"`, { stdio: 'ignore' });
    } else if (platform === 'darwin') {
      execSync(`open "${url}"`, { stdio: 'ignore' });
    } else {
      execSync(`xdg-open "${url}"`, { stdio: 'ignore' });
    }
  } catch {
    console.error(`Falha ao abrir: ${url}`);
  }
}

console.log(`\n[test] Abrindo ${PLAYERS.length} abas de jogadores + 1 lobby TV para sala ${code}\n`);

// Lobby TV primeiro
const lobbyUrl = `${BASE_URL}/lobby?room=${code}`;
openUrl(lobbyUrl);
console.log(`[lobby] ${lobbyUrl}`);

// Pequeno delay para o browser abrir antes das abas de jogadores
setTimeout(() => {
  for (const player of PLAYERS) {
    const url = `${BASE_URL}/auto-login?codename=${player.codename}&password=${player.password}&roomId=${code}`;
    openUrl(url);
    console.log(`[player] ${player.codename} → ${url}`);
  }

  console.log('\n[test] Todas as abas abertas.');
}, 500);
