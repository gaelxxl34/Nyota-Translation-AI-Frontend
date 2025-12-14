// Loading Screen Component for NTC
// Displays a branded loading screen with the company wide logo

import React from 'react';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-screen bg-[#0B1120] flex flex-col items-center justify-center">
      {/* Logo Container with Animation */}
      <div className="relative flex flex-col items-center">
        {/* Pulsing background ring */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-48 h-48 rounded-full bg-blue-500/10 animate-ping" style={{ animationDuration: '2s' }} />
        </div>
        
        {/* Wide Logo */}
        <div className="relative z-10 animate-pulse">
          <img 
            src="/logo-wide.png" 
            alt="Nyota Translation Center" 
            className="h-16 sm:h-20 md:h-24 w-auto object-contain"
          />
        </div>

        {/* Loading dots animation */}
        <div className="mt-8 flex items-center space-x-2">
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
          <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
        </div>

        {/* Loading message */}
        <p className="mt-4 text-slate-400 text-sm sm:text-base animate-pulse">
          {message}
        </p>
      </div>

      {/* Bottom branding */}
      <div className="absolute bottom-8 text-center">
        <p className="text-slate-600 text-xs">
          Nyota Translation Center
        </p>
      </div>
    </div>
  );
};

export default LoadingScreen;
