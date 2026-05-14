// src/pages/Transactions.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

import TransactionsTable from '../components/tables/TransactionsTable';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mapTransaction } from '../utils/apiMappings';

const CATEGORIES = ['Toutes', 'Vente', 'Équipement', 'Cotisation', 'Subvention', 'Transport', 'Fonctionnement'];
const TYPES      = ['Tous', 'credit', 'debit'];
const PAGE_SIZE  = 6;

function apiError(err) {
  return err?.response?.data?.error || err?.message || 'Une erreur est survenue.';
}

export default function Transactions() {
  const { showToast } = useOutletContext();
  const { currentCoop, user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState('');
  const [categorie, setCategorie] = useState('Toutes');
  const [type, setType] = useState('Tous');
  const [page, setPage] = useState(1);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTx, setNewTx] = useState({
    title: '',
    amount: '',
    type: 'in',
    category: 'Cotisation',
  });

  const loadTransactions = useCallback(async () => {
    if (!currentCoop?._id) return;
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/transactions`);
      setTransactions(res.data.map(mapTransaction));
    } catch (err) {
      console.error('Erreur chargement transactions', err.message || err);
      showToast?.(apiError(err));
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const { socket } = useAuth();
  useEffect(() => {
    if (!socket || !currentCoop?._id) return;

    const handleNewTx = (payload) => {
      if (payload.newTransaction) {
        setTransactions(prev => [mapTransaction(payload.newTransaction), ...prev]);
      }
    };

    socket.on('stats_update', handleNewTx);
    return () => {
      socket.off('stats_update', handleNewTx);
    };
  }, [socket, currentCoop?._id]);


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

  const handleCreateTransaction = async (e) => {
    e.preventDefault();
    if (!currentCoop?._id) return;
    const amount = Number(newTx.amount);
    if (!newTx.title?.trim() || !amount || amount <= 0) {
      showToast('Titre et montant valides requis.');
      return;
    }
    setSaving(true);
    try {
      await client.post(`/cooperatives/${currentCoop._id}/transactions`, {
        title: newTx.title.trim(),
        amount,
        type: newTx.type,
        category: newTx.category,
      });
      showToast('Transaction enregistrée ✓');
      setShowModal(false);
      setNewTx({ title: '', amount: '', type: 'in', category: newTx.category });
      await loadTransactions();
      setPage(1);
    } catch (err) {
      showToast(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  const handleValidate = async (txId) => {
    try {
      await client.post(`/cooperatives/${currentCoop._id}/transactions/${txId}/validate`);
      showToast('Transaction approuvée et scellée ✓');
      loadTransactions();
    } catch (err) {
      showToast(apiError(err));
    }
  };

  const handleReject = async (txId) => {
    try {
      await client.post(`/cooperatives/${currentCoop._id}/transactions/${txId}/reject`);
      showToast('Transaction rejetée');
      loadTransactions();
    } catch (err) {
      showToast(apiError(err));
    }
  };

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

          <button type="button" className="btn-outline" onClick={handleExport}>
            <Download size={14} /> Exporter CSV
          </button>
          <button type="button" className="btn-primary" onClick={() => loadTransactions()}>
            <RefreshCw size={14} /> Actualiser
          </button>
          <button type="button" className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={14} /> Nouvelle transaction
          </button>
        </div>

        <div className="flex items-center justify-between mb-3">
          <h2 className="font-display font-bold text-slate-800 text-base">Dernières Transactions</h2>
          <span className="badge-green">{filtered.length} résultats</span>
        </div>

        <TransactionsTable 
          data={paginated} 
          userRole={user?.role}
          onView={(tx) => showToast(`Bloc ${tx.bloc} — ${tx.hash}`)} 
          onValidate={handleValidate}
          onReject={handleReject}
        />

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

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800">Nouvelle transaction</h3>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateTransaction} className="p-5 flex flex-col gap-4">
              <p className="text-xs text-slate-500">
                Les sorties ≥ 500&nbsp;000 FCFA peuvent créer une procédure de vote côté serveur (selon règles de la coop).
              </p>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Libellé</label>
                <input
                  className="input"
                  value={newTx.title}
                  onChange={(e) => setNewTx((s) => ({ ...s, title: e.target.value }))}
                  placeholder="Ex. Cotisation février"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Montant (FCFA)</label>
                <input
                  className="input"
                  type="number"
                  min="1"
                  step="1"
                  value={newTx.amount}
                  onChange={(e) => setNewTx((s) => ({ ...s, amount: e.target.value }))}
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Type</label>
                <select
                  className="input cursor-pointer"
                  value={newTx.type}
                  onChange={(e) => setNewTx((s) => ({ ...s, type: e.target.value }))}
                >
                  <option value="in">Entrée (crédit)</option>
                  <option value="out">Sortie (débit)</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Catégorie</label>
                <select
                  className="input cursor-pointer"
                  value={newTx.category}
                  onChange={(e) => setNewTx((s) => ({ ...s, category: e.target.value }))}
                >
                  {CATEGORIES.filter((c) => c !== 'Toutes').map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary disabled:opacity-50" disabled={saving}>
                  {saving ? 'Envoi…' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
