import { useState, useEffect, useCallback, useMemo } from 'react';
import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';
import {
  TrendingUp, TrendingDown, Wallet, PiggyBank, RefreshCw,
  Download, BookOpen, BarChart3, Tag, Zap, Calendar, Hash
} from 'lucide-react';
import { motion } from 'framer-motion';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

// ── Helpers ─────────────────────────────────────────────────────
function fmt(n) {
  if (n == null) return '—';
  return Number(n).toLocaleString('fr-FR') + ' FCFA';
}
function fmtShort(n) {
  if (n == null || n === 0) return '0';
  if (Math.abs(n) >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (Math.abs(n) >= 1_000) return (n / 1_000).toFixed(0) + 'k';
  return String(n);
}
function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
}

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-2xl shadow-xl p-4 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-semibold">
          {p.name}: {fmtShort(p.value)} FCFA
        </p>
      ))}
    </div>
  );
};

// ── Composant KPI Card ───────────────────────────────────────────
function KpiCard({ label, value, sub, icon: Icon, gradient, trend }) {
  return (
    <motion.div whileHover={{ y: -3 }} className={`rounded-[24px] p-6 text-white shadow-xl ${gradient} relative overflow-hidden`}>
      <div className="absolute -right-4 -bottom-4 opacity-10">
        <Icon size={80} />
      </div>
      <div className="flex items-start justify-between mb-4">
        <div className="w-11 h-11 rounded-2xl bg-white/20 flex items-center justify-center">
          <Icon size={22} />
        </div>
        {trend != null && (
          <span className={`text-[10px] font-bold px-2 py-1 rounded-lg ${trend >= 0 ? 'bg-white/20' : 'bg-red-500/30'}`}>
            {trend >= 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <p className="text-[10px] font-bold uppercase tracking-widest opacity-70 mb-1">{label}</p>
      <p className="font-display font-bold text-2xl leading-tight">{value}</p>
      {sub && <p className="text-[11px] opacity-70 mt-1">{sub}</p>}
    </motion.div>
  );
}

// ── Page principale ──────────────────────────────────────────────
export default function Comptabilite() {
  const { showToast } = useOutletContext();
  const { currentCoop } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [onglet, setOnglet] = useState('bilan'); // bilan | categories | mensuel | journal

  const load = useCallback(async () => {
    if (!currentCoop?._id) return;
    setLoading(true);
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/comptabilite`);
      setData(res.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => { load(); }, [load]);

  // Calcul des soldes cumulés dans le journal
  const journalAvecSoldes = useMemo(() => {
    if (!data?.journal) return [];
    let solde = data.bilan?.solde ?? 0;
    // On remonte dans le temps : le premier élément est le plus récent
    return data.journal.map((e) => {
      const s = solde;
      solde -= e.credit;
      solde += e.debit;
      return { ...e, soldeApres: s };
    });
  }, [data]);

  // Export CSV journal
  const exportCSV = () => {
    if (!data?.journal) return;
    const header = ['Date','Libellé','Catégorie','Source','Débit','Crédit','Solde après','Statut','Hash'];
    const rows = journalAvecSoldes.map(e => [
      fmtDate(e.date), e.libelle, e.categorie, e.source,
      e.debit || '', e.credit || '', e.soldeApres,
      e.statut, e.txHash || ''
    ]);
    const csv = [header, ...rows].map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url;
    a.download = `journal-${currentCoop?.name?.replace(/\s/g,'_')}-${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    showToast?.('Journal CSV téléchargé ✓');
  };

  if (!currentCoop) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-slate-800">Comptabilité</h2>
        <p className="text-sm text-slate-500 mt-2">Sélectionnez une coopérative pour accéder à la comptabilité.</p>
      </div>
    );
  }

  const ONGLETS = [
    { id: 'bilan',      label: 'Bilan',      icon: Wallet },
    { id: 'categories', label: 'Catégories', icon: Tag },
    { id: 'mensuel',    label: 'Évolution',  icon: BarChart3 },
    { id: 'journal',    label: 'Journal',    icon: BookOpen },
  ];

  return (
    <div className="flex flex-col gap-6 pb-10">

      {/* ── Header ── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display font-bold text-2xl text-slate-800">Comptabilité</h1>
          <p className="text-xs text-slate-400 mt-0.5">{currentCoop.name}</p>
        </div>
        <div className="flex gap-2">
          <button onClick={exportCSV} className="btn-outline py-2 px-4 text-xs gap-2">
            <Download size={14} /> Exporter CSV
          </button>
          <button onClick={load} className="btn-primary py-2 px-4 text-xs gap-2" disabled={loading}>
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Actualiser
          </button>
        </div>
      </div>

      {/* ── KPI Cards ── */}
      {loading ? (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1,2,3,4].map(i => <div key={i} className="h-36 rounded-[24px] bg-slate-100 animate-pulse" />)}
        </div>
      ) : data && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Solde total"
            value={fmtShort(data.bilan.solde)}
            sub={fmt(data.bilan.solde)}
            icon={Wallet}
            gradient="bg-gradient-to-br from-violet-600 to-indigo-700"
          />
          <KpiCard
            label="Total entrées"
            value={fmtShort(data.bilan.totalEntrees)}
            sub={fmt(data.bilan.totalEntrees)}
            icon={TrendingUp}
            gradient="bg-gradient-to-br from-emerald-500 to-green-700"
          />
          <KpiCard
            label="Total sorties"
            value={fmtShort(data.bilan.totalSorties)}
            sub={fmt(data.bilan.totalSorties)}
            icon={TrendingDown}
            gradient="bg-gradient-to-br from-red-500 to-rose-700"
          />
          <KpiCard
            label="Taux d'épargne"
            value={`${data.bilan.tauxEpargne}%`}
            sub={`${data.bilan.nbTransactions} opérations`}
            icon={PiggyBank}
            gradient="bg-gradient-to-br from-amber-500 to-orange-600"
          />
        </div>
      )}

      {/* ── Mois courant ── */}
      {data && !loading && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { label: 'Entrées ce mois', val: data.moisCourant.entrees, color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Sorties ce mois', val: data.moisCourant.sorties, color: 'text-red-500',   bg: 'bg-red-50' },
            { label: 'Net ce mois',     val: data.moisCourant.solde,   color: data.moisCourant.solde >= 0 ? 'text-violet-600' : 'text-red-600', bg: 'bg-violet-50' },
          ].map(({ label, val, color, bg }) => (
            <div key={label} className={`${bg} rounded-2xl p-4 sm:p-5 flex flex-col gap-1 shadow-sm`}>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">{label}</p>
              <div className="flex items-baseline gap-2">
                <p className={`font-display font-bold text-xl ${color}`}>{fmtShort(val)}</p>
                <p className="text-[10px] text-slate-400 font-medium">{fmt(val)}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ── Onglets ── */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-2xl w-fit max-w-full overflow-x-auto no-scrollbar">
        {ONGLETS.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setOnglet(id)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-[11px] sm:text-xs font-bold transition-all whitespace-nowrap ${
              onglet === id ? 'bg-white text-violet-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
            }`}
          >
            <Icon size={14} />{label}
          </button>
        ))}
      </div>

      {/* ── Contenu onglets ── */}
      {loading && <div className="h-64 rounded-2xl bg-slate-100 animate-pulse" />}

      {/* BILAN */}
      {!loading && onglet === 'bilan' && data && (
        <div className="card">
          <h2 className="font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Wallet size={18} className="text-violet-600" /> Bilan de trésorerie
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="text-left py-3">Poste</th>
                  <th className="text-right py-3">Montant</th>
                  <th className="text-right py-3">% du total entrées</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                <tr className="hover:bg-green-50/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-green-500" /> Total entrées (recettes)
                  </td>
                  <td className="py-4 text-right font-bold text-green-600">{fmt(data.bilan.totalEntrees)}</td>
                  <td className="py-4 text-right text-slate-400">100%</td>
                </tr>
                <tr className="hover:bg-red-50/30 transition-colors">
                  <td className="py-4 font-semibold text-slate-700 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-red-500" /> Total sorties (dépenses)
                  </td>
                  <td className="py-4 text-right font-bold text-red-500">{fmt(data.bilan.totalSorties)}</td>
                  <td className="py-4 text-right text-slate-400">
                    {data.bilan.totalEntrees > 0 ? ((data.bilan.totalSorties / data.bilan.totalEntrees) * 100).toFixed(1) : 0}%
                  </td>
                </tr>
                <tr className="bg-violet-50 rounded-xl">
                  <td className="py-4 font-bold text-violet-800 flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-violet-600" /> Solde net (résultat)
                  </td>
                  <td className={`py-4 text-right font-bold text-xl ${data.bilan.solde >= 0 ? 'text-violet-700' : 'text-red-600'}`}>
                    {data.bilan.solde >= 0 ? '+' : ''}{fmt(data.bilan.solde)}
                  </td>
                  <td className="py-4 text-right font-bold text-violet-600">{data.bilan.tauxEpargne}%</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CATÉGORIES */}
      {!loading && onglet === 'categories' && data && (
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          <div className="card">
            <h2 className="font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Tag size={18} className="text-violet-600" /> Répartition par catégorie
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                    <th className="text-left py-3">Catégorie</th>
                    <th className="text-right py-3">Entrées</th>
                    <th className="text-right py-3">Sorties</th>
                    <th className="text-right py-3">Solde</th>
                    <th className="text-right py-3">Ops</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {data.categories.map((cat) => (
                    <tr key={cat.nom} className="hover:bg-slate-50/50 transition-colors">
                      <td className="py-3">
                        <span className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: cat.color }} />
                          <span className="font-semibold text-slate-700">{cat.nom}</span>
                        </span>
                      </td>
                      <td className="py-3 text-right font-semibold text-green-600 text-xs">{fmtShort(cat.entrees)}</td>
                      <td className="py-3 text-right font-semibold text-red-500 text-xs">{fmtShort(cat.sorties)}</td>
                      <td className={`py-3 text-right font-bold text-xs ${cat.solde >= 0 ? 'text-violet-600' : 'text-red-600'}`}>
                        {cat.solde >= 0 ? '+' : ''}{fmtShort(cat.solde)}
                      </td>
                      <td className="py-3 text-right text-slate-400 text-xs">{cat.nb}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="card !p-3 sm:!p-6 w-full overflow-hidden">
            <h2 className="font-display font-bold text-slate-800 mb-4 flex items-center gap-2">
              <BarChart3 size={18} className="text-violet-600" /> Camembert catégories
            </h2>
            <div className="flex-1 min-h-[260px]">
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={data.categories.map(c => ({ name: c.nom, value: c.entrees + c.sorties, color: c.color }))}
                    cx="50%" cy="50%" innerRadius={60} outerRadius={100}
                    dataKey="value" nameKey="name"
                  >
                    {data.categories.map((c) => <Cell key={c.nom} fill={c.color} />)}
                  </Pie>
                  <Tooltip formatter={(v) => fmtShort(v) + ' FCFA'} />
                  <Legend formatter={(v) => <span className="text-xs font-semibold text-slate-600">{v}</span>} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}

      {/* ÉVOLUTION MENSUELLE */}
      {!loading && onglet === 'mensuel' && data && (
        <div className="card">
          <h2 className="font-display font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Calendar size={18} className="text-violet-600" /> Évolution sur 12 mois
          </h2>
          <ResponsiveContainer width="100%" height={340}>
            <BarChart data={data.mensuel} barSize={12} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="mois" tick={{ fontSize: 11, fill: '#94a3b8', fontWeight: 600 }} />
              <YAxis tickFormatter={fmtShort} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip content={<CustomTooltip />} />
              <Legend formatter={(v) => <span className="text-xs font-semibold text-slate-500 capitalize">{v}</span>} />
              <Bar dataKey="entrees" name="Entrées"  fill="#10b981" radius={[4,4,0,0]} />
              <Bar dataKey="sorties" name="Sorties"  fill="#f43f5e" radius={[4,4,0,0]} />
              <Bar dataKey="solde"   name="Solde"    fill="#7c3aed" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* JOURNAL COMPTABLE */}
      {!loading && onglet === 'journal' && (
        <div className="card">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-slate-800 flex items-center gap-2">
              <BookOpen size={18} className="text-violet-600" /> Journal comptable
              <span className="text-xs font-normal text-slate-400 ml-1">(50 dernières écritures)</span>
            </h2>
            <button onClick={exportCSV} className="btn-outline py-1.5 px-3 text-xs gap-1.5">
              <Download size={12} /> CSV
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-[10px] font-bold uppercase tracking-widest text-slate-400 border-b border-slate-100">
                  <th className="text-left py-3 pr-4">Date</th>
                  <th className="text-left py-3 pr-4">Libellé</th>
                  <th className="text-left py-3 pr-4">Catégorie</th>
                  <th className="text-left py-3 pr-4">Source</th>
                  <th className="text-right py-3 pr-4">Débit</th>
                  <th className="text-right py-3 pr-4">Crédit</th>
                  <th className="text-right py-3 pr-4">Solde après</th>
                  <th className="text-right py-3">N° Pièce (Hash)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {journalAvecSoldes.map((e) => (
                  <tr key={String(e.id)} className="hover:bg-slate-50/60 transition-colors group">
                    <td className="py-3 pr-4 text-slate-400 whitespace-nowrap">{fmtDate(e.date)}</td>
                    <td className="py-3 pr-4 font-semibold text-slate-700 max-w-[180px] truncate">
                      <span title={e.libelle}>{e.libelle}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className="px-2 py-0.5 rounded-lg bg-slate-100 text-slate-600 font-semibold text-[10px]">
                        {e.categorie}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      {e.fedapayId ? (
                        <span className="flex items-center gap-1 text-violet-600 font-bold">
                          <Zap size={11} /> FedaPay
                        </span>
                      ) : (
                        <span className="text-slate-400">{e.source}</span>
                      )}
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-red-500">
                      {e.debit > 0 ? fmtShort(e.debit) : <span className="text-slate-200">—</span>}
                    </td>
                    <td className="py-3 pr-4 text-right font-bold text-green-600">
                      {e.credit > 0 ? fmtShort(e.credit) : <span className="text-slate-200">—</span>}
                    </td>
                    <td className={`py-3 pr-4 text-right font-bold ${e.soldeApres >= 0 ? 'text-violet-700' : 'text-red-600'}`}>
                      {fmtShort(e.soldeApres)}
                    </td>
                    <td className="py-3 text-right">
                      {e.txHash ? (
                        <div className="flex items-center justify-end gap-1 font-mono text-[9px] text-slate-300 group-hover:text-violet-500 transition-colors">
                          <Hash size={10} />
                          <span>{e.txHash.substring(0, 10)}...</span>
                        </div>
                      ) : (
                        <span className="text-slate-200">En attente</span>
                      )}
                    </td>
                  </tr>
                ))}
                {journalAvecSoldes.length === 0 && (
                  <tr><td colSpan={7} className="py-12 text-center text-slate-400 italic">Aucune écriture dans le journal</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

    </div>
  );
}
