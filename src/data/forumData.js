// src/data/forumData.js — Données fictives du forum CoopLedger

export const forumCategories = [
  { id: 'all',          label: 'Tous',             emoji: '📋' },
  { id: 'annonces',     label: 'Annonces',         emoji: '📢' },
  { id: 'finances',     label: 'Finances',         emoji: '💰' },
  { id: 'agriculture',  label: 'Agriculture',      emoji: '🌱' },
  { id: 'vote',         label: 'Votes & Décisions',emoji: '🗳️' },
  { id: 'entraide',     label: 'Entraide',         emoji: '🤝' },
  { id: 'technique',    label: 'Technique',        emoji: '⚙️' },
];

export const forumTopics = [
  {
    id: 'f001',
    titre: "Résultats de la vente de récolte d'octobre — bilan positif !",
    categorie: 'finances',
    auteur: { nom: 'Eden Wilfried', role: 'Président', avatar: 'EW' },
    date: '2024-10-06T09:15:00',
    vues: 142,
    reponses: 8,
    reactions: { like: 14, utile: 9 },
    epingle: true,
    contenu: `Bonjour à tous les membres,

Je suis heureux de partager les résultats de notre vente de récolte d'octobre. Nous avons réalisé **850 000 FCFA** de recettes, ce qui représente une augmentation de **+23%** par rapport à octobre 2023.

Cette performance est le résultat du travail collectif de chacun d'entre vous. Les transactions sont toutes enregistrées et vérifiables sur la blockchain Polygon.

Prochaine étape : vote sur l'allocation de ces fonds. Restez attentifs à la proposition #14 !`,
    reponsesList: [
      { id: 'r001', auteur: { nom: 'Koffi Amivi', role: 'Trésorier', avatar: 'KA' }, date: '2024-10-06T10:30:00', contenu: "Excellente nouvelle ! En tant que trésorier, je confirme que tous les fonds sont sécurisés et le rapport mensuel sera disponible d'ici vendredi.", reactions: { like: 6, utile: 4 } },
      { id: 'r002', auteur: { nom: 'Ama Kodjovi', role: 'Membre', avatar: 'AK' }, date: '2024-10-06T11:45:00', contenu: "Merci pour la transparence ! C'est exactement ce qu'on attendait. Je vais voter Oui sur la proposition #14 pour les pompes d'irrigation.", reactions: { like: 3, utile: 1 } },
      { id: 'r003', auteur: { nom: 'Selorm Agbo', role: 'Membre', avatar: 'SA' }, date: '2024-10-06T14:00:00', contenu: "Super résultats ! Est-ce qu'on peut avoir la répartition par type de culture ?", reactions: { like: 2, utile: 5 } },
    ],
  },
  {
    id: 'f002',
    titre: 'Problème avec mon dépôt de cotisation — transaction en attente',
    categorie: 'technique',
    auteur: { nom: 'Yao Mensah', role: 'Membre', avatar: 'YM' },
    date: '2024-10-05T16:20:00',
    vues: 67,
    reponses: 5,
    reactions: { like: 2, utile: 11 },
    epingle: false,
    contenu: `Bonjour,

J'ai essayé de déposer ma cotisation hier soir (15 000 FCFA) mais la transaction est toujours en statut "en attente" après 12 heures. Mon hash de transaction est : **0xYM2024...**.

Est-ce que quelqu'un a eu le même problème ? Comment contacter le trésorier ?`,
    reponsesList: [
      { id: 'r004', auteur: { nom: 'Kokou Akla', role: 'Auditeur', avatar: 'KO' }, date: '2024-10-05T17:00:00', contenu: "Bonjour Yao, ce type de délai peut arriver lors de congestion du réseau. Peux-tu partager ton hash complet ? Je vais vérifier côté blockchain.", reactions: { like: 4, utile: 8 } },
      { id: 'r005', auteur: { nom: 'Koffi Amivi', role: 'Trésorier', avatar: 'KA' }, date: '2024-10-05T18:30:00', contenu: "Transaction trouvée ! Elle était en file d'attente. Elle est maintenant confirmée dans le bloc #14 592 798. Vérifiez votre tableau de bord.", reactions: { like: 7, utile: 6 } },
    ],
  },
  {
    id: 'f003',
    titre: "Conseil sur les meilleures cultures pour la saison sèche 2025",
    categorie: 'agriculture',
    auteur: { nom: 'Abla Dossou', role: 'Membre', avatar: 'AD' },
    date: '2024-10-04T08:00:00',
    vues: 98,
    reponses: 12,
    reactions: { like: 18, utile: 15 },
    epingle: false,
    contenu: `Bonjour la communauté,

Avec la saison sèche qui approche, je voudrais recueillir vos expériences sur les cultures les plus rentables dans notre région. L'année dernière j'ai essayé le sésame avec de bons résultats.

Quelles sont vos recommandations ? Certains ont-ils déjà eu recours aux nouvelles pompes solaires ?`,
    reponsesList: [
      { id: 'r006', auteur: { nom: 'Mawuli Agbeko', role: 'Membre', avatar: 'MA' }, date: '2024-10-04T09:15:00', contenu: "Le niébé est excellent en saison sèche ! Peu d'eau nécessaire et bon prix au marché. Je peux partager mes données de rendement si ça intéresse.", reactions: { like: 9, utile: 12 } },
      { id: 'r007', auteur: { nom: 'Akua Sodzi', role: 'Membre', avatar: 'AS' }, date: '2024-10-04T10:30:00', contenu: "Le gombo résiste bien aussi. Et avec les pompes d'irrigation (si la proposition #14 passe), on pourrait envisager le maraîchage toute l'année !", reactions: { like: 11, utile: 9 } },
    ],
  },
  {
    id: 'f004',
    titre: "📢 Réunion mensuelle — 15 Octobre 2024 à 10h",
    categorie: 'annonces',
    auteur: { nom: 'Eden Wilfried', role: 'Président', avatar: 'EW' },
    date: '2024-10-03T07:00:00',
    vues: 203,
    reponses: 3,
    reactions: { like: 22, utile: 8 },
    epingle: true,
    contenu: `Chers membres,

La prochaine réunion mensuelle de la Coopérative Agri-Togo aura lieu le **15 Octobre 2024 à 10h00** au siège de la coopérative.

**Ordre du jour :**
1. Bilan financier de septembre
2. Vote sur les propositions #14 et #15
3. Plan de campagne saison sèche 2025
4. Questions diverses

La présence est fortement recommandée. Les décisions prises seront enregistrées sur la blockchain.`,
    reponsesList: [
      { id: 'r008', auteur: { nom: 'Ama Kodjovi', role: 'Membre', avatar: 'AK' }, date: '2024-10-03T08:00:00', contenu: "Je serai présente ! Est-ce qu'on peut proposer des points à l'ordre du jour ?", reactions: { like: 3, utile: 2 } },
    ],
  },
  {
    id: 'f005',
    titre: "Entraide : qui peut aider au transport de la récolte ce weekend ?",
    categorie: 'entraide',
    auteur: { nom: 'Selorm Agbo', role: 'Membre', avatar: 'SA' },
    date: '2024-10-02T14:00:00',
    vues: 44,
    reponses: 6,
    reactions: { like: 8, utile: 3 },
    epingle: false,
    contenu: `Bonjour à tous,

J'ai besoin d'aide pour transporter ma récolte de maïs (environ 500 kg) depuis mon champ jusqu'au marché ce samedi matin. Est-ce que quelqu'un a un véhicule disponible ? Je peux partager les frais de carburant.

Merci d'avance !`,
    reponsesList: [
      { id: 'r009', auteur: { nom: 'Yao Mensah', role: 'Membre', avatar: 'YM' }, date: '2024-10-02T15:30:00', contenu: "J'ai ma camionnette disponible samedi matin. On peut s'organiser, envoie-moi les détails en message privé.", reactions: { like: 5, utile: 2 } },
    ],
  },
];
