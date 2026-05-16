import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sprout, Wallet, ShieldCheck, ChevronRight, Check, Play, SkipForward } from 'lucide-react';
import { startTour } from '../utils/tourUtils';
import { useAuth } from '../context/AuthContext';

const SLIDES = [
  {
    id: 1,
    title: 'Bienvenue sur agrilogix',
    subtitle: 'La révolution numérique agricole',
    description: 'Pilotez votre coopérative avec une précision inégalée. Une plateforme conçue pour la transparence et la croissance de vos membres.',
    icon: <Sprout size={48} />,
    gradient: 'from-green-500/20 to-emerald-500/20',
    iconColor: 'text-green-600',
    accentColor: 'bg-green-600'
  },
  {
    id: 2,
    title: 'Trésorerie & Transparence',
    subtitle: 'Comptabilité en temps réel',
    description: 'Suivez chaque flux financier instantanément. Vos bilans sont calculés automatiquement, éliminant toute erreur humaine.',
    icon: <Wallet size={48} />,
    gradient: 'from-blue-500/20 to-indigo-500/20',
    iconColor: 'text-blue-600',
    accentColor: 'bg-blue-600'
  },
  {
    id: 3,
    title: 'Sécurité Blockchain',
    subtitle: 'Audit incorruptible',
    description: 'Chaque transaction est scellée cryptographiquement. Une traçabilité totale pour instaurer une confiance absolue entre membres.',
    icon: <ShieldCheck size={48} />,
    gradient: 'from-emerald-500/20 to-teal-500/20',
    iconColor: 'text-emerald-600',
    accentColor: 'bg-emerald-600'
  }
];

export default function WelcomeGuide() {
  const { user, markGuideSeen } = useAuth();
  const [currentSlide, setCurrentSlide] = useState(0);
  const [tourRunning, setTourRunning] = useState(false);

  if (user?.hasSeenGuide || tourRunning) return null;

  const nextSlide = () => {
    if (currentSlide < SLIDES.length - 1) {
      setCurrentSlide(prev => prev + 1);
    } else {
      handleStartTour();
    }
  };

  const handleStartTour = () => {
    setTourRunning(true);
    startTour(() => markGuideSeen());
  };

  const slide = SLIDES[currentSlide];

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      {/* Background overlay with premium subtle blur */}
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-slate-900/10 backdrop-blur-[2px]"
      />

      {/* Modal Content */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="relative bg-white/90 backdrop-blur-xl w-full max-w-xl rounded-[3rem] shadow-[0_32px_64px_-16px_rgba(0,0,0,0.2)] overflow-hidden border border-white/40"
      >
        <div className="flex flex-col md:flex-row h-full">
          {/* Left Side: Visuals */}
          <div className={`w-full md:w-5/12 bg-gradient-to-br ${slide.gradient} p-12 flex flex-col items-center justify-center relative overflow-hidden`}>
             {/* Decorative blobs */}
             <div className="absolute top-[-10%] left-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse" />
             <div className="absolute bottom-[-10%] right-[-10%] w-40 h-40 bg-white/20 rounded-full blur-3xl animate-pulse delay-700" />
             
             <motion.div
               key={`icon-${currentSlide}`}
               initial={{ scale: 0.5, rotate: -20, opacity: 0 }}
               animate={{ scale: 1, rotate: 0, opacity: 1 }}
               className={`relative z-10 w-24 h-24 rounded-3xl bg-white shadow-2xl flex items-center justify-center ${slide.iconColor}`}
             >
               {slide.icon}
             </motion.div>
          </div>

          {/* Right Side: Content */}
          <div className="w-full md:w-7/12 p-10 md:p-12 flex flex-col justify-between bg-white/60">
            <div>
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentSlide}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.4 }}
                >
                  <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-3 ${slide.iconColor} bg-white shadow-sm border border-slate-100`}>
                    {slide.subtitle}
                  </span>
                  <h2 className="text-3xl font-display font-extrabold text-slate-900 mb-4 leading-tight">
                    {slide.title}
                  </h2>
                  <p className="text-slate-600 text-sm leading-relaxed mb-8">
                    {slide.description}
                  </p>
                </motion.div>
              </AnimatePresence>
            </div>

            <div>
              {/* Dots Indicator */}
              <div className="flex items-center gap-1.5 mb-10">
                {SLIDES.map((_, index) => (
                  <button 
                    key={index} 
                    onClick={() => setCurrentSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-500 ${index === currentSlide ? 'w-10 ' + slide.accentColor : 'w-1.5 bg-slate-200 hover:bg-slate-300'}`}
                  />
                ))}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col gap-3">
                <button 
                  onClick={nextSlide}
                  className={`w-full h-14 rounded-2xl flex items-center justify-center gap-2 text-white font-bold transition-all hover:scale-[1.02] active:scale-[0.98] shadow-lg ${slide.accentColor} shadow-${slide.accentColor.split('-')[1]}-600/20`}
                >
                  {currentSlide === SLIDES.length - 1 ? (
                    <>Commencer la visite <Play size={18} fill="white" /></>
                  ) : (
                    <>Suivant <ChevronRight size={18} /></>
                  )}
                </button>
                
                <button 
                  onClick={markGuideSeen}
                  className="w-full h-12 rounded-2xl flex items-center justify-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-widest hover:text-slate-600 hover:bg-slate-50 transition-all"
                >
                  Passer l'introduction <SkipForward size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
