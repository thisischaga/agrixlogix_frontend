import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext, Link, useSearchParams } from 'react-router-dom';
import {
  Wallet, TrendingUp, TrendingDown, Users, RefreshCw,
  Plus, Bell, Shield, ArrowUpRight, ClipboardList, Activity
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { formatCurrency, formatDateShort } from '../utils/formatCurrency';
import { mapTransaction } from '../utils/apiMappings';

import RevenueChart from '../components/charts/RevenueChart';
import QuickActions from '../components/cards/QuickActions';
import AuditCard from '../components/cards/AuditCard';
import ContributionModal from '../components/modals/ContributionModal';
import TransferModal from '../components/modals/TransferModal';
import { confirmFedaPayContribution } from '../api/paymentApi';
import { SkeletonStat, SkeletonList } from '../components/Skeleton';

const FEDAPAY_SESSION_KEY = 'fedapay_pending';

export default function Dashboard() {
  const { showToast } = useOutletContext();
  const { user, currentCoop, coops, setCurrentCoop, pendingCoops, loadCoops, addNotification, socket } = useAuth();


  const [stats, setStats] = useState(null);
  const [weekChart, setWeekChart] = useState([]);
  const [monthChart, setMonthChart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socketConnected, setSocketConnected] = useState(false);
  const [newCoop, setNewCoop] = useState({ name: '', location: '', cropType: '' });
  const [creating, setCreating] = useState(false);
  
  const [isContributionOpen, setIsContributionOpen] = useState(false);
  const [isTransferOpen, setIsTransferOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();

  const fetchData = useCallback(async () => {
    if (!currentCoop?._id) return;
    setLoading(true);
    const id = currentCoop._id;
    try {
      const [statsRes, wRes, mRes, txRes] = await Promise.all([
        client.get(`/cooperatives/${id}/stats`),
        client.get(`/cooperatives/${id}/revenue-expenses`, { params: { period: 'week' } }),
        client.get(`/cooperatives/${id}/revenue-expenses`, { params: { period: 'month' } }),
        client.get(`/cooperatives/${id}/transactions`),
      ]);
      setStats(statsRes.data);
      setWeekChart(Array.isArray(wRes.data) ? wRes.data : []);
      setMonthChart(Array.isArray(mRes.data) ? mRes.data : []);
      setTransactions((txRes.data || []).map(mapTransaction));
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // ── Confirmation automatique après retour FedaPay ───────────────
  useEffect(() => {
    const paymentStatus = searchParams.get('payment');
    if (paymentStatus !== 'success') return;
    
    console.log('[FedaPay Debug] Retour de paiement détecté. CoopID:', currentCoop?._id, 'Loading:', loading);
    
    if (!currentCoop?._id || loading) return;

    const pending = localStorage.getItem(FEDAPAY_SESSION_KEY);
    console.log('[FedaPay Debug] Données en localStorage:', pending);

    if (!pending) {
      console.warn('[FedaPay Debug] Aucune donnée de session trouvée !');
      return;
    }

    let parsed;
    try { parsed = JSON.parse(pending); } catch (e) {
      console.error('[FedaPay Debug] Erreur parsing session:', e);
      localStorage.removeItem(FEDAPAY_SESSION_KEY);
      return;
    }

    const { transaction_id, amount, coopId, description } = parsed;
    console.log('[FedaPay Debug] Détails:', { transaction_id, coopId, amount });

    if (!transaction_id) {
      showToast?.('ID de transaction manquant dans la session', 'error');
      return;
    }

    if (coopId !== currentCoop._id) {
      console.warn('[FedaPay Debug] CoopID ne correspond pas:', { session: coopId, current: currentCoop._id });
      return;
    }

    // Nettoyage
    localStorage.removeItem(FEDAPAY_SESSION_KEY);
    setSearchParams({}, { replace: true });

    const performConfirmation = async () => {
      showToast?.('⌛ Confirmation de votre cotisation en cours...');
      try {
        console.log('[FedaPay Debug] Appel API confirmation...');
        await confirmFedaPayContribution({
          fedapayTransactionId: transaction_id,
          cooperativeId: coopId,
          amount,
          description,
        });
        showToast?.('✅ Cotisation enregistrée avec succès !');
        setTimeout(() => {
          fetchData();
          loadCoops();
        }, 1000);
      } catch (err) {
        console.error('[FedaPay Debug] Échec confirmation API:', err);
        const msg = err.response?.data?.error || err.message;
        showToast?.(`Erreur confirmation : ${msg}`, 'error');
      }
    };

    performConfirmation();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams, currentCoop?._id, loading]);


  // ─────────────────────────────────────────────────────────────────

  // ── Real-time updates with Global Socket ───────────────────────
  useEffect(() => {
    if (!socket || !currentCoop?._id) return;

    const handleStatsUpdate = (payload) => {
      setStats((prev) => prev ? { ...prev, ...payload } : prev);
      if (payload.newTransaction) {
        setTransactions(prev => [mapTransaction(payload.newTransaction), ...prev.slice(0, 9)]);
      }
    };

    socket.on('stats_update', handleStatsUpdate);

    return () => {
      socket.off('stats_update', handleStatsUpdate);
    };
  }, [socket, currentCoop?._id]);


  const balance = stats?.balance ?? 0;
  const userBalance = stats?.userBalance ?? 0;
  const growth = Number(stats?.growthRate ?? 0);
  const membersCount = stats?.membersCount ?? 0;
  const activeVotes = stats?.activeVotes ?? 0;
  const recentTx = transactions.slice(0, 5);

  const handleAcceptInvite = async (coopId) => {
    try {
      await client.post(`/cooperatives/${coopId}/accept-invitation`);
      showToast('Bienvenue ! Adhésion confirmée ✓');
      loadCoops();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur lors de l’acceptation');
    }
  };

  const [verifying, setVerifying] = useState(false);
  const [auditResult, setAuditResult] = useState(null);

  const verifyBlockchain = async () => {
    if (!currentCoop?._id) return;
    setVerifying(true);
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/blockchain/verify`);
      setAuditResult(res.data);
      if (res.data.isValid) {
        showToast('Blockchain vérifiée : Intégrité 100% ✓');
      } else {
        showToast('Alerte : Anomalie détectée dans la chaîne !', 'error');
      }
      setTimeout(() => setAuditResult(null), 8000);
    } catch (err) {
      showToast('Erreur lors de l’audit blockchain');
    } finally {
      setVerifying(false);
    }
  };

  const handleSyncBlockchain = async () => {
    if (!currentCoop?._id) return;
    try {
      showToast?.('⌛ Réparation de la chaîne en cours...');
      await client.post(`/cooperatives/${currentCoop._id}/blockchain/sync`);
      showToast?.('✅ Chaîne synchronisée et scellée ✓');
      verifyBlockchain(); // Relancer l'audit
    } catch (err) {
      console.error(err);
      const errMsg = err.response?.data?.error || err.message || 'Échec de la synchronisation';
      showToast?.(errMsg, 'error');
    }
  };

  const handleExportAudit = async () => {
    if (!currentCoop?._id) return;
    try {
      showToast?.('⌛ Génération du rapport d\'audit...');
      const response = await client.get(`/cooperatives/${currentCoop._id}/blockchain/export`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `audit_${currentCoop.name.replace(/\s+/g, '_')}.csv`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showToast?.('✅ Rapport d\'audit téléchargé !');
    } catch (err) {
      console.error(err);
      showToast?.('Échec de l\'export du rapport', 'error');
    }
  };


  const handleCreateCoop = async (e) => {
    e.preventDefault();
    if (!newCoop.name) return showToast('Le nom est obligatoire');
    setCreating(true);
    try {
      const res = await client.post('/cooperatives', newCoop);
      setNewCoop({ name: '', location: '', cropType: '' });
      
      showToast?.('Coopérative créée avec succès !');

      // Rafraîchir les données
      if (typeof loadCoops === 'function') {
        await loadCoops();
        // Sélectionner la nouvelle coopérative
        if (typeof setCurrentCoop === 'function') {
          setCurrentCoop(res.data);
        }
      } else {
        window.location.reload();
      }
    } catch (err) {
      console.error(err);
      showToast?.(err.response?.data?.error || 'Erreur lors de la création');
    } finally {
      setCreating(false);
    }
  };

  if (!currentCoop) {
    const mainPending = pendingCoops.length > 0 ? pendingCoops[0] : null;

    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] gap-8 py-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
        {mainPending ? (
          // CAS 2 : Invité dans une coopérative
          <motion.div 
            initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-2xl shadow-green-900/10 border border-slate-100 p-10 max-w-lg w-full text-center"
          >
            <div className="w-20 h-20 bg-green-600 text-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-600/30">
              <Shield size={40} />
            </div>
            <h2 className="font-display font-bold text-slate-800 text-3xl mb-4">Invitation reçue !</h2>
            <p className="text-slate-500 mb-10 leading-relaxed">
              L'administrateur de <strong>{mainPending.name}</strong> vous a ajouté comme membre. 
              Veuillez confirmer pour accéder à la gestion de la coopérative.
            </p>
            
            <div className="bg-slate-50 rounded-3xl p-6 mb-10 border border-slate-100 text-left">
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-4">Détails de la coop</p>
              <div className="space-y-3">
                <div className="flex justify-between">
                   <span className="text-sm text-slate-400 font-medium">Localisation</span>
                   <span className="text-sm text-slate-800 font-bold">{mainPending.location || 'Non précisé'}</span>
                </div>
                <div className="flex justify-between">
                   <span className="text-sm text-slate-400 font-medium">Culture</span>
                   <span className="text-sm text-slate-800 font-bold">{mainPending.cropType || 'Non précisé'}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <button 
                onClick={() => handleAcceptInvite(mainPending._id)}
                className="btn-primary justify-center py-5 text-lg rounded-2xl shadow-xl shadow-green-600/30 font-bold"
              >
                 Accepter et Rejoindre
              </button>
              <button className="text-sm text-slate-400 font-bold hover:text-red-500 transition-colors uppercase tracking-widest">
                 Décliner l'invitation
              </button>
            </div>
          </motion.div>
        ) : (
          // CAS 1 : Aucune coopérative du tout -> FORMULAIRE DIRECT
          <motion.div 
            initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-[40px] shadow-2xl shadow-green-900/10 border border-slate-100 p-10 max-w-lg w-full"
          >
            <div className="text-center mb-8">
              <h2 className="font-display font-bold text-slate-800 text-3xl mb-3">Fonder ma coopérative</h2>
              <p className="text-slate-500 text-sm">Créez votre espace de gestion en quelques secondes.</p>
            </div>

            <form onSubmit={handleCreateCoop} className="space-y-5">
              <div className="space-y-2">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Nom de la coopérative</label>
                <input 
                  type="text" required className="input w-full py-4 rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-green-500"
                  placeholder="ex: Coopérative des maraîchers de Kara"
                  value={newCoop.name} onChange={e => setNewCoop({...newCoop, name: e.target.value})}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Localisation</label>
                  <input 
                    type="text" className="input w-full py-4 rounded-2xl bg-slate-50 border-transparent"
                    placeholder="ex: Kara, Togo"
                    value={newCoop.location} onChange={e => setNewCoop({...newCoop, location: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Culture</label>
                  <input 
                    type="text" className="input w-full py-4 rounded-2xl bg-slate-50 border-transparent"
                    placeholder="ex: Maïs, Soja"
                    value={newCoop.cropType} onChange={e => setNewCoop({...newCoop, cropType: e.target.value})}
                  />
                </div>
              </div>

              <button 
                type="submit" disabled={creating}
                className="btn-primary w-full justify-center py-5 text-lg rounded-2xl shadow-xl shadow-green-600/30 font-bold mt-4"
              >
                {creating ? 'Création...' : 'Lancer ma coopérative'}
              </button>
            </form>
          </motion.div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 pb-10">
      {/* Header Mobile-Inspired */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="hidden sm:block">
            <h1 className="font-display font-bold text-slate-800 text-2xl tracking-tight">Tableau de bord</h1>
            <p className="text-xs text-slate-400 font-medium">Bon retour, {user?.name?.split(' ')[0]}</p>
          </div>
          <div className="h-8 w-px bg-slate-200 hidden sm:block mx-2" />
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-full border border-slate-100 shadow-sm">
            <div className={`w-2 h-2 rounded-full ${socketConnected ? 'bg-green-500 animate-pulse' : 'bg-slate-300'}`} />
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">
              {socketConnected ? 'Réseau Actif' : 'Hors-ligne'}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-white rounded-2xl border border-slate-100 shadow-sm pr-1">
            <select
              className="input border-none text-xs py-2 min-w-[180px] bg-transparent cursor-pointer focus:ring-0"
              value={currentCoop._id}
              onChange={(e) => setCurrentCoop(coops.find((c) => c._id === e.target.value))}
            >
              {coops.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
            </select>
            <Link 
              to="/ajout-cooperative" 
              className="w-8 h-8 flex items-center justify-center bg-green-50 text-green-600 rounded-xl hover:bg-green-600 hover:text-white transition-all mr-1"
              title="Créer une autre coopérative"
            >
              <Plus size={16} />
            </Link>
          </div>
          <button className="p-2.5 rounded-xl bg-white border border-slate-100 text-slate-400 hover:text-green-600 transition-all shadow-sm">
            <Bell size={18} />
          </button>
        </div>
      </div>

      {/* Main Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {loading ? (
          <>
            <SkeletonStat />
            <SkeletonStat />
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white p-5 rounded-2xl border border-slate-100 h-full animate-pulse" />
               <div className="bg-white p-5 rounded-2xl border border-slate-100 h-full animate-pulse" />
            </div>
          </>
        ) : (
          <>
            {/* Treasury Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="card bg-white border-none shadow-xl shadow-green-900/5 p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.1em] mb-1">Trésorerie Totale</p>
                  <h3 className="font-display text-3xl font-bold text-slate-900">
                    {formatCurrency(balance)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-green-50 rounded-2xl flex items-center justify-center text-green-600">
                  <Wallet size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className={`flex items-center gap-1 text-xs font-bold px-2 py-1 rounded-lg ${growth >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {growth >= 0 ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                  {growth >= 0 ? '+' : ''}{growth.toFixed(1)}%
                </div>
                <span className="text-[11px] text-slate-400 font-medium">vs mois dernier</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.03] text-green-900">
                <Activity size={120} />
              </div>
            </motion.div>

            {/* Personal Balance Card */}
            <motion.div
              whileHover={{ y: -4 }}
              className="card bg-gradient-to-br from-blue-600 to-indigo-700 border-none shadow-xl shadow-blue-900/20 p-6 relative overflow-hidden"
            >
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-[10px] font-bold text-blue-100 uppercase tracking-[0.1em] mb-1">Solde Théorique (Cotisations)</p>
                  <h3 className="font-display text-3xl font-bold text-white">
                    {formatCurrency(userBalance)}
                  </h3>
                </div>
                <div className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center text-white">
                  <Shield size={24} />
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-blue-100 font-medium">Cumul total de vos cotisations</span>
              </div>
              <div className="absolute -right-4 -bottom-4 opacity-[0.1] text-white">
                <TrendingUp size={120} />
              </div>
            </motion.div>

            {/* Members & Votes */}
            <div className="grid grid-cols-2 gap-4">
              <div className="card bg-white border-slate-100 flex flex-col justify-between p-5 shadow-sm">
                <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Membres</p>
                  <p className="font-display text-2xl font-bold text-slate-800">{membersCount}</p>
                </div>
              </div>
              <div className="card bg-white border-slate-100 flex flex-col justify-between p-5 shadow-sm">
                <div className="w-10 h-10 bg-amber-50 rounded-xl flex items-center justify-center text-amber-600">
                  <ClipboardList size={20} />
                </div>
                <div>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1">Votes Actifs</p>
                  <p className="font-display text-2xl font-bold text-slate-800">{activeVotes}</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Audit & Charts Section */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6 items-stretch">
        <div className="xl:col-span-4">
          <AuditCard
            dernierBloc={stats?.blockchain?.lastBlock ?? '—'}
            validateursLibelle={stats?.blockchain?.validators ?? '—'}
            consensus={stats?.blockchain?.status ?? '—'}
            etatConnexion={socketConnected ? 'Connecté' : 'Hors-ligne'}
            verifying={verifying}
            auditResult={auditResult}
            onVerify={verifyBlockchain}
            onAction={handleExportAudit}
            onSync={handleSyncBlockchain}
            isAdmin={currentCoop?.adminId === user?._id || user?.role === 'Admin' || user?.role === 'Président'}
          />
        </div>
        <div className="xl:col-span-8">
          <QuickActions 
            onContribute={() => setIsContributionOpen(true)} 
            onTransfer={() => setIsTransferOpen(true)} 
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6">
        <RevenueChart weekData={weekChart} monthData={monthChart} />
      </div>


      {/* Recent Transactions Table */}
      <div className="card bg-white shadow-sm border-slate-100">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
            Dernières transactions
            <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          </h2>
          <Link to="/transactions" className="text-xs font-bold text-green-600 hover:text-green-700 flex items-center gap-1 group">
            Tout voir <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-50">
              <tr>
                <th className="text-left py-3 px-2">Description</th>
                <th className="text-left py-3 px-2">Date</th>
                <th className="text-right py-3 px-2">Montant</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {loading ? (
                <tr>
                  <td colSpan="3" className="p-0">
                    <SkeletonList count={3} />
                  </td>
                </tr>
              ) : recentTx.length === 0 ? (
                <tr>
                  <td colSpan="3" className="py-10 text-center text-slate-400 italic">Aucune transaction récente</td>
                </tr>
              ) : (
                recentTx.map((tx) => (
                  <tr key={tx.id} className="group hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-2">
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-500'}`}>
                          {tx.type === 'credit' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                        </div>
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 truncate">{tx.label}</p>
                          <p className="text-[10px] text-slate-400 font-mono truncate">{tx.hash}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-2 text-slate-500 text-xs">{formatDateShort(tx.date)}</td>
                    <td className={`py-4 px-2 text-right font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                      {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.montant)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modals */}
      <ContributionModal 
        isOpen={isContributionOpen} 
        onClose={() => setIsContributionOpen(false)} 
        coopId={currentCoop._id} 
        user={user} 
        onSuccess={fetchData} 
      />
      <TransferModal 
        isOpen={isTransferOpen} 
        onClose={() => setIsTransferOpen(false)} 
        coopId={currentCoop._id} 
        user={user} 
        userBalance={userBalance}
        onSuccess={fetchData} 
      />
    </div>
  );
}
