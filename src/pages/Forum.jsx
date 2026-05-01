// src/pages/Forum.jsx
import { useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import {
  Search, Plus, MessageSquare, Eye, ThumbsUp, Lightbulb,
  Pin, ChevronLeft, X, Send, Users,
} from 'lucide-react';

import { forumCategories, forumTopics } from '../data/forumData';
import { currentUser } from '../data/mockData';
import { getInitials } from '../utils/formatCurrency';

// ─── Utilitaires ─────────────────────────────────────────────────────────────
function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime();
  const min  = Math.floor(diff / 60000);
  const h    = Math.floor(min / 60);
  const d    = Math.floor(h / 24);
  if (d > 0)  return `il y a ${d}j`;
  if (h > 0)  return `il y a ${h}h`;
  if (min > 0) return `il y a ${min}min`;
  return 'à l\'instant';
}

function categoryLabel(id) {
  return forumCategories.find((c) => c.id === id) || { label: id, emoji: '📋' };
}

// ─── Avatar ───────────────────────────────────────────────────────────────────
function Avatar({ nom, size = 'sm' }) {
  const s = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${s} bg-green-600 rounded-full flex items-center justify-center text-white font-bold shrink-0`}>
      {getInitials(nom)}
    </div>
  );
}

// ─── Badge catégorie ──────────────────────────────────────────────────────────
function CategoryBadge({ categorieId }) {
  const cat = categoryLabel(categorieId);
  return (
    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 bg-green-50 text-green-700 text-xs font-semibold rounded-full border border-green-100">
      {cat.emoji} {cat.label}
    </span>
  );
}

// ─── Boutons réaction ─────────────────────────────────────────────────────────
function ReactionBar({ reactions, onReact, myReactions = {} }) {
  return (
    <div className="flex gap-2">
      <button
        onClick={() => onReact('like')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          myReactions.like
            ? 'bg-green-600 text-white border-green-600'
            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-green-400 hover:text-green-600'
        }`}
      >
        <ThumbsUp size={12} /> {reactions.like}
      </button>
      <button
        onClick={() => onReact('utile')}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all duration-200 cursor-pointer ${
          myReactions.utile
            ? 'bg-amber-500 text-white border-amber-500'
            : 'bg-slate-50 text-slate-500 border-slate-200 hover:border-amber-400 hover:text-amber-600'
        }`}
      >
        <Lightbulb size={12} /> Utile {reactions.utile}
      </button>
    </div>
  );
}

// ─── Modal Nouveau Sujet ──────────────────────────────────────────────────────
function NewTopicModal({ onClose, onCreate }) {
  const [titre, setTitre]       = useState('');
  const [categorie, setCategorie] = useState('finances');
  const [contenu, setContenu]   = useState('');

  const handleSubmit = () => {
    if (!titre.trim() || !contenu.trim()) return;
    onCreate({ titre, categorie, contenu });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 className="font-display font-bold text-slate-800 text-base">Nouveau Sujet</h2>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 border-none bg-transparent cursor-pointer transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div className="flex flex-col gap-4 px-6 py-5 overflow-y-auto">
          {/* Catégorie */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Catégorie</label>
            <select
              className="input cursor-pointer appearance-none"
              value={categorie}
              onChange={(e) => setCategorie(e.target.value)}
            >
              {forumCategories.filter(c => c.id !== 'all').map((c) => (
                <option key={c.id} value={c.id}>{c.emoji} {c.label}</option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Titre du sujet</label>
            <input
              className="input"
              placeholder="Décrivez votre sujet en une phrase..."
              value={titre}
              onChange={(e) => setTitre(e.target.value)}
              maxLength={120}
            />
            <p className="text-xs text-slate-400 mt-1 text-right">{titre.length}/120</p>
          </div>

          {/* Contenu */}
          <div>
            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-1.5">Message</label>
            <textarea
              className="input min-h-[120px] resize-none"
              placeholder="Détaillez votre sujet ici..."
              value={contenu}
              onChange={(e) => setContenu(e.target.value)}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex gap-3 px-6 py-4 border-t border-slate-100">
          <button onClick={onClose} className="btn-outline flex-1 justify-center">Annuler</button>
          <button
            onClick={handleSubmit}
            disabled={!titre.trim() || !contenu.trim()}
            className="btn-primary flex-1 justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Send size={14} /> Publier
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Vue détail d'un sujet ────────────────────────────────────────────────────
function TopicDetail({ topic, onBack, onReact, reactions, myReactions, showToast }) {
  const [replyText, setReplyText]   = useState('');
  const [localReplies, setLocalReplies] = useState(topic.reponsesList || []);

  const handleReply = () => {
    if (!replyText.trim()) return;
    const newReply = {
      id: `r-${Date.now()}`,
      auteur: { nom: currentUser.nom, role: currentUser.role, avatar: getInitials(currentUser.nom) },
      date: new Date().toISOString(),
      contenu: replyText,
      reactions: { like: 0, utile: 0 },
    };
    setLocalReplies((r) => [...r, newReply]);
    setReplyText('');
    showToast('Réponse publiée ✓');
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Retour */}
      <button onClick={onBack} className="flex items-center gap-2 text-sm text-slate-500 font-semibold hover:text-green-600 bg-transparent border-none cursor-pointer w-fit transition-colors">
        <ChevronLeft size={16} /> Retour au forum
      </button>

      {/* Post principal */}
      <div className="card">
        <div className="flex items-start gap-3 mb-4">
          <Avatar nom={topic.auteur.nom} size="md" />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-slate-800 text-sm">{topic.auteur.nom}</span>
              <span className="badge-gray text-[10px]">{topic.auteur.role}</span>
              {topic.epingle && <span className="badge-blue text-[10px]"><Pin size={9} /> Épinglé</span>}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">{timeAgo(topic.date)}</p>
          </div>
          <CategoryBadge categorieId={topic.categorie} />
        </div>

        <h1 className="font-display font-bold text-slate-800 text-lg mb-4 leading-snug">{topic.titre}</h1>

        {/* Contenu avec support markdown basique */}
        <div className="text-sm text-slate-600 leading-relaxed whitespace-pre-line mb-5">
          {topic.contenu.replace(/\*\*(.*?)\*\*/g, '$1')}
        </div>

        {/* Stats + réactions */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100">
          <div className="flex items-center gap-4 text-xs text-slate-400">
            <span className="flex items-center gap-1"><Eye size={12} /> {topic.vues} vues</span>
            <span className="flex items-center gap-1"><MessageSquare size={12} /> {localReplies.length} réponses</span>
          </div>
          <ReactionBar
            reactions={reactions[topic.id] || topic.reactions}
            onReact={(type) => onReact(topic.id, type)}
            myReactions={myReactions[topic.id] || {}}
          />
        </div>
      </div>

      {/* Réponses */}
      {localReplies.length > 0 && (
        <div className="flex flex-col gap-3">
          <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{localReplies.length} Réponse(s)</p>
          {localReplies.map((r) => (
            <div key={r.id} className="card border-l-4 border-l-green-200">
              <div className="flex items-start gap-3 mb-3">
                <Avatar nom={r.auteur.nom} />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-slate-800 text-sm">{r.auteur.nom}</span>
                    <span className="badge-gray text-[10px]">{r.auteur.role}</span>
                  </div>
                  <p className="text-xs text-slate-400">{timeAgo(r.date)}</p>
                </div>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-3">{r.contenu}</p>
              <ReactionBar
                reactions={r.reactions}
                onReact={(type) => showToast(`Réaction "${type}" enregistrée`)}
              />
            </div>
          ))}
        </div>
      )}

      {/* Zone de réponse */}
      <div className="card">
        <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Votre réponse</p>
        <div className="flex items-start gap-3">
          <Avatar nom={currentUser.nom} />
          <div className="flex-1">
            <textarea
              className="input resize-none min-h-[90px]"
              placeholder="Écrivez votre réponse..."
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
            />
            <div className="flex justify-end mt-2">
              <button
                className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                onClick={handleReply}
                disabled={!replyText.trim()}
              >
                <Send size={14} /> Répondre
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Card d'un sujet (liste) ──────────────────────────────────────────────────
function TopicCard({ topic, onClick }) {
  return (
    <div
      onClick={onClick}
      className="card hover:border-green-300 hover:shadow-md cursor-pointer transition-all duration-200 group"
    >
      <div className="flex items-start gap-3">
        <Avatar nom={topic.auteur.nom} />
        <div className="flex-1 min-w-0">
          {/* Titre */}
          <div className="flex items-start gap-2 flex-wrap mb-1">
            {topic.epingle && (
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-green-600 mt-0.5">
                <Pin size={9} /> Épinglé
              </span>
            )}
            <h3 className="font-display font-semibold text-slate-800 text-sm group-hover:text-green-700 transition-colors leading-snug">
              {topic.titre}
            </h3>
          </div>

          {/* Meta */}
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <CategoryBadge categorieId={topic.categorie} />
            <span className="text-xs text-slate-400">par <strong className="text-slate-600">{topic.auteur.nom}</strong></span>
            <span className="text-xs text-slate-400">{timeAgo(topic.date)}</span>
          </div>

          {/* Extrait */}
          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
            {topic.contenu.replace(/\*\*(.*?)\*\*/g, '$1').slice(0, 150)}...
          </p>
        </div>

        {/* Stats */}
        <div className="flex flex-col items-end gap-2 shrink-0 ml-2">
          <div className="flex items-center gap-3 text-xs text-slate-400">
            <span className="flex items-center gap-1"><MessageSquare size={11} /> {topic.reponses}</span>
            <span className="flex items-center gap-1"><Eye size={11} /> {topic.vues}</span>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <span className="flex items-center gap-1"><ThumbsUp size={10} /> {topic.reactions.like}</span>
            <span className="flex items-center gap-1"><Lightbulb size={10} /> {topic.reactions.utile}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PAGE PRINCIPALE ─────────────────────────────────────────────────────────
export default function Forum() {
  const { showToast } = useOutletContext();

  const [search,       setSearch]       = useState('');
  const [categorie,    setCategorie]    = useState('all');
  const [selectedTopic, setSelectedTopic] = useState(null);
  const [showModal,    setShowModal]    = useState(false);
  const [topics,       setTopics]       = useState(forumTopics);

  // Réactions locales
  const [reactions,   setReactions]   = useState({});
  const [myReactions, setMyReactions] = useState({});

  // Filtrage
  const filtered = topics.filter((t) => {
    const matchSearch = t.titre.toLowerCase().includes(search.toLowerCase())
      || t.contenu.toLowerCase().includes(search.toLowerCase());
    const matchCat = categorie === 'all' || t.categorie === categorie;
    return matchSearch && matchCat;
  });

  // Épinglés en premier
  const sorted = [...filtered].sort((a, b) => (b.epingle ? 1 : 0) - (a.epingle ? 1 : 0));

  const handleReact = (topicId, type) => {
    const already = myReactions[topicId]?.[type];
    setMyReactions((prev) => ({
      ...prev,
      [topicId]: { ...(prev[topicId] || {}), [type]: !already },
    }));
    const base = reactions[topicId] || topics.find(t => t.id === topicId)?.reactions || {};
    setReactions((prev) => ({
      ...prev,
      [topicId]: { ...base, [type]: (base[type] || 0) + (already ? -1 : 1) },
    }));
    if (!already) showToast(`Réaction "${type}" enregistrée ✓`);
  };

  const handleCreate = ({ titre, categorie: cat, contenu }) => {
    const newTopic = {
      id: `f${Date.now()}`,
      titre,
      categorie: cat,
      auteur: { nom: currentUser.nom, role: currentUser.role, avatar: getInitials(currentUser.nom) },
      date: new Date().toISOString(),
      vues: 1,
      reponses: 0,
      reactions: { like: 0, utile: 0 },
      epingle: false,
      contenu,
      reponsesList: [],
    };
    setTopics((prev) => [newTopic, ...prev]);
    showToast('Sujet publié avec succès ✓');
  };

  // Vue détail
  if (selectedTopic) {
    return (
      <TopicDetail
        topic={selectedTopic}
        onBack={() => setSelectedTopic(null)}
        onReact={handleReact}
        reactions={reactions}
        myReactions={myReactions}
        showToast={showToast}
      />
    );
  }

  return (
    <>
      <div className="flex flex-col gap-5">

        {/* ── Header stats ── */}
        <div className="grid grid-cols-3 gap-4">
          {[
            { label: 'Sujets actifs',  value: topics.length,                                        icon: <MessageSquare size={16} className="text-green-600" />, bg: 'bg-green-100' },
            { label: 'Membres actifs', value: 18,                                                   icon: <Users size={16} className="text-blue-500" />,          bg: 'bg-blue-100'  },
            { label: 'Réactions',      value: topics.reduce((a, t) => a + t.reactions.like + t.reactions.utile, 0), icon: <ThumbsUp size={16} className="text-amber-500" />, bg: 'bg-amber-100' },
          ].map(({ label, value, icon, bg }) => (
            <div key={label} className="card flex items-center gap-3">
              <div className={`w-10 h-10 ${bg} rounded-xl flex items-center justify-center shrink-0`}>{icon}</div>
              <div>
                <p className="font-display font-bold text-slate-800 text-xl">{value}</p>
                <p className="text-xs text-slate-400 font-semibold">{label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative flex-1 min-w-[220px]">
            <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              className="input pl-10"
              placeholder="Rechercher un sujet..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <button className="btn-primary" onClick={() => setShowModal(true)}>
            <Plus size={16} /> Nouveau Sujet
          </button>
        </div>

        {/* ── Filtres catégories ── */}
        <div className="flex flex-wrap gap-2">
          {forumCategories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setCategorie(cat.id)}
              className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold border-none cursor-pointer transition-all duration-200 ${
                categorie === cat.id
                  ? 'bg-green-600 text-white'
                  : 'bg-white text-slate-500 border border-slate-200 hover:border-green-400 hover:text-green-600'
              }`}
            >
              {cat.emoji} {cat.label}
            </button>
          ))}
        </div>

        {/* ── Liste sujets ── */}
        <div className="flex flex-col gap-3">
          {sorted.length === 0 ? (
            <div className="card text-center py-16 text-slate-400">
              <MessageSquare size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-semibold">Aucun sujet trouvé</p>
              <p className="text-xs mt-1">Soyez le premier à lancer la discussion !</p>
            </div>
          ) : (
            sorted.map((topic) => (
              <TopicCard
                key={topic.id}
                topic={topic}
                onClick={() => setSelectedTopic(topic)}
              />
            ))
          )}
        </div>
      </div>

      {/* ── Modal nouveau sujet ── */}
      {showModal && (
        <NewTopicModal
          onClose={() => setShowModal(false)}
          onCreate={handleCreate}
        />
      )}
    </>
  );
}
