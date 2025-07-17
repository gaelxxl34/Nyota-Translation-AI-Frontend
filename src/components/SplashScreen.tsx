import React from 'react';
import { motion } from 'framer-motion';

interface SplashScreenProps {
  message?: string;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ 
  message = "Welcome to Nyota Translation Center" 
}) => {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="fixed inset-0 bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 flex items-center justify-center z-50 overflow-hidden"
    >
      {/* Animated background particles */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full opacity-20"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -100, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Glowing orbs in background */}
      <motion.div
        className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1, 1.2, 1],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
      <motion.div
        className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl"
        animate={{
          scale: [1.2, 1, 1.2],
          opacity: [0.6, 0.3, 0.6],
        }}
        transition={{
          duration: 10,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />

      {/* Main content */}
      <div className="relative z-10 text-center px-8">
        {/* Logo with stunning effect */}
        <motion.div
          initial={{ scale: 0, rotate: -180 }}
          animate={{ scale: 1, rotate: 0 }}
          transition={{ 
            duration: 1.5,
            ease: "easeOut",
            type: "spring",
            stiffness: 100
          }}
          className="mb-12"
        >
          <div className="relative">
            {/* Multiple glowing rings around logo */}
            <motion.div
              className="absolute inset-0 w-32 h-32 mx-auto rounded-full border-2 border-blue-400/30"
              animate={{ rotate: 360 }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              style={{ width: '140px', height: '140px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
            <motion.div
              className="absolute inset-0 w-36 h-36 mx-auto rounded-full border border-indigo-400/20"
              animate={{ rotate: -360 }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              style={{ width: '160px', height: '160px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
            <motion.div
              className="absolute inset-0 w-40 h-40 mx-auto rounded-full border border-purple-400/10"
              animate={{ rotate: 360 }}
              transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
              style={{ width: '180px', height: '180px', left: '50%', top: '50%', transform: 'translate(-50%, -50%)' }}
            />
            
            {/* Logo container with holographic effect */}
            <motion.div 
              animate={{ 
                rotateY: [0, 360],
                scale: [1, 1.05, 1],
              }}
              transition={{
                rotateY: { duration: 8, repeat: Infinity, ease: "linear" },
                scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
              }}
              className="relative w-32 h-32 mx-auto rounded-full bg-gradient-to-r from-blue-600/20 to-indigo-600/20 backdrop-blur-sm border border-white/10 flex items-center justify-center shadow-2xl"
              style={{
                background: 'linear-gradient(45deg, rgba(59, 130, 246, 0.1), rgba(79, 70, 229, 0.1))',
                boxShadow: '0 0 60px rgba(59, 130, 246, 0.3), inset 0 0 60px rgba(79, 70, 229, 0.1)'
              }}
            >
              <img 
                src="/log.PNG" 
                alt="NTC Logo" 
                className="w-20 h-20 object-contain drop-shadow-2xl"
              />
            </motion.div>
          </div>
        </motion.div>

        {/* App title with letter animation */}
        <motion.div className="mb-6">
          <motion.h1
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1, duration: 0.8 }}
            className="text-5xl md:text-6xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-purple-400 to-indigo-400 mb-4"
          >
            {"Nyota Translation Center".split("").map((char, index) => (
              <motion.span
                key={index}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  delay: 1.2 + index * 0.05,
                  duration: 0.5,
                  ease: "easeOut"
                }}
                className="inline-block"
              >
                {char === " " ? "\u00A0" : char}
              </motion.span>
            ))}
          </motion.h1>
        </motion.div>

        {/* Subtitle with shimmer effect */}
        <motion.p
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.5, duration: 0.8 }}
          className="text-xl md:text-2xl text-gray-300 mb-12 relative"
        >
          <span className="relative">
            Transform Academic Documents with AI
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
              animate={{ x: ['-100%', '300%'] }}
              transition={{
                duration: 3,
                repeat: Infinity,
                delay: 3,
                ease: "easeInOut"
              }}
            />
          </span>
        </motion.p>

        {/* Dynamic message */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 3.5, duration: 0.6 }}
          className="relative"
        >
          <motion.p 
            key={message}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="text-lg text-blue-200/90 font-medium px-8 py-3 rounded-full bg-white/5 border border-white/10 backdrop-blur-sm inline-block"
          >
            {message}
          </motion.p>
        </motion.div>

        {/* Academic credentials with floating effect */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 4, duration: 0.8 }}
          className="mt-16"
        >
          <motion.div
            animate={{ y: [0, -10, 0] }}
            transition={{
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="inline-flex items-center space-x-3 text-gray-400 text-sm bg-white/5 px-6 py-3 rounded-full border border-white/10 backdrop-blur-sm"
          >
            <motion.svg 
              className="w-5 h-5 text-yellow-400" 
              fill="currentColor" 
              viewBox="0 0 20 20"
              animate={{ rotate: [0, 360] }}
              transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
            >
              <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
            </motion.svg>
            <span>Trusted by International University of East Africa (IUEA)</span>
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default SplashScreen;
