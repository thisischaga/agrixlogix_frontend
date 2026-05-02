// src/components/cards/AuditCard.jsx
import { Shield, FileText, CheckCircle2, AlertTriangle, RefreshCw } from 'lucide-react';

/**
 * Données issues de l’API uniquement ; pas de valeurs fictives.
 * @param {{ dernierBloc?: string, validateursLibelle?: string, consensus?: string, etatConnexion?: string, verifying?: boolean, auditResult?: any, onVerify?: () => void, onAction?: (msg: string) => void }} props
 */
export default function AuditCard({
  dernierBloc = '—',
  validateursLibelle = '—',
  consensus = '—',
  etatConnexion = '—',
  verifying = false,
  auditResult = null,
  onVerify,
  onAction,
}) {
  return (
    <div className="card h-full flex flex-col">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-green-600" />
          </div>
          <h3 className="font-display font-bold text-slate-800 text-base">Audit Blockchain</h3>
        </div>
        <button 
          onClick={onVerify}
          disabled={verifying}
          className={`p-2 rounded-lg hover:bg-slate-50 transition-all ${verifying ? 'animate-spin' : ''}`}
          title="Vérifier l'intégrité"
        >
          <RefreshCw size={16} className="text-slate-400" />
        </button>
      </div>

      <div className="space-y-3 flex-1">
        {[
          { label: 'Dernier Bloc', value: dernierBloc, mono: true },
          { label: 'Validateurs', value: validateursLibelle, mono: false },
          { label: 'Consensus', value: consensus, green: false },
          { label: 'État réseau', value: etatConnexion, green: true },
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

      {auditResult && (
        <div className={`mt-4 p-3 rounded-xl text-xs flex items-center gap-2 animate-in fade-in zoom-in duration-300 ${auditResult.isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          {auditResult.isValid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
          <span className="font-bold">{auditResult.message}</span>
        </div>
      )}

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
