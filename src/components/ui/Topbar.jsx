// src/components/ui/Topbar.jsx
import { Bell, Menu, RefreshCw } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getInitials } from '../../utils/formatCurrency';

/**
 * Barre supérieure (style tableau de bord coop : accueil, réseau, profil).
 */
export default function Topbar({ title, subtitle, onMenuClick }) {
  const { user, currentCoop } = useAuth();

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 sm:px-6 lg:px-7 py-3 lg:py-4 shadow-sm/50">
      <div className="flex flex-wrap items-start gap-3 sm:items-center sm:justify-between">
        <div className="flex min-w-0 flex-1 items-start gap-3 sm:items-center">
          <button
            type="button"
            className="lg:hidden mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-slate-100 bg-slate-50 text-slate-700 transition-colors hover:border-green-200 hover:bg-green-50 hover:text-green-700"
            onClick={onMenuClick}
            aria-label="Ouvrir le menu"
          >
            <Menu size={22} strokeWidth={2} />
          </button>
          <div className="min-w-0 flex-1">
            <h1 className="font-display font-bold text-slate-800 text-lg sm:text-xl leading-tight truncate">
              {title}
            </h1>
            {subtitle ? (
              <p className="text-sm text-slate-500 mt-1 line-clamp-2 sm:line-clamp-1">{subtitle}</p>
            ) : null}
            {currentCoop && title !== 'Tableau de bord' ? (
              <p className="text-[11px] text-slate-500 mt-1 truncate">
                <span className="font-semibold text-slate-600">Coopérative :</span>{' '}
                {currentCoop.name ?? '—'}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex w-full shrink-0 flex-wrap items-center justify-end gap-2 sm:w-auto sm:gap-3">
          <div className="hidden sm:flex items-center gap-2 rounded-full bg-green-50 border border-green-100 px-3.5 py-1.5 text-xs font-semibold text-green-800">
            <span className="pulse-dot shrink-0" />
            État du réseau : actif
          </div>

          <div className="hidden md:flex flex-col items-end min-w-0 max-w-[200px] mr-0.5">
            <span className="text-sm font-bold text-slate-800 truncate w-full text-right">
              {user?.name ?? '—'}
            </span>
            <span className="text-[11px] text-slate-500 truncate w-full text-right">
              {user?.role ?? 'Membre'}
            </span>
          </div>

          <button
            type="button"
            className="h-9 w-9 shrink-0 rounded-full border border-slate-100 bg-slate-50 flex items-center justify-center text-slate-500 hover:text-green-600 hover:bg-green-50 hover:border-green-100 transition-all duration-200"
            aria-label="Notifications"
          >
            <Bell size={16} />
          </button>
          <button
            type="button"
            className="hidden sm:flex h-9 w-9 shrink-0 rounded-full border border-slate-100 bg-slate-50 items-center justify-center text-slate-500 hover:text-green-600 hover:bg-green-50 hover:border-green-100 transition-all duration-200"
            aria-label="Actualiser la page"
            onClick={() => window.location.reload()}
          >
            <RefreshCw size={15} />
          </button>
          <div
            className="h-10 w-10 shrink-0 rounded-full bg-green-600 flex items-center justify-center text-white text-xs font-bold ring-2 ring-green-100"
            aria-hidden
          >
            {getInitials(user?.name)}
          </div>
        </div>
      </div>
    </header>
  );
}
