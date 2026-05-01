// ─── MOCK DATA — CoopLedger ───────────────────────────────────────────────────
// Données fictives réalistes pour le front-end (pas de backend)

export const currentUser = {
  id: 'u001',
  nom: 'Eden Wilfried',
  role: 'Président',
  wallet: '0xD4E5F6A7B8C9...',
  avatar: 'EW',
  cooperative: 'Coopérative Agri-Togo',
  joined: '2021-03-15',
};

// ─── DASHBOARD ───────────────────────────────────────────────────────────────
export const dashboardStats = {
  tresorerie: 2450000,
  variation: 5.2,
  membres: 240,
  entrees: 1320000,
  sorties: 870000,
  totalTransactions: 7452,
  dernierBloc: '#14 592 801',
  validateurs: { actifs: 12, total: 15 },
  consensus: 'Sécurisé',
};

// ─── REVENUS VS DÉPENSES (graphique bar) ─────────────────────────────────────
export const revenueWeek = [
  { jour: 'Lun', revenus: 180000, depenses: 90000 },
  { jour: 'Mar', revenus: 220000, depenses: 130000 },
  { jour: 'Mer', revenus: 195000, depenses: 110000 },
  { jour: 'Jeu', revenus: 310000, depenses: 160000 },
  { jour: 'Ven', revenus: 380000, depenses: 200000 },
  { jour: 'Sam', revenus: 290000, depenses: 140000 },
  { jour: 'Dim', revenus: 240000, depenses: 120000 },
];

export const revenueMonth = [
  { jour: 'S1', revenus: 980000, depenses: 420000 },
  { jour: 'S2', revenus: 1150000, depenses: 580000 },
  { jour: 'S3', revenus: 870000, depenses: 390000 },
  { jour: 'S4', revenus: 1320000, depenses: 670000 },
];

// ─── DÉPENSES PAR CATÉGORIE (graphique pie) ───────────────────────────────────
export const depensesCategories = [
  { name: 'Équipement',     value: 320000, color: '#16a34a' },
  { name: 'Transport',      value: 180000, color: '#22c55e' },
  { name: 'Subventions',    value: 210000, color: '#4ade80' },
  { name: 'Fonctionnement', value: 90000,  color: '#86efac' },
  { name: 'Autres',         value: 70000,  color: '#bbf7d0' },
];

// ─── TRANSACTIONS PAR MOIS (line chart) ───────────────────────────────────────
export const transactionsParMois = [
  { mois: 'Jan', transactions: 420 },
  { mois: 'Fév', transactions: 380 },
  { mois: 'Mar', transactions: 510 },
  { mois: 'Avr', transactions: 620 },
  { mois: 'Mai', transactions: 580 },
  { mois: 'Juin', transactions: 740 },
  { mois: 'Juil', transactions: 690 },
  { mois: 'Aoû', transactions: 810 },
  { mois: 'Sep', transactions: 760 },
  { mois: 'Oct', transactions: 940 },
];

// ─── TRANSACTIONS ─────────────────────────────────────────────────────────────
export const transactions = [
  { id: 't001', type: 'credit', categorie: 'Vente',        label: 'Vente de Récolte (Export)',      hash: '0xA1F2...9B16', date: '2024-10-06T14:32:05', montant: 850000,  bloc: '#14 592 801', statut: 'validé' },
  { id: 't002', type: 'debit',  categorie: 'Équipement',   label: "Achat d'Équipement",             hash: '0xB3C4...1A32', date: '2024-10-05T16:50:10', montant: 120000,  bloc: '#14 592 800', statut: 'validé' },
  { id: 't003', type: 'credit', categorie: 'Cotisation',   label: 'Dépôt de Membre',                hash: '0xD5E6...01A4', date: '2024-10-04T11:20:33', montant: 15000,   bloc: '#14 592 799', statut: 'validé' },
  { id: 't004', type: 'debit',  categorie: 'Subvention',   label: 'Distribution de Subventions',    hash: '0xF7A8...4C9B', date: '2024-10-03T09:44:55', montant: 45000,   bloc: '#14 592 798', statut: 'validé' },
  { id: 't005', type: 'credit', categorie: 'Cotisation',   label: 'Cotisation Mensuelle — Koffi',   hash: '0xC2D3...7E1F', date: '2024-10-02T08:15:00', montant: 30000,   bloc: '#14 592 797', statut: 'validé' },
  { id: 't006', type: 'debit',  categorie: 'Transport',    label: 'Frais de Transport Cargaison',   hash: '0xE4F5...2B8C', date: '2024-10-01T15:30:22', montant: 18000,   bloc: '#14 592 796', statut: 'validé' },
  { id: 't007', type: 'credit', categorie: 'Vente',        label: 'Vente Cacao — Marché Local',     hash: '0xA9B1...5D2E', date: '2024-09-30T10:05:44', montant: 420000,  bloc: '#14 592 795', statut: 'validé' },
  { id: 't008', type: 'debit',  categorie: 'Fonctionnement', label: 'Facture Électricité Entrepôt', hash: '0xC3D4...6E3F', date: '2024-09-29T13:20:11', montant: 12000,   bloc: '#14 592 794', statut: 'validé' },
  { id: 't009', type: 'credit', categorie: 'Cotisation',   label: 'Dépôt Membre — Ama Kodjovi',    hash: '0xE5F6...7A4B', date: '2024-09-28T09:00:00', montant: 15000,   bloc: '#14 592 793', statut: 'validé' },
  { id: 't010', type: 'debit',  categorie: 'Équipement',   label: 'Réparation Tracteur Communautaire', hash: '0xB7C8...8D5E', date: '2024-09-27T14:45:30', montant: 65000, bloc: '#14 592 792', statut: 'validé' },
  { id: 't011', type: 'credit', categorie: 'Vente',        label: 'Export Maïs — IFAD Partenariat', hash: '0xD9E1...9F6G', date: '2024-09-26T11:30:00', montant: 680000, bloc: '#14 592 791', statut: 'validé' },
  { id: 't012', type: 'debit',  categorie: 'Subvention',   label: 'Prime Saisonnière Membres',      hash: '0xF2A3...1H7I', date: '2024-09-25T08:00:00', montant: 200000, bloc: '#14 592 790', statut: 'validé' },
];

