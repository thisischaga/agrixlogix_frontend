import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Download,
  UserX,
  UserCheck,
  Clock,
  Link2,
  Copy,
  RefreshCw,
  UserPlus,
  ShieldCheck,
  X,
  User,
  Briefcase,
  AlertCircle,
  Share2,
  ChevronRight,
  UserSearch
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials, formatDateShort } from '../utils/formatCurrency';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Tous', 'Président', 'Trésorier', 'Auditeur', 'Membre'];
const FORM_ROLES = ['Membre', 'Trésorier', 'Auditeur', 'Président'];

const ROLE_COLORS = {
  'Président': 'bg-purple-100 text-purple-700',
  'Trésorier': 'bg-blue-100 text-blue-700',
  'Auditeur': 'bg-amber-100 text-amber-700',
  'Admin': 'bg-red-100 text-red-700',
  'Membre': 'bg-emerald-50 text-emerald-700',
};

export default function Membres() {
  const { showToast } = useOutletContext();
  const { user, currentCoop } = useAuth();

  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Smart Addition States
  const [showAddModal, setShowAddModal] = useState(false);
  const [smartForm, setSmartForm] = useState({ name: '', role: 'Membre' });
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null); // 'found', 'not_found', 'multiple', 'error'
  const [inviteUrl, setInviteUrl] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);

  const canManage = useMemo(() => {
    if (!user || !currentCoop) return false;
    const aid = currentCoop.adminId?._id ?? currentCoop.adminId;
    return String(aid) === String(user._id) || user.role === 'Admin' || user.role === 'Président';
  }, [user, currentCoop]);

  const loadData = useCallback(async () => {
    if (!currentCoop?._id) return;
    setLoading(true);
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}`);
      setMembers(res.data?.members || []);
      setPending(res.data?.pendingMembers || []);
    } catch { showToast('Erreur de chargement'); }
    finally { setLoading(false); }
  }, [currentCoop?._id, showToast]);

  useEffect(() => { loadData(); }, [loadData]);

  // SMART ADDITION LOGIC
  const handleSmartCheck = async (e) => {
    e.preventDefault();
    const query = smartForm.name.trim();
    if (query.length < 2) return;
    
    setChecking(true);
    setCheckResult(null);
    setCandidates([]);
    setInviteUrl('');

    try {
      // 1. Search for candidates
      const res = await client.get(`/cooperatives/${currentCoop._id}/member-candidates`, {
        params: { q: query }
      });
      
      const found = res.data || [];
      
      // Look for an exact match first
      const exactMatch = found.find(c => c.name.toLowerCase() === query.toLowerCase());

      if (exactMatch) {
        setCheckResult('found');
        setSelectedUser(exactMatch);
      } else if (found.length > 0) {
        // If not exact match but some results found, show them
        setCandidates(found);
        setCheckResult('multiple');
      } else {
        // 2. If truly not found, generate invite link
        const inviteRes = await client.post(`/cooperatives/${currentCoop._id}/invite-link`);
        setInviteUrl(inviteRes.data?.webJoinUrl || '');
        setCheckResult('not_found');
      }
    } catch (err) {
      console.error('Check error', err);
      setCheckResult('error');
    } finally {
      setChecking(false);
    }
  };

  const confirmAdd = async (u) => {
    const target = u || selectedUser;
    if (!target) return;
    try {
      await client.post(`/cooperatives/${currentCoop._id}/members`, { userId: target._id });
      if (smartForm.role !== 'Membre') {
        await client.put(`/cooperatives/${currentCoop._id}/members/${target._id}/role`, { role: smartForm.role });
      }
      showToast(`${target.name} ajouté avec succès ✓`);
      resetModal();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur lors de l'ajout");
    }
  };

  const resetModal = () => {
    setShowAddModal(false);
    setSmartForm({ name: '', role: 'Membre' });
    setCheckResult(null);
    setCandidates([]);
    setSelectedUser(null);
    setInviteUrl('');
  };

  const handleUpdateRole = async (userId, newRole) => {
    try {
      await client.put(`/cooperatives/${currentCoop._id}/members/${userId}/role`, { role: newRole });
      showToast(`Rôle mis à jour ✓`);
      loadData();
    } catch { showToast('Erreur'); }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Retirer ce membre ?')) return;
    try {
      await client.delete(`/cooperatives/${currentCoop._id}/members/${userId}`);
      showToast('Membre retiré');
      loadData();
    } catch { showToast('Action impossible'); }
  };

  const filtered = useMemo(() => {
    return members.filter(m => {
      const q = search.toLowerCase();
      return (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
    });
  }, [members, search]);

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="font-display font-bold text-slate-800 text-2xl tracking-tight">Membres</h1>
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">
            Gestion des effectifs • {members.length} membres
          </p>
        </div>
        {canManage && (
          <motion.button 
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => setShowAddModal(true)} 
            className="btn-primary shadow-xl shadow-green-600/20 py-3 px-6 rounded-2xl flex items-center gap-2"
          >
            <UserPlus size={18} /> 
            <span>Ajouter un membre</span>
          </motion.button>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-8 space-y-6">
          {/* Pending Alerts */}
          <AnimatePresence>
            {canManage && pending.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="card bg-amber-50 border-amber-200 p-4"
              >
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="text-amber-500" size={18} />
                  <h3 className="font-bold text-amber-900 text-xs uppercase tracking-wider">Demandes en attente ({pending.length})</h3>
                </div>
                <div className="flex flex-wrap gap-2">
                  {pending.map(m => (
                    <div key={m._id} className="bg-white rounded-xl px-3 py-2 border border-amber-100 flex items-center gap-4 shadow-sm">
                      <span className="text-xs font-bold text-slate-700">{m.name}</span>
                      <div className="flex gap-1 border-l border-slate-100 pl-2">
                        <button onClick={() => client.post(`/cooperatives/${currentCoop._id}/approve`, { userId: m._id }).then(loadData)} className="p-1 text-green-600 hover:bg-green-50 rounded">
                          <UserCheck size={14} />
                        </button>
                        <button onClick={() => client.post(`/cooperatives/${currentCoop._id}/reject`, { userId: m._id }).then(loadData)} className="p-1 text-red-400 hover:bg-red-50 rounded">
                          <UserX size={14} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* List Card */}
          <div className="card bg-white p-0 shadow-sm border-slate-100 overflow-hidden">
            <div className="p-5 border-b border-slate-50 flex items-center gap-4">
              <div className="relative flex-1">
                <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" />
                <input 
                  className="input pl-11 bg-slate-50 border-transparent focus:bg-white focus:border-green-500"
                  placeholder="Rechercher..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-widest border-b border-slate-100">
                  <tr>
                    <th className="text-left py-4 px-6">Nom</th>
                    <th className="text-left py-4 px-6">Poste</th>
                    <th className="text-right py-4 px-6">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {loading ? (
                    <tr><td colSpan="3" className="py-12 text-center text-slate-300">Chargement...</td></tr>
                  ) : filtered.length === 0 ? (
                    <tr><td colSpan="3" className="py-12 text-center text-slate-300">Aucun membre</td></tr>
                  ) : (
                    filtered.map(m => (
                      <tr key={m._id} className="group hover:bg-slate-50/50 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-green-50 text-green-700 rounded-xl flex items-center justify-center font-bold text-xs uppercase">
                              {getInitials(m.name)}
                            </div>
                            <div>
                              <p className="font-bold text-slate-800 leading-none">{m.name}</p>
                              <p className="text-[10px] text-slate-400 mt-1">{m.phone || '—'}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-0.5 rounded-lg text-[10px] font-bold uppercase tracking-wider ${ROLE_COLORS[m.role] || 'bg-slate-100 text-slate-500'}`}>
                              {m.role || 'Membre'}
                            </span>
                            {canManage && m._id !== user._id && (
                              <select 
                                className="opacity-0 group-hover:opacity-100 text-[10px] bg-white border border-slate-200 rounded p-0.5 cursor-pointer"
                                value={m.role || 'Membre'}
                                onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                              >
                                {FORM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                              </select>
                            )}
                          </div>
                        </td>
                        <td className="py-4 px-6 text-right">
                          {m._id !== user._id && canManage ? (
                            <button onClick={() => handleRemove(m._id)} className="p-2 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-xl">
                              <UserX size={18} />
                            </button>
                          ) : m._id === user._id ? (
                            <span className="text-[9px] font-bold text-green-600 bg-green-50 px-2 py-1 rounded-full border border-green-100">Moi</span>
                          ) : null}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="lg:col-span-4 space-y-6">
          <div className="card bg-green-900 text-white border-none p-6 shadow-xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <Download size={20} className="text-green-400" /> Documents
            </h3>
            <p className="text-xs text-green-100/60 leading-relaxed mb-6">
              Téléchargez le registre officiel des membres pour vos archives.
            </p>
            <button className="w-full bg-white text-green-900 font-bold py-3 rounded-xl hover:bg-green-50 transition-all border-none">
              Exporter (PDF)
            </button>
          </div>
        </div>
      </div>

      {/* POP-UP Modal */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={resetModal}
              className="absolute inset-0 bg-slate-900/70 backdrop-blur-sm"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="relative bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-green-600 text-white rounded-xl flex items-center justify-center shadow-lg shadow-green-600/20">
                    <UserPlus size={20} />
                  </div>
                  <h3 className="font-display font-bold text-xl text-slate-800">Ajouter un membre</h3>
                </div>
                <button onClick={resetModal} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors bg-transparent border-none cursor-pointer">
                  <X size={20} />
                </button>
              </div>

              <div className="p-8">
                <AnimatePresence mode="wait">
                  {!checkResult ? (
                    <motion.form 
                      key="step-initial"
                      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onSubmit={handleSmartCheck} 
                      className="space-y-6"
                    >
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Nom complet du membre</label>
                        <div className="relative group">
                          <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={18} />
                          <input 
                            required
                            className="input pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-2xl"
                            placeholder="Entrez le nom exact..."
                            value={smartForm.name}
                            onChange={e => setSmartForm(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Rôle assigné</label>
                        <div className="relative group">
                          <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={18} />
                          <select 
                            className="input pl-12 py-4 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-2xl appearance-none cursor-pointer"
                            value={smartForm.role}
                            onChange={e => setSmartForm(p => ({ ...p, role: e.target.value }))}
                          >
                            {FORM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" 
                        disabled={checking}
                        className="w-full btn-primary py-4 justify-center text-base rounded-2xl shadow-xl shadow-green-600/20"
                      >
                        {checking ? 'Recherche en cours...' : 'Vérifier et Ajouter'}
                      </button>
                    </motion.form>
                  ) : checkResult === 'found' ? (
                    <motion.div key="found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-6">
                      <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-2">
                        <UserCheck size={32} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-lg">Utilisateur trouvé !</h4>
                        <p className="text-xs text-slate-500 mt-1 px-4 leading-relaxed">
                          <strong>{selectedUser?.name}</strong> possède déjà un compte. Confirmez l'ajout pour l'intégrer à la coopérative.
                        </p>
                      </div>
                      <div className="flex gap-3">
                        <button onClick={() => setCheckResult(null)} className="flex-1 btn-outline justify-center py-3">Retour</button>
                        <button onClick={() => confirmAdd()} className="flex-1 btn-primary justify-center py-3">Confirmer</button>
                      </div>
                    </motion.div>
                  ) : checkResult === 'multiple' ? (
                    <motion.div key="multiple" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="flex items-center gap-3 px-1">
                        <UserSearch size={18} className="text-blue-500" />
                        <h4 className="font-bold text-slate-800 text-sm">Plusieurs comptes trouvés :</h4>
                      </div>
                      <div className="bg-slate-50 rounded-2xl border border-slate-100 divide-y divide-slate-100 overflow-hidden max-h-[250px] overflow-y-auto shadow-inner">
                        {candidates.map(c => (
                          <div key={c._id} className="p-4 flex items-center justify-between hover:bg-white transition-colors group">
                            <div className="flex items-center gap-3">
                              <div className="w-9 h-9 bg-white border border-slate-200 rounded-xl flex items-center justify-center text-[10px] font-bold text-slate-400">
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <p className="text-xs font-bold text-slate-700">{c.name}</p>
                                <p className="text-[9px] text-slate-400">{c.phone || 'Sans numéro'}</p>
                              </div>
                            </div>
                            <button onClick={() => confirmAdd(c)} className="px-3 py-1.5 bg-green-600 text-white text-[10px] font-bold rounded-lg shadow-sm">
                              Ajouter
                            </button>
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setCheckResult(null)} className="w-full text-xs text-slate-400 font-bold hover:text-slate-600">
                        Aucun de ceux-là ? Réessayer
                      </button>
                    </motion.div>
                  ) : checkResult === 'not_found' ? (
                    <motion.div key="not-found" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="p-4 bg-amber-50 rounded-2xl border border-amber-100 flex gap-3">
                        <AlertCircle className="text-amber-500 shrink-0" size={20} />
                        <p className="text-xs text-amber-800 leading-relaxed">
                          <strong>{smartForm.name}</strong> n'est pas encore inscrit. Partagez ce lien avec lui pour qu'il puisse s'inscrire et rejoindre la coop.
                        </p>
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-1">Lien d'invitation personnalisé</label>
                        <div className="bg-slate-50 border border-slate-100 p-4 rounded-2xl text-[10px] font-mono break-all text-green-600 font-bold">
                          {inviteUrl || 'Génération du lien...'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-3">
                        <button 
                          disabled={!inviteUrl}
                          onClick={() => { navigator.clipboard.writeText(inviteUrl); showToast('Lien copié ✓'); }}
                          className="w-full btn-primary py-4 justify-center gap-2"
                        >
                          <Share2 size={18} /> Copier le lien
                        </button>
                        <button onClick={resetModal} className="w-full btn-outline py-4 justify-center">Fermer</button>
                      </div>
                    </motion.div>
                  ) : (
                    <motion.div key="error" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center py-8">
                       <AlertCircle size={40} className="text-red-500 mx-auto mb-4" />
                       <p className="text-sm text-slate-600">Désolé, une erreur technique est survenue.</p>
                       <button onClick={() => setCheckResult(null)} className="mt-4 btn-outline py-2 px-6 mx-auto">Réessayer</button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
