'use client';

import { useState, useRef, useEffect } from 'react';
import { query, type AlfredContext } from '@engine/AlfredEngine';
import { generateId } from '@engine/id';

interface Msg {
  id: string;
  role: 'user' | 'alfred';
  content: string;
}

const QUICK = [
  '📊 How am I doing?',
  '⚔ What should I train today?',
  '⚡ Motivate me',
  '📚 Give me a PMP tip',
  '🏁 Race prep status',
  '⬡ Quest status',
];

const STORAGE_KEY = 'alfred:web:chat';

export default function Chat({ context }: { context: AlfredContext }) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setMessages(JSON.parse(raw));
    } catch {}
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-100)));
    } catch {}
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function send(text: string) {
    if (!text.trim()) return;
    const userMsg: Msg = { id: generateId(), role: 'user', content: text.trim() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      const { text: reply } = query(text.trim(), context);
      setMessages((m) => [...m, { id: generateId(), role: 'alfred', content: reply }]);
      setTyping(false);
    }, 600 + Math.random() * 500);
  }

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)]">
      {/* Quick actions */}
      <div className="flex flex-wrap gap-2 mb-3">
        {QUICK.map((q) => (
          <button
            key={q}
            onClick={() => send(q.replace(/^\S+\s/, ''))}
            className="border border-border bg-surface text-muted text-[11px] px-2.5 py-1.5 hover:border-gold hover:text-gold transition-colors"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto border border-border bg-surface/40 p-4 flex flex-col gap-3">
        {messages.length === 0 && (
          <p className="text-gold text-sm text-center mt-8">
            The Study awaits, {context.honorific}. Ask Alfred anything.
          </p>
        )}
        {messages.map((m) => {
          const alfred = m.role === 'alfred';
          return (
            <div key={m.id} className={`flex gap-2 ${alfred ? 'justify-start' : 'justify-end'}`}>
              {alfred && (
                <div className="w-7 h-7 rounded-full border border-gold flex items-center justify-center shrink-0">
                  <span className="text-gold text-xs font-bold">A</span>
                </div>
              )}
              <div
                className={`max-w-[80%] px-3 py-2 text-sm leading-relaxed border ${
                  alfred ? 'bg-surface border-border text-text' : 'bg-[#1a1a3e] border-[#2a2a5e] text-text'
                }`}
              >
                {m.content}
              </div>
            </div>
          );
        })}
        {typing && (
          <div className="flex gap-2 items-center">
            <div className="w-7 h-7 rounded-full border border-gold flex items-center justify-center">
              <span className="text-gold text-xs font-bold">A</span>
            </div>
            <span className="text-muted text-xs font-mono">Alfred is composing…</span>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex gap-2 mt-3"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Ask Alfred anything, ${context.honorific}…`}
          className="flex-1 bg-surface border border-border text-text px-4 py-3 text-sm outline-none focus:border-gold transition-colors"
        />
        <button
          type="submit"
          className="bg-gold text-bg font-bold text-xs px-5 hover:opacity-90 transition-opacity"
        >
          SEND
        </button>
      </form>
    </div>
  );
}
