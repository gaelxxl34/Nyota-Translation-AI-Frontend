// HeroSection Component - Polished, modern hero for translation service
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface HeroSectionProps {
  onNavigate: (page: 'landing' | 'login' | 'register' | 'dashboard' | 'privacy' | 'terms') => void;
}

const HeroSection: React.FC<HeroSectionProps> = ({ onNavigate }) => {
  const { t } = useTranslation();

  return (
    <section className="relative min-h-[500px] sm:min-h-[550px] lg:min-h-[700px] overflow-hidden">
      {/* Background Image */}
      <div className="absolute inset-0">
        <img
          src="/hero.png"
          alt=""
          loading="eager"
          fetchPriority="high"
          className="w-full h-full object-cover object-center sm:object-right"
        />
        {/* Gradient overlay - stronger on mobile for text readability */}
        <div className="absolute inset-0 bg-gradient-to-b sm:bg-gradient-to-r from-[#0B1120] via-[#0B1120]/80 sm:via-transparent to-transparent" />
      </div>

      <div className="relative container mx-auto px-4 sm:px-6 py-16 sm:py-20 lg:py-32">
        <div className="max-w-xl">
          {/* Left Content - Typography focused */}
          <div className="text-center sm:text-left space-y-5 sm:space-y-6">
            
            {/* Main Heading - Clean & Bold */}
            <motion.h1 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] tracking-tight"
            >
              {t('hero.title')}
              <span className="block text-blue-400 mt-2">{t('hero.titleHighlight')}</span>
            </motion.h1>

            {/* Subtitle - Readable & Calm */}
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-lg text-slate-300 leading-relaxed"
            >
              {t('hero.subtitle')}
            </motion.p>

            {/* Actions - Clear hierarchy */}
            <motion.div 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-center sm:items-start pt-2"
            >
              <button
                onClick={() => onNavigate('register')}
                className="bg-white text-slate-900 font-semibold px-8 py-3.5 rounded-lg hover:bg-slate-100 transition-colors w-full sm:w-auto"
              >
                {t('hero.startTranslation')}
              </button>
              <button
                onClick={() => onNavigate('login')}
                className="text-slate-300 font-medium px-6 py-3.5 hover:text-white transition-colors"
              >
                {t('hero.alreadyHaveAccount')}
              </button>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSection;
