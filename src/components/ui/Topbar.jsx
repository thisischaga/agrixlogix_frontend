import { Bell, Menu, RefreshCw } from 'lucide-react';
import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatCurrency';
import BrandLogo from '../brand/BrandLogo';
import NotificationPanel from '../modals/NotificationPanel';

/**
 * Barre supérieure (style tableau de bord coop : accueil, réseau, profil).
 */
export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, currentCoop, notifications } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-slate-100 px-3 sm:px-6 lg:px-8 py-2.5 sm:py-3 shadow-sm">
      <div className="flex items-center justify-between gap-2">
        {/* Left Side: Menu + Logo/Title */}
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="lg:hidden flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-slate-600 border-none cursor-pointer hover:bg-green-50 hover:text-green-600 transition-colors"
            onClick={onMenuClick}
          >
            <Menu size={20} />
          </button>
          
          <div className="min-w-0">
            <h1 className="font-display font-bold text-slate-800 text-sm sm:text-lg truncate leading-none">
              {title}
            </h1>
            {currentCoop && title !== 'Tableau de bord' && (
              <p className="text-[9px] sm:text-[10px] text-slate-400 font-medium truncate mt-0.5">
                {currentCoop.name}
              </p>
            )}
          </div>
        </div>

        {/* Right Side: Actions + Profil */}
        <div className="flex items-center gap-1.5 sm:gap-3">
          {/* Status Dot (Mobile) */}
          <div className="sm:hidden flex items-center justify-center w-6 h-6">
             <span className="pulse-dot w-1.5 h-1.5" />
          </div>

          <div className="hidden sm:flex items-center gap-2 rounded-full bg-green-50 border border-green-100 px-3 py-1.5 text-[10px] font-bold text-green-800 uppercase tracking-tight">
            <span className="pulse-dot w-1.5 h-1.5 shrink-0" />
            Réseau Actif
          </div>

          <button
            type="button"
            onClick={() => setNotifOpen(true)}
            className="h-9 w-9 shrink-0 rounded-xl bg-slate-50 flex items-center justify-center text-slate-500 hover:text-green-600 transition-all relative border-none cursor-pointer"
          >
            <Bell size={16} />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 min-w-[16px] h-4 bg-red-500 text-white text-[9px] font-bold flex items-center justify-center rounded-full border-2 border-white">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>
          
          <NotificationPanel isOpen={notifOpen} onClose={() => setNotifOpen(false)} />

          <div className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 rounded-xl bg-green-600 flex items-center justify-center text-white text-[10px] sm:text-xs font-bold shadow-lg shadow-green-900/20">
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
