// SpeedComparison Component - Animated comparison showing Nyota's speed advantage
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const SpeedComparison: React.FC = () => {
  const { i18n } = useTranslation();
  const [isVisible, setIsVisible] = useState(false);
  const isEnglish = i18n.language === 'en';

  // Animated counter hook
  const useAnimatedCounter = (endValue: number, duration: number, isActive: boolean) => {
    const [value, setValue] = useState(0);

    useEffect(() => {
      if (!isActive) return;

      let startTime: number;
      const animate = (timestamp: number) => {
        if (!startTime) startTime = timestamp;
        const progress = Math.min((timestamp - startTime) / duration, 1);
        
        setValue(Math.floor(progress * endValue));
        
        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };
      
      requestAnimationFrame(animate);
    }, [endValue, duration, isActive]);

    return value;
  };

  const traditionCounter = useAnimatedCounter(21, 2500, isVisible); // 2-3 weeks = ~21 days
  const nyotaCounter = useAnimatedCounter(5, 1800, isVisible); // 5 minutes

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-br from-gray-50 via-white to-blue-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            onViewportEnter={() => setIsVisible(true)}
          >
            <div className="inline-flex items-center space-x-2 bg-orange-100 text-orange-800 px-4 py-2 rounded-full text-sm font-medium mb-4">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
              </svg>
              <span>{isEnglish ? 'Speed Comparison' : 'Comparaison de Vitesse'}</span>
            </div>
            <h2 className="text-4xl lg:text-5xl font-heading font-bold text-gray-900 mb-6">
              {isEnglish ? 'Manual vs AI-Powered Translation' : 'Traduction Manuelle vs IA'}
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {isEnglish 
                ? 'See the dramatic difference between outdated manual translation methods and Nyota\'s cutting-edge AI technology'
                : 'Découvrez la différence dramatique entre les méthodes de traduction manuelle obsolètes et la technologie IA de pointe de Nyota'
              }
            </p>
          </motion.div>

          {/* Comparison Cards */}
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 mb-12">
            {/* Traditional Manual Method */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-red-500 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <svg fill="currentColor" viewBox="0 0 100 100" className="w-full h-full text-red-500">
                    <path d="M20 20h60v60H20z M30 30h40v40H30z M40 40h20v20H40z"/>
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isEnglish ? 'Traditional Manual Translation' : 'Traduction Manuelle Traditionnelle'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isEnglish ? 'Outdated manual typing approach' : 'Approche de saisie manuelle obsolète'}
                      </p>
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl lg:text-5xl font-bold text-red-600">
                        {traditionCounter}
                      </span>
                      <span className="text-xl text-red-500 font-semibold">
                        {isEnglish ? 'days' : 'jours'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {isEnglish ? 'Typical timeframe for manual translation services' : 'Délai typique pour les services de traduction manuelle'}
                    </p>
                  </div>

                  {/* Process Steps */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      {isEnglish ? 'Manual Process Steps' : 'Étapes du Processus Manuel'}:
                    </div>
                    {[
                      isEnglish ? 'Manual data entry and typing' : 'Saisie de données et frappe manuelle',
                      isEnglish ? 'Human translation (prone to errors)' : 'Traduction humaine (sujette aux erreurs)',
                      isEnglish ? 'Multiple review cycles' : 'Plusieurs cycles de révision',
                      isEnglish ? 'Final formatting and delivery' : 'Formatage final et livraison'
                    ].map((step, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.6 + index * 0.1 }}
                      >
                        <div className="w-6 h-6 bg-red-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <span className="text-xs font-semibold text-red-600">{index + 1}</span>
                        </div>
                        <span className="text-sm text-gray-600">{step}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        className="bg-gradient-to-r from-red-400 to-red-600 h-3 rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        whileInView={{ width: '100%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 3, delay: 1 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-30 animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{isEnglish ? 'Day 1' : 'Jour 1'}</span>
                      <span>{isEnglish ? 'Day 21+' : 'Jour 21+'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Nyota AI Method */}
            <motion.div 
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8 border-l-4 border-green-500 relative overflow-hidden">
                {/* Background Pattern */}
                <div className="absolute top-0 right-0 w-32 h-32 opacity-5">
                  <svg fill="currentColor" viewBox="0 0 100 100" className="w-full h-full text-green-500">
                    <circle cx="50" cy="50" r="40"/>
                    <circle cx="50" cy="50" r="25"/>
                    <circle cx="50" cy="50" r="10"/>
                  </svg>
                </div>
                
                <div className="relative z-10">
                  <div className="flex items-center space-x-3 mb-6">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {isEnglish ? 'Nyota AI Translation' : 'Traduction IA Nyota'}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {isEnglish ? 'Advanced AI-powered automation' : 'Automatisation avancée alimentée par l\'IA'}
                      </p>
                    </div>
                  </div>

                  {/* Time Display */}
                  <div className="mb-6">
                    <div className="flex items-baseline space-x-2">
                      <span className="text-4xl lg:text-5xl font-bold text-green-600">
                        {nyotaCounter}
                      </span>
                      <span className="text-xl text-green-500 font-semibold">
                        {isEnglish ? 'minutes' : 'minutes'}
                      </span>
                    </div>
                    <p className="text-gray-600 mt-2">
                      {isEnglish ? 'Instant AI-powered translation and formatting' : 'Traduction et formatage instantanés alimentés par l\'IA'}
                    </p>
                  </div>

                  {/* Process Steps */}
                  <div className="space-y-3">
                    <div className="text-sm font-medium text-gray-700 mb-3">
                      {isEnglish ? 'AI Process Steps' : 'Étapes du Processus IA'}:
                    </div>
                    {[
                      isEnglish ? 'Upload document (any format)' : 'Télécharger le document (tout format)',
                      isEnglish ? 'AI extraction and translation' : 'Extraction et traduction par IA',
                      isEnglish ? 'Instant formatted output' : 'Sortie formatée instantanée'
                    ].map((step, index) => (
                      <motion.div 
                        key={index}
                        className="flex items-center space-x-3"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.4, delay: 0.8 + index * 0.1 }}
                      >
                        <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
                          <svg className="w-3 h-3 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                        </div>
                        <span className="text-sm text-gray-600">{step}</span>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress Bar */}
                  <div className="mt-6">
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <motion.div 
                        className="bg-gradient-to-r from-green-400 to-green-600 h-3 rounded-full relative overflow-hidden"
                        initial={{ width: 0 }}
                        whileInView={{ width: '20%' }}
                        viewport={{ once: true }}
                        transition={{ duration: 2, delay: 1.2 }}
                      >
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white to-transparent opacity-40 animate-pulse"></div>
                      </motion.div>
                    </div>
                    <div className="flex justify-between text-xs text-gray-500 mt-2">
                      <span>{isEnglish ? 'Upload' : 'Téléchargement'}</span>
                      <span>{isEnglish ? 'Complete' : 'Terminé'}</span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>

          {/* Impact Statistics */}
          <motion.div 
            className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 lg:p-12 text-white"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.6 }}
          >
            <div className="text-center mb-8">
              <h3 className="text-2xl lg:text-3xl font-bold mb-4">
                {isEnglish ? 'The Transformation Impact' : 'L\'Impact de la Transformation'}
              </h3>
              <p className="text-blue-100 text-lg max-w-2xl mx-auto">
                {isEnglish ? 'Discover how Nyota revolutionizes the translation experience' : 'Découvrez comment Nyota révolutionne l\'expérience de traduction'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.8 }}
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">99%</div>
                <div className="text-blue-100 text-sm">
                  {isEnglish ? 'Time Saved' : 'Temps Économisé'}
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 0.9 }}
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">50x</div>
                <div className="text-blue-100 text-sm">
                  {isEnglish ? 'Faster Process' : 'Processus Plus Rapide'}
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.0 }}
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">100%</div>
                <div className="text-blue-100 text-sm">
                  {isEnglish ? 'AI Accuracy' : 'Précision IA'}
                </div>
              </motion.div>
              
              <motion.div 
                className="text-center"
                initial={{ opacity: 0, scale: 0.8 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: 1.1 }}
              >
                <div className="text-3xl lg:text-4xl font-bold mb-2">24/7</div>
                <div className="text-blue-100 text-sm">
                  {isEnglish ? 'Always Available' : 'Toujours Disponible'}
                </div>
              </motion.div>
            </div>
            
            <div className="text-center mt-8">
              <motion.div 
                className="inline-flex items-center space-x-2 bg-white/20 backdrop-blur-sm px-6 py-3 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 1.2 }}
              >
                <svg className="w-5 h-5 text-yellow-300" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                </svg>
                <span className="font-semibold">
                  {isEnglish ? 'Revolutionizing Education Translation' : 'Révolutionner la Traduction Éducative'}
                </span>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default SpeedComparison;
