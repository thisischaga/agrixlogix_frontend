import React from 'react';
import { motion } from 'framer-motion';

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
        <div className="w-24 h-24 bg-green-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-green-600/30 mb-8 relative overflow-hidden">
          <motion.div 
            className="absolute inset-0 bg-gradient-to-tr from-green-400 to-transparent opacity-30"
            animate={{ 
              rotate: [0, 360],
            }}
            transition={{ 
              duration: 4, 
              repeat: Infinity, 
              ease: "linear" 
            }}
          />
          <span className="text-white text-4xl font-black italic relative z-10">AL</span>
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
        <p className="font-display font-black text-slate-400 text-sm tracking-tighter italic">BCH-Solutions</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
