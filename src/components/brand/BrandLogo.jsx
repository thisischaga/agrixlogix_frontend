

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
      className={`bg-green-600 flex items-center justify-center shrink-0 ${c.box} ${className}`.trim()}
      aria-hidden
    >
      <svg 
        width={c.icon} 
        height={c.icon} 
        viewBox="0 0 100 100" 
        fill="none" 
        xmlns="http://www.w3.org/2000/svg"
        className="scale-125" // Zoom global sur le dessin
      >
        <circle cx="35" cy="35" r="3" fill="white" fillOpacity="0.4"/>
        <circle cx="65" cy="35" r="3" fill="white" fillOpacity="0.4"/>
        <circle cx="50" cy="75" r="3" fill="white" fillOpacity="0.4"/>
        <path d="M35 35L65 35L50 75L35 35" stroke="white" strokeWidth="1.5" strokeOpacity="0.2" strokeDasharray="2 2"/>
        <g transform="translate(25, 25)">
          <path d="M25 45V15" stroke="white" strokeWidth="4" strokeLinecap="round"/>
          <path d="M25 25C35 25 45 15 45 5C35 5 25 15 25 25Z" fill="white"/>
          <path d="M25 35C15 35 5 25 5 15C15 15 25 25 25 35Z" fill="white" fillOpacity="0.8"/>
          <circle cx="25" cy="15" r="5" fill="#16A34A" stroke="white" strokeWidth="2"/>
        </g>
      </svg>
    </div>
  );
}
