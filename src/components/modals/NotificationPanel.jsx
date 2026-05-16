import React from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, X, Check, TrendingUp, TrendingDown, Info, Calendar } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export default function NotificationPanel({ isOpen, onClose }) {
  const { notifications, markRead, markAllRead } = useAuth();
  const unreadCount = notifications.filter(n => !n.read).length;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop overlay */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
          />

          {/* Panel */}
          <motion.div
            initial={{ x: 400, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            exit={{ x: 400, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="relative w-full max-w-sm h-full bg-white shadow-2xl border-l border-slate-100 flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-100 text-green-700 rounded-xl flex items-center justify-center">
                  <Bell size={20} />
                </div>
                <div>
                  <h2 className="font-display font-bold text-slate-800 text-lg">Notifications</h2>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                    {unreadCount} nouvelle{unreadCount > 1 ? 's' : ''}
                  </p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto no-scrollbar p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-center p-8">
                  <div className="w-16 h-16 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-4">
                    <Bell size={32} />
                  </div>
                  <p className="text-slate-400 text-sm font-medium italic">Aucune notification pour le moment.</p>
                </div>
              ) : (
                notifications.map((notif) => (
                  <motion.div 
                    layout
                    key={notif.id}
                    onClick={() => !notif.read && markRead(notif.id || notif._id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${notif.read ? 'bg-white border-slate-100 opacity-70' : 'bg-green-50/50 border-green-100 shadow-sm hover:border-green-300'}`}
                  >
                    <div className="flex gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        notif.type === 'success' ? 'bg-green-100 text-green-600' : 
                        notif.type === 'warning' ? 'bg-amber-100 text-amber-600' : 'bg-blue-100 text-blue-600'
                      }`}>
                        {notif.type === 'success' ? <TrendingUp size={18} /> : 
                         notif.type === 'warning' ? <TrendingDown size={18} /> : <Info size={18} />}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <p className="font-bold text-slate-800 text-sm truncate">{notif.title}</p>
                          {!notif.read && <div className="w-2 h-2 rounded-full bg-green-500 mt-1.5" />}
                        </div>
                        <p className="text-xs text-slate-500 leading-relaxed mb-2">{notif.message}</p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold uppercase tracking-widest">
                          <Calendar size={10} />
                          <span>{new Date(notif.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))
              )}
            </div>

            {/* Footer */}
            {unreadCount > 0 && (
              <div className="p-4 border-t border-slate-100">
                <button 
                  onClick={markAllRead}
                  className="w-full py-3 bg-slate-50 hover:bg-slate-100 text-slate-600 text-xs font-bold rounded-xl flex items-center justify-center gap-2 transition-colors"
                >
                  <Check size={14} /> Tout marquer comme lu
                </button>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>,
    document.body
  );
}
