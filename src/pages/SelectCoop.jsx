import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Building2, MapPin, Sprout, Plus, Search, ChevronRight, Clock, LogOut } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import client from '../api/client';

export default function SelectCoop() {
  const { coops, setCurrentCoop, loadCoops, logout, user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [allCoops, setAllCoops] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchAllCoops();
  }, []);

  const fetchAllCoops = async () => {
    setLoading(true);
    try {
      const res = await client.get('/cooperatives');
      setAllCoops(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (coop) => {
    // Check membership
    const isMember = coop.members?.some(m => (m._id || m) === user?._id);
    const isPending = coop.pendingMembers?.some(m => (m._id || m) === user?._id);

    if (isMember) {
      setCurrentCoop(coop);
      navigate('/');
    } else if (isPending) {
      alert('Votre demande est toujours en attente de validation.');
    } else {
      // Join request
      if (window.confirm(`Voulez-vous envoyer une demande d'adhésion à ${coop.name} ?`)) {
        try {
          await client.post(`/cooperatives/${coop._id}/join`);
          alert('Demande envoyée ! Veuillez attendre la validation d\'un administrateur.');
          fetchAllCoops();
        } catch (err) {
          alert(err.response?.data?.error || 'Erreur lors de la demande');
        }
      }
    }
  };

  const filtered = allCoops.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-[#F0FDF4] flex flex-col items-center p-6 sm:p-12">
      <div className="w-full max-w-2xl">
        <div className="flex justify-between items-center mb-10">
          <div>
            <h1 className="font-display font-bold text-3xl text-slate-800">AgriLogix</h1>
            <p className="text-slate-500 font-medium">Choisissez ou rejoignez une coopérative</p>
          </div>
          <button 
            onClick={() => { logout(); navigate('/login'); }}
            className="flex items-center gap-2 text-sm font-bold text-red-600 hover:bg-red-50 px-4 py-2 rounded-xl transition-colors bg-transparent border-none cursor-pointer"
          >
            <LogOut size={18} /> Quitter
          </button>
        </div>

        <div className="flex flex-col gap-6">
          {/* Search & Actions */}
          <div className="flex flex-wrap gap-4">
            <div className="relative flex-1 min-w-[280px]">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input 
                className="input pl-12 py-4 shadow-sm"
                placeholder="Rechercher une coopérative par nom ou ville..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <button 
              onClick={() => navigate('/ajout-cooperative')}
              className="btn-primary py-4 px-6"
            >
              <Plus size={18} /> Créer une coopérative
            </button>
          </div>

          {/* List */}
          <div className="grid grid-cols-1 gap-4">
            {loading ? (
              <div className="py-20 text-center text-slate-400 font-medium">Chargement des communautés...</div>
            ) : filtered.length === 0 ? (
              <div className="py-20 text-center card bg-white border-dashed border-2 border-slate-200">
                <p className="text-slate-400 italic">Aucune coopérative trouvée pour "{search}"</p>
              </div>
            ) : (
              filtered.map((coop, idx) => {
                const isMember = coop.members?.some(m => (m._id || m) === user?._id);
                const isPending = coop.pendingMembers?.some(m => (m._id || m) === user?._id);
                
                return (
                  <motion.div
                    key={coop._id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    onClick={() => handleSelect(coop)}
                    className={`card bg-white hover:border-green-400 cursor-pointer transition-all group flex items-center justify-between p-5 ${isMember ? 'border-l-4 border-l-green-500' : ''}`}
                  >
                    <div className="flex items-center gap-5">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${isMember ? 'bg-green-100 text-green-600' : 'bg-slate-100 text-slate-400'}`}>
                        <Building2 size={24} />
                      </div>
                      <div>
                        <h3 className="font-display font-bold text-slate-800 text-lg group-hover:text-green-700 transition-colors">{coop.name}</h3>
                        <div className="flex items-center gap-3 text-slate-400 text-xs mt-1 font-medium">
                          <span className="flex items-center gap-1"><MapPin size={12} /> {coop.location}</span>
                          <span className="flex items-center gap-1"><Sprout size={12} /> {coop.cropType || 'Poly-culture'}</span>
                          <span className="flex items-center gap-1"><Users size={12} /> {coop.members?.length || 0} membres</span>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4">
                      {isMember ? (
                        <span className="badge-green">Membre</span>
                      ) : isPending ? (
                        <span className="badge-yellow flex items-center gap-1"><Clock size={12} /> En attente</span>
                      ) : (
                        <span className="text-xs font-bold text-green-600 opacity-0 group-hover:opacity-100 transition-opacity">Rejoindre</span>
                      )}
                      <ChevronRight className="text-slate-300 group-hover:text-green-500 transition-colors" size={20} />
                    </div>
                  </motion.div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
