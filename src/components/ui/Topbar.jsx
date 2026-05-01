// src/components/ui/Topbar.jsx
import { Bell, RefreshCw } from 'lucide-react';
import { currentUser } from '../../data/mockData';
import { getInitials } from '../../utils/formatCurrency';

/**
 * Barre de navigation supérieure
 * @param {string} title - Titre de la page
 * @param {string} subtitle - Sous-titre
 */
export default function Topbar({ title, subtitle }) {
  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-100 px-7 py-4 flex items-center justify-between">
      {/* Title */}
      <div>
        <h1 className="font-display font-bold text-slate-800 text-lg leading-tight">{title}</h1>
        {subtitle && <p className="text-xs text-slate-400 mt-0.5">{subtitle}</p>}
      </div>

      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Network badge */}
        <div className="flex items-center gap-2 bg-green-50 border border-green-100 px-3.5 py-1.5 rounded-full text-xs font-semibold text-green-700">
          <span className="pulse-dot" />
          État du Réseau : Actif
        </div>

        {/* Notification bell */}
        <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-green-600 hover:bg-green-50 hover:border-green-100 transition-all duration-200 cursor-pointer">
          <Bell size={16} />
        </button>

        {/* Refresh */}
        <button className="w-9 h-9 rounded-full bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-500 hover:text-green-600 hover:bg-green-50 hover:border-green-100 transition-all duration-200 cursor-pointer">
          <RefreshCw size={15} />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold cursor-pointer">
          {getInitials(currentUser.nom)}
        </div>
      </div>
    </header>
  );
}
