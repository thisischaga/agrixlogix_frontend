// src/components/charts/RevenueChart.jsx
import { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { revenueWeek, revenueMonth } from '../../data/mockData';

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

export default function RevenueChart() {
  const [period, setPeriod] = useState('semaine');
  const data = period === 'semaine' ? revenueWeek : revenueMonth;

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="font-display font-bold text-slate-800 text-base">Revenus vs Dépenses</h3>
          <p className="text-xs text-slate-400 mt-0.5">Performance de la coopérative</p>
        </div>
        <div className="flex gap-1.5">
          {['semaine', 'mois'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 border-none cursor-pointer ${
                period === p
                  ? 'bg-green-600 text-white'
                  : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
              }`}
            >
              {p.charAt(0).toUpperCase() + p.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={20} barGap={4}>
          <XAxis
            dataKey="jour"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis hide />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="revenus"  fill="#16a34a" radius={[6, 6, 0, 0]} name="Revenus"   />
          <Bar dataKey="depenses" fill="#bbf7d0" radius={[6, 6, 0, 0]} name="Dépenses"  />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
