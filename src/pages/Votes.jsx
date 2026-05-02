// src/pages/Votes.jsx
import { useState, useEffect, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Clock, Shield, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

function apiError(err) {
  return err?.response?.data?.error || err?.message || 'Une erreur est survenue.';
}

function formatDeadline(expiresAt) {
  if (!expiresAt) return 'Date non définie';
  return new Date(expiresAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });
}

function PropositionCard({ prop, onVote, votedLabel, serverHasVoted }) {
  const totalVotes = prop.yesVotes + prop.noVotes;
  const yesPct = totalVotes > 0 ? Math.round((prop.yesVotes / totalVotes) * 100) : 0;
  const noPct = 100 - yesPct;

  return (
    <div className="card flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="badge-yellow">🗳️ Vote {prop.status === 'active' ? 'ouvert' : prop.status}</span>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          {formatDeadline(prop.expiresAt)}
        </div>
      </div>

      <div>
        <h3 className="font-display font-bold text-slate-800 text-sm mb-1">{prop.title}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{prop.description || 'Aucune description fournie'}</p>
      </div>

      <div className="flex flex-col gap-2.5">
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-green-600">👍 Oui ({yesPct}%)</span>
            <span className="text-slate-400">{prop.yesVotes} votes</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${yesPct}%` }}
            />
          </div>
        </div>
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-500">👎 Non ({noPct}%)</span>
            <span className="text-slate-400">{prop.noVotes} votes</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-700"
              style={{ width: `${noPct}%` }}
            />
          </div>
        </div>
      </div>

      {votedLabel || serverHasVoted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm font-bold text-green-700">
          ✓{' '}
          {votedLabel
            ? `Vote « ${votedLabel} » enregistré`
            : 'Vous avez déjà voté sur cette proposition'}
        </div>
      ) : (
        <div className="flex gap-2.5">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-green-700 active:scale-95 transition-all duration-200"
            onClick={() => onVote(prop._id, 'Oui')}
          >
            <CheckCircle size={15} /> Voter Oui
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 cursor-pointer hover:bg-slate-200 active:scale-95 transition-all duration-200"
            onClick={() => onVote(prop._id, 'Non')}
          >
            <XCircle size={15} /> Voter Non
          </button>
        </div>
      )}

      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
        <Shield size={11} />
        Vote coopératif
        {prop.expiresAt ? ` · avant le ${formatDeadline(prop.expiresAt)}` : ''}
      </div>
    </div>
  );
}

export default function Votes() {
  const { showToast } = useOutletContext();
  const { currentCoop, user } = useAuth();
  const [votes, setVotes] = useState([]);
  const [voted, setVoted] = useState({});
  const [showModal, setShowModal] = useState(false);
  const [saving, setSaving] = useState(false);
  const [propTitle, setPropTitle] = useState('');
  const [propDesc, setPropDesc] = useState('');

  const loadVotes = useCallback(async () => {
    if (!currentCoop?._id) return;
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}/votes`);
      setVotes(res.data);
    } catch (err) {
      console.error('Erreur chargement des votes', err.message || err);
      showToast?.(apiError(err));
    }
  }, [currentCoop?._id, showToast]);

  useEffect(() => {
    loadVotes();
  }, [loadVotes]);

  const handleVote = async (voteId, choice) => {
    try {
      const answer = choice === 'Oui' ? 'yes' : 'no';
      const res = await client.post(`/votes/${voteId}/cast`, { vote: answer });
      setVotes((prev) => prev.map((v) => (v._id === voteId ? res.data : v)));
      setVoted((prev) => ({ ...prev, [voteId]: choice }));
      showToast(`Vote "${choice}" enregistré ✓`);
    } catch (err) {
      showToast(apiError(err));
    }
  };

  const handleCreateProposal = async (e) => {
    e.preventDefault();
    if (!currentCoop?._id || !propTitle.trim()) return;
    setSaving(true);
    try {
      await client.post(`/cooperatives/${currentCoop._id}/proposals`, {
        title: propTitle.trim(),
        description: propDesc.trim() || undefined,
      });
      showToast('Proposition créée ✓');
      setPropTitle('');
      setPropDesc('');
      setShowModal(false);
      await loadVotes();
    } catch (err) {
      showToast(apiError(err));
    } finally {
      setSaving(false);
    }
  };

  if (!currentCoop) {
    return (
      <div className="card">
        <h2 className="font-display font-bold text-slate-800">Votes</h2>
        <p className="text-sm text-slate-500">Sélectionnez une coopérative pour consulter les propositions réelles.</p>
      </div>
    );
  }

  const activeVotes = votes.filter((vote) => vote.status === 'active');
  const historyVotes = votes.filter((vote) => vote.status !== 'active');

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">
            {activeVotes.length} proposition(s) active(s)
          </p>
        </div>
        <button type="button" className="btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} />
          Nouvelle proposition
        </button>
      </div>

      <section>
        <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">
          Propositions Actives
        </h2>
        {activeVotes.length === 0 ? (
          <div className="card text-center text-slate-500 py-12">Aucune proposition active trouvée.</div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {activeVotes.map((vote) => {
              const serverHasVoted =
                !!user &&
                Array.isArray(vote.votedMembers) &&
                vote.votedMembers.some((id) => String(id) === String(user._id));
              return (
                <PropositionCard
                  key={vote._id}
                  prop={vote}
                  votedLabel={voted[vote._id]}
                  serverHasVoted={serverHasVoted}
                  onVote={handleVote}
                />
              );
            })}
          </div>
        )}
      </section>

      <section>
        <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">
          Historique des Votes
        </h2>
        <div className="card overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Proposition', 'Statut', 'Date de création', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historyVotes.map((vote) => (
                <tr key={vote._id} className="border-b border-slate-50 hover:bg-green-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{vote.title}</p>
                    <p className="text-xs text-slate-400 truncate">{vote.description}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={vote.status === 'approved' ? 'badge-green' : 'badge-red'}>
                      {vote.status === 'approved' ? 'Approuvé' : 'Rejeté'}
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{new Date(vote.createdAt).toLocaleDateString('fr-FR')}</td>
                  <td className="px-4 py-3.5">
                    <button
                      className="text-xs text-green-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                      onClick={() => showToast(`Détails du vote ${vote._id}`)}
                    >
                      Détails →
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {showModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
              <h3 className="font-display font-bold text-slate-800">Nouvelle proposition</h3>
              <button
                type="button"
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-500 border-none bg-transparent cursor-pointer"
                onClick={() => setShowModal(false)}
                aria-label="Fermer"
              >
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleCreateProposal} className="p-5 flex flex-col gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Titre</label>
                <input
                  className="input"
                  value={propTitle}
                  onChange={(e) => setPropTitle(e.target.value)}
                  placeholder="Ex. Achat d’irrigation"
                  required
                  maxLength={200}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Description</label>
                <textarea
                  className="input min-h-[120px] resize-y"
                  value={propDesc}
                  onChange={(e) => setPropDesc(e.target.value)}
                  placeholder="Contexte, montant estimé, impact…"
                />
              </div>
              <div className="flex gap-3 justify-end pt-2">
                <button type="button" className="btn-outline" onClick={() => setShowModal(false)}>
                  Annuler
                </button>
                <button type="submit" className="btn-primary disabled:opacity-50" disabled={saving}>
                  {saving ? 'Envoi…' : 'Soumettre au vote'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
