import client from './client';

export const createCinetPayPayment = async (data) => {
  const response = await client.post('/payments/cinetpay/create-payment', data);
  return response.data;
};

export const submitContribution = async (coopId, data) => {
  const response = await client.post(`/cooperatives/${coopId}/contribute`, data);
  return response.data;
};

export const submitTransfer = async (coopId, data) => {
  const response = await client.post(`/cooperatives/${coopId}/transfer`, data);
  return response.data;
};

// ─── FedaPay ───────────────────────────────────────────────

/**
 * Crée une transaction FedaPay et retourne { transaction_id, token, payment_url }
 */
export const createFedaPayPayment = async (data) => {
  const response = await client.post('/payments/fedapay/create', data);
  return response.data;
};

/**
 * Vérifie le statut d'une transaction FedaPay
 */
export const verifyFedaPayTransaction = async (transactionId) => {
  const response = await client.get(`/payments/fedapay/verify/${transactionId}`);
  return response.data;
};

/**
 * Confirme manuellement une cotisation après retour FedaPay (utile en sandbox/local)
 */
export const confirmFedaPayContribution = async ({ fedapayTransactionId, cooperativeId, amount, description }) => {
  const response = await client.post('/payments/fedapay/confirm-contribution', {
    fedapayTransactionId,
    cooperativeId,
    amount,
    description,
  });
  return response.data;
};

/**
 * Effectue un paiement FedaPay direct (Mobile Money)
 */
export const createFedaPayDirectPayment = async (data) => {
  const response = await client.post('/payments/fedapay/direct', data);
  return response.data;
};

