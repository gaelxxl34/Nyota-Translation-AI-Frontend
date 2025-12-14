// LanguagesSection Component - Display supported language pairs
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const LanguagesSection: React.FC = () => {
  const { t } = useTranslation();

  const languagePairs = [
    {
      from: { code: 'FR', name: t('languages.french'), flag: '🇫🇷' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'available',
      bidirectional: true,
    },
    {
      from: { code: 'ES', name: t('languages.spanish'), flag: '🇪🇸' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'coming',
      bidirectional: true,
    },
    {
      from: { code: 'PT', name: t('languages.portuguese'), flag: '🇵🇹' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'coming',
      bidirectional: true,
    },
    {
      from: { code: 'AR', name: t('languages.arabic'), flag: '🇸🇦' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'coming',
      bidirectional: true,
    },
    {
      from: { code: 'SW', name: t('languages.swahili'), flag: '🇰🇪' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'coming',
      bidirectional: true,
    },
    {
      from: { code: 'ZH', name: t('languages.chinese'), flag: '🇨🇳' },
      to: { code: 'EN', name: t('languages.english'), flag: '🇬🇧' },
      status: 'coming',
      bidirectional: true,
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white" id="languages">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-secondary-100 text-secondary-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              {t('languages.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t('languages.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('languages.subtitle')}
            </p>
          </motion.div>

          {/* Language Pairs Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {languagePairs.map((pair, index) => (
              <motion.div
                key={`${pair.from.code}-${pair.to.code}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className={`relative bg-gradient-to-br ${
                  pair.status === 'available'
                    ? 'from-green-50 to-green-100 border-green-200'
                    : 'from-gray-50 to-gray-100 border-gray-200'
                } rounded-xl p-5 border hover:shadow-lg transition-all duration-300`}
              >
                {/* Status indicator */}
                <div className="absolute top-3 right-3">
                  {pair.status === 'available' ? (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                      {t('languages.available')}
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-xs font-semibold text-gray-400">
                      {t('languages.comingSoon')}
                    </span>
                  )}
                </div>

                {/* Language pair display */}
                <div className="flex items-center justify-center gap-3 py-2">
                  {/* From language */}
                  <div className="text-center">
                    <span className="text-3xl mb-1 block">{pair.from.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{pair.from.name}</span>
                  </div>

                  {/* Arrow - bidirectional */}
                  <div className="flex flex-col items-center">
                    {pair.bidirectional ? (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    ) : (
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                      </svg>
                    )}
                  </div>

                  {/* To language */}
                  <div className="text-center">
                    <span className="text-3xl mb-1 block">{pair.to.flag}</span>
                    <span className="text-sm font-medium text-gray-700">{pair.to.name}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* More languages coming */}
          <motion.div
            className="text-center mt-8"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <p className="text-gray-500 text-sm">
              {t('languages.moreComingSoon')}
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default LanguagesSection;
