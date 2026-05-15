import { useState, useEffect, useCallback, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { io } from 'socket.io-client';
import {
  Search, Plus, MessageSquare, Send, Hash, X, Users, ChevronRight, Clock, User
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import client, { getSocketOrigin } from '../api/client';
import { SkeletonList, SkeletonRow } from '../components/Skeleton';

function ThreadRow({ thread, active, onSelect }) {
  return (
    <motion.button
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
      type="button"
      onClick={() => onSelect(thread)}
      className={[
        'w-full text-left rounded-2xl border p-4 transition-all duration-300 relative group overflow-hidden',
        active 
          ? 'border-green-500 bg-white shadow-md ring-1 ring-green-500/20' 
          : 'border-slate-100 bg-white/50 hover:bg-white hover:border-green-200 hover:shadow-sm',
      ].join(' ')}
    >
      {active && (
        <motion.div 
          layoutId="active-pill"
          className="absolute left-0 top-0 bottom-0 w-1 bg-green-500 rounded-r-full" 
        />
      )}
      <div className="flex items-start gap-3">
        <div className={[
          'w-10 h-10 rounded-xl flex items-center justify-center shrink-0 transition-colors',
          active ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400 group-hover:bg-green-50 group-hover:text-green-500'
        ].join(' ')}>
          <Hash size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-display font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-green-700 transition-colors">
            {thread.title}
          </p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tight">{thread.authorName ?? '—'}</span>
            <span className="text-[10px] text-slate-300">•</span>
            <div className="flex items-center gap-1 text-[10px] text-slate-400 font-medium">
              <MessageSquare size={10} />
              {thread.postCount ?? 0}
            </div>
          </div>
        </div>
        <ChevronRight size={14} className={['mt-1 transition-transform', active ? 'text-green-500 translate-x-1' : 'text-slate-300 group-hover:text-slate-400'].join(' ')} />
      </div>
    </motion.button>
  );
}

export default function Forum() {
  const { showToast } = useOutletContext();
  const { user, currentCoop, unreadForumCount, setUnreadForumCount } = useAuth();

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
  const [onlineCount, setOnlineCount] = useState(1);
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
    socket.on('online_update', (count) => {
      if (count) setOnlineCount(count);
    });

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
      <div className="card max-w-md mx-auto mt-12 text-center py-12 px-8">
        <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <MessageSquare size={32} className="text-slate-300" />
        </div>
        <h2 className="font-display font-bold text-slate-800 text-xl">Accès restreint</h2>
        <p className="text-sm text-slate-500 mt-3 leading-relaxed">
          Veuillez sélectionner ou rejoindre une coopérative pour accéder aux discussions de la communauté.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Stats Header */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <div className="card bg-gradient-to-br from-white to-green-50/30 flex items-center gap-4 py-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-green-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-200">
            <MessageSquare size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-2xl leading-none">{threads.length}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Sujets Actifs</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-white to-blue-50/30 flex items-center gap-4 py-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-blue-200">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-2xl leading-none">{membersCount ?? '—'}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">Membres Coop</p>
          </div>
        </div>
        <div className="card bg-gradient-to-br from-white to-indigo-50/30 flex items-center gap-4 py-5 hover:shadow-md transition-shadow">
          <div className="w-12 h-12 bg-indigo-600 rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-indigo-200 relative overflow-hidden">
             <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 2, repeat: Infinity }}
                className="absolute inset-0 bg-white/20 rounded-full" 
             />
             <div className="w-3 h-3 bg-green-400 rounded-full border-2 border-indigo-600 z-10" />
          </div>
          <div>
            <p className="font-display font-bold text-slate-800 text-2xl leading-none">{onlineCount}</p>
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">En Ligne</p>
          </div>
        </div>
      </motion.div>

      <div className="flex flex-col gap-6 lg:grid lg:grid-cols-[360px_1fr] lg:items-start">
        {/* Sidebar */}
        <div className="flex flex-col gap-4 lg:sticky lg:top-24 lg:max-h-[calc(100vh-8rem)]">
          <div className="flex flex-col gap-3">
             <div className="flex items-center justify-between px-1">
               <h3 className="font-display font-bold text-slate-800 flex items-center gap-2">
                 <Hash size={18} className="text-green-600" /> Discussion
               </h3>
               <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} SUJETS</span>
             </div>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  className="input pl-10 h-12 bg-white/70 backdrop-blur-sm border-slate-200/60"
                  placeholder="Filtrer les sujets..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                type="button" 
                className="btn-primary w-12 h-12 !p-0 justify-center shadow-lg shadow-green-200" 
                onClick={() => setShowNew(true)}
              >
                <Plus size={20} />
              </motion.button>
            </div>
          </div>

          <div className="flex flex-col gap-2.5 overflow-y-auto lg:pr-2 custom-scrollbar max-h-[50vh] lg:max-h-[calc(100vh-16rem)]">
            <AnimatePresence mode="popLayout">
              {loading ? (
                <SkeletonList count={6} />
              ) : filtered.length === 0 ? (
                <motion.div 
                  initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="card bg-slate-50/50 border-dashed border-2 border-slate-200 text-center py-12 px-6"
                >
                  <Search size={32} className="mx-auto mb-4 text-slate-200" />
                  <p className="text-sm font-semibold text-slate-500">Aucun résultat trouvé</p>
                  <p className="text-xs text-slate-400 mt-1">Essayez d'autres mots-clés ou créez un sujet.</p>
                </motion.div>
              ) : (
                filtered.map((t, idx) => (
                  <motion.div
                    key={t._id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.05 }}
                  >
                    <ThreadRow
                      thread={t}
                      active={activeThread?._id === t._id}
                      onSelect={(thr) => {
                        setActiveThread(thr);
                        const stored = localStorage.getItem(`read_counts_${user._id}`);
                        const readCounts = stored ? JSON.parse(stored) : {};
                        readCounts[thr._id] = thr.postCount || 0;
                        localStorage.setItem(`read_counts_${user._id}`, JSON.stringify(readCounts));
                        
                        if (typeof setUnreadForumCount === 'function') {
                          const newTotal = threads.reduce((acc, current) => {
                            const lastRead = current._id === thr._id ? (current.postCount || 0) : (readCounts[current._id] || 0);
                            const diff = (current.postCount || 0) - lastRead;
                            return acc + (diff > 0 ? diff : 0);
                          }, 0);
                          setUnreadForumCount(newTotal);
                        }

                        if (typeof window !== 'undefined' && window.innerWidth < 1024) {
                          window.scrollTo({ top: 300, behavior: 'smooth' });
                        }
                      }}
                    />
                  </motion.div>
                ))
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Chat Area */}
        <div
          className={[
            'card !p-0 flex flex-col min-h-[500px] lg:h-[calc(100vh-10rem)] shadow-xl border-slate-200/50 relative overflow-hidden transition-all duration-500',
            !activeThread ? 'hidden lg:flex bg-slate-50/30' : 'flex bg-white',
          ].join(' ')}
        >
          {!activeThread ? (
            <div className="flex-1 flex flex-col items-center justify-center p-12 text-center">
              <div className="relative mb-8">
                 <div className="absolute inset-0 bg-green-100 rounded-full blur-2xl opacity-50" />
                 <div className="relative w-24 h-24 bg-white rounded-3xl shadow-lg border border-slate-100 flex items-center justify-center rotate-3">
                    <MessageSquare size={48} className="text-green-500" />
                 </div>
              </div>
              <h3 className="font-display font-bold text-slate-800 text-xl">Sujet de discussion</h3>
              <p className="text-sm text-slate-400 mt-3 max-w-xs leading-relaxed">
                Sélectionnez un sujet dans la liste pour rejoindre la conversation ou lancez-en un nouveau.
              </p>
            </div>
          ) : (
            <>
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white/80 backdrop-blur-md sticky top-0 z-20">
                <div className="flex items-center gap-4 min-w-0">
                   <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center text-white font-bold shrink-0 shadow-lg shadow-green-100">
                      {activeThread.authorName?.charAt(0) || <Hash size={18} />}
                   </div>
                   <div className="min-w-0">
                     <h2 className="font-display font-bold text-slate-800 text-base line-clamp-1 flex items-center gap-2">
                       {activeThread.title}
                     </h2>
                     <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px] font-bold text-green-600 uppercase tracking-wider">Actif</span>
                        <span className="text-slate-300">•</span>
                        <span className="text-[10px] text-slate-400 font-medium">{activeThread.authorName}</span>
                     </div>
                   </div>
                </div>
                <button 
                  onClick={() => setActiveThread(null)}
                  className="lg:hidden p-2 hover:bg-slate-50 rounded-xl text-slate-400 transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Messages Container */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar bg-slate-50/30">
                {activeThread.content && (
                  <div className="flex flex-col items-center mb-8">
                     <div className="max-w-[90%] bg-white border border-slate-100 rounded-2xl p-5 shadow-sm text-sm text-slate-700 relative">
                        <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-green-600 text-[9px] font-black text-white px-3 py-1 rounded-full uppercase tracking-widest">Sujet Original</div>
                        <p className="whitespace-pre-wrap leading-relaxed">{activeThread.content}</p>
                        <div className="flex items-center justify-between mt-4 pt-4 border-t border-slate-50">
                           <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <User size={12} /> {activeThread.authorName}
                           </div>
                           <div className="flex items-center gap-2 text-[10px] text-slate-400">
                              <Clock size={12} /> {new Date(activeThread.createdAt).toLocaleDateString()}
                           </div>
                        </div>
                     </div>
                  </div>
                )}

                <AnimatePresence>
                  {posts.map((p, idx) => {
                    const isMe = String(p.authorId) === String(user?._id);
                    return (
                      <motion.div 
                        key={p._id}
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.3 }}
                        className={`flex flex-col ${isMe ? 'items-end' : 'items-start'}`}
                      >
                        {!isMe && (
                          <span className="text-[10px] font-black text-slate-400 mb-1.5 ml-2 uppercase tracking-widest">
                            {p.authorName}
                          </span>
                        )}
                        <div 
                          className={[
                            'max-w-[80%] px-5 py-3.5 rounded-2xl text-sm relative group',
                            isMe 
                              ? 'bg-gradient-to-br from-green-600 to-green-700 text-white rounded-tr-none shadow-lg shadow-green-100' 
                              : 'bg-white text-slate-700 rounded-tl-none border border-slate-100 shadow-sm'
                          ].join(' ')}
                        >
                          <p className="whitespace-pre-wrap leading-relaxed">{p.content}</p>
                          <div className={[
                            'text-[9px] mt-2 flex items-center gap-1.5 opacity-60 font-medium',
                            isMe ? 'justify-end' : 'justify-start'
                          ].join(' ')}>
                            {new Date(p.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            {isMe && <div className="w-1 h-1 bg-white/50 rounded-full" />}
                          </div>
                        </div>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
                <div ref={messagesEndRef} />
              </div>

              {/* Chat Input */}
              <div className="p-4 bg-white border-t border-slate-100">
                <form 
                  onSubmit={handleSendReply} 
                  className="flex gap-2 bg-slate-50 p-1.5 rounded-[20px] border border-slate-100 focus-within:border-green-300 focus-within:ring-4 focus-within:ring-green-50 transition-all"
                >
                  <input
                    className="flex-1 bg-transparent border-none outline-none px-4 text-sm text-slate-700 placeholder:text-slate-400"
                    placeholder="Écrire votre message ici..."
                    value={reply}
                    onChange={(e) => setReply(e.target.value)}
                  />
                  <motion.button 
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    type="submit" 
                    className="w-11 h-11 bg-green-600 text-white rounded-2xl flex items-center justify-center shrink-0 shadow-lg shadow-green-100 disabled:opacity-50 disabled:shadow-none" 
                    disabled={!reply.trim()}
                  >
                    <Send size={18} />
                  </motion.button>
                </form>
              </div>
            </>
          )}
        </div>
      </div>

      {/* New Subject Modal */}
      <AnimatePresence>
        {showNew && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" 
              onClick={() => setShowNew(false)}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[32px] shadow-2xl w-full max-w-xl flex flex-col relative z-10 overflow-hidden"
            >
              <div className="flex items-center justify-between px-8 py-6 border-b border-slate-50">
                <div>
                  <h3 className="font-display font-bold text-slate-800 text-xl tracking-tight">Nouveau Sujet</h3>
                  <p className="text-xs text-slate-400 mt-1 uppercase font-bold tracking-widest">Lancez une discussion</p>
                </div>
                <button 
                  type="button" 
                  className="w-10 h-10 flex items-center justify-center rounded-2xl hover:bg-slate-50 text-slate-400 transition-colors" 
                  onClick={() => setShowNew(false)}
                >
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateThread} className="flex flex-col gap-6 px-8 py-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Titre de la discussion</label>
                  <input 
                    className="input h-14 !bg-slate-50 border-slate-100 focus:!bg-white" 
                    placeholder="De quoi voulez-vous parler ?"
                    value={newTitle} 
                    onChange={(e) => setNewTitle(e.target.value)} 
                    required 
                    maxLength={200} 
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-[2px] ml-1">Message principal</label>
                  <textarea 
                    className="input min-h-[160px] resize-none !bg-slate-50 border-slate-100 focus:!bg-white !py-4" 
                    placeholder="Détaillez votre pensée..."
                    value={newBody} 
                    onChange={(e) => setNewBody(e.target.value)} 
                    required 
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" className="btn-outline flex-1 h-14 rounded-2xl" onClick={() => setShowNew(false)}>
                    Annuler
                  </button>
                  <button type="submit" className="btn-primary flex-1 h-14 rounded-2xl shadow-xl shadow-green-100 text-base">
                    Publier le sujet
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
