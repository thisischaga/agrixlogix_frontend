// src/components/tables/TransactionsTable.jsx
import { ArrowUpRight, ArrowDownLeft, ExternalLink } from 'lucide-react';
import { formatCurrency, formatDate } from '../../utils/formatCurrency';

/**
 * Tableau des transactions réutilisable
 * @param {Array} data - tableau de transactions
 * @param {Function} onView - callback au clic "Voir"
 */
export default function TransactionsTable({ data, onView }) {
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
            {['Transaction', 'Catégorie', 'Date', 'Bloc', 'Montant', ''].map((h) => (
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
                    <p className="text-xs text-slate-400 font-mono mt-0.5">{tx.hash}</p>
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

              {/* Bloc */}
              <td className="px-4 py-3.5">
                <span className="badge-green text-xs font-mono">✓ {tx.bloc}</span>
              </td>

              {/* Montant */}
              <td className={`px-4 py-3.5 font-display font-bold whitespace-nowrap ${
                tx.type === 'credit' ? 'text-green-600' : 'text-red-500'
              }`}>
                {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.montant)}
              </td>

              {/* Action */}
              <td className="px-4 py-3.5">
                <button
                  className="p-1.5 rounded-lg hover:bg-green-100 text-slate-400 hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer"
                  onClick={() => onView?.(tx)}
                  title="Voir sur la blockchain"
                >
                  <ExternalLink size={14} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
