import { parsePhoneNumberFromString } from 'libphonenumber-js';

/**
 * Liste complète des opérateurs Mobile Money en Afrique
 * Utilisée pour la validation et le choix du moyen de règlement
 */
export const AFRICAN_COUNTRIES = [
  {
    name: 'Togo',
    code: 'TG',
    dialCode: '+228',
    operators: [
      { id: 'tg_tmoney', name: 'Togocom (TMoney)', prefix: ['90', '91', '92', '93', '70'], color: '#EE7F00' },
      { id: 'tg_moov', name: 'Moov (Flooz)', prefix: ['98', '99', '97', '79'], color: '#005CAB' }
    ]
  },
  {
    name: 'Bénin',
    code: 'BJ',
    dialCode: '+229',
    operators: [
      { id: 'bj_mtn', name: 'MTN Mobile Money', prefix: ['61', '62', '66', '67', '69', '90', '91', '96', '97', '51', '52', '53', '54'], color: '#FFCC00' },
      { id: 'bj_moov', name: 'Moov Money', prefix: ['94', '95', '60', '63', '64', '65', '68'], color: '#005CAB' },
      { id: 'bj_celtiis', name: 'Celtiis', prefix: ['40', '41', '42'], color: '#E30613' }
    ]
  },
  {
    name: 'Côte d\'Ivoire',
    code: 'CI',
    dialCode: '+225',
    operators: [
      { id: 'ci_orange', name: 'Orange Money', prefix: ['07', '08', '09', '47', '48', '49', '57', '58', '59', '67', '68', '69', '77', '78', '79', '87', '88', '89', '97', '98'], color: '#FF7900' },
      { id: 'ci_mtn', name: 'MTN MoMo', prefix: ['05', '45', '55', '65', '75', '85', '95'], color: '#FFCC00' },
      { id: 'ci_moov', name: 'Moov Money', prefix: ['01', '41', '51', '71'], color: '#005CAB' },
      { id: 'ci_wave', name: 'Wave', prefix: ['07', '05', '01'], color: '#1E90FF' }
    ]
  },
  {
    name: 'Sénégal',
    code: 'SN',
    dialCode: '+221',
    operators: [
      { id: 'sn_orange', name: 'Orange Money', prefix: ['77', '78'], color: '#FF7900' },
      { id: 'sn_free', name: 'Free Money', prefix: ['76'], color: '#EE3524' },
      { id: 'sn_expresso', name: 'Expresso (e-money)', prefix: ['70'], color: '#005CAB' },
      { id: 'sn_wave', name: 'Wave', prefix: ['77', '78', '76', '70'], color: '#1E90FF' }
    ]
  },
  {
    name: 'Cameroun',
    code: 'CM',
    dialCode: '+237',
    operators: [
      { id: 'cm_mtn', name: 'MTN Mobile Money', prefix: ['67', '68', '650', '651', '652', '653', '654'], color: '#FFCC00' },
      { id: 'cm_orange', name: 'Orange Money', prefix: ['69', '655', '656', '657', '658', '659'], color: '#FF7900' }
    ]
  },
  {
    name: 'Burkina Faso',
    code: 'BF',
    dialCode: '+226',
    operators: [
      { id: 'bf_orange', name: 'Orange Money', prefix: ['07', '06', '77', '76', '67', '66', '57', '56'], color: '#FF7900' },
      { id: 'bf_moov', name: 'Moov Money', prefix: ['02', '01', '72', '71', '62', '61', '52', '51'], color: '#005CAB' }
    ]
  },
  {
    name: 'Mali',
    code: 'ML',
    dialCode: '+223',
    operators: [
      { id: 'ml_orange', name: 'Orange Money', prefix: ['7', '8', '9'], color: '#FF7900' },
      { id: 'ml_moov', name: 'Moov Money', prefix: ['6'], color: '#005CAB' }
    ]
  },
  {
    name: 'Guinée',
    code: 'GN',
    dialCode: '+224',
    operators: [
      { id: 'gn_orange', name: 'Orange Money', prefix: ['62'], color: '#FF7900' },
      { id: 'gn_mtn', name: 'MTN Mobile Money', prefix: ['66'], color: '#FFCC00' }
    ]
  },
  {
    name: 'Ghana',
    code: 'GH',
    dialCode: '+233',
    operators: [
      { id: 'gh_mtn', name: 'MTN Mobile Money', prefix: ['24', '54', '55', '59'], color: '#FFCC00' },
      { id: 'gh_vodafone', name: 'Vodafone Cash', prefix: ['20', '50'], color: '#E60000' },
      { id: 'gh_airteltigo', name: 'AirtelTigo Money', prefix: ['26', '27', '56', '57'], color: '#005CAB' }
    ]
  },
  {
    name: 'Gabon',
    code: 'GA',
    dialCode: '+241',
    operators: [
      { id: 'ga_airtel', name: 'Airtel Money', prefix: ['74', '77', '4'], color: '#FF0000' },
      { id: 'ga_moov', name: 'Moov Money', prefix: ['62', '65', '66'], color: '#005CAB' }
    ]
  },
  {
    name: 'Niger',
    code: 'NE',
    dialCode: '+227',
    operators: [
      { id: 'ne_airtel', name: 'Airtel Money', prefix: ['99', '98', '97', '96'], color: '#FF0000' },
      { id: 'ne_moov', name: 'Moov Money', prefix: ['91', '90', '89'], color: '#005CAB' }
    ]
  },
  {
    name: 'Tchad',
    code: 'TD',
    dialCode: '+235',
    operators: [
      { id: 'td_airtel', name: 'Airtel Money', prefix: ['66', '63', '60'], color: '#FF0000' },
      { id: 'td_moov', name: 'Moov Money (Tigo Cash)', prefix: ['99', '95', '90'], color: '#005CAB' }
    ]
  },
  {
    name: 'Kenya',
    code: 'KE',
    dialCode: '+254',
    operators: [
      { id: 'ke_mpesa', name: 'Safaricom M-Pesa', prefix: ['70', '71', '72', '74', '79', '11'], color: '#16A34A' },
      { id: 'ke_airtel', name: 'Airtel Money', prefix: ['73', '75', '78'], color: '#FF0000' }
    ]
  },
  {
    name: 'Ouganda',
    code: 'UG',
    dialCode: '+256',
    operators: [
      { id: 'ug_mtn', name: 'MTN Mobile Money', prefix: ['77', '78', '76'], color: '#FFCC00' },
      { id: 'ug_airtel', name: 'Airtel Money', prefix: ['70', '75', '74'], color: '#FF0000' }
    ]
  },
  {
    name: 'Rwanda',
    code: 'RW',
    dialCode: '+250',
    operators: [
      { id: 'rw_mtn', name: 'MTN Mobile Money', prefix: ['78', '79'], color: '#FFCC00' },
      { id: 'rw_airtel', name: 'Airtel Money', prefix: ['72', '73'], color: '#FF0000' }
    ]
  }
];

