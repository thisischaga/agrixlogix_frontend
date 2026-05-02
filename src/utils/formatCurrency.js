// ─── Utilitaires de formatage ─────────────────────────────────────────────────

/**
 * Formate un montant en FCFA
 * @param {number} amount
 * @param {boolean} withSign - afficher + pour les positifs
 * @returns {string}
 */
export function formatCurrency(amount, withSign = false) {
  const formatted = new Intl.NumberFormat('fr-FR').format(Math.abs(amount));
  if (withSign) {
    return amount >= 0 ? `+${formatted} FCFA` : `-${formatted} FCFA`;
  }
  return `${formatted} FCFA`;
}

/**
 * Formate une date ISO en français
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDate(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Formate une date courte
 * @param {string} isoDate
 * @returns {string}
 */
export function formatDateShort(isoDate) {
  return new Date(isoDate).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

/**
 * Retourne les initiales d'un nom
 * @param {string} nom
 * @returns {string}
 */
export function getInitials(nom) {
  if (!nom?.trim?.()) return '?';
  return nom
    .split(/\s+/)
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || '?';
}

/**
 * Tronque un hash blockchain
 * @param {string} hash
 * @returns {string}
 */
export function shortHash(hash) {
  if (!hash) return '';
  return hash.length > 16 ? `${hash.slice(0, 10)}...${hash.slice(-6)}` : hash;
}
