// src/components/ui/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Vote, Users, Settings, MessageSquare, BookOpen, UserPlus,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatCurrency';
import BrandLogo from '../brand/BrandLogo';

const navItems = [
  { to: '/', label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions', icon: ArrowLeftRight },
  { to: '/comptabilite', label: 'Comptabilité', icon: BookOpen },
  { to: '/membres', label: 'Membres', icon: Users },
  { to: '/ajout-membre', label: 'Ajouter membre', icon: UserPlus, adminOnly: true },
  { to: '/votes', label: 'Vote', icon: Vote },
  { to: '/forum', label: 'Forum', icon: MessageSquare },
  { to: '/settings', label: 'Paramètres', icon: Settings },
];

/**
 * @param {{ mobileOpen?: boolean, onNavigate?: () => void }} props
 */
export default function Sidebar({ mobileOpen = false, onNavigate }) {
  const { user, currentCoop, unreadForumCount } = useAuth();

  const canManage = (() => {
    if (!user || !currentCoop) return false;
    const localRole = currentCoop.myRole;
    const isCoopAdmin = ['Président', 'President', 'Admin'].includes(localRole);
    const isOwner = String(currentCoop.adminId?._id || currentCoop.adminId) === String(user._id);
    return isCoopAdmin || isOwner || user.isSystemAdmin;
  })();

  return (
    <aside
      className={[
        'fixed top-0 left-0 z-50 h-screen w-[min(100vw-3rem,260px)] max-w-[280px] flex flex-col bg-green-950',
        'transition-transform duration-200 ease-out lg:translate-x-0',
        mobileOpen ? 'translate-x-0' : '-translate-x-full',
        'lg:w-[220px] lg:max-w-none',
      ].join(' ')}
      aria-label="Navigation principale"
    >
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <BrandLogo variant="sidebar" />
        <div className="min-w-0">
          <p className="font-display font-bold text-white text-lg leading-tight tracking-tight">AgriLogix</p>
          <p className="text-green-300/90 text-[10px] font-medium leading-snug mt-0.5">
            Gestion coopérative décentralisée
          </p>
        </div>
      </div>

      <nav className="flex-1 px-3 py-5 flex flex-col gap-1 overflow-y-auto">
        {navItems
          .filter(item => {
            // Si pas de coop, on ne garde que Dashboard et Settings
            if (!currentCoop?._id) {
              return ['Tableau de bord', 'Paramètres'].includes(item.label);
            }
            // Restriction Admin
            if (item.adminOnly && !canManage) return false;
            return true;
          })
          .map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              id={`tour-${to.replace('/', '') || 'dashboard'}`}
              end={to === '/'}
              onClick={() => onNavigate?.()}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <div className="relative flex items-center gap-3 w-full">
                <Icon size={17} />
                <span className="flex-1">{label}</span>
                {label === 'Forum' && unreadForumCount > 0 && (
                  <span className="bg-emerald-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center shadow-lg shadow-emerald-500/20 animate-pulse">
                    {unreadForumCount > 99 ? '99+' : unreadForumCount}
                  </span>
                )}
              </div>
            </NavLink>
          ))}
      </nav>

      <div className="px-3 pb-2">
        <div className="rounded-xl bg-black/30 border border-white/10 px-3 py-2.5">
          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-green-300">
            <span className="inline-block h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.75)]" />
            Nœud : connecté
          </div>
          {currentCoop?._id ? (
            <p className="text-[10px] text-green-400/85 font-mono mt-2 break-all leading-snug">
              ID coop · …{String(currentCoop._id).slice(-10)}
            </p>
          ) : (
            <p className="text-[10px] text-green-400/60 mt-2">Sélectionnez une coopérative</p>
          )}
        </div>
      </div>

      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-white text-xs font-semibold truncate">{user?.name ?? '—'}</p>
            {user?.role ? (
              <p className="text-green-400 text-[10px] truncate">{user.role}</p>
            ) : null}
          </div>
        </div>
      </div>
    </aside>
  );
}
