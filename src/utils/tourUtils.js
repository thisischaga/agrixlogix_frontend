import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = (onComplete) => {
  const driverObj = driver({
    showProgress: true,
    animate: true,
    overlayColor: 'rgba(15, 23, 42, 0.8)',
    nextBtnText: 'Suivant',
    prevBtnText: 'Précédent',
    doneBtnText: 'Terminer',
    stagePadding: 8,
    steps: [
      { 
        element: '#tour-dashboard', 
        popover: { 
          title: 'Tableau de Bord', 
          description: 'C\'est ici que vous pilotez votre coopérative. Un aperçu global de la santé financière et de l\'activité des membres.', 
          side: "right", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-treasury', 
        popover: { 
          title: 'Trésorerie Collective', 
          description: 'Le cœur financier de votre communauté. Ce montant est protégé et vérifiable à tout moment.', 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-personal', 
        popover: { 
          title: 'Votre Solde', 
          description: 'Le cumul de vos contributions personnelles. C\'est votre épargne au sein de la coopérative.', 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-transactions', 
        popover: { 
          title: 'Registre Blockchain', 
          description: 'Chaque centime qui entre ou sort est enregistré de manière immuable. La transparence totale garantie.', 
          side: "right", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-comptabilite', 
        popover: { 
          title: 'Intelligence Financière', 
          description: 'Générez des rapports comptables professionnels en un clic. Prêt pour les audits et les assemblées générales.', 
          side: "right", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-audit', 
        popover: { 
          title: 'Certification Audit', 
          description: 'Vérifiez par vous-même l\'intégrité mathématique de vos données grâce au nœud blockchain agrilogix.', 
          side: "top", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-actions', 
        popover: { 
          title: 'Actions Rapides', 
          description: 'Besoin de cotiser ou de faire un transfert ? Tout se passe ici, simplement et rapidement.', 
          side: "top", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-coop-selector', 
        popover: { 
          title: 'Gestion Multi-Coop', 
          description: 'Si vous appartenez à plusieurs coopératives, vous pouvez basculer de l\'une à l\'autre instantanément.', 
          side: "bottom", 
          align: 'start' 
        } 
      },
      { 
        element: '#tour-notifications', 
        popover: { 
          title: 'Centre d\'Alertes', 
          description: 'Ne manquez aucune activité importante : nouveaux votes, transactions ou messages du forum.', 
          side: "bottom", 
          align: 'end' 
        } 
      },
      { 
        element: '#tour-profile', 
        popover: { 
          title: 'Votre Identité Numérique', 
          description: 'Gérez vos informations et sécurisez votre accès à la plateforme.', 
          side: "bottom", 
          align: 'end' 
        } 
      },
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
      if (onComplete) onComplete();
    }
  });
  driverObj.drive();
};
