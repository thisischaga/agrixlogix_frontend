// src/components/ui/Sidebar.jsx
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, ArrowLeftRight, Vote, Users, Settings, Leaf, MessageSquare,
} from 'lucide-react';
import { currentUser } from '../../data/mockData';
import { getInitials } from '../../utils/formatCurrency';

const navItems = [
  { to: '/',             label: 'Tableau de bord', icon: LayoutDashboard },
  { to: '/transactions', label: 'Transactions',    icon: ArrowLeftRight   },
  { to: '/votes',        label: 'Vote',             icon: Vote             },
  { to: '/forum',        label: 'Forum',            icon: MessageSquare    },
  { to: '/membres',      label: 'Membres',          icon: Users            },
  { to: '/settings',     label: 'Paramètres',       icon: Settings         },
];

export default function Sidebar() {
  return (
    <aside className="fixed top-0 left-0 h-screen w-[220px] bg-green-950 flex flex-col z-50">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-6 border-b border-white/10">
        <div className="w-9 h-9 bg-green-600 rounded-xl flex items-center justify-center shrink-0">
          <Leaf size={18} className="text-white" />
        </div>
        <div>
          <p className="font-display font-bold text-white text-base leading-tight">Agrilogix</p>
          <p className="text-green-400 text-[10px] font-semibold">● Connecté</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-5 flex flex-col gap-1">
        {navItems.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `nav-item ${isActive ? 'active' : ''}`
            }
          >
            <Icon size={17} />
            {label}
          </NavLink>
        ))}
      </nav>

      {/* User */}
      <div className="p-3 border-t border-white/10">
        <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl hover:bg-white/5 transition-colors cursor-pointer">
          <div className="w-8 h-8 bg-green-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
            {getInitials(currentUser.nom)}
          </div>
          <div className="min-w-0">
            <p className="text-white text-xs font-semibold truncate">{currentUser.nom}</p>
            <p className="text-green-400 text-[10px]">{currentUser.role}</p>
          </div>
          <div className="w-2 h-2 bg-green-400 rounded-full ml-auto shrink-0 shadow-[0_0_6px_#4ade80]" />
        </div>
      </div>
    </aside>
  );
}
