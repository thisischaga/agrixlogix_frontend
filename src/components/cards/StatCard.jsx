// src/components/cards/StatCard.jsx
import { TrendingUp, TrendingDown } from 'lucide-react';

/**
 * Carte de statistique réutilisable
 * @param {string} label - Titre de la carte
 * @param {string} value - Valeur principale (déjà formatée)
 * @param {string|number} variation - Variation en %
 * @param {boolean} positive - tendance positive ou négative
 * @param {ReactNode} icon - Icône Lucide
 * @param {string} iconBg - Classe Tailwind pour le fond de l'icône
 */
export default function StatCard({ label, value, variation, positive = true, icon, iconBg = 'bg-green-100' }) {
  return (
    <div className="card flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</span>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${iconBg}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="font-display text-2xl font-bold text-slate-800 leading-tight">{value}</p>
      </div>

      {/* Variation */}
      {variation !== undefined && (
        <div className={`flex items-center gap-1 text-xs font-semibold ${positive ? 'text-green-600' : 'text-red-500'}`}>
          {positive ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
          <span>{variation}</span>
          <span className="text-slate-400 font-normal">vs mois dernier</span>
        </div>
      )}
    </div>
  );
}
