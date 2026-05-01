// src/components/cards/QuickActions.jsx
import { Send, Download, PlusCircle } from 'lucide-react';

const actions = [
  {
    id: 'send',
    label: 'Envoyer des fonds',
    sub: 'Transférer vers un membre',
    icon: Send,
    bg: 'bg-green-50',
    iconBg: 'bg-green-200',
    text: 'text-green-800',
    toast: 'Formulaire envoi de fonds ouvert',
  },
  {
    id: 'withdraw',
    label: 'Demander un retrait',
    sub: 'Soumettre une demande',
    icon: Download,
    bg: 'bg-amber-50',
    iconBg: 'bg-amber-200',
    text: 'text-amber-800',
    toast: 'Formulaire de retrait ouvert',
  },
  {
    id: 'propose',
    label: 'Créer une proposition',
    sub: 'Soumettre au vote',
    icon: PlusCircle,
    bg: 'bg-blue-50',
    iconBg: 'bg-blue-200',
    text: 'text-blue-800',
    toast: 'Formulaire de proposition ouvert',
  },
];

export default function QuickActions({ onAction }) {
  return (
    <div className="card">
      <h3 className="font-display font-bold text-slate-800 text-base mb-4">Actions Rapides</h3>
      <div className="flex flex-col gap-2.5">
        {actions.map(({ id, label, sub, icon: Icon, bg, iconBg, text, toast }) => (
          <button
            key={id}
            onClick={() => onAction?.(toast)}
            className={`flex items-center gap-3 p-3.5 rounded-xl ${bg} ${text} w-full text-left border-none cursor-pointer transition-all duration-200 hover:translate-x-1 hover:brightness-95`}
          >
            <div className={`w-9 h-9 ${iconBg} rounded-lg flex items-center justify-center shrink-0`}>
              <Icon size={16} />
            </div>
            <div>
              <p className="text-sm font-semibold">{label}</p>
              <p className="text-xs opacity-70">{sub}</p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
