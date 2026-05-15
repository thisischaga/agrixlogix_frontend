// src/components/tables/TransactionsTable.jsx
import { ArrowUpRight, ArrowDownLeft, ExternalLink, Check, X, FileText, Smartphone, Landmark } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

/** Couleur du badge selon l'opérateur/moyen de paiement */
function paymentBadgeStyle(method) {
  const m = (method || '').toLowerCase();
  if (m === 'mtn')      return 'bg-yellow-100 text-yellow-800';
  if (m === 'moov')     return 'bg-blue-100 text-blue-800';
  if (m === 'flooz')    return 'bg-orange-100 text-orange-800';
  if (m === 't-money')  return 'bg-red-100 text-red-700';
  if (m === 'fedapay')  return 'bg-violet-100 text-violet-800';
  if (m === 'virement') return 'bg-teal-100 text-teal-800';
  if (m === 'espèces' || m === 'especes') return 'bg-green-100 text-green-700';
  return 'bg-slate-100 text-slate-600';
}

/** Formate un numéro de compte pour l'affichage */
function formatAccountNumber(num, type) {
  if (!num) return null;
  if (type === 'mobile') {
    // Ex: 90123456 → 90 12 34 56
    return num.replace(/(\d{2})(?=\d)/g, '$1 ').trim();
  }
  return num;
}

/**
 * Tableau des transactions réutilisable
 * @param {Array}    data       - tableau de transactions mappées
 * @param {Function} onView     - callback au clic "Voir"
 * @param {String}   userRole   - rôle de l'utilisateur courant (pour validation)
 * @param {Function} onValidate - callback au clic "Valider"
 * @param {Function} onReject   - callback au clic "Rejeter"
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
            {['Transaction', 'Moyen', 'Catégorie', 'Date', 'Statut / Bloc', 'Montant', ''].map((h) => (
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

              {/* Label + numéro de compte + hash */}
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

                    {/* Numéro de compte si disponible */}
                    {tx.accountNumber && (
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5 flex items-center gap-1">
                        {tx.accountType === 'bancaire'
                          ? <Landmark size={9} className="text-slate-400" />
                          : <Smartphone size={9} className="text-slate-400" />
                        }
                        {formatAccountNumber(tx.accountNumber, tx.accountType)}
                      </p>
                    )}

                    {/* Hash blockchain */}
                    <p className="text-[10px] text-slate-400 font-mono mt-0.5" title={tx.hash}>
                      {tx.hash && tx.hash !== '—'
                        ? `${tx.hash.substring(0, 10)}...${tx.hash.substring(tx.hash.length - 8)}`
                        : '—'}
                    </p>
                  </div>
                </div>
              </td>

              {/* Moyen de paiement */}
              <td className="px-3 sm:px-4 py-3.5">
                {tx.paymentMethod ? (
                  <span className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-lg ${paymentBadgeStyle(tx.paymentMethod)}`}>
                    {tx.accountType === 'mobile'   && <Smartphone size={9} />}
                    {tx.accountType === 'bancaire' && <Landmark size={9} />}
                    {tx.paymentMethod}
                  </span>
                ) : (
                  <span className="text-[10px] text-slate-300">—</span>
                )}
              </td>

              {/* Catégorie */}
              <td className="px-3 sm:px-4 py-3.5">
                <span className="badge-gray text-[10px] sm:text-xs">{tx.categorie}</span>
              </td>

              {/* Date */}
              <td className="px-3 sm:px-4 py-3.5 text-[10px] sm:text-xs text-slate-500 whitespace-nowrap">
                {formatDate(tx.date)}
              </td>

              {/* Statut / Bloc */}
              <td className="px-3 sm:px-4 py-3.5">
                {tx.statut === 'pending'   && <span className="bg-amber-100 text-amber-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg">En attente</span>}
                {tx.statut === 'rejected'  && <span className="bg-red-100 text-red-700 text-[10px] sm:text-xs font-bold px-2 py-0.5 rounded-lg">Rejeté</span>}
                {tx.statut === 'completed' && (
                  <span className="badge-green text-[10px] sm:text-xs font-mono px-2 py-0.5 rounded-lg">
                    ✓ {tx.bloc !== '—' ? tx.bloc : 'validé'}
                  </span>
                )}
              </td>

              {/* Montant */}
              <td className={`px-4 py-3.5 font-display font-bold whitespace-nowrap ${
                tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.montant)}
              </td>

              {/* Actions */}
              <td className="px-4 py-3.5">
                <div className="flex items-center gap-1">
                  {/* Boutons Valider / Rejeter pour Président/Admin */}
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

                  {/* Télécharger le reçu */}
                  {tx.statut === 'completed' && (
                    <button
                      className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-slate-600 transition-colors border-none bg-transparent cursor-pointer"
                      onClick={() => {
                        const lines = [
                          'REÇU DE TRANSACTION AgriLogix',
                          '─'.repeat(35),
                          `Date          : ${formatDate(tx.date)}`,
                          `Montant       : ${tx.type === 'credit' ? '+' : '-'}${formatCurrency(tx.montant)}`,
                          `Motif         : ${tx.label}`,
                          `Catégorie     : ${tx.categorie}`,
                        ];
                        if (tx.paymentMethod) lines.push(`Moyen         : ${tx.paymentMethod}`);
                        if (tx.accountNumber) lines.push(`Compte        : ${formatAccountNumber(tx.accountNumber, tx.accountType)}`);
                        lines.push(`Hash          : ${tx.hash}`);
                        lines.push(`Statut        : Validé`);
                        lines.push('', '─'.repeat(35));
                        lines.push('Powered by AgriLogix CoopLedger');

                        const blob = new Blob([lines.join('\n')], { type: 'text/plain' });
                        const a = document.createElement('a');
                        a.href = URL.createObjectURL(blob);
                        a.download = `recu_${tx.id}.txt`;
                        a.click();
                      }}
                      title="Télécharger le reçu"
                    >
                      <FileText size={14} />
                    </button>
                  )}

                  {/* Voir détails */}
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
