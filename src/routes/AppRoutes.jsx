import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import ProtectedRoute from '../components/auth/ProtectedRoute';
import Dashboard    from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Votes        from '../pages/Votes';
import Forum        from '../pages/Forum';
import Membres      from '../pages/Membres';
import Settings     from '../pages/Settings';
import NotFound     from '../pages/NotFound';
import AjoutCooperative from '../pages/AjoutCooperative';
import Login from '../pages/Login';
import Register from '../pages/Register';

export default function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Protected — ProtectedRoute renders <Outlet />, DashboardLayout is the layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route index               element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="votes"        element={<Votes />} />
          <Route path="forum"        element={<Forum />} />
          <Route path="membres"      element={<Membres />} />
          <Route path="settings"     element={<Settings />} />
          <Route path="ajout-cooperative" element={<AjoutCooperative />} />
        </Route>
      </Route>

      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
