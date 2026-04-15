'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import Image from 'next/image';
import { useSocket } from './SocketProvider';
import styles from './ChatWidget.module.css';

interface ChatMessage {
  id: string;
  fromCodename: string;
  fromDisplayName: string;
  toCodename: string;
  content: string;
  timestamp: number;
}

interface Contact {
  codename: string;
  displayName: string;
  image: string;
}

// ─────────────────────────────────────────────────────────────────────────────

export function ChatWidget() {
  const { socket } = useSocket();

  const [open, setOpen]               = useState(false);
  const [myCodename, setMyCodename]   = useState<string | null>(null);
  const [gameActive, setGameActive]   = useState(false);
  const [contacts, setContacts]       = useState<Contact[]>([]);
  const [activeContact, setActiveContact] = useState<string | null>(null);
  // messages keyed by partner codename
  const [messages, setMessages]       = useState<Record<string, ChatMessage[]>>({});
  const [unread, setUnread]           = useState<Record<string, number>>({});
  const [input, setInput]             = useState('');
  const bottomRef                     = useRef<HTMLDivElement>(null);

  // Helper: read player identity from sessionStorage (available after login)
  function loadIdentity(): string | null {
    const rawPlayer = sessionStorage.getItem('myPlayer');
    if (!rawPlayer) return null;
    const me = JSON.parse(rawPlayer) as { codename: string };
    setMyCodename(me.codename);
    return me.codename;
  }

  // Mount: covers mid-game page refresh (gameStarted already in sessionStorage)
  useEffect(() => {
    const codename = loadIdentity();
    if (!codename) return;
    if (sessionStorage.getItem('gameStarted')) setGameActive(true);
    const rawPlayers = sessionStorage.getItem('roundPlayers');
    if (rawPlayers) {
      const all = JSON.parse(rawPlayers) as Contact[];
      setContacts(all.filter((p) => p.codename !== codename));
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // server:game_started — fires when admin starts the game.
  // myPlayer is already in sessionStorage by now (set during login).
  // This is the PRIMARY activation path for first-time play.
  useEffect(() => {
    if (!socket) return;
    const onGameStarted = () => {
      const codename = loadIdentity();
      if (codename) setGameActive(true);
    };
    socket.on('server:game_started', onGameStarted);
    return () => { socket.off('server:game_started', onGameStarted); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket]);

  // Update contacts on each round + cover reconnection (game_update fires on rejoin)
  useEffect(() => {
    if (!socket) return;
    const onGameUpdate = (payload: { phase?: string; players?: Contact[] }) => {
      if (!payload.players) return;
      // On reconnect, identity may not be loaded yet — try again
      const codename = myCodename ?? loadIdentity();
      if (!codename) return;
      if (payload.phase === 'action') setGameActive(true);
      setContacts(payload.players.filter((p) => p.codename !== codename));
    };
    socket.on('server:game_update', onGameUpdate);
    return () => { socket.off('server:game_update', onGameUpdate); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [socket, myCodename]);

  // Receive messages
  useEffect(() => {
    if (!socket || !myCodename) return;

    const onMessage = (msg: ChatMessage) => {
      const partner = msg.fromCodename === myCodename ? msg.toCodename : msg.fromCodename;
      setMessages((prev) => ({
        ...prev,
        [partner]: [...(prev[partner] ?? []), msg],
      }));
      // Increment unread only if this conversation isn't currently open
      setUnread((prev) => {
        if (activeContactRef.current === partner && openRef.current) return prev;
        return { ...prev, [partner]: (prev[partner] ?? 0) + 1 };
      });
    };

    const onHistory = (payload: { withCodename: string; messages: ChatMessage[] }) => {
      setMessages((prev) => ({ ...prev, [payload.withCodename]: payload.messages }));
    };

    socket.on('server:chat_message', onMessage);
    socket.on('server:chat_history',  onHistory);
    return () => {
      socket.off('server:chat_message', onMessage);
      socket.off('server:chat_history',  onHistory);
    };
  }, [socket, myCodename]);

  // Refs to avoid stale closures inside the socket handler
  const activeContactRef = useRef(activeContact);
  const openRef          = useRef(open);
  useEffect(() => { activeContactRef.current = activeContact; }, [activeContact]);
  useEffect(() => { openRef.current = open; }, [open]);

  // Scroll to bottom when messages or active conversation change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, activeContact]);

  const openConversation = useCallback((codename: string) => {
    setActiveContact(codename);
    setUnread((prev) => ({ ...prev, [codename]: 0 }));
    socket?.emit('client:chat_history', { withCodename: codename });
  }, [socket]);

  function send() {
    if (!socket || !activeContact || !input.trim()) return;
    socket.emit('client:chat_send', { toCodename: activeContact, content: input.trim() });
    setInput('');
  }

  function handleKey(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') send();
  }

  // Only render after game has started and player identity is known
  if (!myCodename || !gameActive) return null;

  const totalUnread = Object.values(unread).reduce((a, b) => a + b, 0);
  const convoMessages = activeContact ? (messages[activeContact] ?? []) : [];

  return (
    <>
      {/* ── Floating toggle button ── */}
      <button
        className={styles.fab}
        onClick={() => setOpen((v) => !v)}
        aria-label="Chat"
      >
        {open ? '✕' : '✉'}
        {!open && totalUnread > 0 && (
          <span className={styles.fabBadge}>{totalUnread > 9 ? '9+' : totalUnread}</span>
        )}
      </button>

      {/* ── Widget panel ── */}
      {open && (
        <div className={styles.panel}>

          {/* VIEW 1: Contact list — shown when no active conversation */}
          {!activeContact && (
            <div className={styles.contacts}>
              <p className={styles.colHeader}>&gt;&gt; AGENTES</p>
              {contacts.length === 0 && (
                <p className={styles.empty}>Aguardando início da partida...</p>
              )}
              {contacts.map((c) => (
                <button
                  key={c.codename}
                  className={styles.contactBtn}
                  onClick={() => openConversation(c.codename)}
                >
                  <Image
                    src={c.image}
                    alt={c.displayName}
                    width={32}
                    height={32}
                    className={styles.contactAvatar}
                  />
                  <span className={styles.contactName}>{c.displayName}</span>
                  {(unread[c.codename] ?? 0) > 0 && (
                    <span className={styles.badge}>{unread[c.codename]}</span>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* VIEW 2: Conversation — shown when a contact is selected */}
          {activeContact && (
            <div className={styles.convo}>
              <div className={styles.convoHeader}>
                <button className={styles.backBtn} onClick={() => setActiveContact(null)}>
                  ←
                </button>
                <span className={styles.convoName}>
                  {contacts.find((c) => c.codename === activeContact)?.displayName ?? activeContact}
                </span>
              </div>

              <div className={styles.messages}>
                {convoMessages.length === 0 && (
                  <p className={styles.empty}>Nenhuma mensagem ainda.</p>
                )}
                {convoMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`${styles.msg} ${msg.fromCodename === myCodename ? styles.msgOut : styles.msgIn}`}
                  >
                    <span className={styles.msgContent}>{msg.content}</span>
                    <span className={styles.msgTime}>
                      {new Date(msg.timestamp).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>

              <div className={styles.inputRow}>
                <input
                  className={styles.input}
                  type="text"
                  placeholder="mensagem..."
                  maxLength={500}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKey}
                />
                <button className={styles.sendBtn} onClick={send} disabled={!input.trim()}>
                  [OK]
                </button>
              </div>
            </div>
          )}

        </div>
      )}
    </>
  );
}
