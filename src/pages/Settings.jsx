import { useOutletContext } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Building2 } from 'lucide-react';
import { getInitials } from '../utils/formatCurrency';

export default function Settings() {
  const { showToast } = useOutletContext();
  const { user, currentCoop, coops, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col gap-5 max-w-2xl">
      {/* Profile */}
      <div className="card flex items-center gap-5">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center text-white text-xl font-bold shrink-0">
          {getInitials(user?.name || 'AG')}
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-display font-bold text-slate-800 text-lg">{user?.name || '—'}</p>
          <p className="text-sm text-slate-500">{user?.email || '—'}</p>
          <span className="inline-block mt-1 text-xs font-bold bg-green-100 text-green-700 px-2.5 py-0.5 rounded-full">
            {user?.role || 'Membre'}
          </span>
        </div>
      </div>

      {/* Active Coop */}
      {currentCoop && (
        <div className="card">
          <div className="flex items-center gap-3 mb-3">
            <Building2 size={16} className="text-green-600" />
            <h3 className="font-bold text-slate-700 text-sm">Coopérative active</h3>
          </div>
          <div className="bg-green-50 border border-green-100 rounded-xl px-4 py-3">
            <p className="font-semibold text-slate-800">{currentCoop.name}</p>
            <p className="text-xs text-slate-500 font-mono mt-0.5">ID: {currentCoop._id}</p>
          </div>
          {coops.length > 1 && (
            <p className="text-xs text-slate-400 mt-2">{coops.length} coopératives au total</p>
          )}
        </div>
      )}

      {/* Info card */}
      <div className="card">
        <h3 className="font-bold text-slate-700 text-sm mb-4 flex items-center gap-2">
          <User size={15} className="text-green-600" /> Informations du compte
        </h3>
        <div className="flex flex-col gap-3">
          {[
            { label: 'Nom complet', value: user?.name },
            { label: 'Email', value: user?.email },
            { label: 'Rôle', value: user?.role || 'Membre' },
            { label: 'ID', value: user?._id, mono: true },
          ].map(({ label, value, mono }) => (
            <div key={label} className="flex items-center justify-between py-2 border-b border-slate-50 last:border-0">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">{label}</span>
              <span className={`text-sm font-medium text-slate-700 ${mono ? 'font-mono text-xs' : ''}`}>{value || '—'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center gap-2 w-full py-3 bg-red-50 hover:bg-red-100 text-red-600 font-bold rounded-xl border border-red-100 transition-all cursor-pointer"
      >
        <LogOut size={16} /> Se déconnecter
      </button>
    </div>
  );
}