// Ajouter "Autre" à chaque pays dynamiquement pour la flexibilité
AFRICAN_COUNTRIES.forEach(c => {
  c.operators.push({ id: `${c.code.toLowerCase()}_other`, name: 'Autre', prefix: [], color: '#64748B' });
});

/** Détecte l'opérateur Mobile Money localement */
export const detectOperator = (phone, countryCode) => {
  if (!phone || phone.length < 2) return null;
  let cleanPhone = phone.replace(/\s/g, '').replace(/^\+\d{1,3}/, '');
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

  const country = AFRICAN_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return null;

  return country.operators.find(op => op.prefix.some(p => cleanPhone.startsWith(p))) || null;
};

/** Valide si un numéro appartient à un opérateur spécifique d'un pays */
export const validateOperatorNumber = (phone, countryCode, operatorId) => {
  const country = AFRICAN_COUNTRIES.find(c => c.code === countryCode);
  if (!country) return { valid: false, error: 'Pays non supporté' };

  const operator = country.operators.find(op => op.id === operatorId);
  if (!operator) return { valid: false, error: 'Opérateur non supporté' };

  let cleanPhone = phone.replace(/\s/g, '').replace(/^\+\d{1,3}/, '');
  if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);

  // Pour "Autre", on valide juste le format général du numéro pour le pays
  if (operator.name === 'Autre') {
    try {
      const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
      if (!phoneNumber || !phoneNumber.isValid()) {
         const localPhone = parsePhoneNumberFromString(country.dialCode + cleanPhone);
         return localPhone && localPhone.isValid() ? { valid: true, formatted: localPhone.formatInternational() } : { valid: false, error: 'Format invalide' };
      }
      return { valid: true, formatted: phoneNumber.formatInternational() };
    } catch(e) { return { valid: false, error: 'Format invalide' }; }
  }

  const hasValidPrefix = operator.prefix.some(p => cleanPhone.startsWith(p));
  if (!hasValidPrefix) return { valid: false, error: `Ce numéro ne semble pas appartenir à ${operator.name}` };

  try {
    const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
    if (!phoneNumber || !phoneNumber.isValid()) {
      const localPhone = parsePhoneNumberFromString(country.dialCode + cleanPhone);
      if (!localPhone || !localPhone.isValid()) {
        // Fallback permissif si libphonenumber rejette mais que le préfixe et la taille (8-15) sont bons
        if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
           return { valid: true, formatted: `${country.dialCode} ${cleanPhone}` };
        }
        return { valid: false, error: 'Format de numéro invalide' };
      }
      return { valid: true, formatted: localPhone.formatInternational() };
    }
    return { valid: true, formatted: phoneNumber.formatInternational() };
  } catch (e) {
    if (cleanPhone.length >= 8 && cleanPhone.length <= 15) {
       return { valid: true, formatted: `${country.dialCode} ${cleanPhone}` };
    }
    return { valid: false, error: 'Erreur de validation' };
  }
};

/** Valide un numéro de téléphone internationalement */
export const validatePhone = (phone, countryCode = 'TG') => {
  try {
    const phoneNumber = parsePhoneNumberFromString(phone, countryCode);
    if (!phoneNumber) return { valid: false, error: 'Format invalide' };
    return {
      valid: phoneNumber.isValid(),
      formatted: phoneNumber.formatInternational(),
      country: phoneNumber.country,
      type: phoneNumber.getType()
    };
  } catch (e) {
    return { valid: false, error: 'Erreur de validation' };
  }
};

/** Valide un compte bancaire (IBAN ou format local) */
export const validateBankAccount = (accountNum) => {
  if (!accountNum || accountNum.length < 5) return { valid: false, error: 'Numéro de compte trop court' };
  const ibanRegex = /^[A-Z0-9]{5,34}$/i;
  const clean = accountNum.replace(/[\s-]/g, '');
  if (!ibanRegex.test(clean)) return { valid: false, error: 'Format invalide' };
  return { valid: true, formatted: clean.toUpperCase() };
};
