import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useOutletContext } from 'react-router-dom';
import { Building2, MapPin, Users, Wallet, Plus, ArrowLeft } from 'lucide-react';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function AjoutCooperative() {
  const { showToast } = useOutletContext();
  const { loadCoops } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    location: '',
    description: '',
    walletAddress: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.name.trim() || !form.location.trim()) {
      setError('Le nom et la localisation sont obligatoires.');
      return;
    }
    setLoading(true);
    try {
      await client.post('/cooperatives', form);
      await loadCoops();
      showToast('Coopérative créée avec succès ✓');
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Erreur lors de la création.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto flex flex-col gap-5">
      <button
        onClick={() => navigate('/')}
        className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-green-600 bg-transparent border-none cursor-pointer w-fit transition-colors"
      >
        <ArrowLeft size={16} /> Retour au tableau de bord
      </button>

      <div className="card">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-green-100 rounded-xl flex items-center justify-center">
            <Building2 size={20} className="text-green-600" />
          </div>
          <div>
            <h2 className="font-display font-bold text-slate-800">Créer une Coopérative</h2>
            <p className="text-xs text-slate-400 mt-0.5">Remplissez les informations pour créer votre coopérative</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="bg-red-50 border border-red-100 text-red-600 text-sm p-3 rounded-xl">{error}</div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Building2 size={12} /> Nom de la coopérative *
            </label>
            <input
              name="name"
              className="input"
              placeholder="Ex: Coopérative Agricole de Lomé"
              value={form.name}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <MapPin size={12} /> Localisation *
            </label>
            <input
              name="location"
              className="input"
              placeholder="Ex: Lomé, Togo"
              value={form.location}
              onChange={handleChange}
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Users size={12} /> Description
            </label>
            <textarea
              name="description"
              className="input min-h-[90px] resize-none"
              placeholder="Décrivez les activités de votre coopérative..."
              value={form.description}
              onChange={handleChange}
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
              <Wallet size={12} /> Adresse Wallet (optionnel)
            </label>
            <input
              name="walletAddress"
              className="input font-mono text-xs"
              placeholder="0x..."
              value={form.walletAddress}
              onChange={handleChange}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary justify-center py-3 mt-2 disabled:opacity-60"
          >
            {loading
              ? <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              : <Plus size={16} />
            }
            {loading ? 'Création en cours…' : 'Créer la Coopérative'}
          </button>
        </form>
      </div>
    </div>
  );
}
