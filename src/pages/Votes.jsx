import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Clock, Shield, X, Search, CheckCircle2, TrendingUp, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function Votes() {
  const { showToast } = useOutletContext();
  const { currentCoop, user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [search, setSearch] = useState('');
  const [stats, setStats] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');

  const loadData = useCallback(async () => {
    if (!currentCoop?._id) return;
    try {
      const [vRes, sRes] = await Promise.all([
        client.get(`/cooperatives/${currentCoop._id}/votes`),
        client.get(`/cooperatives/${currentCoop._id}/stats`)
      ]);
      setVotes(vRes.data);
      setStats(sRes.data);
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Erreur de chargement');
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleVote = async (voteId, choice) => {
    try {
      const answer = choice === 'Oui' ? 'yes' : 'no';
      await client.post(`/votes/${voteId}/cast`, { vote: answer });
      showToast(`Vote "${choice}" enregistré ✓`);
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Erreur lors du vote');
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!propTitle.trim()) return;
    setSaving(true);
    try {
      await client.post(`/cooperatives/${currentCoop._id}/proposals`, {
        title: propTitle.trim(),
        description: propDesc.trim(),
      });
      showToast('Proposition créée ✓');
      setPropTitle('');
      setPropDesc('');
      setShowModal(false);
      loadData();
    } catch (err) {
      showToast?.(err.response?.data?.error || 'Erreur de création');
    } finally {
      setSaving(false);
    }
  };

  const filtered = votes.filter(v => 
    v.title.toLowerCase().includes(search.toLowerCase()) || 
    v.description?.toLowerCase().includes(search.toLowerCase())
  );

  const activeVotes = filtered.filter(v => v.status === 'active');
  const historyVotes = filtered.filter(v => v.status !== 'active');
  const membersCount = stats?.membersCount || 1;

  return (
    <div className="flex flex-col gap-6 pb-12">
      {/* Header Area */}
      <div className="flex flex-wrap items-center justify-between gap-6">
        <div>
          <h1 className="font-display font-bold text-slate-800 text-2xl">Gouvernance</h1>
          <p className="text-xs text-slate-400 font-medium mt-1">Prenez des décisions collectives pour la coopérative</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary shadow-lg shadow-green-600/20 py-3">
          <Plus size={18} /> Nouvelle proposition
        </button>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="card bg-white p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-amber-50 text-amber-600 rounded-xl flex items-center justify-center">
            <Clock size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">En cours</p>
            <p className="font-display font-bold text-xl text-slate-800">{activeVotes.length}</p>
          </div>
        </div>
        <div className="card bg-white p-4 flex items-center gap-4">
          <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
            <CheckCircle2 size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Membres</p>
            <p className="font-display font-bold text-xl text-slate-800">{membersCount}</p>
          </div>
        </div>
        <div className="sm:col-span-2 relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            className="input pl-12 h-full bg-white shadow-sm border-none"
            placeholder="Rechercher une proposition..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* Active Proposals Grid */}
      <section>
        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Propositions actives</h2>
        {activeVotes.length === 0 ? (
          <div className="card bg-white py-16 text-center border-dashed border-2 border-slate-100">
            <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-4 text-slate-300">
              <Clock size={32} />
            </div>
            <p className="text-slate-400 font-medium italic">Aucun vote en cours actuellement.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {activeVotes.map((vote) => {
              const totalVoted = vote.votedMembers?.length || 0;
              const participationP = Math.round((totalVoted / membersCount) * 100);
              const yesP = totalVoted > 0 ? Math.round((vote.yesVotes / totalVoted) * 100) : 0;
              const noP = totalVoted > 0 ? Math.round((vote.noVotes / totalVoted) * 100) : 0;
              const hasVoted = vote.votedMembers?.some(id => String(id) === String(user?._id));

              return (
                <motion.div 
                  layout
                  key={vote._id} 
                  className={`card bg-white shadow-xl shadow-slate-200/50 p-6 flex flex-col gap-5 border-l-4 ${hasVoted ? 'border-l-green-500' : 'border-l-amber-400'}`}
                >
                  <div className="flex justify-between items-start gap-4">
                    <div>
                      <h3 className="font-display font-bold text-slate-800 text-lg mb-1">{vote.title}</h3>
                      <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">{vote.description}</p>
                    </div>
                    {hasVoted && <div className="badge-green shrink-0">Voté</div>}
                  </div>

                  {/* Participation */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-[11px] font-bold">
                      <span className="text-slate-400 uppercase tracking-widest">Participation</span>
                      <span className="text-slate-700">{participationP}% ({totalVoted}/{membersCount})</span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }} 
                        animate={{ width: `${participationP}%` }} 
                        className="h-full bg-slate-400 rounded-full"
                      />
                    </div>
                  </div>

                  {/* Results preview */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-3 rounded-xl bg-green-50 border border-green-100/50">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-green-600 uppercase">Oui</span>
                        <span className="text-sm font-bold text-green-700">{yesP}%</span>
                      </div>
                      <div className="h-1 bg-green-200/50 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${yesP}%` }} className="h-full bg-green-500" />
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-red-50 border border-red-100/50">
                      <div className="flex justify-between items-end mb-1">
                        <span className="text-[10px] font-bold text-red-500 uppercase">Non</span>
                        <span className="text-sm font-bold text-red-600">{noP}%</span>
                      </div>
                      <div className="h-1 bg-red-200/50 rounded-full overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${noP}%` }} className="h-full bg-red-400" />
                      </div>
                    </div>
                  </div>

                  {!hasVoted ? (
                    <div className="flex gap-3 pt-2">
                      <button 
                        onClick={() => handleVote(vote._id, 'Oui')}
                        className="flex-1 btn-primary justify-center py-3"
                      >
                        Approuver
                      </button>
                      <button 
                        onClick={() => handleVote(vote._id, 'Non')}
                        className="flex-1 btn-outline justify-center py-3 bg-red-50 border-red-100 text-red-600 hover:bg-red-100"
                      >
                        Rejeter
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center justify-center gap-2 py-3 bg-slate-50 rounded-xl text-slate-400 text-xs font-bold uppercase tracking-widest">
                      <CheckCircle2 size={14} /> Merci pour votre vote
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* History Table */}
      {historyVotes.length > 0 && (
        <section>
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] mb-4">Historique des votes</h2>
          <div className="card bg-white shadow-sm border-slate-100 overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-slate-50/50 text-slate-400 text-[10px] font-bold uppercase tracking-widest border-b border-slate-100">
                <tr>
                  <th className="text-left py-4 px-6">Proposition</th>
                  <th className="text-center py-4 px-6">Résultat</th>
                  <th className="text-right py-4 px-6">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {historyVotes.map((vote) => (
                  <tr key={vote._id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-4 px-6">
                      <p className="font-bold text-slate-800">{vote.title}</p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[300px]">{vote.description}</p>
                    </td>
                    <td className="py-4 px-6 text-center">
                      <span className={vote.status === 'approved' ? 'badge-green' : 'badge-red'}>
                        {vote.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-right text-xs text-slate-500">{new Date(vote.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Create Proposal Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden"
            >
              <div className="px-8 py-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                <h3 className="font-display font-bold text-xl text-slate-800">Nouvelle proposition</h3>
                <button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors bg-transparent border-none cursor-pointer">
                  <X size={20} />
                </button>
              </div>
              <form onSubmit={handleCreateProposal} className="p-8 space-y-6">
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Titre de la proposition</label>
                  <input 
                    className="input py-4 bg-slate-50 border-transparent focus:bg-white"
                    placeholder="Ex: Construction d'un nouveau silo"
                    value={propTitle}
                    onChange={(e) => setPropTitle(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Description détaillée</label>
                  <textarea 
                    className="input py-4 bg-slate-50 border-transparent focus:bg-white min-h-[150px] resize-none"
                    placeholder="Expliquez pourquoi cette décision est nécessaire..."
                    value={propDesc}
                    onChange={(e) => setPropDesc(e.target.value)}
                    required
                  />
                </div>
                <div className="flex gap-4 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 btn-outline py-3.5 justify-center">Annuler</button>
                  <button type="submit" disabled={saving} className="flex-1 btn-primary py-3.5 justify-center">
                    {saving ? 'Création...' : 'Lancer le vote'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
