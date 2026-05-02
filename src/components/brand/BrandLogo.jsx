import { Sprout } from 'lucide-react';

const variants = {
  /** Sidebar : même style arrondi qu’Auth, proportions réduites */
  sidebar: {
    box: 'w-10 h-10 rounded-2xl shadow-md shadow-green-900/15',
    icon: 20,
  },
  /** Connexion / inscription : identique aux pages Auth */
  hero: {
    box: 'w-16 h-16 rounded-2xl shadow-lg shadow-green-900/15',
    icon: 30,
  },
};

/**
 * Logo AgriLogix (pousse Sprout — aligné avec Login / Register).
 * @param {{ variant?: 'sidebar' | 'hero', className?: string }} props
 */
export default function BrandLogo({ variant = 'sidebar', className = '' }) {
  const c = variants[variant] ?? variants.sidebar;
  return (
    <div
      className={`bg-green-600 flex items-center justify-center shrink-0 ${c.box} ${className}`.trim()}
      aria-hidden
    >
      <Sprout size={c.icon} className="text-white" strokeWidth={2} />
    </div>
  );
}
