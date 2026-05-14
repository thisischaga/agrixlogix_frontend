import React, { useState } from 'react';
import { X, Loader2, CheckCircle2, AlertCircle, ShieldCheck, Zap, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { createFedaPayPayment, createFedaPayDirectPayment } from '../../api/paymentApi';
import toast from 'react-hot-toast';

const FEDAPAY_SESSION_KEY = 'fedapay_pending';

const QUICK_AMOUNTS = [1000, 2500, 5000, 10000, 25000];

export default function ContributionModal({ isOpen, onClose, coopId, user, onSuccess }) {
  const [step, setStep] = useState('form');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [method, setMethod] = useState('direct'); // 'direct' or 'redirect'
  const [phone, setPhone] = useState(user?.phone || '');
  const [operator, setOperator] = useState('mtn_tg');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const reset = () => { setStep('form'); setAmount(''); setNote(''); setError(null); };
  const handleClose = () => { reset(); onClose(); };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt < 100) { toast.error('Montant minimum : 100 FCFA'); return; }

    setLoading(true);
    setError(null);
    setStep('loading');

    try {
      const description = note.trim()
        ? `Cotisation – ${note.trim()} (${user?.name || 'Membre'})`
        : `Cotisation de ${user?.name || 'Membre'}`;

      if (method === 'redirect') {
        const paymentData = await createFedaPayPayment({ amount: amt, description, cooperativeId: coopId });
        if (!paymentData.payment_url) throw new Error('URL de paiement non reçue');
        
        sessionStorage.setItem(FEDAPAY_SESSION_KEY, JSON.stringify({
          transaction_id: paymentData.transaction_id,
          amount: amt,
          coopId,
          description,
        }));

        toast.loading('Redirection vers FedaPay…');
        window.location.href = paymentData.payment_url;
      } else {
        // Paiement direct
        await createFedaPayDirectPayment({ 
          amount: amt, 
          description, 
          cooperativeId: coopId,
          phoneNumber: phone,
          mode: operator
        });
        
        toast.success('Paiement initié ! Veuillez confirmer sur votre téléphone.');
        setStep('success');
      }
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(`Erreur : ${msg}`);
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div
        initial={{ scale: 0.92, opacity: 0, y: 24 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 280, damping: 26 }}
        className="bg-white  h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-md relative overflow-hidden"
      >
        {/* Header gradient band */}
        <div className="h-1.5 w-full bg-gradient-to-r from-violet-500 via-purple-500 to-indigo-500" />

        <div className="p-8">
          <button
            onClick={handleClose}
            className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-700 transition-colors"
          >
            <X size={18} />
          </button>

          <AnimatePresence mode="wait">

            {/* ── FORMULAIRE ─────────────────────────────────── */}
            {step === 'form' && (
              <motion.div key="form" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                {/* Titre */}
                <div className="flex items-center gap-3 mb-7">
                  <div className="w-11 h-11 rounded-2xl bg-violet-100 flex items-center justify-center text-violet-600 shadow-sm">
                    <Zap size={22} />
                  </div>
                  <div>
                    <h2 className="font-display font-bold text-xl text-slate-800 leading-tight">Cotiser</h2>
                    <p className="text-xs text-slate-400 font-medium mt-0.5">Paiement sécurisé via FedaPay</p>
                  </div>
                </div>

                <div className="flex bg-slate-100 p-1 rounded-2xl mb-6">
                  <button 
                    type="button"
                    onClick={() => setMethod('direct')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'direct' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}
                  >
                    Mobile Money
                  </button>
                  <button 
                    type="button"
                    onClick={() => setMethod('redirect')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all ${method === 'redirect' ? 'bg-white shadow-sm text-violet-600' : 'text-slate-500'}`}
                  >
                    Carte / Redirection
                  </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                  {/* Montant */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Montant (FCFA)</label>
                    <div className="relative">
                      <input
                        required type="number" min="100"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="input w-full py-4 text-2xl font-bold pr-20 text-slate-800 focus:ring-violet-500"
                        placeholder="0"
                      />
                      <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm font-bold text-violet-400">FCFA</span>
                    </div>
                    {/* Montants rapides */}
                    <div className="flex flex-wrap gap-2 pt-1">
                      {QUICK_AMOUNTS.map((q) => (
                        <button
                          key={q} type="button"
                          onClick={() => setAmount(String(q))}
                          className={`px-3 py-1.5 rounded-xl text-xs font-bold border-2 transition-all ${
                            Number(amount) === q
                              ? 'border-violet-600 bg-violet-50 text-violet-700'
                              : 'border-slate-100 text-slate-500 hover:border-violet-200 hover:text-violet-600'
                          }`}
                        >
                          {q.toLocaleString('fr-FR')}
                        </button>
                      ))}
                    </div>
                  </div>

                  {method === 'direct' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Opérateur</label>
                        <div className="grid grid-cols-2 gap-3">
                          <button 
                            type="button"
                            onClick={() => setOperator('mtn_tg')}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${operator === 'mtn_tg' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 text-slate-500'}`}
                          >
                            <span className="font-bold text-sm">T-Money</span>
                            <span className="text-[10px] opacity-60">Togo</span>
                          </button>
                          <button 
                            type="button"
                            onClick={() => setOperator('mtn_bj')}
                            className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-1 ${operator === 'mtn_bj' ? 'border-violet-600 bg-violet-50 text-violet-700' : 'border-slate-100 text-slate-500'}`}
                          >
                            <span className="font-bold text-sm">MTN Bénin</span>
                            <span className="text-[10px] opacity-60">Bénin</span>
                          </button>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Numéro Mobile Money</label>
                        <input
                          required type="tel"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          className="input w-full py-4 text-lg font-bold"
                          placeholder="Ex: 90 00 00 00"
                        />
                      </div>
                    </div>
                  )}

                  {/* Note optionnelle */}
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Note / motif (optionnel)</label>
                    <input
                      type="text" maxLength={80}
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      className="input w-full py-3 text-sm"
                      placeholder="Ex : Cotisation annuelle 2026"
                    />
                  </div>

                  {/* Récapitulatif */}
                  <div className="bg-violet-50 border border-violet-100 rounded-2xl p-4 space-y-2">
                    <div className="flex justify-between text-xs font-semibold text-violet-700">
                      <span>Montant</span>
                      <span className="font-bold">{amount ? Number(amount).toLocaleString('fr-FR') : '—'} FCFA</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-violet-700">
                      <span>Méthode</span>
                      <span className="flex items-center gap-1.5"><Zap size={12} /> FedaPay</span>
                    </div>
                    <div className="flex justify-between text-xs font-semibold text-violet-700">
                      <span>Membre</span>
                      <span>{user?.name || '—'}</span>
                    </div>
                    <p className="text-[10px] text-violet-500 pt-1">
                      Vous serez redirigé vers FedaPay pour choisir votre mode de paiement (Flooz, T-Money, Carte…)
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loading || !amount || Number(amount) < 100}
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 shadow-lg shadow-violet-600/25 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {loading ? <Loader2 size={20} className="animate-spin" /> : <><Zap size={18} /> Payer via FedaPay <ArrowRight size={16} /></>}
                  </button>
                </form>
              </motion.div>
            )}

            {/* ── CHARGEMENT ─────────────────────────────────── */}
            {step === 'loading' && (
              <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="text-center py-12">
                <div className="relative w-20 h-20 mx-auto mb-8">
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}
                    className="absolute inset-0 border-4 border-violet-100 border-t-violet-600 rounded-full"
                  />
                  <div className="absolute inset-0 flex items-center justify-center text-violet-600">
                    <ShieldCheck size={30} />
                  </div>
                </div>
                <h3 className="font-display font-bold text-xl text-slate-800 mb-2">Préparation du paiement…</h3>
                <p className="text-sm text-slate-400 px-4">Connexion sécurisée à FedaPay en cours.</p>
              </motion.div>
            )}

            {/* ── SUCCÈS ─────────────────────────────────────── */}
            {step === 'success' && (
              <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/10">
                  <CheckCircle2 size={40} />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Cotisation enregistrée !</h3>
                <p className="text-slate-500 font-medium mb-8 px-4">
                  Votre cotisation de <strong className="text-green-600">{Number(amount).toLocaleString('fr-FR')} FCFA</strong> a été confirmée et scellée dans le registre.
                </p>
                <button onClick={handleClose} className="w-full py-4 rounded-2xl font-bold text-white bg-gradient-to-r from-green-600 to-emerald-600 shadow-lg">
                  Retour au dashboard
                </button>
              </motion.div>
            )}

            {/* ── ERREUR ─────────────────────────────────────── */}
            {step === 'error' && (
              <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
                <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                  <AlertCircle size={40} />
                </div>
                <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Échec du paiement</h3>
                <p className="text-slate-500 font-medium mb-8 px-4 text-sm">{error}</p>
                <button onClick={reset} className="w-full py-4 rounded-2xl font-bold border-2 border-slate-200 text-slate-700 hover:border-violet-300 transition-colors">
                  Réessayer
                </button>
              </motion.div>
            )}

          </AnimatePresence>
        </div>
      </motion.div>
    </div>
  );
}
