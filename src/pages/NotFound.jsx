// src/pages/NotFound.jsx
import { Link } from 'react-router-dom';
import { Leaf, Home } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-green-50 flex items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 bg-green-600 rounded-2xl flex items-center justify-center mx-auto mb-6">
          <Leaf size={32} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-6xl text-green-600 mb-2">404</h1>
        <h2 className="font-display font-bold text-slate-800 text-xl mb-3">Page introuvable</h2>
        <p className="text-slate-500 text-sm mb-8">
          Cette page n'existe pas ou a été déplacée. Retournez au tableau de bord.
        </p>
        <Link
          to="/"
          className="inline-flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm hover:bg-green-700 transition-colors"
        >
          <Home size={16} /> Retour au tableau de bord
        </Link>
      </div>
    </div>
  );
}
