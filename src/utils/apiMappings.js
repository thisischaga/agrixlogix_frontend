/**
 * Transforme une transaction du format backend vers le format frontend
 */
export function mapTransaction(tx) {
  const rawType = (tx.type || '').toString().toLowerCase();
  const isCredit =
    rawType === 'in' ||
    rawType === 'credit' ||
    rawType === 'entrée' ||
    rawType === 'entree';

  const hash = tx.txHash ?? tx.hash;

  return {
    id: tx._id,
    _id: tx._id,
    type: isCredit ? 'credit' : 'debit',
    montant: Number(tx.amount ?? tx.montant ?? 0) || 0,
    label: tx.title ?? tx.description ?? tx.label ?? '—',
    categorie: tx.category ?? tx.categorie ?? '—',
    hash: hash ?? '—',
    bloc: tx.blockNumber ?? '—',
    date: tx.createdAt ?? tx.date,
    statut: tx.status ?? '—',
  };
}
