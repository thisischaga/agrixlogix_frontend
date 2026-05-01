// src/pages/Dashboard.jsx
import { useOutletContext } from 'react-router-dom';
import { Wallet, TrendingUp, TrendingDown, Hash, Users } from 'lucide-react';

import StatCard    from '../components/cards/StatCard';
import AuditCard   from '../components/cards/AuditCard';
import QuickActions from '../components/cards/QuickActions';
import RevenueChart from '../components/charts/RevenueChart';
import DepensesChart from '../components/charts/DepensesChart';
import TxLineChart  from '../components/charts/TxLineChart';
import TransactionsTable from '../components/tables/TransactionsTable';

import { dashboardStats, transactions } from '../data/mockData';
import { formatCurrency } from '../utils/formatCurrency';

export default function Dashboard() {
  const { showToast } = useOutletContext();
  const derniersTx = transactions.slice(0, 5);

  return (
    <div className="flex flex-col gap-6">

      {/* ── Trésorerie principale ── */}
      <div className="card bg-gradient-to-br from-green-700 to-green-900 border-0 text-white">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-green-300 text-xs font-bold uppercase tracking-wider mb-2">Trésorerie</p>
            <p className="font-display text-3xl font-bold">{formatCurrency(dashboardStats.tresorerie)}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="flex items-center gap-1 text-xs bg-white/20 px-2.5 py-1 rounded-full font-semibold">
                <TrendingUp size={12} /> +{dashboardStats.variation}%
              </span>
              <span className="text-green-300 text-xs">vs mois dernier</span>
            </div>
          </div>
          <div className="w-12 h-12 bg-white/15 rounded-2xl flex items-center justify-center">
            <Wallet size={24} className="text-white" />
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 pt-4 border-t border-white/15 text-xs text-green-300 font-medium">
          <span className="w-2 h-2 bg-green-400 rounded-full" />
          Vérifié via Smart Contract Polygon
        </div>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Membres"
          value={dashboardStats.membres}
          variation="+12 ce mois"
          positive={true}
          icon={<Users size={16} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          label="Entrées"
          value={formatCurrency(dashboardStats.entrees)}
          variation="+8,3%"
          positive={true}
          icon={<TrendingUp size={16} className="text-green-600" />}
          iconBg="bg-green-100"
        />
        <StatCard
          label="Sorties"
          value={formatCurrency(dashboardStats.sorties)}
          variation="-2,1%"
          positive={false}
          icon={<TrendingDown size={16} className="text-red-500" />}
          iconBg="bg-red-100"
        />
        <StatCard
          label="Total Transactions"
          value={dashboardStats.totalTransactions.toLocaleString('fr-FR')}
          variation="+940 ce mois"
          positive={true}
          icon={<Hash size={16} className="text-blue-500" />}
          iconBg="bg-blue-100"
        />
      </div>

      {/* ── Charts row 1 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2">
          <RevenueChart />
        </div>
        <div className="flex flex-col gap-4">
          <AuditCard onAction={showToast} />
          <QuickActions onAction={showToast} />
        </div>
      </div>

      {/* ── Charts row 2 ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <DepensesChart />
        <TxLineChart />
      </div>

      {/* ── Dernières transactions ── */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display font-bold text-slate-800 text-base">Dernières Transactions</h2>
          <button
            className="text-xs text-green-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
            onClick={() => showToast('Accès à la page Transactions')}
          >
            Voir tout →
          </button>
        </div>
        <TransactionsTable
          data={derniersTx}
          onView={(tx) => showToast(`Transaction ${tx.hash} vue sur la blockchain`)}
        />
      </div>
    </div>
  );
}
