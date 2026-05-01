// src/routes/AppRoutes.jsx
import { Routes, Route } from 'react-router-dom';
import DashboardLayout from '../layouts/DashboardLayout';
import Dashboard    from '../pages/Dashboard';
import Transactions from '../pages/Transactions';
import Votes        from '../pages/Votes';
import Forum        from '../pages/Forum';
import Membres      from '../pages/Membres';
import Settings     from '../pages/Settings';
import NotFound     from '../pages/NotFound';
import AjoutCooperative from '../pages/AjoutCooperative';

export default function AppRoutes() {
  return (
    <Routes>
      <Route element={<DashboardLayout />}>
        <Route index            element={<Dashboard />}    />
        <Route path="transactions" element={<Transactions />} />
        <Route path="votes"        element={<Votes />}        />
        <Route path="forum"        element={<Forum />}        />
        <Route path="membres"      element={<Membres />}      />
        <Route path="settings"     element={<Settings />}     />
        <Route path="ajout-cooperative" element={<AjoutCooperative />} /> 
      </Route>
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
}
