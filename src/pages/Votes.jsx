// src/pages/Votes.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import { Plus, CheckCircle, XCircle, Clock, Shield } from 'lucide-react';

import { propositions, historiqueVotes } from '../data/mockData';
import { formatCurrency } from '../utils/formatCurrency';

// ── Carte d'une proposition ─────────────────────────────────────────────────
function PropositionCard({ prop, onVote, voted }) {
  const totalPct = prop.votesOui + prop.votesNon;
  const ouiPct   = totalPct > 0 ? Math.round((prop.votesOui / totalPct) * 100) : 0;
  const nonPct   = 100 - ouiPct;

  return (
    <div className="card flex flex-col gap-4">
      {/* Badge statut */}
      <div className="flex items-center justify-between">
        <span className="badge-yellow">🗳️ Vote Ouvert</span>
        <div className="flex items-center gap-1 text-xs text-slate-400">
          <Clock size={12} />
          {new Date(prop.deadline).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' })}
        </div>
      </div>

      {/* Titre + description */}
      <div>
        <h3 className="font-display font-bold text-slate-800 text-sm mb-1">{prop.titre}</h3>
        <p className="text-xs text-slate-500 leading-relaxed">{prop.description}</p>
      </div>

      {/* Montant si applicable */}
      {prop.montant > 0 && (
        <div className="bg-green-50 border border-green-100 rounded-xl px-3 py-2 text-xs font-semibold text-green-700">
          💰 Montant : {formatCurrency(prop.montant)}
        </div>
      )}

      {/* Barres de progression */}
      <div className="flex flex-col gap-2.5">
        {/* Oui */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-green-600">👍 Oui ({ouiPct}%)</span>
            <span className="text-slate-400">{prop.votesOui} votes</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-green-500 rounded-full transition-all duration-700"
              style={{ width: `${ouiPct}%` }}
            />
          </div>
        </div>
        {/* Non */}
        <div>
          <div className="flex justify-between text-xs font-semibold mb-1.5">
            <span className="text-slate-500">👎 Non ({nonPct}%)</span>
            <span className="text-slate-400">{prop.votesNon} votes</span>
          </div>
          <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-slate-400 rounded-full transition-all duration-700"
              style={{ width: `${nonPct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Participation */}
      <p className="text-xs text-slate-400">
        Participation : {prop.totalVotants} / {prop.quorum} membres requis
      </p>

      {/* Boutons vote */}
      {voted ? (
        <div className="bg-green-50 border border-green-200 rounded-xl p-3 text-center text-sm font-bold text-green-700">
          ✓ Vote "{voted}" enregistré sur la blockchain
        </div>
      ) : (
        <div className="flex gap-2.5">
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold border-none cursor-pointer hover:bg-green-700 active:scale-95 transition-all duration-200"
            onClick={() => onVote(prop.id, 'Oui')}
          >
            <CheckCircle size={15} /> Voter Oui
          </button>
          <button
            className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-slate-100 text-slate-600 rounded-xl text-sm font-bold border border-slate-200 cursor-pointer hover:bg-slate-200 active:scale-95 transition-all duration-200"
            onClick={() => onVote(prop.id, 'Non')}
          >
            <XCircle size={15} /> Voter Non
          </button>
        </div>
      )}

      {/* Smart contract info */}
      <div className="flex items-center justify-center gap-2 text-[10px] text-slate-400 font-medium">
        <Shield size={11} />
        Smart Contract · Polygon · {prop.deadline ? `Se termine le ${new Date(prop.deadline).toLocaleDateString('fr-FR')}` : ''}
      </div>
    </div>
  );
}

// ── Page principale ──────────────────────────────────────────────────────────
export default function Votes() {
  const { showToast } = useOutletContext();
  const [votes, setVotes] = useState({});

  const handleVote = (id, choice) => {
    setVotes((v) => ({ ...v, [id]: choice }));
    showToast(`Vote "${choice}" enregistré sur la blockchain ✓`);
  };

  return (
    <div className="flex flex-col gap-6">

      {/* ── Header ── */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-slate-400 mb-1">
            {propositions.length} proposition(s) active(s) en attente de vote
          </p>
        </div>
        <button
          className="btn-primary"
          onClick={() => showToast('Formulaire de nouvelle proposition ouvert')}
        >
          <Plus size={16} />
          Nouvelle Proposition
        </button>
      </div>

      {/* ── Propositions actives ── */}
      <section>
        <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">
          Propositions Actives
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          {propositions.map((p) => (
            <PropositionCard
              key={p.id}
              prop={p}
              voted={votes[p.id]}
              onVote={handleVote}
            />
          ))}
        </div>
      </section>

      {/* ── Historique ── */}
      <section>
        <h2 className="font-display font-bold text-slate-700 text-sm uppercase tracking-wider mb-4">
          Historique des Votes
        </h2>
        <div className="card">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Proposition', 'Résultat', 'Date de Clôture', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {historiqueVotes.map((h) => (
                <tr key={h.id} className="border-b border-slate-50 hover:bg-green-50/30 transition-colors">
                  <td className="px-4 py-3.5">
                    <p className="font-semibold text-slate-800">{h.label}</p>
                    <p className="text-xs text-slate-400 font-mono">{h.id}</p>
                  </td>
                  <td className="px-4 py-3.5">
                    <span className={h.type === 'success' ? 'badge-green' : 'badge-red'}>
                      {h.type === 'success' ? '✓' : '✗'} {h.resultat} ({h.pct})
                    </span>
                  </td>
                  <td className="px-4 py-3.5 text-xs text-slate-500">{h.date}</td>
                  <td className="px-4 py-3.5">
                    <button
                      className="text-xs text-green-600 font-semibold hover:underline bg-transparent border-none cursor-pointer"
                      onClick={() => showToast(`Détails du vote ${h.id}`)}
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
    </div>
  );
}
