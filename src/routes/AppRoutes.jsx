import { Routes, Route, Navigate } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard    from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Votes        from '../pages/Votes';
import Forum        from '../pages/Forum';
import Membres      from '../pages/Membres';
import Settings     from '../pages/Settings';
import Blockchain   from '../pages/Blockchain';
import NotFound     from '../pages/NotFound';
import AjoutCooperative from '../pages/AjoutCooperative';
import Login from '../pages/Login';
import Register from '../pages/Register';
import Comptabilite from '../pages/Comptabilite';
import AjoutMembre from '../pages/AjoutMembre';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index               element={<Dashboard />} />
          <Route path="dashboard"   element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="votes"        element={<Votes />} />
          <Route path="forum"        element={<Forum />} />
          <Route path="membres"      element={<Membres />} />
          <Route path="blockchain"   element={<Blockchain />} />
          <Route path="comptabilite" element={<Comptabilite />} />
          <Route path="settings"     element={<Settings />} />
          <Route path="ajout-cooperative" element={<AjoutCooperative />} />
          <Route path="ajout-membre" element={<AjoutMembre />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
