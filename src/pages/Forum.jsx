import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Search, Plus, MessageSquare, Send, Hash, X, Users,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client, { getSocketOrigin } from '../api/client';

function ThreadRow({ thread, active, onSelect }) {
  return (
    <button
      type="button"
      onClick={() => onSelect(thread)}
      className={[
        'w-full text-left rounded-xl border p-4 transition-colors',
        active ? 'border-green-500 bg-green-50/60' : 'border-slate-100 bg-white hover:border-green-200',
      ].join(' ')}
    >
      <div className="flex items-start gap-2">
        <Hash size={16} className="text-slate-400 shrink-0 mt-0.5" />
        <div className="min-w-0 flex-1">
          <p className="font-display font-semibold text-slate-800 text-sm line-clamp-2">{thread.title}</p>
          <p className="text-[11px] text-slate-400 mt-1">
            {thread.authorName ?? '—'} · {thread.postCount ?? 0} message(s)
          </p>
        </div>
      </div>
    </button>
  );
}

export default function Forum() {
  const { showToast } = useOutletContext();
  const { user, currentCoop } = useAuth();

  const [threads, setThreads] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [activeThread, setActiveThread] = useState(null);
  const [posts, setPosts] = useState([]);
  const [newTitle, setNewTitle] = useState('');
  const [newBody, setNewBody] = useState('');
  const [reply, setReply] = useState('');
  const [showNew, setShowNew] = useState(false);
  const [membersCount, setMembersCount] = useState(null);
  const messagesEndRef = useRef(null);
  const socketRef = useRef(null);
  const activeThreadIdRef = useRef(null);

  const coopId = currentCoop?._id;

  useEffect(() => {
    setActiveThread(null);
  }, [coopId]);

  useEffect(() => {
    activeThreadIdRef.current = activeThread?._id;
  }, [activeThread?._id]);

  const fetchThreads = useCallback(async () => {
    if (!coopId) return;
    setLoading(true);
    try {
      const [tRes, cRes] = await Promise.all([
        client.get(`/cooperatives/${coopId}/forums`),
        client.get(`/cooperatives/${coopId}`),
      ]);
      setThreads(Array.isArray(tRes.data) ? tRes.data : []);
      const n = Array.isArray(cRes.data?.members) ? cRes.data.members.length : null;
      setMembersCount(n);
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || err.message || 'Forum indisponible');
    } finally {
      setLoading(false);
    }
  }, [coopId, showToast]);

  const fetchPosts = useCallback(async (threadId) => {
    try {
      const { data } = await client.get(`/forums/${threadId}/posts`);
      setPosts(Array.isArray(data) ? data : []);
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Impossible de charger les messages');
    }
  }, [showToast]);

  useEffect(() => {
    fetchThreads();
  }, [fetchThreads]);

  useEffect(() => {
    if (!user?._id || !coopId) return undefined;
    const origin = getSocketOrigin();
    const socket = io(origin, {
      auth: { userId: user._id },
      transports: ['websocket', 'polling'],
    });
    socketRef.current = socket;

    const syncRooms = () => {
      socket.emit('join_coop', coopId);
      const tid = activeThreadIdRef.current;
      if (tid) socket.emit('join_thread', tid);
    };

    socket.on('connect', syncRooms);

    const onThreadEvt = (thread) => {
      setThreads((prev) => {
        const list = prev.filter((t) => t._id !== thread._id);
        return [thread, ...list];
      });
    };

    const onPost = (post) => {
      const tid = activeThreadIdRef.current;
      if (!post?.threadId || String(post.threadId) !== String(tid)) return;
      setPosts((prev) => (prev.some((p) => p._id === post._id) ? prev : [...prev, post]));
      setThreads((prev) =>
        prev.map((t) =>
          String(t._id) === String(tid) ? { ...t, postCount: (t.postCount || 0) + 1 } : t,
        ),
      );
      setTimeout(() => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 80);
    };

    socket.on('new_thread', onThreadEvt);
    socket.on('thread_updated', onThreadEvt);
    socket.on('new_post', onPost);

    if (socket.connected) syncRooms();

    return () => {
      socket.off('connect', syncRooms);
      socket.off('new_thread', onThreadEvt);
      socket.off('thread_updated', onThreadEvt);
      socket.off('new_post', onPost);
      socket.disconnect();
      socketRef.current = null;
    };
  }, [user?._id, coopId]);

  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected || !activeThread?._id) return;
    s.emit('join_thread', activeThread._id);
  }, [activeThread?._id]);

  useEffect(() => {
    if (activeThread?._id) {
      fetchPosts(activeThread._id);
    } else {
      setPosts([]);
    }
  }, [activeThread?._id, fetchPosts]);

  const filtered = threads.filter((t) => {
    const q = search.toLowerCase().trim();
    if (!q) return true;
    return (
      (t.title || '').toLowerCase().includes(q) ||
      (t.authorName || '').toLowerCase().includes(q) ||
      (t.content || '').toLowerCase().includes(q)
    );
  });

  const handleCreateThread = async (e) => {
    e.preventDefault();
    if (!newTitle.trim() || !newBody.trim() || !coopId) return;
    try {
      await client.post(`/cooperatives/${coopId}/forums`, {
        title: newTitle.trim(),
        content: newBody.trim(),
        authorName: user?.name || 'Membre',
      });
      setNewTitle('');
      setNewBody('');
      setShowNew(false);
      fetchThreads();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Publication impossible');
    }
  };

  const handleSendReply = async (e) => {
    e.preventDefault();
    if (!reply.trim() || !activeThread?._id) return;
    try {
      await client.post(`/forums/${activeThread._id}/posts`, {
        content: reply.trim(),
        authorName: user?.name || 'Membre',
      });
      setReply('');
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Envoi impossible');
    }
  };

  if (!currentCoop) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-slate-800">Forum</h2>
        <p className="text-sm text-slate-500 mt-2">Choisissez une coopérative pour accéder au forum.</p>
      </div>
    );
  }

  const totalPosts = threads.reduce((a, t) => a + (Number(t.postCount) || 0), 0);

  return (
    <div className="flex flex-col gap-5">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
        <div className="card flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-green-600" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-xl leading-none">{threads.length}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Sujets</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
            <Users size={16} className="text-blue-600" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-xl leading-none">{membersCount ?? '—'}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Membres (coop)</p>
          </div>
        </div>
        <div className="card flex items-center gap-3 py-4">
          <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center shrink-0">
            <MessageSquare size={16} className="text-amber-600" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-xl leading-none">{totalPosts}</p>
            <p className="text-[11px] text-slate-400 font-semibold mt-1">Messages (fil)</p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-4 lg:grid lg:grid-cols-[minmax(0,340px)_1fr] lg:gap-6 lg:items-start">
        <div className="flex flex-col gap-3 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
          <div className="flex flex-wrap gap-2">
            <div className="relative flex-1 min-w-[200px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-10"
                placeholder="Rechercher…"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button type="button" className="btn-primary whitespace-nowrap" onClick={() => setShowNew(true)}>
              <Plus size={16} /> Nouveau sujet
            </button>
          </div>

          <div className="flex flex-col gap-2 overflow-y-auto lg:pr-1 max-h-[50vh] lg:max-h-[calc(100vh-14rem)]">
            {loading && threads.length === 0 ? (
              <p className="text-sm text-slate-400 py-8 text-center">Chargement…</p>
            ) : filtered.length === 0 ? (
              <div className="card text-center py-12 text-slate-400 text-sm">
                Aucun sujet. Lancez une discussion depuis « Nouveau sujet ».
              </div>
            ) : (
              filtered.map((t) => (
                <ThreadRow
                  key={t._id}
                  thread={t}
                  active={activeThread?._id === t._id}
                  onSelect={(thr) => {
                    setActiveThread(thr);
                    if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }
                  }}
                />
              ))
            )}
          </div>

          {activeThread && (
            <button
              type="button"
              className="lg:hidden btn-outline justify-center text-sm"
              onClick={() => setActiveThread(null)}
            >
              Masquer la discussion
            </button>
          )}
        </div>

        <div
          className={[
            'card flex flex-col min-h-[320px] lg:min-h-[480px]',
            !activeThread ? 'hidden lg:flex' : 'flex',
            !activeThread ? 'lg:items-center lg:justify-center text-slate-400 text-sm text-center px-8' : '',
          ].join(' ')}
        >
          {!activeThread ? (
            <div>
              <MessageSquare size={36} className="mx-auto mb-3 opacity-30 text-slate-300" />
              <p className="font-semibold text-slate-600">Sélectionnez un sujet</p>
              <p className="text-xs mt-1 text-slate-400">Les messages viennent du serveur, sans jeu de données local.</p>
            </div>
          ) : (
            <>
              <div className="border-b border-slate-100 pb-4 mb-4">
                <h2 className="font-display font-bold text-slate-800 text-lg leading-snug flex items-start gap-2">
                  <Hash size={20} className="text-green-600 shrink-0 mt-0.5" />
                  <span>{activeThread.title}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-2">{activeThread.authorName} · sujet créé depuis l’API</p>
              </div>

              <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[45vh] sm:max-h-[50vh]">
                {activeThread.content ? (
                  <div className="rounded-xl bg-slate-50 border border-slate-100 p-4 text-sm text-slate-700 whitespace-pre-wrap">
                    {activeThread.content}
                  </div>
                ) : null}
                {posts.map((p) => (
                  <div key={p._id} className="border-l-4 border-green-200 pl-3 py-2">
                    <p className="text-xs font-bold text-slate-500">{p.authorName ?? '—'}</p>
                    <p className="text-sm text-slate-700 mt-1 whitespace-pre-wrap">{p.content}</p>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={handleSendReply} className="flex gap-2 pt-3 border-t border-slate-100">
                <input
                  className="input flex-1"
                  placeholder="Votre message…"
                  value={reply}
                  onChange={(e) => setReply(e.target.value)}
                />
                <button type="submit" className="btn-primary shrink-0" disabled={!reply.trim()}>
                  <Send size={14} /> Envoyer
                </button>
              </form>
            </>
          )}
        </div>
      </div>

      {showNew && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800">Nouveau sujet</h3>
              <button type="button" className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer" onClick={() => setShowNew(false)} aria-label="Fermer">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateThread} className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Titre</label>
                <input className="input" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} required maxLength={200} />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Premier message</label>
                <textarea className="input min-h-[140px] resize-y" value={newBody} onChange={(e) => setNewBody(e.target.value)} required />
              </div>
              <div className="flex gap-3 justify-end">
                <button type="button" className="btn-outline" onClick={() => setShowNew(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary">
                  Publier
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
