'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSocket } from '@/components/SocketProvider';
import { Scanlines } from '@/components/Scanlines';
import type { RoomPublic } from '@/types/game';
import styles from './page.module.css';

const PHASE_LABEL: Record<string, string> = {
  lobby:     'LOBBY',
  action:    'AÇÃO',
  resolving: 'RESOLVENDO',
  report:    'RELATÓRIO',
  game_over: 'ENCERRADO',
};

export default function AdminPage() {
  const { socket, connected } = useSocket();
  const router                            = useRouter();
  const [authorized, setAuthorized]       = useState(false);
  const [rooms, setRooms]                 = useState<RoomPublic[]>([]);
  const [lastCreated, setLastCreated]     = useState('');
  const [error, setError]                 = useState('');
  const [duration, setDuration]           = useState(120);
  const [expectedPlayers, setExpectedPlayers] = useState(8);
  const [tasks, setTasks]                 = useState(40);

  // Guard: só admins autenticados podem acessar esta página
  useEffect(() => {
    const raw = sessionStorage.getItem('myPlayer');
    if (!raw) { router.replace('/'); return; }
    const me = JSON.parse(raw) as { codename: string; role?: string };
    if (me.codename !== 'admin' && me.role !== 'admin') {
      router.replace('/');
      return;
    }
    setAuthorized(true);
  }, [router]);

  useEffect(() => {
    if (!error) return;
    const t = setTimeout(() => setError(''), 4000);
    return () => clearTimeout(t);
  }, [error]);

  useEffect(() => {
    if (!socket) return;

    socket.emit('admin:list_rooms');

    const onList   = (data: RoomPublic[]) => setRooms(data);

    const onCreated = (room: RoomPublic) => {
      setRooms((prev) => [...prev.filter((r) => r.id !== room.id), room]);
      setLastCreated(room.id);
    };

    const onUpdate  = (room: RoomPublic) =>
      setRooms((prev) => prev.map((r) => (r.id === room.id ? room : r)));

    const onDeleted = ({ roomId }: { roomId: string }) =>
      setRooms((prev) => prev.filter((r) => r.id !== roomId));

    const onServerError = ({ message }: { message: string }) => setError(message);

    socket.on('admin:rooms_list',   onList);
    socket.on('admin:room_created', onCreated);
    socket.on('admin:room_update',  onUpdate);
    socket.on('admin:room_deleted', onDeleted);
    socket.on('server:error',       onServerError);

    return () => {
      socket.off('admin:rooms_list',   onList);
      socket.off('admin:room_created', onCreated);
      socket.off('admin:room_update',  onUpdate);
      socket.off('admin:room_deleted', onDeleted);
      socket.off('server:error',       onServerError);
    };
  }, [socket]);

  function createRoom()              { socket?.emit('admin:create_room', { duration, tasks }); }
  function handleExpectedPlayersChange(n: number) {
    setExpectedPlayers(n);
    setTasks(n * 5);
  }
  function startGame(roomId: string)       { socket?.emit('admin:start_game', roomId); }
  function forceNextRound(roomId: string)  { socket?.emit('admin:force_next_round', roomId); }
  function deleteRoom(roomId: string)      { socket?.emit('admin:delete_room', roomId); }
  function refreshRooms()            { socket?.emit('admin:list_rooms'); }

  if (!authorized) return null;

  return (
    <div className={styles.page}>
      <Scanlines variant="green" />

      <div className={styles.container}>
        <header className={styles.header}>
          <div className={styles.titleRow}>
            <h1 className={styles.title}>&gt;&gt; PAINEL ADMINISTRATIVO &lt;&lt;</h1>
            <span className={connected ? styles.connectedDot : styles.disconnectedDot}>
              {connected ? '● ONLINE' : '○ OFFLINE'}
            </span>
          </div>
          <div className={styles.headerActions}>
            <div className={styles.durationWrap}>
              <label className={styles.durationLabel}>DURAÇÃO (s):</label>
              <input
                className={styles.durationInput}
                type="number"
                min={30}
                max={600}
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              />
            </div>
            <div className={styles.durationWrap}>
              <label className={styles.durationLabel}>JOGADORES:</label>
              <input
                className={styles.durationInput}
                type="number"
                min={2}
                max={20}
                value={expectedPlayers}
                onChange={(e) => handleExpectedPlayersChange(Number(e.target.value))}
              />
            </div>
            <div className={styles.durationWrap}>
              <label className={styles.durationLabel}>TAREFAS:</label>
              <input
                className={styles.durationInput}
                type="number"
                min={0}
                max={999}
                value={tasks}
                onChange={(e) => setTasks(Number(e.target.value))}
              />
            </div>
            <button className={styles.createBtn}  onClick={createRoom}   disabled={!connected}>[+ CRIAR SALA]</button>
            <button className={styles.refreshBtn} onClick={refreshRooms} disabled={!connected}>[↻ ATUALIZAR]</button>
          </div>
        </header>

        {error && <div className={styles.errorBanner}>[ERRO] {error}</div>}

        {lastCreated && (
          <div className={styles.createdBanner}>
            Sala criada: <strong>{lastCreated}</strong> — envie este código aos jogadores
          </div>
        )}

        {rooms.length === 0 && !error && (
          <p className={styles.empty}>Nenhuma sala ativa. Clique em "[+ CRIAR SALA]" para começar.</p>
        )}

        <div className={styles.roomList}>
          {rooms.map((room) => (
            <div key={room.id} className={styles.roomCard}>
              <div className={styles.roomHeader}>
                <span className={styles.roomId}>{room.id}</span>
                <span className={styles.roomPhase}>[{PHASE_LABEL[room.phase] ?? room.phase}]</span>
                <span className={styles.roomRound}>Rodada {room.round}</span>
                <span className={styles.roomCount}>{room.playerCount} jogador{room.playerCount !== 1 ? 'es' : ''}</span>
                {room.phase === 'lobby' && (
                  <button
                    className={styles.startBtn}
                    disabled={room.playerCount < 2}
                    title={room.playerCount < 2 ? 'Mínimo 2 jogadores' : 'Iniciar jogo'}
                    onClick={() => startGame(room.id)}
                  >
                    [▶ INICIAR]
                  </button>
                )}
                {room.phase === 'report' && (
                  <button
                    className={styles.forceNextRoundBtn}
                    title="Forçar início da próxima rodada"
                    onClick={() => forceNextRound(room.id)}
                  >
                    [⏭ PRÓXIMA RODADA]
                  </button>
                )}
                <button
                  className={styles.deleteBtn}
                  onClick={() => deleteRoom(room.id)}
                  title="Deletar sala"
                >
                  [✕ DELETAR]
                </button>
              </div>

              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Codinome</th>
                    <th>Nome</th>
                    <th>Status</th>
                    <th>Conexão</th>
                  </tr>
                </thead>
                <tbody>
                  {room.players.map((p) => (
                    <tr key={p.codename}>
                      <td>{p.codename}</td>
                      <td>{p.displayName}</td>
                      <td>{p.status}</td>
                      <td>
                        <span className={p.isConnected ? styles.connected : styles.disconnected}>
                          {p.isConnected ? '● online' : '○ offline'}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {room.players.length === 0 && (
                    <tr>
                      <td colSpan={4} className={styles.emptyRow}>
                        Nenhum jogador na sala ainda.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
