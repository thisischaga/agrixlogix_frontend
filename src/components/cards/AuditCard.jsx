// src/components/cards/AuditCard.jsx
import { Shield, FileText } from 'lucide-react';
import { dashboardStats } from '../../data/mockData';

export default function AuditCard({ onAction }) {
  const { dernierBloc, validateurs, consensus } = dashboardStats;

  return (
    <div className="card">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
          <Shield size={16} className="text-green-600" />
        </div>
        <h3 className="font-display font-bold text-slate-800 text-base">Audit Blockchain</h3>
      </div>

      <div className="space-y-3">
        {[
          { label: 'Dernier Bloc',        value: dernierBloc,                        mono: true  },
          { label: 'Validateurs Actifs',  value: `${validateurs.actifs} / ${validateurs.total}`, mono: false },
          { label: 'Consensus',           value: consensus,                           green: true },
        ].map(({ label, value, mono, green }) => (
          <div key={label} className="flex items-center justify-between">
            <span className="text-sm text-slate-500">{label}</span>
            <span
              className={`text-sm font-semibold ${green ? 'text-green-600' : 'text-slate-700'} ${mono ? 'font-mono text-xs' : ''}`}
            >
              {value}
            </span>
          </div>
        ))}
      </div>

      <button
        className="btn-outline w-full mt-4 justify-center"
        onClick={() => onAction?.('Rapport d\'audit blockchain généré ✓')}
      >
        <FileText size={14} />
        Rapport d'Audit
      </button>
    </div>
  );
}
