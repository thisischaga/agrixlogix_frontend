/**
 * Transforme une transaction du format backend vers le format frontend
 */
export function mapTransaction(tx) {
  return {
    id: tx._id,
    _id: tx._id,
    type: tx.type === 'credit' ? 'credit' : 'debit',
    montant: tx.amount ?? tx.montant ?? 0,
    label: tx.description ?? tx.label ?? 'Sans description',
    categorie: tx.category ?? tx.categorie ?? 'Autre',
    hash: tx.hash ?? `0x${tx._id?.slice(-8).toUpperCase()}`,
    bloc: tx.blockNumber ?? '—',
    date: tx.createdAt ?? tx.date,
    statut: tx.status ?? 'confirmed',
  };
}
