import React from 'react';
import { motion } from 'framer-motion';
import BrandLogo from './brand/BrandLogo';

const LoadingScreen = () => {
  return (
    <div className="fixed inset-0 bg-white flex flex-col items-center justify-center z-[9999]">
      <motion.div 
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ 
          duration: 0.5,
          ease: "easeOut"
        }}
        className="flex flex-col items-center"
      >
        {/* Logo Container */}
        <div className="mb-8">
          <BrandLogo variant="loading" />
        </div>

        {/* Text and Loader */}
        <h1 className="font-display font-black text-2xl text-slate-800 tracking-tight mb-4">
          AgriLogix
        </h1>
        
        <div className="flex gap-1.5">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-2 h-2 bg-green-600 rounded-full"
              animate={{ 
                scale: [1, 1.5, 1],
                opacity: [0.3, 1, 0.3]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.15,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>

      {/* Footer Branding like Instagram */}
      <div className="absolute bottom-12 flex flex-col items-center gap-1">
        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">Propulsé par</p>
        <p className="font-display font-black text-slate-400 text-sm tracking-tighter italic">coop-leger</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
