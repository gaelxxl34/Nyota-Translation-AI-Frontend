// HowItWorks Component - Step-by-step process visualization
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const HowItWorks: React.FC = () => {
  const { i18n } = useTranslation();
  const isEnglish = i18n.language === 'en';

  const steps = [
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
        </svg>
      ),
      title: isEnglish ? 'Upload Bulletin' : 'Télécharger le Bulletin',
      description: isEnglish ? 'Upload your French school bulletin as PDF or image' : 'Téléchargez votre bulletin scolaire français en PDF ou image',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
      borderColor: 'border-blue-200'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      ),
      title: isEnglish ? 'AI Auto-Extract' : 'Extraction Automatique IA',
      description: isEnglish ? 'Our AI automatically extracts all relevant information' : 'Notre IA extrait automatiquement toutes les informations pertinentes',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
      borderColor: 'border-green-200'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
        </svg>
      ),
      title: isEnglish ? 'Review & Correct' : 'Réviser et Corriger',
      description: isEnglish ? 'Review the extracted data and make any corrections' : 'Révisez les données extraites et apportez des corrections',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
      borderColor: 'border-purple-200'
    },
    {
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: isEnglish ? 'Download PDF' : 'Télécharger le PDF',
      description: isEnglish ? 'Download your professionally formatted English report' : 'Téléchargez votre rapport anglais formaté professionnellement',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
      borderColor: 'border-orange-200'
    }
  ];

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {isEnglish ? 'How It Works' : 'Comment Ça Marche'}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {isEnglish 
                ? 'Get your translated report card in just 4 simple steps' 
                : 'Obtenez votre bulletin traduit en seulement 4 étapes simples'
              }
            </p>
          </motion.div>

          {/* Steps Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {steps.map((step, index) => (
              <motion.div
                key={index}
                className="relative group"
                variants={itemVariants}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                {/* Step Number */}
                <div className="absolute -top-4 -left-4 w-8 h-8 bg-primary-600 text-white rounded-full flex items-center justify-center text-sm font-bold z-10">
                  {index + 1}
                </div>
                
                {/* Step Card */}
                <div className={`bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-2 ${step.borderColor} h-full`}>
                  <div className={`w-16 h-16 ${step.bgColor} rounded-xl flex items-center justify-center mb-6 mx-auto ${step.color} group-hover:scale-110 transition-transform duration-300`}>
                    {step.icon}
                  </div>
                  
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-3 text-center">
                    {step.title}
                  </h3>
                  
                  <p className="text-gray-600 text-sm leading-relaxed text-center">
                    {step.description}
                  </p>
                </div>

                {/* Connection Arrow - Hidden on mobile, visible on desktop */}
                {index < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10">
                    <svg className="w-8 h-8 text-gray-300" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            className="text-center mt-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.8 }}
          >
            <p className="text-gray-600 mb-6">
              {isEnglish 
                ? 'Ready to transform your French school bulletins into professional English reports?' 
                : 'Prêt à transformer vos bulletins scolaires français en rapports anglais professionnels ?'
              }
            </p>
            <button className="btn-primary text-lg px-8 py-3">
              {isEnglish ? 'Get Started Now' : 'Commencer Maintenant'}
            </button>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
