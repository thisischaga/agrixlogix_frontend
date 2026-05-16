import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = (onComplete) => {
  const driverObj = driver({
    showProgress: true,
    nextBtnText: 'Suivant &rarr;',
    prevBtnText: '&larr; Précédent',
    doneBtnText: 'Terminer',
    steps: [
      { element: '#tour-dashboard', popover: { title: 'Tableau de bord', description: 'Votre centre de contrôle avec les statistiques clés de la coopérative.', side: "right", align: 'start' } },
      { element: '#tour-treasury', popover: { title: 'Trésorerie Totale', description: 'Consultez le solde global de la coopérative et son évolution ce mois-ci.', side: "bottom", align: 'start' } },
      { element: '#tour-personal', popover: { title: 'Solde Personnel', description: 'Voici le montant total de vos propres cotisations versées à la coopérative.', side: "bottom", align: 'start' } },
      { element: '#tour-transactions', popover: { title: 'Transactions', description: 'Enregistrez vos entrées et sorties. Tout est ancré dans la Blockchain.', side: "right", align: 'start' } },
      { element: '#tour-comptabilite', popover: { title: 'Comptabilité', description: 'Générez des rapports financiers complets et le journal de caisse.', side: "right", align: 'start' } },
      { element: '#tour-audit', popover: { title: 'Audit Blockchain', description: 'Vérifiez l\'intégrité des données et exportez des rapports d\'audit certifiés.', side: "top", align: 'start' } },
      { element: '#tour-actions', popover: { title: 'Actions Rapides', description: 'Cotisez ou effectuez des transferts en quelques clics.', side: "top", align: 'start' } },
      { element: '#tour-coop-selector', popover: { title: 'Sélecteur de Coop', description: 'Basculez facilement entre vos différentes coopératives ici.', side: "bottom", align: 'start' } },
      { element: '#tour-notifications', popover: { title: 'Notifications', description: 'Restez informé des nouveaux votes, messages et transactions.', side: "bottom", align: 'end' } },
      { element: '#tour-profile', popover: { title: 'Votre Profil', description: 'Gérez vos informations personnelles et vos préférences de compte.', side: "bottom", align: 'end' } },
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
      if (onComplete) onComplete();
    }
  });
  driverObj.drive();
};
