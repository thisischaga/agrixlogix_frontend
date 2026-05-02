// src/components/charts/RevenueChart.jsx — données réelles depuis /revenue-expenses
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-2">{label}</p>
      {payload.map((p) => (
        <p key={p.name} style={{ color: p.color }} className="font-semibold">
          {p.name} : {new Intl.NumberFormat('fr-FR').format(p.value)} FCFA
        </p>
      ))}
    </div>
  );
};

/**
 * @param {{ weekData?: Array<{ jour: string; revenus: number; depenses: number }>, monthData?: typeof weekData }} props
 */
export default function RevenueChart({ weekData = [], monthData = [] }) {
  const [period, setPeriod] = useState('semaine');
  const data = period === 'semaine' ? weekData : monthData;

  return (
    <div className="card h-full flex flex-col">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Revenus vs dépenses</h3>
          <p className="text-xs text-slate-400 mt-0.5">Performance hebdomadaire ou mensuelle de la coopérative</p>
        </div>
        <div className="flex gap-1.5 shrink-0">
          {[
            { key: 'semaine', label: 'Semaine' },
            { key: 'mois', label: 'Mois' },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setPeriod(key)}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border-none cursor-pointer ${
                period === key
                  ? 'bg-green-600 text-white shadow-md shadow-green-900/15'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1 min-h-[220px]">
        {!data?.length ? (
          <div className="h-full flex items-center justify-center text-sm text-slate-400 rounded-xl bg-slate-50 border border-dashed border-slate-200">
            Aucune donnée pour cette période.
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data} margin={{ top: 8, right: 8, left: -10, bottom: 0 }}>
              <XAxis
                dataKey="jour"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={{ stroke: '#e2e8f0' }}
                tickLine={false}
              />
              <YAxis hide />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(16, 185, 129, 0.06)' }} />
              <Bar dataKey="revenus" fill="#15803d" radius={[8, 8, 0, 0]} name="Revenus" maxBarSize={28} />
              <Bar dataKey="depenses" fill="#bbf7d0" radius={[8, 8, 0, 0]} name="Dépenses" maxBarSize={28} />
              <Legend
                verticalAlign="top"
                align="right"
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingBottom: 8 }}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
