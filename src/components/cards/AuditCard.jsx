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
  onSync,
  isAdmin = false,
}) {
  return (
    <div className="card h-full flex flex-col relative overflow-hidden">
      <div className="flex items-center justify-between mb-4 relative z-10">
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

      <div className="space-y-3 flex-1 relative z-10">
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
        <div className={`mt-4 p-3 rounded-xl text-xs flex flex-col gap-2 animate-in fade-in zoom-in duration-300 ${auditResult.isValid ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'}`}>
          <div className="flex items-center gap-2">
            {auditResult.isValid ? <CheckCircle2 size={14} /> : <AlertTriangle size={14} />}
            <span className="font-bold">{auditResult.message}</span>
          </div>
          
          {!auditResult.isValid && isAdmin && (
             <button 
               onClick={onSync}
               className="mt-1 bg-red-600 text-white py-2 px-3 rounded-lg font-bold hover:bg-red-700 transition-colors flex items-center justify-center gap-2"
             >
               <RefreshCw size={12} /> Réparer la chaîne
             </button>
          )}
        </div>
      )}

      <div className="mt-4 grid grid-cols-1 gap-2 relative z-10">
        <button
          type="button"
          className="btn-outline w-full justify-center"
          onClick={onAction}
        >
          <FileText size={14} />
          Rapport d&apos;audit
        </button>
      </div>
    </div>
  );
}
