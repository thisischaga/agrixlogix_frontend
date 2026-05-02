// src/pages/Transactions.jsx
import { useState, useMemo, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight } from 'lucide-react';

import TransactionsTable from '../components/tables/TransactionsTable';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mapTransaction } from '../utils/apiMappings';

const CATEGORIES = ['Toutes', 'Vente', 'Équipement', 'Cotisation', 'Subvention', 'Transport', 'Fonctionnement'];
const TYPES      = ['Tous', 'credit', 'debit'];
const PAGE_SIZE  = 6;

export default function Transactions() {
  const { showToast } = useOutletContext();
  const { currentCoop } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Toutes');
  const [type, setType] = useState('Tous');
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (!currentCoop?._id) return;

    const loadTransactions = async () => {
      try {
        const res = await client.get(`/cooperatives/${currentCoop._id}/transactions`);
        setTransactions(res.data.map(mapTransaction));
      } catch (err) {
        console.error('Erreur chargement transactions', err.message || err);
      }
    };

    loadTransactions();
  }, [currentCoop?._id]);

  const filtered = useMemo(() => {
    return transactions.filter((tx) => {
      const query = search.toLowerCase();
      const matchSearch = tx.label.toLowerCase().includes(query)
        || tx.hash.toLowerCase().includes(query);
      const matchCat  = categorie === 'Toutes' || tx.categorie === categorie;
      const matchType = type === 'Tous' || tx.type === type;
      return matchSearch && matchCat && matchType;
    });
  }, [search, categorie, type, transactions]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE) || 1;
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const handleExport = () => {
    const csv = [
      ['ID', 'Type', 'Catégorie', 'Label', 'Hash', 'Date', 'Montant', 'Statut'],
      ...filtered.map((tx) => [
        tx.id, tx.type, tx.categorie, tx.label, tx.hash,
        tx.date, tx.montant, tx.bloc,
      ]),
    ].map((r) => r.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'transactions-coopled.csv';
    a.click();
    showToast('Export CSV téléchargé ✓');
  };

  if (!currentCoop) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-slate-800">Transactions</h2>
        <p className="text-sm text-slate-500">Sélectionnez une coopérative pour consulter les transactions réelles.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              className="input pl-10"
              placeholder="Rechercher une transaction, hash..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            />
          </div>

          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="input pl-8 pr-4 cursor-pointer appearance-none min-w-[150px]"
              value={categorie}
              onChange={(e) => { setCategorie(e.target.value); setPage(1); }}
            >
              {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
            </select>
          </div>

          <select
            className="input cursor-pointer appearance-none min-w-[130px]"
            value={type}
            onChange={(e) => { setType(e.target.value); setPage(1); }}
          >
            <option value="Tous">Tous les types</option>
            <option value="credit">Entrées</option>
            <option value="debit">Sorties</option>
          </select>

          <button className="btn-outline" onClick={handleExport}>
            <Download size={14} /> Exporter CSV
          </button>
          <button className="btn-primary" onClick={() => showToast('Données synchronisées avec le backend ✓')}>
            <RefreshCw size={14} /> Synchroniser
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-slate-800 text-base">Dernières Transactions</h2>
          <span className="badge-green">{filtered.length} résultats</span>
        </div>

        <TransactionsTable data={paginated} onView={(tx) => showToast(`Bloc ${tx.bloc} — ${tx.hash}`)} />

        <div className="flex items-center justify-between mt-5 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-400">
            Affichage {Math.min((page - 1) * PAGE_SIZE + 1, filtered.length)}–{Math.min(page * PAGE_SIZE, filtered.length)} sur {filtered.length} transactions
          </p>
          <div className="flex items-center gap-2">
            <button
              className="btn-outline py-1.5 px-3 disabled:opacity-40"
              disabled={page === 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              <ChevronLeft size={14} /> Précédent
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold border-none cursor-pointer transition-all duration-200 ${
                  page === p
                    ? 'bg-green-600 text-white'
                    : 'bg-slate-100 text-slate-500 hover:bg-green-100 hover:text-green-700'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              className="btn-outline py-1.5 px-3 disabled:opacity-40"
              disabled={page === totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Suivant <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
