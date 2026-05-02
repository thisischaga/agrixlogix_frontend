// src/components/tables/TransactionsTable.jsx
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Check, X, FileText } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

/**
 * Tableau des transactions réutilisable
 * @param {Array} data - tableau de transactions
 * @param {Function} onView - callback au clic "Voir"
 * @param {String} userRole - le rôle de l'utilisateur courant (pour validation)
 * @param {Function} onValidate - callback au clic "Valider"
 * @param {Function} onReject - callback au clic "Rejeter"
 */
export default function TransactionsTable({ data, onView, userRole, onValidate, onReject }) {
  if (!data?.length) {
    return (
      <div className="py-16 text-center text-slate-400 text-sm">
        Aucune transaction trouvée
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr>
            {['Transaction', 'Catégorie', 'Date', 'Statut / Bloc', 'Montant', ''].map((h) => (
              <th
                key={h}
                className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100"
              >
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((tx) => (
            <tr key={tx.id} className="border-b border-slate-50 hover:bg-green-50/40 transition-colors duration-150">
              {/* Label + hash */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'credit'
                      ? <ArrowUpRight size={16} className="text-green-600" />
                      : <ArrowDownLeft size={16} className="text-red-500" />
                    }
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800 text-sm">{tx.label}</p>
                    <p className="text-xs text-slate-400 font-mono mt-0.5" title={tx.hash}>
                      {tx.hash ? `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}` : '—'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Catégorie */}
              <td className="px-4 py-3.5">
                <span className="badge-gray">{tx.categorie}</span>
              </td>

              {/* Date */}
              <td className="px-4 py-3.5 text-xs text-slate-500 whitespace-nowrap">
                {formatDate(tx.date)}
              </td>

              {/* Bloc et Statut */}
              <td className="px-4 py-3.5">
                {tx.statut === 'pending' && <span className="badge-warning text-xs font-semibold px-2 py-1 rounded">En attente</span>}
                {tx.statut === 'rejected' && <span className="badge-danger text-xs font-semibold px-2 py-1 rounded">Rejeté</span>}
                {tx.statut === 'completed' && <span className="badge-green text-xs font-mono px-2 py-1 rounded">✓ {tx.bloc !== '—' ? tx.bloc : 'validé'}</span>}
              </td>

              {/* Montant */}
              <td className={`px-4 py-3.5 font-display font-bold whitespace-nowrap ${
                tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.montant)}
              </td>

              {/* Action */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  {(userRole === 'Président' || userRole === 'President' || userRole === 'Admin') && tx.statut === 'pending' && (
                    <>
                      <button
                        className="p-1.5 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 transition-colors border-none cursor-pointer"
                        onClick={() => onValidate?.(tx.id)}
                        title="Valider la transaction"
                      >
                        <Check size={14} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-500 transition-colors border-none cursor-pointer"
                        onClick={() => onReject?.(tx.id)}
                        title="Rejeter la transaction"
                      >
                        <X size={14} />
                      </button>
                    </>
                  )}
                  {tx.statut === 'completed' && (
                    <button
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                      onClick={() => {
                        const receiptText = `REÇU DE TRANSACTION\n\nDate: ${formatDate(tx.date)}\nMontant: ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.montant)}\nMotif: ${tx.label}\nHash: ${tx.hash}\nStatut: Validé sur la blockchain\n`;
                        const blob = new Blob([receiptText], { type: 'text/plain' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `recu_transaction_${tx.id}.txt`;
                        a.click();
                      }}
                      title="Télécharger le reçu"
                    >
                      <FileText size={14} />
                    </button>
                  )}
                  <button
                    className="p-1.5 rounded-lg hover:bg-green-100 text-slate-400 hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer"
                    onClick={() => onView?.(tx)}
                    title="Voir les détails"
                  >
                    <ExternalLink size={14} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
