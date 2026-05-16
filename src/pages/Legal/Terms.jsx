import React from 'react';
import { motion } from 'framer-motion';
import { Shield, FileText, Scale, Lock, Globe, AlertCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Terms() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl mx-auto bg-white shadow-xl rounded-3xl overflow-hidden border border-slate-100"
      >
        {/* Header */}
        <div className="bg-green-600 p-8 text-white">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-white/20 rounded-2xl backdrop-blur-md">
              <Scale size={32} />
            </div>
            <h1 className="text-3xl font-display font-bold">Conditions Générales d'Utilisation</h1>
          </div>
          <p className="text-green-50 opacity-90">Dernière mise à jour : 16 Mai 2026</p>
        </div>

        <div className="p-8 sm:p-12 space-y-10 text-slate-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Globe className="text-green-600" size={24} />
              1. Acceptation des Conditions
            </h2>
            <p>
              En accédant et en utilisant la plateforme agrilogix, vous acceptez d'être lié par les présentes Conditions Générales d'Utilisation. agrilogix est une solution de gestion pour les coopératives agricoles visant la transparence financière et la sécurité des données via la technologie blockchain.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <FileText className="text-green-600" size={24} />
              2. Description du Service
            </h2>
            <p>
              agrilogix fournit des outils de suivi des cotisations, de gestion des membres, de vote électronique et de comptabilité transparente. Certaines transactions sont ancrées sur une blockchain publique pour garantir leur immutabilité.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Shield className="text-green-600" size={24} />
              3. Responsabilités de l'Utilisateur
            </h2>
            <ul className="list-disc pl-6 space-y-2">
              <li>Vous êtes responsable de la confidentialité de vos identifiants de connexion.</li>
              <li>Vous vous engagez à fournir des informations exactes et sincères lors de votre inscription.</li>
              <li>L'utilisation de la plateforme à des fins frauduleuses ou illégales est strictement interdite.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <Lock className="text-green-600" size={24} />
              4. Sécurité et Blockchain
            </h2>
            <p>
              L'ancrage blockchain assure que les archives financières ne peuvent être altérées. En utilisant agrilogix, vous reconnaissez que les hachages de transactions rendus publics sont définitifs et ne peuvent être supprimés.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-3">
              <AlertCircle className="text-green-600" size={24} />
              5. Limitation de Responsabilité
            </h2>
            <p>
              agrilogix s'efforce de maintenir une disponibilité maximale du service mais ne peut être tenu responsable des interruptions dues à des facteurs externes (pannes réseau, maintenance, bugs tiers).
            </p>
          </section>

          <div className="pt-8 border-t border-slate-100 flex justify-between items-center">
            <button 
              onClick={() => navigate(-1)}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-colors"
            >
              Retour
            </button>
            <p className="text-sm text-slate-400 italic">agrilogix © 2026 - Tous droits réservés.</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
