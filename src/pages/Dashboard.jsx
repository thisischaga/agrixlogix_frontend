import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  Users,
  RefreshCw,
  Plus,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import { formatCurrency, formatDateShort } from '../utils/formatCurrency';
import { mapTransaction } from '../utils/apiMappings';
import { Link } from 'react-router-dom';
import RevenueChart from '../components/charts/RevenueChart';
import QuickActions from '../components/cards/QuickActions';
import AuditCard from '../components/cards/AuditCard';

function apiError(err) {
  return err?.response?.data?.error || err?.message || 'Chargement impossible.';
}

export default function Dashboard() {
  const { showToast } = useOutletContext();
  const { currentCoop, coops, setCurrentCoop } = useAuth();

  const [stats, setStats] = useState(null);
  const [weekChart, setWeekChart] = useState([]);
  const [monthChart, setMonthChart] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

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
      showToast?.(apiError(err));
    } finally {
      setLoading(false);
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const balance = stats?.balance ?? 0;
  const growth = Number(stats?.growthRate ?? 0);
  const membersCount = stats?.membersCount ?? 0;
  const recentTx = transactions.slice(0, 5);

  const bc = stats?.blockchain;

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
    <div className="flex flex-col gap-5 lg:gap-6">
      {coops.length > 1 && (
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3 w-full">
          <span className="text-xs text-slate-500 font-semibold shrink-0">Coopérative :</span>
          <select
            className="input text-sm py-2 sm:py-1.5 w-full sm:min-w-[220px] sm:w-auto"
            value={currentCoop._id}
            onChange={(e) => setCurrentCoop(coops.find((c) => c._id === e.target.value))}
          >
            {coops.map((c) => (
              <option key={c._id} value={c._id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>
      )}

      {/* Rangée type CoopLedger : Trésorerie | Membres | Audit */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-5">
        <div className="card relative overflow-hidden border-slate-100 shadow-md">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Trésorerie</p>
              <p className="font-display text-3xl sm:text-4xl font-bold text-slate-900 tracking-tight">
                {stats ? formatCurrency(balance) : '—'}
              </p>
              <div
                className={`inline-flex items-center gap-1.5 mt-3 text-sm font-bold ${
                  growth >= 0 ? 'text-green-600' : 'text-red-600'
                }`}
              >
                {growth >= 0 ? <TrendingUp size={18} /> : <TrendingDown size={18} />}
                <span>
                  {growth >= 0 ? '+' : ''}
                  {growth.toFixed(1).replace(/\.0$/, '')}% <span className="font-semibold text-slate-500">vs mois préc.</span>
                </span>
              </div>
            </div>
            <div className="w-12 h-12 rounded-2xl bg-green-100 flex items-center justify-center shrink-0">
              <Wallet size={24} className="text-green-700" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-4 pt-4 border-t border-slate-100">
            {currentCoop.name} · {stats?.totalTransactions ?? 0} opérations enregistrées
          </p>
        </div>

        <div className="card flex flex-col justify-center border-slate-100 shadow-md min-h-[160px]">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2">Membres</p>
              <p className="font-display text-4xl sm:text-5xl font-bold text-slate-900">
                {stats ? membersCount : '—'}
              </p>
              <p className="text-xs text-slate-500 mt-2 font-medium">Membres actifs de la coopérative</p>
            </div>
            <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users size={28} className="text-blue-600" />
            </div>
          </div>
        </div>

        <div className="md:col-span-2 xl:col-span-1">
          <AuditCard
            dernierBloc={bc?.lastBlock ?? '—'}
            validateursLibelle={bc?.validators ?? '—'}
            consensus={bc?.consensus ?? bc?.status ?? '—'}
            onAction={(msg) => showToast?.(msg)}
          />
        </div>
      </div>

      {/* Graphique + actions */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-4 lg:gap-5 items-stretch">
        <div className="xl:col-span-8 min-h-0">
          <RevenueChart weekData={weekChart} monthData={monthChart} />
        </div>
        <div className="xl:col-span-4 min-h-0">
          <QuickActions />
        </div>
      </div>

      {/* Dernières transactions */}
      <div className="card border-slate-100 shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
          <h2 className="font-display font-bold text-slate-800 text-base">Dernières transactions</h2>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={fetchData}
              className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 hover:text-green-600 hover:bg-green-50 transition-all cursor-pointer"
              aria-label="Actualiser"
            >
              <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            </button>
            <Link to="/transactions" className="text-xs text-green-600 font-semibold hover:underline">
              Voir tout →
            </Link>
          </div>
        </div>

        {recentTx.length === 0 ? (
          <p className="text-sm text-slate-400 text-center py-10 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            Aucune transaction pour l’instant. Utilisez « Actions rapides » ou la page Transactions.
          </p>
        ) : (
          <div className="flex flex-col divide-y divide-slate-100">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between py-3.5 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                      tx.type === 'credit' ? 'bg-green-100' : 'bg-red-100'
                    }`}
                  >
                    {tx.type === 'credit' ? (
                      <TrendingUp size={18} className="text-green-600" />
                    ) : (
                      <TrendingDown size={18} className="text-red-500" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800 truncate">{tx.label}</p>
                    <p className="text-xs text-slate-400 font-mono truncate">{tx.hash}</p>
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p
                    className={`text-sm font-bold ${tx.type === 'credit' ? 'text-green-600' : 'text-red-500'}`}
                  >
                    {tx.type === 'credit' ? '+' : '-'}
                    {formatCurrency(tx.montant)}
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
