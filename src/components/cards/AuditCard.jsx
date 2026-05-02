// src/components/cards/AuditCard.jsx
import { Shield, FileText } from 'lucide-react';

/**
 * Données issues de l’API uniquement ; pas de valeurs fictives.
 * @param {{ dernierBloc?: string, validateursLibelle?: string, consensus?: string, onAction?: (msg: string) => void }} props
 */
export default function AuditCard({
  dernierBloc = '—',
  validateursLibelle = '—',
  consensus = '—',
  onAction,
}) {
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
          { label: 'Dernier Bloc', value: dernierBloc, mono: true },
          { label: 'Validateurs', value: validateursLibelle, mono: false },
          { label: 'Consensus', value: consensus, green: true },
        ].map(({ label, value, mono, green }) => (
          <div key={label} className="flex items-center justify-between gap-4">
            <span className="text-sm text-slate-500 shrink-0">{label}</span>
            <span
              className={`text-sm font-semibold text-right min-w-0 break-all ${green ? 'text-green-600' : 'text-slate-700'} ${mono ? 'font-mono text-xs' : ''}`}
            >
              {value ?? '—'}
            </span>
          </div>
        ))}
      </div>

      <button
        type="button"
        className="btn-outline w-full mt-4 justify-center"
        onClick={() => onAction?.('Audit : export disponible après branchement nœud.')}
      >
        <FileText size={14} />
        Rapport d&apos;audit
      </button>
    </div>
  );
}
