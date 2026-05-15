// src/layouts/DashboardLayout.jsx
import { useState } from 'react';
import { Outlet, useLocation, Navigate } from 'react-router-dom';
import Sidebar from '../components/ui/Sidebar';
import Topbar from '../components/ui/Topbar';
import Toast from '../components/ui/Toast';
import { useToast } from '../utils/useToast';
import { useAuth } from '../context/AuthContext';

const pageMeta = {
  '/': { title: 'Tableau de bord', subtitle: 'Vue d\'ensemble de la coopérative' },
  '/transactions': { title: 'Transactions', subtitle: 'Historique complet et vérifiable des transactions' },
  '/votes': { title: 'Gouvernance & Vote', subtitle: 'Participez aux décisions de la coopérative' },
  '/forum': { title: 'Forum Coopérative', subtitle: 'Espace de discussion entre membres' },
  '/membres': { title: 'Membres', subtitle: 'Membres de la coopérative' },
  '/comptabilite': { title: 'Comptabilité', subtitle: 'Gestion financière, journal et bilan' },
  '/settings': { title: 'Paramètres', subtitle: 'Préférences et compte' },
  '/ajout-cooperative': { title: 'Nouvelle coopérative', subtitle: 'Créer ou compléter l’adhésion' },
};

export default function DashboardLayout() {
  const location = useLocation();
  const { user, currentCoop, loading } = useAuth();
  
  const { toast, showToast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Restriction : Si pas de coop et pas sur Dashboard/Settings/AjoutCoop, on redirige vers AjoutCoop
  const isPublicPage = ['/', '/settings', '/ajout-cooperative'].includes(location.pathname);
  if (!loading && !currentCoop?._id && !isPublicPage) {
    return <Navigate to="/ajout-cooperative" replace />;
  }

  const metaBase = pageMeta[location.pathname] || { title: 'AgriLogix', subtitle: '' };
  const firstName = user?.name?.trim?.().split(/\s+/)[0];
  const subtitle =
    location.pathname === '/' && firstName
      ? `Bon retour, ${firstName}`
      : metaBase.subtitle;
  const meta = { ...metaBase, subtitle };

  return (
    <div className="flex min-h-screen bg-green-50 no-scrollbar">
      <button
        type="button"
        aria-label={sidebarOpen ? 'Fermer le menu' : 'Fond pour fermer le menu'}
        className={[
          'fixed inset-0 z-40 bg-black/40 transition-opacity lg:hidden',
          sidebarOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setSidebarOpen(false)}
      />

      <Sidebar mobileOpen={sidebarOpen} onNavigate={() => setSidebarOpen(false)} />

      <div className="flex flex-1 flex-col min-h-screen w-full lg:ml-[220px]">
        <Topbar
          title={meta.title}
          subtitle={meta.subtitle}
          onMenuClick={() => setSidebarOpen(true)}
        />

        <main className="flex-1 px-4 py-5 sm:px-6 lg:px-7 lg:py-7 max-w-[1600px] w-full mx-auto">
          <Outlet context={{ showToast }} />
        </main>
      </div>

      <Toast toast={toast} />
    </div>
  );
}
