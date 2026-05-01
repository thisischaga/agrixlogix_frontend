// src/pages/Membres.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Search, Filter, Download, Plus, ExternalLink } from 'lucide-react';
import { membres } from '../data/mockData';
import { getInitials, formatDateShort } from '../utils/formatCurrency';

const ROLES = ['Tous', 'Président', 'Trésorier', 'Auditeur', 'Membre'];

export default function Membres() {
  const { showToast } = useOutletContext();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');

  const filtered = membres.filter((m) => {
    const matchSearch = m.nom.toLowerCase().includes(search.toLowerCase())
      || m.wallet.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === 'Tous' || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const roleClass = (role) => {
    if (role === 'Président' || role === 'Trésorier') return 'badge-blue';
    if (role === 'Auditeur') return 'badge-yellow';
    return 'badge-gray';
  };

  return (
    <div className="flex flex-col gap-5">

      {/* ── Stats rapides ── */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Membres', value: membres.length },
          { label: 'Actifs',        value: membres.filter(m => m.statut === 'Actif').length },
          { label: 'En retard',     value: membres.filter(m => m.cotisation === 'En retard').length },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="font-display text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {/* ── Table ── */}
      <div className="card">
        {/* Toolbar */}
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Rechercher un membre..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative">
            <Filter size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <select
              className="input pl-8 pr-4 cursor-pointer appearance-none min-w-[140px]"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              {ROLES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>
          <button className="btn-outline" onClick={() => showToast('Export CSV membres téléchargé')}>
            <Download size={14} /> Exporter
          </button>
          <button className="btn-primary" onClick={() => showToast('Formulaire ajout de membre ouvert')}>
            <Plus size={14} /> Ajouter
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Membre', 'Rôle', 'Wallet', 'Membre depuis', 'Statut', 'Cotisation', ''].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((m) => (
                <tr key={m.id} className="border-b border-slate-50 hover:bg-green-50/40 transition-colors">
                  {/* Avatar + nom */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                        {getInitials(m.nom)}
                      </div>
                      <p className="font-semibold text-slate-800">{m.nom}</p>
                    </div>
                  </td>
                  {/* Rôle */}
                  <td className="px-4 py-3.5">
                    <span className={roleClass(m.role)}>{m.role}</span>
                  </td>
                  {/* Wallet */}
                  <td className="px-4 py-3.5 text-xs text-slate-400 font-mono">{m.wallet}</td>
                  {/* Date */}
                  <td className="px-4 py-3.5 text-xs text-slate-500">{formatDateShort(m.joined)}</td>
                  {/* Statut */}
                  <td className="px-4 py-3.5">
                    <div className="flex items-center gap-1.5 text-xs font-semibold">
                      <span className={`w-2 h-2 rounded-full ${m.statut === 'Actif' ? 'bg-green-500' : 'bg-slate-400'}`} />
                      <span className={m.statut === 'Actif' ? 'text-slate-700' : 'text-slate-400'}>{m.statut}</span>
                    </div>
                  </td>
                  {/* Cotisation */}
                  <td className="px-4 py-3.5">
                    <span className={m.cotisation === 'À jour' ? 'badge-green' : 'badge-red'}>
                      {m.cotisation}
                    </span>
                  </td>
                  {/* Action */}
                  <td className="px-4 py-3.5">
                    <button
                      className="p-1.5 rounded-lg hover:bg-green-100 text-slate-400 hover:text-green-600 transition-colors border-none bg-transparent cursor-pointer"
                      onClick={() => showToast(`Profil de ${m.nom} ouvert`)}
                    >
                      <ExternalLink size={14} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
