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
  Users,
  ShieldCheck,
  X,
  User,
  Briefcase,
  AlertCircle,
  Share2,
  ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { getInitials, formatDateShort } from '../utils/formatCurrency';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Tous', 'Président', 'Trésorier', 'Auditeur', 'Membre'];
const FORM_ROLES = ['Membre', 'Trésorier', 'Auditeur', 'Président'];

const ROLE_COLORS = {
  'Président': 'bg-purple-100 text-purple-700 border border-purple-200',
  'Trésorier': 'bg-blue-100 text-blue-700 border border-blue-200',
  'Auditeur': 'bg-amber-100 text-amber-700 border border-amber-200',
  'Admin': 'bg-red-100 text-red-700 border border-red-200',
  'Membre': 'bg-emerald-50 text-emerald-700 border border-emerald-100',
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
  const [checkResultData, setCheckResultData] = useState('');

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
      const res = await client.get(`/cooperatives/${currentCoop._id}/member-candidates`, {
        params: { q: query }
      });
      const found = res.data || [];
      const exactMatch = found.find(c => c.name.toLowerCase() === query.toLowerCase());

      if (exactMatch) {
        setCheckResult('found');
        setSelectedUser(exactMatch);
      } else if (found.length > 0) {
        setCandidates(found);
        setCheckResult('multiple');
      } else {
        const inviteRes = await client.post(`/cooperatives/${currentCoop._id}/invite-link`);
        setInviteUrl(inviteRes.data?.webJoinUrl || '');
        setCheckResult('not_found');
      }
    } catch (err) {
      setCheckResult('error');
      setCheckResultData(err.response?.data?.error || err.message);
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
      showToast(`${target.name} ajouté ✓`);
      resetModal();
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || "Erreur d'ajout");
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
    <div className="max-w-6xl mx-auto flex flex-col gap-8 pb-20">
      {/* Header Full Width */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[32px] border border-slate-100 shadow-sm">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-xl shadow-green-600/20">
              <Users size={24} />
            </div>
            <h1 className="font-display font-bold text-3xl text-slate-800 tracking-tight">Registre des Membres</h1>
          </div>
          <p className="text-sm text-slate-400 font-medium ml-1">
            {currentCoop?.name} • <span className="text-green-600 font-bold">{members.length} membres actifs</span>
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="btn-outline px-6 py-3 rounded-2xl border-slate-100 flex items-center gap-2">
            <Download size={18} />
            <span>Exporter</span>
          </button>
          {canManage && (
            <motion.button 
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setShowAddModal(true)} 
              className="btn-primary shadow-2xl shadow-green-600/30 py-4 px-8 rounded-2xl flex items-center gap-2 text-base"
            >
              <UserPlus size={20} /> 
              <span>Ajouter un membre</span>
            </motion.button>
          )}
        </div>
      </div>

      <div className="flex flex-col gap-6 w-full">
        {/* Pending Alerts - Wider */}
        <AnimatePresence>
          {canManage && pending.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-amber-50 border border-amber-200 p-6 rounded-[24px] shadow-lg shadow-amber-900/5"
            >
              <div className="flex items-center gap-3 mb-4">
                <Clock className="text-amber-500 animate-pulse" size={20} />
                <h3 className="font-bold text-amber-900 text-sm uppercase tracking-widest">Demandes d'adhésion en attente ({pending.length})</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pending.map(m => (
                  <div key={m._id} className="bg-white rounded-2xl p-4 border border-amber-100 flex items-center justify-between shadow-sm hover:border-amber-300 transition-all">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 bg-amber-100 text-amber-700 rounded-xl flex items-center justify-center font-bold text-xs uppercase shrink-0">
                        {getInitials(m.name)}
                      </div>
                      <span className="text-sm font-bold text-slate-700 truncate">{m.name}</span>
                    </div>
                    <div className="flex gap-2 ml-4">
                      <button onClick={() => client.post(`/cooperatives/${currentCoop._id}/approve`, { userId: m._id }).then(loadData)} className="p-2 bg-green-600 text-white rounded-xl hover:bg-green-700 shadow-sm transition-all active:scale-90">
                        <UserCheck size={16} />
                      </button>
                      <button onClick={() => client.post(`/cooperatives/${currentCoop._id}/reject`, { userId: m._id }).then(loadData)} className="p-2 bg-slate-100 text-slate-400 rounded-xl hover:text-red-500 hover:bg-red-50 transition-all active:scale-90">
                        <UserX size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Main Members List Full Width */}
        <div className="card bg-white p-0 shadow-2xl shadow-slate-200/40 border-slate-100 rounded-[32px] overflow-hidden">
          <div className="p-8 border-b border-slate-50 bg-slate-50/20 flex flex-col sm:flex-row items-center gap-6">
            <div className="relative flex-1 w-full">
              <Search size={18} className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300" />
              <input 
                className="input pl-14 py-4 bg-white border-slate-100 focus:border-green-500 rounded-2xl text-base shadow-sm"
                placeholder="Filtrer les membres par nom ou email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] border-b border-slate-100">
                <tr>
                  <th className="text-left py-6 px-8">Identité du Membre</th>
                  <th className="text-left py-6 px-8">Responsabilité</th>
                  <th className="text-right py-6 px-8">Actions de Gestion</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {loading ? (
                  <tr><td colSpan="3" className="py-24 text-center italic text-slate-300">Synchronisation des données...</td></tr>
                ) : filtered.length === 0 ? (
                  <tr><td colSpan="3" className="py-24 text-center italic text-slate-300">Aucun membre ne correspond à votre recherche</td></tr>
                ) : (
                  filtered.map(m => (
                    <tr key={m._id} className="group hover:bg-green-50/20 transition-all duration-300">
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-50 text-green-700 rounded-2xl flex items-center justify-center font-bold text-sm shadow-inner group-hover:bg-green-100 transition-colors">
                            {getInitials(m.name)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-800 text-base leading-tight">{m.name}</p>
                            <p className="text-xs text-slate-400 mt-1.5 font-medium">{m.phone || m.email || 'Pas de contact'}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-6 px-8">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider shadow-sm ${ROLE_COLORS[m.role] || 'bg-slate-100 text-slate-500'}`}>
                            {m.role || 'Membre'}
                          </span>
                          {canManage && m._id !== user._id && (
                            <select 
                              className="opacity-0 group-hover:opacity-100 text-[10px] font-bold bg-white border border-slate-200 rounded-lg p-1.5 cursor-pointer shadow-sm transition-all focus:opacity-100"
                              value={m.role || 'Membre'}
                              onChange={(e) => handleUpdateRole(m._id, e.target.value)}
                            >
                              {FORM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                            </select>
                          )}
                        </div>
                      </td>
                      <td className="py-6 px-8 text-right">
                        {m._id !== user._id && canManage ? (
                          <button onClick={() => handleRemove(m._id)} className="p-3 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-2xl transition-all active:scale-90 border-none bg-transparent cursor-pointer">
                            <UserX size={20} />
                          </button>
                        ) : m._id === user._id ? (
                          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-50 text-green-700 text-[10px] font-bold uppercase tracking-widest rounded-full border border-green-100">
                            <ShieldCheck size={12} /> Moi
                          </div>
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

      {/* POP-UP Smart Add Member */}
      <AnimatePresence>
        {showAddModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={resetModal} className="absolute inset-0 bg-slate-900/80 backdrop-blur-md"
            />
            
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 30 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 30 }}
              className="relative bg-white rounded-[40px] shadow-2xl w-full max-w-lg overflow-hidden border border-white/20"
            >
              <div className="px-10 py-8 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-green-600 text-white rounded-2xl flex items-center justify-center shadow-2xl shadow-green-600/30">
                    <UserPlus size={24} />
                  </div>
                  <h3 className="font-display font-bold text-2xl text-slate-800">Ajout de Membre</h3>
                </div>
                <button onClick={resetModal} className="p-3 hover:bg-slate-200 rounded-full text-slate-400 transition-colors bg-transparent border-none cursor-pointer">
                  <X size={24} />
                </button>
              </div>

              <div className="p-10">
                <AnimatePresence mode="wait">
                  {!checkResult ? (
                    <motion.form 
                      key="init" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      onSubmit={handleSmartCheck} className="space-y-8"
                    >
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Nom complet à vérifier</label>
                        <div className="relative group">
                          <User className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={20} />
                          <input 
                            required
                            className="input pl-14 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-3xl text-lg shadow-sm"
                            placeholder="ex: Richard Hezou"
                            value={smartForm.name}
                            onChange={e => setSmartForm(p => ({ ...p, name: e.target.value }))}
                            autoFocus
                          />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">Rôle dans la coop</label>
                        <div className="relative group">
                          <Briefcase className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={20} />
                          <select 
                            className="input pl-14 py-5 bg-slate-50 border-transparent focus:bg-white focus:border-green-500 rounded-3xl text-lg appearance-none cursor-pointer shadow-sm"
                            value={smartForm.role}
                            onChange={e => setSmartForm(p => ({ ...p, role: e.target.value }))}
                          >
                            {FORM_ROLES.map(r => <option key={r} value={r}>{r}</option>)}
                          </select>
                        </div>
                      </div>

                      <button 
                        type="submit" disabled={checking}
                        className="w-full btn-primary py-5 justify-center text-lg rounded-3xl shadow-2xl shadow-green-600/30 font-bold"
                      >
                        {checking ? 'Recherche...' : 'Vérifier et Ajouter'}
                      </button>
                    </motion.form>
                  ) : checkResult === 'found' ? (
                    <motion.div key="found" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-8">
                      <div className="w-20 h-20 bg-green-100 text-green-600 rounded-[32px] flex items-center justify-center mx-auto shadow-inner">
                        <UserCheck size={40} />
                      </div>
                      <div>
                        <h4 className="font-bold text-slate-800 text-2xl">Utilisateur trouvé !</h4>
                        <p className="text-sm text-slate-500 mt-2 px-6 leading-relaxed">
                          <strong>{selectedUser?.name}</strong> possède déjà un compte AgriLogix. Confirmez pour l'ajouter comme <strong>{smartForm.role}</strong>.
                        </p>
                      </div>
                      <div className="flex gap-4">
                        <button onClick={() => setCheckResult(null)} className="flex-1 btn-outline justify-center py-4 rounded-2xl">Retour</button>
                        <button onClick={() => confirmAdd()} className="flex-1 btn-primary justify-center py-4 rounded-2xl text-lg">Confirmer</button>
                      </div>
                    </motion.div>
                  ) : checkResult === 'multiple' ? (
                    <motion.div key="mult" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
                      <div className="flex items-center gap-3 px-2">
                        <Search size={20} className="text-blue-500" />
                        <h4 className="font-bold text-slate-800 text-lg">Résultats suggérés :</h4>
                      </div>
                      <div className="bg-slate-50 rounded-[32px] border border-slate-100 divide-y divide-slate-100 overflow-hidden shadow-inner max-h-[300px] overflow-y-auto">
                        {candidates.map(c => (
                          <div key={c._id} className="p-6 flex items-center justify-between hover:bg-white transition-all group">
                            <div className="flex items-center gap-4">
                              <div className="w-12 h-12 bg-white border border-slate-200 rounded-2xl flex items-center justify-center font-bold text-slate-400 group-hover:text-green-600 group-hover:bg-green-50 transition-colors">
                                {getInitials(c.name)}
                              </div>
                              <div>
                                <p className="font-bold text-slate-800">{c.name}</p>
                                <p className="text-[10px] text-slate-400 font-medium uppercase tracking-wider mt-0.5">
                                  {c.status === 'already_member' ? 'Déjà membre ✓' : c.status === 'pending' ? 'En attente...' : c.phone || 'Sans tel'}
                                </p>
                              </div>
                            </div>
                            {c.status === 'available' && (
                              <button onClick={() => confirmAdd(c)} className="px-5 py-2.5 bg-green-600 text-white text-xs font-bold rounded-xl shadow-lg shadow-green-600/10">
                                Ajouter
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                      <button onClick={() => setCheckResult(null)} className="w-full text-xs text-slate-400 font-bold hover:text-slate-600 tracking-widest uppercase">
                        Aucun de ceux-là ? Réessayer
                      </button>
                    </motion.div>
                  ) : checkResult === 'not_found' ? (
                    <motion.div key="not" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                      <div className="p-6 bg-amber-50 rounded-[32px] border border-amber-100 flex gap-4">
                        <AlertCircle className="text-amber-500 shrink-0 mt-1" size={24} />
                        <p className="text-sm text-amber-800 leading-relaxed">
                          <strong>{smartForm.name}</strong> n'est pas encore sur AgriLogix. Partagez ce lien pour qu'il rejoigne la coopérative.
                        </p>
                      </div>
                      <div className="space-y-3">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest ml-2">Lien d'invitation personnalisé</label>
                        <div className="bg-slate-50 border border-slate-100 p-6 rounded-[24px] text-xs font-mono break-all text-green-700 font-bold leading-relaxed shadow-inner">
                          {inviteUrl || 'Génération...'}
                        </div>
                      </div>
                      <div className="flex flex-col gap-4">
                        <button 
                          disabled={!inviteUrl}
                          onClick={() => { navigator.clipboard.writeText(inviteUrl); showToast('Copié ✓'); }}
                          className="w-full btn-primary py-5 justify-center gap-3 text-lg rounded-[24px]"
                        >
                          <Share2 size={20} /> Partager le lien
                        </button>
                        <button onClick={resetModal} className="w-full btn-outline py-5 justify-center rounded-[24px]">Fermer</button>
                      </div>
                    </motion.div>
                  ) : (
                    <div className="text-center py-12">
                       <AlertCircle size={48} className="text-red-500 mx-auto mb-6" />
                       <p className="text-slate-800 font-bold text-lg">Une erreur est survenue</p>
                       <p className="text-slate-500 mt-2 px-6">
                         {checkResultData || "Impossible de contacter le serveur local."}
                       </p>
                       <button onClick={() => setCheckResult(null)} className="mt-8 btn-outline py-3 px-8 mx-auto rounded-2xl font-bold">Réessayer</button>
                    </div>
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
