import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export const startTour = (onComplete) => {
  const driverObj = driver({
    showProgress: true,
    nextBtnText: 'Suivant &rarr;',
    prevBtnText: '&larr; Précédent',
    doneBtnText: 'Terminer',
    steps: [
      { element: '#tour-transactions', popover: { title: 'Transactions', description: 'Enregistrez et consultez toutes les entrées et sorties de votre coopérative ici.', side: "right", align: 'start' } },
      { element: '#tour-compta', popover: { title: 'Comptabilité', description: 'Générez des rapports et consultez le bilan global de la trésorerie.', side: "right", align: 'start' } },
      { element: '#tour-coop-selector', popover: { title: 'Changer de Coopérative', description: 'Si vous appartenez à plusieurs coopératives, vous pouvez basculer entre elles ici.', side: "bottom", align: 'start' } },
      { element: '#tour-add-coop', popover: { title: 'Nouvelle Coopérative', description: 'Créez une nouvelle coopérative ou rejoignez-en une avec un code.', side: "bottom", align: 'start' } },
    ],
    onDestroyStarted: () => {
      driverObj.destroy();
      if (onComplete) onComplete();
    }
  });
  driverObj.drive();
};
