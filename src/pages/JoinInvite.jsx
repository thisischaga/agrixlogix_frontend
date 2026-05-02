import { useState, useEffect, useCallback } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { MapPin, Sprout, Loader2, ArrowRight, LogIn } from 'lucide-react';
import client from '../api/client';
import BrandLogo from '../components/brand/BrandLogo';
import { useAuth } from '../context/AuthContext';

export default function JoinInvite() {
  const [params] = useSearchParams();
  const token = params.get('invite')?.trim() || '';
  const { user, loadCoops } = useAuth();
  const navigate = useNavigate();

  const [info, setInfo] = useState(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(true);
  const [joining, setJoining] = useState(false);

  const fetchInfo = useCallback(async () => {
    if (!token) {
      setErr('Lien incomplet : ajoutez ?invite=…');
      setLoading(false);
      return;
    }
    setErr('');
    setLoading(true);
    try {
      const res = await client.get(`/invite/${encodeURIComponent(token)}/info`);
      setInfo(res.data);
    } catch (e) {
      setInfo(null);
      setErr(e.response?.data?.error || 'Invitation introuvable.');
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchInfo();
  }, [fetchInfo]);

  const handleJoin = async () => {
    if (!token || !user) return;
    setJoining(true);
    setErr('');
    try {
      await client.post('/cooperatives/join-with-invite', { token });
      try {
        await loadCoops?.();
      } catch {
        /* la suite ne dépend pas forcément du reload des coops */
      }
      navigate('/', { replace: true });
    } catch (e) {
      setErr(e.response?.data?.error || 'Impossible de rejoindre pour le moment.');
    } finally {
      setJoining(false);
    }
  };

  const fromPath = `/rejoindre?invite=${encodeURIComponent(token)}`;

  return (
    <div className="min-h-screen bg-green-50/80 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg border border-slate-100 p-8">
        <div className="flex justify-center mb-4">
          <BrandLogo variant="hero" />
        </div>
        <h1 className="text-xl font-bold text-center text-slate-900 mb-2">Rejoindre une coopérative</h1>
        <p className="text-sm text-slate-500 text-center mb-6">
          Vous avez été invité·e à faire une demande d&apos;adhésion. Un administrateur validera votre demande.
        </p>

        {loading && (
          <div className="flex justify-center py-10 text-green-700 gap-2">
            <Loader2 className="animate-spin" size={22} /> Chargement…
          </div>
        )}

        {!loading && err && (
          <div className="rounded-xl bg-red-50 border border-red-100 text-red-700 text-sm p-4 mb-4">{err}</div>
        )}

        {!loading && info && (
          <div className="rounded-xl border border-slate-100 bg-slate-50 p-5 mb-6">
            <p className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-1">Coopérative</p>
            <p className="text-lg font-bold text-slate-900">{info.name}</p>
            <div className="flex flex-wrap gap-3 mt-3 text-xs text-slate-600">
              {info.location && (
                <span className="inline-flex items-center gap-1">
                  <MapPin size={13} /> {info.location}
                </span>
              )}
              {info.cropType && (
                <span className="inline-flex items-center gap-1">
                  <Sprout size={13} /> {info.cropType}
                </span>
              )}
            </div>
          </div>
        )}

        {!loading && token && info && (
          <>
            {user ? (
              <button
                type="button"
                disabled={joining}
                className="btn-primary w-full justify-center"
                onClick={handleJoin}
              >
                {joining ? <Loader2 size={18} className="animate-spin" /> : <ArrowRight size={18} />}
                Envoyer ma demande d&apos;adhésion
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  state={{ from: fromPath }}
                  className="btn-primary w-full justify-center text-center no-underline inline-flex gap-2"
                >
                  <LogIn size={18} /> Me connecter et demander à rejoindre
                </Link>
                <Link
                  to="/register"
                  state={{ from: fromPath }}
                  className="btn-outline w-full justify-center text-center no-underline"
                >
                  Créer un compte
                </Link>
              </div>
            )}
          </>
        )}

        <p className="text-center mt-6 text-xs text-slate-400">
          <Link to="/login" className="text-green-700 font-semibold hover:underline">
            Connexion
          </Link>{' '}
          ·{' '}
          <Link to="/" className="text-slate-500 hover:underline">
            Accueil
          </Link>
        </p>
      </div>
    </div>
  );
}
