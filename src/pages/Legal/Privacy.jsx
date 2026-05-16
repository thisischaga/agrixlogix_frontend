import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Eye, Database, Share2, Key, HelpCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Privacy() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="bg-emerald-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <ShieldCheck size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold">Politique de Confidentialité</h1>
          </div>
          <p className="text-emerald-50 opacity-90">Dernière mise à jour : 16 Mai 2026</p>
        </div>

        <div className="p-8 sm:p-12 space-y-10 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Eye className="text-emerald-600" size={24} />
              1. Collecte des Données
            </h2>
            <p>
              Nous collectons les données nécessaires au bon fonctionnement de votre coopérative : nom complet, numéro de téléphone, historique des cotisations et participations aux votes. Ces données sont collectées lors de votre inscription et de vos activités sur la plateforme.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Database className="text-emerald-600" size={24} />
              2. Utilisation des Données
            </h2>
            <p>
              Vos données sont utilisées exclusivement pour :
            </p>
            <ul className="list-disc pl-6 mt-2 space-y-2">
              <li>Assurer la gestion administrative de votre coopérative.</li>
              <li>Générer des rapports financiers transparents pour tous les membres.</li>
              <li>Vous envoyer des notifications importantes concernant la vie de la coopérative.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Share2 className="text-emerald-600" size={24} />
              3. Partage des Données
            </h2>
            <p>
              agrilogix ne vend jamais vos données à des tiers. Les hachages de transactions (données anonymisées) sont partagés sur la blockchain publique pour garantir l'auditabilité financière. Seuls les membres autorisés de votre propre coopérative ont accès à vos détails financiers complets.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Key className="text-emerald-600" size={24} />
              4. Sécurité
            </h2>
            <p>
              Nous utilisons des protocoles de chiffrement avancés (SSL/TLS) pour protéger vos données lors de leur transfert et de leur stockage. Votre mot de passe est haché et inaccessible, même pour nos administrateurs système.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <HelpCircle className="text-emerald-600" size={24} />
              5. Vos Droits
            </h2>
            <p>
              Conformément aux lois sur la protection des données, vous disposez d'un droit d'accès, de rectification et d'opposition. Notez toutefois que les données enregistrées sur la blockchain ne peuvent être modifiées pour des raisons d'intégrité financière.
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Retour
            </button>
            <p className="text-sm text-slate-400 italic">agrilogix © 2026 - Protection des données.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
