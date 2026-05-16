import { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { 
  UserPlus, 
  Search, 
  UserCheck, 
  AlertCircle, 
  Share2, 
  ArrowLeft,
  User,
  Briefcase
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';
import { getInitials } from '../utils/formatCurrency';

const FORM_ROLES = ['Membre', 'Trésorier', 'Auditeur', 'Président'];

export default function AjoutMembre() {
  const { showToast } = useOutletContext();
  const navigate = useNavigate();
  const { currentCoop } = useAuth();

  const [form, setForm] = useState({ name: '', role: 'Membre' });
  const [checking, setChecking] = useState(false);
  const [result, setResult] = useState(null); // 'found', 'multiple', 'not_found', 'error'
  const [candidates, setCandidates] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [inviteUrl, setInviteUrl] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    if (form.name.trim().length < 2) return;

    setChecking(true);
    setResult(null);
    setCandidates([]);
    setErrorMsg('');

    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/member-candidates`, {
        params: { q: form.name.trim() }
      });
      const found = res.data || [];
      
      if (found.length === 1) {
        setResult('found');
        setSelectedUser(found[0]);
      } else if (found.length > 1) {
        setCandidates(found);
        setResult('multiple');
      } else {
        const inviteRes = await client.post(`/cooperatives/${currentCoop._id}/invite-link`);
        const baseUrl = window.location.origin;
        setInviteUrl(inviteRes.data?.webJoinUrl || `${baseUrl}/rejoindre?invite=${inviteRes.data?.inviteToken}`);
        setResult('not_found');
      }
    } catch (err) {
      setResult('error');
      setErrorMsg(err.response?.data?.error || "Erreur lors de la recherche");
    } finally {
      setChecking(false);
    }
  };

  const confirmAdd = async (u) => {
    const target = u || selectedUser;
    if (!target) return;
    try {
      await client.post(`/cooperatives/${currentCoop._id}/members`, { userId: target._id });
      if (form.role !== 'Membre') {
        await client.put(`/cooperatives/${currentCoop._id}/members/${target._id}/role`, { role: form.role });
      }
      showToast(`${target.name} ajouté avec succès !`);
      navigate('/membres');
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur d'ajout");
    }
  };

  return (
    <div className="max-w-2xl mx-auto space-y-8 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button 
          onClick={() => navigate('/membres')}
          className="flex items-center gap-2 text-slate-500 hover:text-slate-800 transition-colors bg-transparent border-none cursor-pointer"
        >
          <ArrowLeft size={20} />
          <span className="font-bold text-sm uppercase tracking-widest">Retour au registre</span>
        </button>
      </div>

      <div className="bg-white rounded-[32px] p-10 border border-slate-100 shadow-xl shadow-green-900/5">
        <div className="flex items-center gap-4 mb-10">
          <div className="w-14 h-14 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-green-600/30">
            <UserPlus size={28} />
          </div>
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-800">Ajouter un Membre</h1>
            <p className="text-slate-400 text-sm mt-1">Onboardez un nouveau membre dans {currentCoop?.name}</p>
          </div>
        </div>

        <AnimatePresence mode="wait">
          {!result ? (
            <motion.form 
              key="search"
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
              onSubmit={handleSearch} className="space-y-8"
            >
              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Rechercher par nom ou numéro</label>
                <div className="relative">
                  <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <input 
                    required
                    className="input pl-16 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-3xl text-lg shadow-sm"
                    placeholder="ex: Richard Hezou..."
                    value={form.name}
                    onChange={e => setForm({ ...form, name: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-4">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Rôle à attribuer</label>
                <div className="relative">
                  <Briefcase className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300" size={20} />
                  <select 
                    className="input pl-16 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-3xl text-lg appearance-none cursor-pointer shadow-sm"
                    value={form.role}
                    onChange={e => setForm({ ...form, role: e.target.value })}
                  >
                    {FORM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                  </select>
                </div>
              </div>

              <button 
                type="submit" disabled={checking}
                className="w-full btn-primary py-5 justify-center text-lg rounded-3xl shadow-2xl shadow-green-600/30 font-bold"
              >
                {checking ? 'Recherche en cours...' : 'Vérifier la disponibilité'}
              </button>
            </motion.form>
          ) : result === 'found' ? (
            <motion.div key="found" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="text-center space-y-8">
              <div className="w-24 h-24 bg-green-50 text-green-600 rounded-[32px] flex items-center justify-center mx-auto border-2 border-green-100">
                <UserCheck size={48} />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-slate-800">Utilisateur trouvé !</h2>
                <p className="text-slate-500 mt-2">
                  <strong>{selectedUser?.name}</strong> est déjà inscrit sur AgriLogix.<br/> 
                  Voulez-vous l'ajouter comme <strong>{form.role}</strong> ?
                </p>
              </div>
              <div className="flex gap-4">
                <button onClick={() => setResult(null)} className="flex-1 btn-outline py-4 rounded-2xl">Annuler</button>
                <button onClick={() => confirmAdd()} className="flex-1 btn-primary py-4 rounded-2xl shadow-xl shadow-green-600/20">Confirmer l'ajout</button>
              </div>
            </motion.div>
          ) : result === 'multiple' ? (
            <motion.div key="multiple" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
              <h3 className="font-bold text-slate-800 text-lg px-2">Plusieurs comptes trouvés :</h3>
              <div className="bg-slate-50 rounded-[32px] border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-inner">
                {candidates.map(c => (
                  <div key={c._id} className="p-6 flex items-center justify-between hover:bg-white transition-all group">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-white border border-slate-100 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:text-green-600 transition-colors">
                        {getInitials(c.name)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-800">{c.name}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{c.phone || 'Sans numéro'}</p>
                      </div>
                    </div>
                    <button onClick={() => confirmAdd(c)} className="px-5 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-600/10">
                      Ajouter
                    </button>
                  </div>
                ))}
              </div>
              <button onClick={() => setResult(null)} className="w-full text-xs text-slate-400 font-bold hover:text-slate-800 transition-colors uppercase tracking-widest">
                Aucun de ceux-là ? Affiner la recherche
              </button>
            </motion.div>
          ) : result === 'not_found' ? (
            <motion.div key="not_found" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
              <div className="p-8 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-5">
                <AlertCircle className="text-amber-500 shrink-0 mt-1" size={28} />
                <p className="text-sm text-amber-900 leading-relaxed">
                  <strong>{form.name}</strong> n'a pas encore de compte AgriLogix.<br/>
                  Générez un lien d'invitation pour qu'il puisse rejoindre votre coopérative en un clic.
                </p>
              </div>
              
              <div className="space-y-3">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Lien d'invitation unique</label>
                <div className="bg-slate-900 text-green-400 p-6 rounded-[24px] text-xs font-mono break-all leading-relaxed shadow-2xl border border-white/5">
                  {inviteUrl}
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <button 
                  onClick={() => { navigator.clipboard.writeText(inviteUrl); showToast('Lien copié !'); }}
                  className="w-full btn-primary py-5 justify-center gap-3 text-lg rounded-[24px] shadow-2xl shadow-green-600/20"
                >
                  <Share2 size={20} /> Copier et Partager
                </button>
                <button onClick={() => setResult(null)} className="w-full btn-outline py-4 rounded-[24px]">Recommencer</button>
              </div>
            </motion.div>
          ) : (
            <div className="text-center py-10 space-y-6">
              <div className="w-16 h-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
                <AlertCircle size={32} />
              </div>
              <p className="text-slate-600">{errorMsg}</p>
              <button onClick={() => setResult(null)} className="btn-outline px-8 py-3 rounded-xl mx-auto">Réessayer</button>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
