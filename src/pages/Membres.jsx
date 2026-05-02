import { useState, useEffect, useMemo, useCallback } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search,
  Filter,
  Download,
  UserX,
  UserCheck,
  Clock,
  Link2,
  Copy,
  RefreshCw,
  UserPlus,
} from 'lucide-react';
import { getInitials, formatDateShort } from '../utils/formatCurrency';
import client from '../api/client';
import { useAuth } from '../context/AuthContext';

const ROLES = ['Tous', 'Président', 'Trésorier', 'Auditeur', 'Membre'];

const ROLE_COLORS = {
  Président: 'bg-purple-100 text-purple-700',
  Trésorier: 'bg-blue-100 text-blue-700',
  Auditeur: 'bg-amber-100 text-amber-700',
  Admin: 'bg-red-100 text-red-700',
};

export default function Membres() {
  const outlet = useOutletContext() || {};
  const showToast = outlet.showToast ?? (() => {});
  const { user, currentCoop } = useAuth();

  const [members, setMembers] = useState([]);
  const [pending, setPending] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('Tous');
  const [loading, setLoading] = useState(false);

  const [inviteUrl, setInviteUrl] = useState('');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [addQuery, setAddQuery] = useState('');
  const [candidates, setCandidates] = useState([]);
  const [addingId, setAddingId] = useState(null);

  const canManageMembers = useMemo(() => {
    if (!user || !currentCoop) return false;
    const aid = currentCoop.adminId?._id ?? currentCoop.adminId;
    return (
      String(aid) === String(user._id) ||
      user.role === 'Admin' ||
      user.role === 'Président' ||
      user.role === 'President'
    );
  }, [user, currentCoop]);

  const loadData = useCallback(async () => {
    if (!currentCoop?._id) return;
    setLoading(true);
    try {
      const res = await client.get(`/cooperatives/${currentCoop._id}`);
      setMembers(res.data?.members || []);
      setPending(res.data?.pendingMembers || []);
    } catch (err) {
      console.error('Erreur membres:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentCoop?._id]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshInviteLink = useCallback(
    async (regenerate, silentToast) => {
      if (!currentCoop?._id || !canManageMembers) return;
      setInviteLoading(true);
      try {
        const res = await client.post(`/cooperatives/${currentCoop._id}/invite-link`, {
          regenerate: !!regenerate,
        });
        setInviteUrl(res.data?.webJoinUrl || '');
        if (!silentToast) showToast(regenerate ? 'Nouveau lien généré ✓' : 'Lien prêt ✓');
      } catch (err) {
        showToast(err.response?.data?.error || 'Impossible de générer le lien');
      } finally {
        setInviteLoading(false);
      }
    },
    [currentCoop?._id, canManageMembers, showToast]
  );

  useEffect(() => {
    if (!canManageMembers || !currentCoop?._id) return;
    let cancelled = false;
    (async () => {
      setInviteLoading(true);
      try {
        const res = await client.post(`/cooperatives/${currentCoop._id}/invite-link`, {});
        if (!cancelled) setInviteUrl(res.data?.webJoinUrl || '');
      } catch {
        /* silencieux : droits ou réseau */
      } finally {
        if (!cancelled) setInviteLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canManageMembers, currentCoop?._id]);

  useEffect(() => {
    if (!canManageMembers || !currentCoop?._id) {
      setCandidates([]);
      return;
    }
    const q = addQuery.trim();
    if (q.length < 2) {
      setCandidates([]);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const res = await client.get(`/cooperatives/${currentCoop._id}/member-candidates`, {
          params: { q },
        });
        setCandidates(res.data || []);
      } catch {
        setCandidates([]);
      }
    }, 350);
    return () => clearTimeout(t);
  }, [addQuery, currentCoop?._id, canManageMembers]);

  const handleApprove = async (userId) => {
    try {
      await client.post(`/cooperatives/${currentCoop._id}/approve`, { userId });
      showToast('Membre approuvé ✓');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur approbation');
    }
  };

  const handleReject = async (userId) => {
    try {
      await client.post(`/cooperatives/${currentCoop._id}/reject`, { userId });
      showToast('Demande rejetée');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur rejet');
    }
  };

  const handleRemove = async (userId) => {
    if (!window.confirm('Retirer ce membre de la coopérative ?')) return;
    try {
      await client.delete(`/cooperatives/${currentCoop._id}/members/${userId}`);
      showToast('Membre retiré');
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Erreur suppression');
    }
  };

  const handleAddMember = async (userId) => {
    setAddingId(userId);
    try {
      await client.post(`/cooperatives/${currentCoop._id}/members`, { userId });
      showToast('Membre ajouté ✓');
      setAddQuery('');
      setCandidates([]);
      loadData();
    } catch (err) {
      showToast(err.response?.data?.error || 'Impossible d’ajouter ce membre');
    } finally {
      setAddingId(null);
    }
  };

  const copyInvite = async () => {
    if (!inviteUrl) return;
    try {
      await navigator.clipboard.writeText(inviteUrl);
      showToast('Lien copié dans le presse-papiers');
    } catch {
      showToast('Copie impossible (navigateur)');
    }
  };

  const filtered = useMemo(() => {
    return members.filter((m) => {
      const q = search.toLowerCase();
      const matchSearch =
        (m.name || '').toLowerCase().includes(q) || (m.email || '').toLowerCase().includes(q);
      const matchRole = roleFilter === 'Tous' || m.role === roleFilter;
      return matchSearch && matchRole;
    });
  }, [members, search, roleFilter]);

  if (!currentCoop) {
    return (
      <div className="card text-center py-12">
        <p className="text-slate-500">Sélectionnez une coopérative pour voir les membres.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-5">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Membres', value: members.length },
          { label: 'En attente', value: pending.length },
          { label: 'Rôles', value: new Set(members.map((m) => m.role || 'Membre')).size },
        ].map(({ label, value }) => (
          <div key={label} className="card text-center">
            <p className="font-display text-2xl font-bold text-slate-800">{value}</p>
            <p className="text-xs text-slate-400 mt-1 font-semibold uppercase tracking-wider">{label}</p>
          </div>
        ))}
      </div>

      {canManageMembers && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="card border border-green-100 bg-green-50/30">
            <div className="flex items-center gap-2 mb-3">
              <Link2 size={16} className="text-green-600" />
              <h3 className="font-bold text-slate-800 text-sm">Inviter par lien</h3>
            </div>
            <p className="text-xs text-slate-500 mb-3">
              Partagez ce lien : la personne crée un compte ou se connecte, puis envoie une demande
              d&apos;adhésion que vous validez ci-dessous.
            </p>
            {inviteLoading ? (
              <p className="text-sm text-slate-400">Préparation du lien…</p>
            ) : (
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  readOnly
                  className="input flex-1 text-xs font-mono bg-white"
                  value={inviteUrl}
                  placeholder="Lien d’invitation"
                />
                <div className="flex gap-2 shrink-0">
                  <button type="button" className="btn-primary py-2 px-3 text-xs" onClick={copyInvite}>
                    <Copy size={14} /> Copier
                  </button>
                  <button
                    type="button"
                    className="btn-outline py-2 px-3 text-xs"
                    onClick={() => refreshInviteLink(true, false)}
                    title="Invalider l’ancien lien"
                  >
                    <RefreshCw size={14} /> Nouveau
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="card border border-slate-100">
            <div className="flex items-center gap-2 mb-3">
              <UserPlus size={16} className="text-green-600" />
              <h3 className="font-bold text-slate-800 text-sm">Ajouter un membre existant</h3>
            </div>
            <p className="text-xs text-slate-500 mb-2">
              Recherchez un compte AgriLogix par nom (hors membres actuels).
            </p>
            <div className="relative mb-2">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                className="input pl-9 text-sm"
                placeholder="Au moins 2 lettres…"
                value={addQuery}
                onChange={(e) => setAddQuery(e.target.value)}
              />
            </div>
            {candidates.length > 0 && (
              <ul className="border border-slate-100 rounded-xl divide-y divide-slate-50 max-h-48 overflow-y-auto">
                {candidates.map((c) => (
                  <li
                    key={c._id}
                    className="flex items-center justify-between gap-2 px-3 py-2 text-sm bg-white"
                  >
                    <div className="min-w-0">
                      <p className="font-semibold text-slate-800 truncate">{c.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{c.email || '—'}</p>
                    </div>
                    <button
                      type="button"
                      disabled={addingId === c._id}
                      className="btn-primary text-[11px] py-1.5 px-2 shrink-0"
                      onClick={() => handleAddMember(c._id)}
                    >
                      {addingId === c._id ? '…' : 'Ajouter'}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}

      {/* Pending approvals */}
      {canManageMembers && pending.length > 0 && (
        <div className="card border border-amber-200 bg-amber-50/40">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={16} className="text-amber-500" />
            <h3 className="font-bold text-slate-700 text-sm">Demandes en attente ({pending.length})</h3>
          </div>
          <div className="flex flex-col gap-2">
            {pending.map((m) => (
              <div
                key={m._id}
                className="flex items-center justify-between bg-white rounded-xl px-4 py-2.5 border border-amber-100"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-amber-500 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {getInitials(m.name || '?')}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-slate-800">{m.name}</p>
                    <p className="text-xs text-slate-400">{m.email}</p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(m._id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-all border-none cursor-pointer"
                  >
                    <UserCheck size={13} /> Approuver
                  </button>
                  <button
                    onClick={() => handleReject(m._id)}
                    className="flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 bg-slate-100 text-slate-600 rounded-lg hover:bg-red-50 hover:text-red-600 transition-all border border-slate-200 cursor-pointer"
                  >
                    <UserX size={13} /> Rejeter
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Members list */}
      <div className="card">
        <div className="flex flex-wrap items-center gap-3 mb-5">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Rechercher un membre…"
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
              {ROLES.map((r) => (
                <option key={r}>{r}</option>
              ))}
            </select>
          </div>
          <button className="btn-outline" onClick={() => showToast('Export CSV membres')}>
            <Download size={14} /> Exporter
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                {['Membre', 'Rôle', 'Email', 'Inscrit le', ...(canManageMembers ? ['Action'] : [])].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={canManageMembers ? 5 : 4} className="text-center py-8 text-slate-400 text-sm">
                    Chargement…
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={canManageMembers ? 5 : 4} className="text-center py-8 text-slate-400 text-sm">
                    Aucun membre trouvé.
                  </td>
                </tr>
              ) : (
                filtered.map((m) => (
                  <tr key={m._id} className="border-b border-slate-50 hover:bg-green-50/40 transition-colors">
                    <td className="px-4 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                          {getInitials(m.name || '?')}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{m.name}</p>
                          {m._id === user?._id && (
                            <span className="text-[10px] bg-green-100 text-green-700 font-bold px-1.5 py-0.5 rounded">
                              Vous
                            </span>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-full ${
                          ROLE_COLORS[m.role] || 'bg-slate-100 text-slate-600'
                        }`}
                      >
                        {m.role || 'Membre'}
                      </span>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-slate-400">{m.email || '—'}</td>
                    <td className="px-4 py-3.5 text-xs text-slate-500">
                      {m.createdAt ? formatDateShort(m.createdAt) : '—'}
                    </td>
                    {canManageMembers && (
                      <td className="px-4 py-3.5">
                        {m._id !== user?._id && (
                          <button
                            onClick={() => handleRemove(m._id)}
                            className="p-1.5 rounded-lg hover:bg-red-50 text-slate-300 hover:text-red-500 transition-colors border-none bg-transparent cursor-pointer"
                            title="Retirer le membre"
                          >
                            <UserX size={15} />
                          </button>
                        )}
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
