// src/pages/Transactions.jsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Download, RefreshCw, ChevronLeft, ChevronRight, Plus, X, Smartphone, Landmark, CreditCard } from 'lucide-react';

import TransactionsTable from '../components/tables/TransactionsTable';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { mapTransaction } from '../utils/apiMappings';
import { AFRICAN_COUNTRIES, detectOperator, validateOperatorNumber, validateBankAccount } from '../utils/phoneUtils';
import { SkeletonList } from '../components/Skeleton';

const CATEGORIES = ['Toutes', 'Vente', 'Équipement', 'Cotisation', 'Subvention', 'Transport', 'Fonctionnement'];
const TYPES      = ['Tous', 'credit', 'debit'];
const PAGE_SIZE  = 6;

// Moyens de paiement disponibles selon le type de compte
const MOBILE_OPERATORS  = ['MTN', 'Moov', 'Flooz', 'T-Money'];
const BANKING_OPERATORS = ['Virement', 'Espèces', 'Chèque', 'Autre'];

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
    // Moyen de paiement
    accountType: '',       // '' | 'mobile' | 'bancaire'
    paymentMethod: '',     // MTN / Moov / Flooz / T-Money / Virement ...
    accountNumber: '',     // numéro tel ou compte bancaire
  });
  const [customOperator, setCustomOperator] = useState('');
  const [selectedCountry, setSelectedCountry] = useState('TG');
  const [detectedOperator, setDetectedOperator] = useState(null);
  const [isDetecting, setIsDetecting] = useState(false);
  const [accountError, setAccountError] = useState('');

  // Détection automatique locale de l'opérateur
  useEffect(() => {
    if (newTx.accountType === 'mobile' && newTx.accountNumber?.length >= 2) {
      const op = detectOperator(newTx.accountNumber, selectedCountry);
      if (op) {
        setDetectedOperator(op);
        setNewTx(prev => ({ ...prev, paymentMethod: op.name }));
      } else {
        setDetectedOperator(null);
      }
    } else {
      setDetectedOperator(null);
    }
  }, [newTx.accountNumber, newTx.accountType, selectedCountry]);

  // Synchroniser le pays par défaut avec la localisation de la coop
  useEffect(() => {
    if (currentCoop?.location) {
      const country = AFRICAN_COUNTRIES.find(c => currentCoop.location.includes(c.name));
      if (country) setSelectedCountry(country.code);
    }
  }, [currentCoop?.location]);

  /** Valide le numéro de compte selon le type choisi */
  function validateAccountNumber(num, type) {
    if (!num) return '';
    if (type === 'mobile') {
      const clean = num.replace(/[\s-]/g, '');
      if (!/^\d{7,15}$/.test(clean)) return 'Numéro Mobile Money invalide (7 à 15 chiffres)';
    }
    if (type === 'bancaire') {
      const v = validateBankAccount(num);
      return v.valid ? '' : v.error;
    }
    return '';
  }

  const loadTransactions = useCallback(async () => {
    if (!currentCoop?._id) return;
    setLoading(true);
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/transactions`);
      setTransactions(res.data.map(mapTransaction));
    } catch (err) {
      console.error('Erreur chargement transactions', err.message || err);
      showToast?.(apiError(err));
    } finally {
      setLoading(false);
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

    let finalOperator = newTx.paymentMethod;
    if (newTx.paymentMethod === 'Autre') {
      if (!customOperator.trim()) { showToast("Précisez le nom de l'opérateur."); return; }
      finalOperator = customOperator.trim();
    }

    // Validation moyen de paiement
    if (newTx.accountType === 'mobile') {
      if (!newTx.paymentMethod) { showToast("Sélectionnez l'opérateur Mobile Money."); return; }
      const err = validateAccountNumber(newTx.accountNumber, 'mobile');
      if (!newTx.accountNumber || err) { showToast(err || 'Numéro de téléphone requis.'); return; }
    }
    if (newTx.accountType === 'bancaire') {
      if (!newTx.paymentMethod) { showToast('Sélectionnez le mode bancaire.'); return; }
      const err = validateAccountNumber(newTx.accountNumber, 'bancaire');
      if (!newTx.accountNumber || err) { showToast(err || 'Numéro de compte requis.'); return; }
    }

    setSaving(true);
    try {
      await client.post(`/cooperatives/${currentCoop._id}/transactions`, {
        title: newTx.title.trim(),
        amount,
        type: newTx.type,
        category: newTx.category,
        accountType:   newTx.accountType   || undefined,
        paymentMethod: finalOperator || undefined,
        accountNumber: newTx.accountNumber ? newTx.accountNumber.replace(/[\s-]/g, '') : undefined,
      });
      showToast('Transaction enregistrée ✓');
      setShowModal(false);
      setNewTx({ title: '', amount: '', type: 'in', category: newTx.category, accountType: '', paymentMethod: '', accountNumber: '' });
      setAccountError('');
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
      ['ID', 'Type', 'Catégorie', 'Label', 'Moyen', 'Compte', 'Hash', 'Date', 'Montant', 'Statut'],
      ...filtered.map((tx) => [
        tx.id, tx.type, tx.categorie, tx.label,
        tx.paymentMethod || '', tx.accountNumber || '',
        tx.hash, tx.date, tx.montant, tx.statut,
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
    <div className="flex flex-col gap-4 sm:gap-5 w-full max-w-full overflow-x-hidden">
      <div className="card !p-3 sm:!p-5">
        <div className="flex flex-col gap-4 mb-6">
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[280px] sm:min-w-[300px]">
              <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                className="input pl-10 h-11"
                placeholder="Rechercher une transaction, hash..."
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              />
            </div>
            
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <button type="button" className="btn-primary flex-1 sm:flex-initial h-11" onClick={() => setShowModal(true)}>
                <Plus size={14} /> Nouvelle
              </button>
              <button type="button" className="btn-outline flex-1 sm:flex-initial h-11" onClick={() => loadTransactions()}>
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-50 mt-2 sm:mt-0 sm:border-none sm:pt-0">
            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <select
                className="input pl-8 pr-4 cursor-pointer appearance-none h-10 text-xs font-semibold"
                value={categorie}
                onChange={(e) => { setCategorie(e.target.value); setPage(1); }}
              >
                {CATEGORIES.map((c) => <option key={c}>{c}</option>)}
              </select>
            </div>

            <div className="relative flex-1 sm:flex-initial min-w-[140px]">
              <select
                className="input cursor-pointer appearance-none h-10 text-xs font-semibold"
                value={type}
                onChange={(e) => { setType(e.target.value); setPage(1); }}
              >
                <option value="Tous">Tous les types</option>
                <option value="credit">Entrées (Crédit)</option>
                <option value="debit">Sorties (Débit)</option>
              </select>
            </div>

            <button type="button" className="btn-outline h-10 text-xs ml-auto" onClick={handleExport}>
              <Download size={14} /> CSV
            </button>
          </div>
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
              {/* ── Section Moyen de paiement ── */}
              <div className="border border-slate-100 rounded-2xl p-4 flex flex-col gap-4 bg-slate-50/60">
                <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">Moyen de paiement</p>

                {/* Type de compte */}
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setNewTx(s => ({ ...s, accountType: 'mobile', paymentMethod: '', accountNumber: '' }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all cursor-pointer text-xs font-bold ${
                      newTx.accountType === 'mobile'
                        ? 'border-green-500 bg-green-50 text-green-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-green-300'
                    }`}
                  >
                    <Smartphone size={18} />
                    Mobile Money
                  </button>
                  <button
                    type="button"
                    onClick={() => setNewTx(s => ({ ...s, accountType: 'bancaire', paymentMethod: '', accountNumber: '' }))}
                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 transition-all cursor-pointer text-xs font-bold ${
                      newTx.accountType === 'bancaire'
                        ? 'border-blue-500 bg-blue-50 text-blue-700'
                        : 'border-slate-200 bg-white text-slate-500 hover:border-blue-300'
                    }`}
                  >
                    <Landmark size={18} />
                    Bancaire
                  </button>
                </div>

                {/* Pays et Opérateur */}
                {newTx.accountType === 'mobile' && (
                  <div className="flex flex-col gap-3">
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Pays</label>
                        <select 
                          className="input h-10 text-xs font-bold"
                          value={selectedCountry}
                          onChange={(e) => {
                            setSelectedCountry(e.target.value);
                            setNewTx(s => ({ ...s, paymentMethod: '', accountNumber: '' }));
                            setCustomOperator('');
                            setAccountError('');
                          }}
                        >
                          {AFRICAN_COUNTRIES.map(c => (
                            <option key={c.code} value={c.code}>{c.name}</option>
                          ))}
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Opérateur</label>
                        <select 
                          className="input h-10 text-xs font-bold"
                          value={newTx.paymentMethod}
                          onChange={(e) => {
                            setNewTx(s => ({ ...s, paymentMethod: e.target.value }));
                            setAccountError('');
                          }}
                        >
                          <option value="">Sélectionner...</option>
                          {AFRICAN_COUNTRIES.find(c => c.code === selectedCountry)?.operators.map(op => (
                            <option key={op.id} value={op.name}>{op.name}</option>
                          ))}
                        </select>
                      </div>
                    </div>

                    {newTx.paymentMethod === 'Autre' && (
                      <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2">
                        <label className="block text-[10px] font-bold text-slate-400 uppercase ml-1">Nom du service Mobile Money</label>
                        <input 
                          className="input h-10 text-xs font-bold"
                          placeholder="Ex: Orange Money, Wave, etc."
                          value={customOperator}
                          onChange={(e) => setCustomOperator(e.target.value)}
                        />
                      </div>
                    )}
                  </div>
                )}

                {newTx.accountType === 'bancaire' && (
                  <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Mode</label>
                    <div className="grid grid-cols-2 gap-2">
                      {BANKING_OPERATORS.map(op => (
                        <button
                          key={op}
                          type="button"
                          onClick={() => setNewTx(s => ({ ...s, paymentMethod: op }))}
                          className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all cursor-pointer ${
                            newTx.paymentMethod === op
                              ? 'border-blue-500 bg-blue-500 text-white'
                              : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                          }`}
                        >
                          {op}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                 {/* Numéro de compte */}
                 {newTx.accountType && (
                   <div className="space-y-2">
                     <label className="block text-xs font-bold text-slate-500 uppercase">
                       {newTx.accountType === 'mobile' ? 'Numéro de téléphone' : 'Numéro de compte'}
                     </label>
                     <div className="relative">
                       {newTx.accountType === 'mobile'
                         ? <Smartphone size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                         : <CreditCard size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                       }
                       <input
                         className={`input pl-9 font-mono ${
                           accountError ? 'border-red-400 focus:border-red-500 bg-red-50' : ''
                         }`}
                         placeholder={newTx.accountType === 'mobile' ? 'Numéro de téléphone' : 'Numéro de compte'}
                         value={newTx.accountNumber}
                         onChange={(e) => {
                           const val = e.target.value;
                           setNewTx(s => ({ ...s, accountNumber: val }));
                           
                           if (newTx.accountType === 'mobile' && newTx.paymentMethod) {
                              const country = AFRICAN_COUNTRIES.find(c => c.code === selectedCountry);
                              const operator = country?.operators.find(op => op.name === newTx.paymentMethod);
                              if (operator) {
                                const v = validateOperatorNumber(val, selectedCountry, operator.id);
                                setAccountError(v.valid ? '' : v.error);
                              }
                           } else {
                              setAccountError(validateAccountNumber(val, newTx.accountType));
                           }
                         }}
                         inputMode={newTx.accountType === 'mobile' ? 'numeric' : 'text'}
                       />
                     </div>

                     {/* Feedback Opérateur */}
                     {newTx.accountType === 'mobile' && detectedOperator && (
                        <div className="flex items-center gap-2 px-3 py-2 rounded-xl border animate-in fade-in slide-in-from-top-1" style={{ backgroundColor: `${detectedOperator.color}10`, borderColor: `${detectedOperator.color}30` }}>
                          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: detectedOperator.color }} />
                          <span className="text-[11px] font-bold" style={{ color: detectedOperator.color }}>
                            {detectedOperator.name} détecté
                          </span>
                        </div>
                     )}

                     {accountError && (
                       <p className="text-xs text-red-500 font-medium">{accountError}</p>
                     )}
                     {!accountError && newTx.accountNumber && !detectedOperator && (
                       <p className="text-xs text-green-600 font-medium">✓ Format valide</p>
                     )}
                   </div>
                 )}

                {!newTx.accountType && (
                  <p className="text-[11px] text-slate-400 text-center italic">
                    Optionnel — sélectionnez un type pour renseigner le moyen de paiement
                  </p>
                )}
              </div>

              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary disabled:opacity-50" disabled={saving || !!accountError}>
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