// ─── PROPOSITIONS DE VOTE ─────────────────────────────────────────────────────
export const propositions = [
  {
    id: 14,
    titre: 'Proposition Active #14',
    description: "Allouer 500 000 FCFA du fonds de réserve commun pour l'achat de 5 nouvelles pompes d'irrigation solaires pour le secteur est de la coopérative.",
    montant: 500000,
    oui: 88,
    non: 32,
    votesOui: 40,
    votesNon: 28,
    totalVotants: 68,
    quorum: 120,
    statut: 'ouvert',
    deadline: '2024-10-09T23:59:00',
    auteur: 'Koffi Amivi',
    type: 'Dépense',
  },
  {
    id: 15,
    titre: 'Proposition Active #15',
    description: "Réduire la cotisation mensuelle des membres de 15% pour soutenir les petits producteurs pendant la saison sèche.",
    montant: 0,
    oui: 65,
    non: 55,
    votesOui: 51,
    votesNon: 43,
    totalVotants: 94,
    quorum: 120,
    statut: 'ouvert',
    deadline: '2024-10-12T23:59:00',
    auteur: 'Eden Wilfried',
    type: 'Politique',
  },
];

// ─── HISTORIQUE VOTES ─────────────────────────────────────────────────────────
export const historiqueVotes = [
  { id: '#13', label: 'Achat Tracteur Communautaire',    resultat: 'Approuvé', pct: '82%', date: '12 Sep. 2023', type: 'success' },
  { id: '#12', label: 'Changement Partenaire Logistique', resultat: 'Rejeté',  pct: '60%', date: '16 Août 2023', type: 'error'   },
  { id: '#11', label: 'Augmentation des cotisations',    resultat: 'Approuvé', pct: '71%', date: '3 Juil. 2023', type: 'success' },
  { id: '#10', label: 'Construction Silo de Stockage',   resultat: 'Approuvé', pct: '89%', date: '20 Mai 2023',  type: 'success' },
  { id: '#9',  label: 'Partenariat Banque Agricole',     resultat: 'Rejeté',   pct: '44%', date: '5 Avr. 2023',  type: 'error'   },
];

// ─── MEMBRES ──────────────────────────────────────────────────────────────────
export const membres = [
  { id: 'm001', nom: 'Koffi Amivi',    role: 'Trésorier',  wallet: '0xA1B2C3...', statut: 'Actif',   cotisation: 'À jour',   joined: '2020-01-10' },
  { id: 'm002', nom: 'Eden Wilfried',  role: 'Président',  wallet: '0xD4E5F6...', statut: 'Actif',   cotisation: 'À jour',   joined: '2020-01-10' },
  { id: 'm003', nom: 'Ama Kodjovi',    role: 'Membre',     wallet: '0xG7H8I9...', statut: 'Actif',   cotisation: 'À jour',   joined: '2020-03-15' },
  { id: 'm004', nom: 'Yao Mensah',     role: 'Membre',     wallet: '0xJ1K2L3...', statut: 'Actif',   cotisation: 'En retard',joined: '2020-05-22' },
  { id: 'm005', nom: 'Akua Sodzi',     role: 'Membre',     wallet: '0xM4N5O6...', statut: 'Actif',   cotisation: 'À jour',   joined: '2021-01-08' },
  { id: 'm006', nom: 'Kokou Akla',     role: 'Auditeur',   wallet: '0xP7Q8R9...', statut: 'Actif',   cotisation: 'À jour',   joined: '2021-04-11' },
  { id: 'm007', nom: 'Efua Kpodo',     role: 'Membre',     wallet: '0xS1T2U3...', statut: 'Inactif', cotisation: 'En retard',joined: '2021-07-30' },
  { id: 'm008', nom: 'Selorm Agbo',    role: 'Membre',     wallet: '0xV4W5X6...', statut: 'Actif',   cotisation: 'À jour',   joined: '2022-02-14' },
  { id: 'm009', nom: 'Abla Dossou',    role: 'Membre',     wallet: '0xY7Z8A9...', statut: 'Actif',   cotisation: 'À jour',   joined: '2022-06-01' },
  { id: 'm010', nom: 'Mawuli Agbeko',  role: 'Membre',     wallet: '0xB1C2D3...', statut: 'Actif',   cotisation: 'En retard',joined: '2023-01-20' },
];
