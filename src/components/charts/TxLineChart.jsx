// src/components/charts/TxLineChart.jsx
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { transactionsParMois } from '../../data/mockData';

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700 mb-1">{label}</p>
      <p className="text-green-600 font-semibold">{payload[0].value} transactions</p>
    </div>
  );
};

export default function TxLineChart() {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-display font-bold text-slate-800 text-base">Transactions par Mois</h3>
        <p className="text-xs text-slate-400 mt-0.5">Volume mensuel sur l'année en cours</p>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={transactionsParMois}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
          <XAxis
            dataKey="mois"
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type="monotone"
            dataKey="transactions"
            stroke="#16a34a"
            strokeWidth={2.5}
            dot={{ fill: '#16a34a', r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
