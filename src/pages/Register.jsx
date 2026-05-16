import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseDisplay } from '../api/client';
import { User, Lock, ChevronRight, Eye, EyeOff, ArrowLeft } from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';
import { motion } from 'framer-motion';

const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{8,64}$/;
const PASSWORD_HINT = '8+ caractères : majuscule, minuscule, chiffre et caractère spécial.';

export default function Register() {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [accepted, setAccepted] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Veuillez entrer votre nom complet.');
    if (password !== confirm) return setError('Les mots de passe ne correspondent pas.');
    if (!PASSWORD_REGEX.test(password)) return setError('Mot de passe trop faible. ' + PASSWORD_HINT);
    if (!accepted) return setError('Vous devez accepter les conditions pour continuer.');

    setLoading(true);
    try {
      await register({ name: name.trim(), password, acceptedTerms: true });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Impossible de créer le compte.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo Section */}
        <div className="flex flex-col items-center mb-10 text-center">
          <BrandLogo variant="hero" />
          <h1 className="text-[32px] font-[800] text-[#0F172A] tracking-tighter mt-4 leading-none">AgriLogix</h1>
          <p className="text-[13px] text-[#64748B] font-medium mt-2">Gérez votre coopérative du bout des doigts</p>
        </div>

        <div className="space-y-6">
          <div className="flex items-center gap-3">
            <Link to="/login" className="p-2 hover:bg-slate-100 rounded-full text-[#0F172A] transition-colors">
              <ArrowLeft size={20} />
            </Link>
            <h2 className="text-[22px] font-[800] text-[#0F172A]">Inscription</h2>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold p-4 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1B6B3A]" size={20} />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full h-[56px] pl-12 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all text-base font-medium"
                placeholder="Nom complet"
                required
              />
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1B6B3A]" size={20} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full h-[56px] pl-12 pr-12 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all text-base font-medium"
                placeholder="Mot de passe"
                required
              />
              <button
                type="button"
                onClick={() => setShowPwd(!showPwd)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] bg-transparent border-none cursor-pointer p-0"
              >
                {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] group-focus-within:text-[#1B6B3A]" size={20} />
              <input
                type={showPwd ? 'text' : 'password'}
                value={confirm}
                onChange={(e) => setConfirm(e.target.value)}
                className="w-full h-[56px] pl-12 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all text-base font-medium"
                placeholder="Confirmer le mot de passe"
                required
              />
            </div>

            <p className="text-[11px] text-[#64748B] leading-tight font-medium px-1">
              {PASSWORD_HINT}
            </p>

            {/* Legal Acceptance Checkbox */}
            <div className="flex items-start gap-3 p-1">
              <input 
                type="checkbox" 
                id="terms-check"
                checked={accepted}
                onChange={(e) => setAccepted(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-slate-300 text-[#1B6B3A] focus:ring-[#1B6B3A] cursor-pointer"
              />
              <label htmlFor="terms-check" className="text-[12px] text-[#64748B] leading-snug font-medium select-none cursor-pointer">
                J'accepte les <Link to="/terms" className="text-[#1B6B3A] font-bold hover:underline">Conditions Générales d'Utilisation</Link> et la <Link to="/privacy" className="text-[#1B6B3A] font-bold hover:underline">Politique de Confidentialité</Link> d'AgriLogix.
              </label>
            </div>

            <button
              type="submit"
              disabled={loading || !accepted}
              className="h-[56px] w-full bg-[#1B6B3A] hover:bg-[#15522c] disabled:opacity-50 text-white font-[700] rounded-xl flex items-center justify-center transition-all shadow-md mt-2 border-none cursor-pointer"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <span className="text-base">Créer mon compte</span>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[14px] font-semibold text-[#64748B]">
              Déjà inscrit ?{' '}
              <Link to="/login" className="text-[#1B6B3A] hover:underline">
                Se connecter
              </Link>
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
