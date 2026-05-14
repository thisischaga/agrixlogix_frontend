import React, { useState, useEffect } from 'react';
import { X, Send, User, Loader2, CheckCircle2, AlertCircle, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import client from '../../api/client';
import { submitTransfer } from '../../api/paymentApi';
import toast from 'react-hot-toast';

export default function TransferModal({ isOpen, onClose, coopId, user, onSuccess }) {
  const [step, setStep] = useState('form');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [transferType, setTransferType] = useState('member-to-member');
  const [amount, setAmount] = useState('');
  const [receiverId, setReceiverId] = useState('');
  const [reason, setReason] = useState('');
  const [members, setMembers] = useState([]);

  useEffect(() => {
    if (isOpen && coopId) {
      const fetchMembers = async () => {
        try {
          const res = await client.get(`/cooperatives/${coopId}/members`);
          setMembers(res.data.filter(m => m._id !== user?._id));
        } catch (err) {
          console.error('Error fetching members:', err);
        }
      };
      fetchMembers();
    }
  }, [isOpen, coopId, user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const res = await submitTransfer(coopId, {
        amount: Number(amount),
        receiverId,
        reason,
        transferType
      });
      toast.success('Transfert effectué avec succès !');
      setStep('success');
      if (onSuccess) onSuccess(res);
    } catch (err) {
      const msg = err.response?.data?.error || err.message;
      toast.error(`Erreur: ${msg}`);
      setError(msg);
      setStep('error');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const isAdminOrPres = user?.role === 'Admin' || user?.role === 'Président' || user?.role === 'President';

  return (
    <div className="fixed  inset-0 bg-slate-900/40 backdrop-blur-md flex items-center justify-center z-[100] p-4">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white  h-[90vh] overflow-y-auto rounded-[32px] shadow-2xl border border-slate-100 w-full max-w-lg p-8 relative"
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 rounded-full bg-slate-50 text-slate-400 hover:text-slate-600 transition-colors"
        >
          <X size={20} />
        </button>

        <AnimatePresence mode="wait">
          {step === 'form' && (
            <motion.div key="form" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="mb-8">
                <h2 className="font-display font-bold text-2xl text-slate-800 mb-2">Transférer des fonds</h2>
                <p className="text-sm text-slate-500 font-medium">Déplacez de l'argent de manière sécurisée et traçable sur Polygon.</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Type de transfert</label>
                  <div className="flex gap-2 bg-slate-50 p-1.5 rounded-2xl border border-slate-100">
                    <button 
                      type="button" 
                      onClick={() => setTransferType('member-to-member')}
                      className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${transferType === 'member-to-member' ? 'bg-white text-green-600 shadow-md shadow-green-900/5' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                      Vers un membre
                    </button>
                    {isAdminOrPres && (
                      <button 
                        type="button" 
                        onClick={() => setTransferType('coop-to-member')}
                        className={`flex-1 py-3 rounded-xl font-bold text-xs transition-all ${transferType === 'coop-to-member' ? 'bg-white text-green-600 shadow-md shadow-green-900/5' : 'text-slate-400 hover:text-slate-600'}`}
                      >
                        Depuis la Coop
                      </button>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Destinataire</label>
                  <select 
                    required 
                    className="input w-full py-4 bg-slate-50 border-transparent focus:bg-white font-medium" 
                    value={receiverId} 
                    onChange={(e) => setReceiverId(e.target.value)}
                  >
                    <option value="">Choisir un membre...</option>
                    {members.map(m => (
                      <option key={m._id} value={m._id}>{m.name} ({m.role})</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Montant (FCFA)</label>
                    <input 
                      required type="number" min="1" 
                      value={amount} onChange={(e) => setAmount(e.target.value)} 
                      className="input w-full py-4 bg-slate-50 border-transparent focus:bg-white font-bold" 
                      placeholder="Ex: 2500" 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Motif</label>
                    <input 
                      required type="text" 
                      value={reason} onChange={(e) => setReason(e.target.value)} 
                      className="input w-full py-4 bg-slate-50 border-transparent focus:bg-white font-medium text-xs" 
                      placeholder="Ex: Aide récolte..." 
                    />
                  </div>
                </div>

                <div className="bg-green-50 p-4 rounded-2xl flex gap-3 mb-6">
                  <Info size={20} className="text-green-600 shrink-0" />
                  <p className="text-[10px] text-green-700 font-semibold leading-relaxed">
                    Opération immédiate. Un hash blockchain sera généré pour l'audit.
                    {transferType === 'member-to-member' ? ` Votre solde: ${user?.balance || 0} F.` : ''}
                  </p>
                </div>

                <button 
                  type="submit" 
                  disabled={loading || !amount || !receiverId}
                  className="btn-primary w-full justify-center py-4 text-lg rounded-2xl shadow-xl shadow-green-600/20 font-bold"
                >
                  {loading ? <Loader2 className="animate-spin" /> : <Send size={20} />}
                  Envoyer les fonds
                </button>
              </form>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-green-100 text-green-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-green-600/10">
                <CheckCircle2 size={40} />
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Transfert Réussi !</h3>
              <p className="text-slate-500 font-medium mb-10 px-4">Les fonds ont été transférés instantanément et le grand livre blockchain a été mis à jour.</p>
              <button onClick={onClose} className="btn-primary w-full justify-center py-4 rounded-2xl shadow-lg font-bold">
                Fermer
              </button>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error" initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-10">
              <div className="w-20 h-20 bg-red-50 text-red-500 rounded-3xl flex items-center justify-center mx-auto mb-6">
                <AlertCircle size={40} />
              </div>
              <h3 className="font-display font-bold text-2xl text-slate-800 mb-3">Erreur de transfert</h3>
              <p className="text-slate-500 font-medium mb-10 px-4">{error}</p>
              <button onClick={() => setStep('form')} className="btn-outline w-full justify-center py-4 rounded-2xl font-bold">
                Réessayer
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
