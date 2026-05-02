import { useState, useEffect } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Users, ArrowRight, RefreshCw, Plus } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { formatCurrency, formatDateShort } from '../utils/formatCurrency';
import { mapTransaction } from '../utils/apiMappings';
import { Link } from 'react-router-dom';

export default function Dashboard() {
  const { showToast } = useOutletContext();
  const { currentCoop, coops, setCurrentCoop, loadCoops } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!currentCoop?._id) return;
    fetchData();
  }, [currentCoop?._id]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [txRes, membersRes] = await Promise.all([
        client.get(`/cooperatives/${currentCoop._id}/transactions`),
        client.get(`/cooperatives/${currentCoop._id}`),
      ]);
      setTransactions((txRes.data || []).map(mapTransaction));
      setMembers(membersRes.data?.members || []);
    } catch (err) {
      console.error('Erreur chargement dashboard:', err.message);
    } finally {
      setLoading(false);
    }
  };

  // Computed stats
  const credits = transactions.filter((t) => t.type === 'credit');
  const debits  = transactions.filter((t) => t.type === 'debit');
  const totalEntrees = credits.reduce((sum, t) => sum + t.montant, 0);
  const totalSorties = debits.reduce((sum, t) => sum + t.montant, 0);
  const tresorerie = totalEntrees - totalSorties;
  const recentTx = transactions.slice(0, 5);

  if (!currentCoop) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 py-16">
        <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center">
          <Wallet size={28} className="text-green-600" />
        </div>
        <div className="text-center">
          <h2 className="font-bold text-slate-800 text-xl mb-2">Aucune coopérative trouvée</h2>
          <p className="text-slate-500 text-sm mb-6">Rejoignez ou créez une coopérative pour accéder à votre tableau de bord.</p>
          <Link to="/ajout-cooperative" className="btn-primary">
            <Plus size={16} /> Créer une coopérative
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Coop selector (if multiple coops) */}
      {coops.length > 1 && (
        <div className="flex items-center gap-3">
          <span className="text-xs text-slate-500 font-semibold">Coopérative :</span>
          <select
            className="input text-sm py-1.5 min-w-[200px]"
            value={currentCoop._id}
            onChange={(e) => setCurrentCoop(coops.find((c) => c._id === e.target.value))}
          >
            {coops.map((c) => <option key={c._id} value={c._id}>{c.name}</option>)}
          </select>
        </div>
      )}

      {/* Trésorerie card */}
      <div className="card bg-gradient-to-br from-green-700 to-green-900 border-0 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-2">Trésorerie</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(tresorerie)}</p>
            <div className="flex items-center gap-2 mt-3">
              <span className={`flex items-center gap-1 text-xs px-2.5 py-1 rounded-full font-semibold ${tresorerie >= 0 ? 'bg-white/20' : 'bg-red-400/30'}`}>
                {tresorerie >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                {tresorerie >= 0 ? 'Solde positif' : 'Solde négatif'}
              </span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/15 text-xs text-green-300 font-medium">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          {currentCoop.name} — {members.length} membres actifs
        </div>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Membres', value: members.length, icon: <Users size={16} className="text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Entrées', value: formatCurrency(totalEntrees), icon: <TrendingUp size={16} className="text-green-600" />, bg: 'bg-green-100', color: 'text-green-600' },
          { label: 'Sorties', value: formatCurrency(totalSorties), icon: <TrendingDown size={16} className="text-red-500" />, bg: 'bg-red-100', color: 'text-red-500' },
          { label: 'Transactions', value: transactions.length, icon: <ArrowRight size={16} className="text-blue-500" />, bg: 'bg-blue-100', color: 'text-blue-500' },
        ].map(({ label, value, icon, bg, color }) => (
          <div key={label} className="card flex flex-col gap-3">
            <div className={`w-9 h-9 ${bg} rounded-xl flex items-center justify-center`}>{icon}</div>
            <div>
              <p className={`font-display text-xl font-bold text-slate-800`}>{value}</p>
              <p className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-0.5">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent transactions */}
      <div className="card">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-slate-800 text-base">Dernières Transactions</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={fetchData}
              className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link to="/transactions" className="text-xs text-green-600 font-semibold hover:underline">
              Voir tout →
            </Link>
          </div>
        </div>

        {recentTx.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-8">Aucune transaction pour l'instant.</p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-50">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-3">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'}`}>
                    {tx.type === 'credit'
                      ? <TrendingUp size={16} className="text-green-600" />
                      : <TrendingDown size={16} className="text-red-500" />}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{tx.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{tx.hash}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}>
                    {tx.type === 'credit' ? '+' : '-'}{formatCurrency(tx.montant)}
                  </p>
                  <p className="text-xs text-slate-400">{formatDateShort(tx.date)}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
