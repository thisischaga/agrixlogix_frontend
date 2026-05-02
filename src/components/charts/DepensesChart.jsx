// src/components/charts/DepensesChart.jsx
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatCurrency } from '../../utils/formatCurrency';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0];
  return (
    <div className="bg-white border border-slate-100 rounded-xl shadow-lg p-3 text-xs">
      <p className="font-bold text-slate-700">{d.name}</p>
      <p className="font-semibold text-green-600 mt-1">{formatCurrency(d.value)}</p>
    </div>
  );
};

export default function DepensesChart({ data = [] }) {
  return (
    <div className="card">
      <div className="mb-4">
        <h3 className="font-display font-bold text-slate-800 text-base">Dépenses par Catégorie</h3>
        <p className="text-xs text-slate-400 mt-0.5">Répartition du mois en cours</p>
      </div>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={55}
            outerRadius={85}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((entry, i) => (
              <Cell key={i} fill={entry.color || '#16a34a'} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
