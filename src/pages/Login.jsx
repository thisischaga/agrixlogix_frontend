import { useState } from 'react';
import { useNavigate, Link, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getApiBaseDisplay } from '../api/client';
import { User, Lock, ChevronRight, Eye, EyeOff } from 'lucide-react';
import BrandLogo from '../components/brand/BrandLogo';
import { motion } from 'framer-motion';

export default function Login() {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();

  if (user) return <Navigate to="/" replace />;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(identifier, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.error || 'Nom ou mot de passe incorrect.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-[400px]"
      >
        {/* Logo Section - Mobile Style */}
        <div className="flex flex-col items-center mb-10 text-center">
          <BrandLogo variant="hero" />
          <h1 className="text-[32px] font-[800] text-[#0F172A] tracking-tighter mt-4 leading-none">AgriLogix</h1>
          <p className="text-[13px] text-[#64748B] font-medium mt-2 leading-relaxed">
            Gérez votre coopérative du bout des doigts
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-[22px] font-[800] text-[#0F172A]">Connexion</h2>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-red-50 border border-red-100 text-red-600 text-[13px] font-semibold p-4 rounded-xl"
              >
                {error}
              </motion.div>
            )}

            <div className="space-y-1.5">
              <div className="relative group">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors group-focus-within:text-[#1B6B3A]" size={20} />
                <input
                  type="text"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-[56px] pl-12 pr-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-[#0F172A] placeholder-[#64748B] focus:outline-none focus:border-[#1B6B3A] focus:ring-1 focus:ring-[#1B6B3A] transition-all text-base font-medium"
                  placeholder="Nom complet"
                  required
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-[#64748B] transition-colors group-focus-within:text-[#1B6B3A]" size={20} />
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
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-[#64748B] hover:text-[#0F172A] transition-colors bg-transparent border-none cursor-pointer p-0"
                >
                  {showPwd ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="h-[56px] w-full bg-[#1B6B3A] hover:bg-[#15522c] disabled:opacity-50 text-white font-[700] rounded-xl flex items-center justify-center gap-2 transition-all shadow-md mt-2 border-none cursor-pointer group"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span className="text-base">Se connecter</span>
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </button>
          </form>

          <div className="text-center pt-4">
            <p className="text-[14px] font-semibold text-[#64748B]">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#1B6B3A] hover:underline">
                S'inscrire
              </Link>
            </p>
          </div>
        </div>

        <p className="text-center text-[#94A3B8] text-[11px] font-mono mt-12 tracking-wider">
          PLATFORME SÉCURISÉE · {getApiBaseDisplay()}
        </p>
      </motion.div>
    </div>
  );
}
