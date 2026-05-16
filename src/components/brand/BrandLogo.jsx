

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
  /** Chargement : plus grand, ombre prononcée */
  loading: {
    box: 'w-24 h-24 rounded-[32px] shadow-2xl shadow-green-600/30',
    icon: 64, // Augmenté de 48 à 64
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
      className={`bg-white flex items-center justify-center shrink-0 ${c.box} ${className}`.trim()}
      aria-hidden
    >
      <img 
        src="/logo.png" 
        alt="AgriLogix"
        style={{ width: c.icon, height: c.icon, objectFit: 'contain' }}
      />
    </div>
  );
}
