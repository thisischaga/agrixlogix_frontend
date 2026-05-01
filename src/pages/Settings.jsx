// src/pages/Settings.jsx
import { useOutletContext } from 'react-router-dom';
import { User, Shield, Bell, Palette, Save } from 'lucide-react';
import { currentUser } from '../data/mockData';
import { getInitials } from '../utils/formatCurrency';

export default function Settings() {
  const { showToast } = useOutletContext();

  return (
    <div className="flex flex-col gap-6 max-w-2xl">

      {/* Profil */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-green-100 rounded-xl flex items-center justify-center">
            <User size={16} className="text-green-600" />
          </div>
          <h2 className="font-display font-bold text-slate-800">Informations Personnelles</h2>
        </div>

        <div className="flex items-center gap-4 mb-6 p-4 bg-green-50 rounded-xl">
          <div className="w-14 h-14 bg-green-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
            {getInitials(currentUser.nom)}
          </div>
          <div>
            <p className="font-bold text-slate-800">{currentUser.nom}</p>
            <p className="text-sm text-slate-500">{currentUser.role} · {currentUser.cooperative}</p>
            <p className="text-xs text-slate-400 font-mono mt-1">{currentUser.wallet}</p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'Nom complet',      value: currentUser.nom },
            { label: 'Rôle',             value: currentUser.role },
            { label: 'Coopérative',      value: currentUser.cooperative },
            { label: 'Wallet Polygon',   value: currentUser.wallet },
          ].map(({ label, value }) => (
            <div key={label}>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">{label}</label>
              <input className="input" defaultValue={value} />
            </div>
          ))}
        </div>

        <button className="btn-primary mt-4" onClick={() => showToast('Profil mis à jour ✓')}>
          <Save size={14} /> Sauvegarder
        </button>
      </div>

      {/* Sécurité */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center">
            <Shield size={16} className="text-blue-600" />
          </div>
          <h2 className="font-display font-bold text-slate-800">Sécurité</h2>
        </div>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Authentification 2FA', desc: 'Activée via wallet Polygon', enabled: true },
            { label: 'Signature des transactions', desc: 'Clé privée ECDSA', enabled: true },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
              <div>
                <p className="text-sm font-semibold text-slate-800">{label}</p>
                <p className="text-xs text-slate-400">{desc}</p>
              </div>
              <span className={enabled ? 'badge-green' : 'badge-red'}>{enabled ? 'Actif' : 'Inactif'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Notifications */}
      <div className="card">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 bg-amber-100 rounded-xl flex items-center justify-center">
            <Bell size={16} className="text-amber-600" />
          </div>
          <h2 className="font-display font-bold text-slate-800">Notifications</h2>
        </div>
        <div className="flex flex-col gap-3">
          {[
            'Nouvelle transaction validée',
            'Vote ouvert sur une proposition',
            'Nouveau message sur le forum',
            'Rapport mensuel disponible',
          ].map((label) => (
            <div key={label} className="flex items-center justify-between">
              <p className="text-sm text-slate-700">{label}</p>
              <label className="relative inline-flex items-center cursor-pointer">
                <input type="checkbox" className="sr-only peer" defaultChecked />
                <div className="w-10 h-5 bg-slate-200 peer-checked:bg-green-600 rounded-full transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:w-4 after:h-4 after:bg-white after:rounded-full after:transition-transform peer-checked:after:translate-x-5" />
              </label>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
