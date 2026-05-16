import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Wallet, ShieldCheck, ChevronRight, Check } from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  {
    id: 1,
    title: 'Bienvenue sur AgriLogix !',
    description: 'La plateforme moderne pour gérer la comptabilité de votre coopérative agricole en toute transparence.',
    icon: <Sprout size={48} className="text-green-500" />,
    color: 'bg-green-50 text-green-600',
  },
  {
    id: 2,
    title: 'Trésorerie Simplifiée',
    description: 'Suivez vos entrées, sorties et cotisations. Le système calcule automatiquement vos bilans mensuels.',
    icon: <Wallet size={48} className="text-blue-500" />,
    color: 'bg-blue-50 text-blue-600',
  },
  {
    id: 3,
    title: 'Audit Incorruptible',
    description: 'Chaque transaction est cryptée et ancrée de manière immuable grâce à notre technologie Blockchain sécurisée.',
    icon: <ShieldCheck size={48} className="text-emerald-500" />,
    color: 'bg-emerald-50 text-emerald-600',
  }
];

export default function WelcomeGuide() {
  const { user, markGuideSeen } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);

  const [tourRunning, setTourRunning] = useState(false);

  // If the user has already seen the guide, don't render anything
  if (user?.hasSeenGuide || tourRunning) return null;

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      setTourRunning(true);
      const driverObj = driver({
        showProgress: true,
        nextBtnText: 'Suivant &rarr;',
        prevBtnText: '&larr; Précédent',
        doneBtnText: 'Terminer',
        steps: [
          { element: '#tour-transactions', popover: { title: 'Transactions', description: 'Enregistrez et consultez toutes les entrées et sorties de votre coopérative ici.', side: "right", align: 'start' } },
          { element: '#tour-compta', popover: { title: 'Comptabilité', description: 'Générez des rapports et consultez le bilan global de la trésorerie.', side: "right", align: 'start' } },
          { element: '#tour-coop-selector', popover: { title: 'Changer de Coopérative', description: 'Si vous appartenez à plusieurs coopératives, vous pouvez basculer entre elles ici.', side: "bottom", align: 'start' } },
          { element: '#tour-add-coop', popover: { title: 'Nouvelle Coopérative', description: 'Créez une nouvelle coopérative ou rejoignez-en une avec un code.', side: "bottom", align: 'start' } },
        ],
        onDestroyStarted: () => {
          driverObj.destroy();
          markGuideSeen();
        }
      });
      driverObj.drive();
    }
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Background overlay */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative bg-white w-full max-w-md rounded-[2.5rem] shadow-2xl overflow-hidden"
      >
        <div className="p-10 text-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentSlide}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-center"
            >
              <div className={`w-24 h-24 rounded-full ${slide.color} flex items-center justify-center mb-6`}>
                {slide.icon}
              </div>
              <h2 className="font-display text-2xl font-bold text-slate-800 mb-4">
                {slide.title}
              </h2>
              <p className="text-slate-500 text-sm leading-relaxed mb-8 min-h-[60px]">
                {slide.description}
              </p>
            </motion.div>
          </AnimatePresence>

          {/* Dots Indicator */}
          <div className="flex items-center justify-center gap-2 mb-8">
            {SLIDES.map((_, index) => (
              <div 
                key={index} 
                className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-green-500' : 'w-2 bg-slate-200'}`}
              />
            ))}
          </div>

          {/* Action Button */}
          <button 
            onClick={nextSlide}
            className="w-full btn-primary justify-center py-4 rounded-2xl text-lg font-bold shadow-xl shadow-green-600/20 group"
          >
            {currentSlide === SLIDES.length - 1 ? (
              <span className="flex items-center gap-2">
                C'est parti <Check size={20} />
              </span>
            ) : (
              <span className="flex items-center gap-2">
                Suivant <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform" />
              </span>
            )}
          </button>
          
          {/* Skip Button */}
          {currentSlide < SLIDES.length - 1 && (
            <button 
              onClick={markGuideSeen}
              className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest hover:text-slate-600 transition-colors"
            >
              Passer
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
