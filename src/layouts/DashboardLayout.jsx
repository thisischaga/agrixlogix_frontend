// src/layouts/DashboardLayout.jsx
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import Topbar from '../components/ui/Topbar';
import Toast from '../components/ui/Toast';
import { useToast } from '../utils/useToast';

// Map route → titre/sous-titre
const pageMeta = {
  '/':             { title: 'Tableau de bord',   subtitle: 'Vue d\'ensemble de la coopérative' },
  '/transactions': { title: 'Transactions',       subtitle: 'Historique complet et vérifiable des transactions' },
  '/votes':        { title: 'Gouvernance & Vote', subtitle: 'Participez aux décisions de la coopérative' },
  '/forum':        { title: 'Forum Coopérative',  subtitle: 'Espace de discussion et d\'entraide des membres' },
  '/membres':      { title: 'Membres',            subtitle: 'Gestion des membres de la coopérative' },
  '/settings':     { title: 'Paramètres',         subtitle: 'Vos préférences et informations de compte' },
};

export default function DashboardLayout() {
  const location = useLocation();
  const { title, subtitle } = pageMeta[location.pathname] || { title: 'Agrilogix', subtitle: '' };
  const { toast, showToast } = useToast();

  return (
    <div className="flex min-h-screen bg-green-50">
      <Sidebar />

      {/* Main — décalé de la largeur de la sidebar */}
      <div className="ml-[220px] flex-1 flex flex-col min-h-screen">
        <Topbar title={title} subtitle={subtitle} />

        <main className="flex-1 p-7">
          {/* On passe showToast aux pages via context outlet */}
          <Outlet context={{ showToast }} />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
