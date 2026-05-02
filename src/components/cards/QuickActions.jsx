// Actions rapides → routes réelles (transactions / votes / membres)
import { Link } from 'react-router-dom';
import { Send, Download, ClipboardList, UserPlus } from 'lucide-react';

const actions = [
  {
    id: 'send',
    to: '/transactions',
    label: 'Envoyer des fonds',
    sub: 'Transférer ou enregistrer une entrée',
    icon: Send,
    bg: 'bg-emerald-50/90',
    iconBg: 'bg-emerald-200',
    text: 'text-emerald-950',
  },
  {
    id: 'withdraw',
    to: '/transactions',
    label: 'Demander un retrait',
    sub: 'Soumettre une sortie au comité',
    icon: Download,
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-200',
    text: 'text-amber-950',
  },
  {
    id: 'propose',
    to: '/votes',
    label: 'Créer une proposition',
    sub: 'Soumettre un vote aux membres',
    icon: ClipboardList,
    bg: 'bg-sky-50',
    iconBg: 'bg-sky-200',
    text: 'text-sky-950',
  },
  {
    id: 'add-member',
    to: '/membres',
    label: 'Ajouter un membre',
    sub: 'Inviter un agriculteur ou valider',
    icon: UserPlus,
    bg: 'bg-purple-50',
    iconBg: 'bg-purple-200',
    text: 'text-purple-950',
  },
];

export default function QuickActions() {
  return (
    <div className="card h-full flex flex-col shadow-xl shadow-green-900/[0.03]">
      <h3 className="font-display font-bold text-slate-800 text-base mb-4">Actions rapides</h3>
      <div className="flex flex-col gap-2.5 flex-1">
        {actions.map(({ id, to, label, sub, icon: Icon, bg, iconBg, text }) => (
          <Link
            key={id}
            to={to}
            className={`flex items-center gap-3 p-4 rounded-2xl ${bg} ${text} w-full text-left no-underline transition-all duration-200 hover:brightness-[0.98] hover:shadow-md border border-black/[0.04]`}
          >
            <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
              <Icon size={18} strokeWidth={2.25} />
            </div>
            <div className="min-w-0">
              <p className="text-sm font-bold">{label}</p>
              <p className="text-xs opacity-80 mt-0.5 leading-snug">{sub}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
