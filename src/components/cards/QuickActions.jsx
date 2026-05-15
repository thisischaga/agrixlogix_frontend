import React from 'react';
import { Link } from 'react-router-dom';
import { Send, Download, ClipboardList, UserPlus, CreditCard, BookOpen } from 'lucide-react';

export default function QuickActions({ onContribute, onTransfer }) {
  const actions = [
    {
      id: 'contribute',
      onClick: onContribute,
      label: 'Cotiser',
      sub: 'Payer ma cotisation annuelle',
      icon: CreditCard,
      bg: 'bg-green-50/80',
      iconBg: 'bg-green-200',
      text: 'text-green-950',
    },
    /* {
      id: 'transfer',
      onClick: onTransfer,
      label: 'Transférer',
      sub: 'Envoi sécurisé vers un membre',
      icon: Send,
      bg: 'bg-emerald-50/90',
      iconBg: 'bg-emerald-200',
      text: 'text-emerald-950',
    }, */
    {
      id: 'withdraw',
      href: '/transactions',
      label: 'Demander un retrait',
      sub: 'Soumettre une sortie au comité',
      icon: Download,
      bg: 'bg-amber-50',
      iconBg: 'bg-amber-200',
      text: 'text-amber-950',
    },
    {
      id: 'accounting',
      href: '/comptabilite',
      label: 'Comptabilité',
      sub: 'Bilan et journal financier',
      icon: BookOpen,
      bg: 'bg-violet-50',
      iconBg: 'bg-violet-200',
      text: 'text-violet-950',
    },
    {
      id: 'propose',
      href: '/votes',
      label: 'Créer une proposition',
      sub: 'Soumettre un vote aux membres',
      icon: ClipboardList,
      bg: 'bg-sky-50',
      iconBg: 'bg-sky-200',
      text: 'text-sky-950',
    },
  ];

  return (
    <div className="card h-full flex flex-col shadow-xl shadow-green-900/[0.03]">
      <h3 className="font-display font-bold text-slate-800 text-base mb-4">Actions rapides</h3>
      <div className="flex flex-col gap-2.5 flex-1">
        {actions.map(({ id, href, onClick, label, sub, icon: Icon, bg, iconBg, text }) => {
          if (onClick) {
            return (
              <button
                key={id}
                onClick={onClick}
                className={`flex items-center gap-3 p-4 rounded-2xl ${bg} ${text} w-full text-left no-underline transition-all duration-200 hover:brightness-[0.98] hover:shadow-md border border-black/[0.04] cursor-pointer`}
              >
                <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                  <Icon size={18} strokeWidth={2.25} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-bold">{label}</p>
                  <p className="text-xs opacity-80 mt-0.5 leading-snug">{sub}</p>
                </div>
              </button>
            );
          }
          return (
            <Link
              key={id}
              to={href}
              className={`flex items-center gap-3 p-4 rounded-2xl ${bg} ${text} w-full text-left no-underline transition-all duration-200 hover:brightness-[0.98] hover:shadow-md border border-black/[0.04] cursor-pointer`}
            >
              <div className={`w-10 h-10 ${iconBg} rounded-xl flex items-center justify-center shrink-0 shadow-sm`}>
                <Icon size={18} strokeWidth={2.25} />
              </div>
              <div className="min-w-0">
                <p className="text-sm font-bold">{label}</p>
                <p className="text-xs opacity-80 mt-0.5 leading-snug">{sub}</p>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
