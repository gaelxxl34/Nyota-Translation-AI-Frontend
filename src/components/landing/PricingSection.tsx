// PricingSection Component - Freemium model: Free AI Draft + Certified tiers
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  onGetStarted?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  const freeFeatures = [
    t('pricing.free.feature1', 'AI-powered translation'),
    t('pricing.free.feature2', 'Instant preview'),
    t('pricing.free.feature3', 'Watermarked draft PDF'),
    t('pricing.free.feature4', 'Multiple document types'),
  ];

  const certifiedFeatures = [
    t('pricing.certified.feature1', 'Expert human review'),
    t('pricing.certified.feature2', 'Certified translation'),
    t('pricing.certified.feature3', 'Tamper-proof PDF with QR code'),
    t('pricing.certified.feature4', 'Digital verification'),
    t('pricing.certified.feature5', 'Priority support'),
  ];

  const tiers = [
    { key: 'standard', price: '$30', label: t('pricing.tiers.standard', 'Standard'), time: t('pricing.tiers.standardTime', 'Up to 24 hours') },
    { key: 'rush', price: '$35', label: t('pricing.tiers.rush', 'Rush'), time: t('pricing.tiers.rushTime', 'Up to 12 hours') },
    { key: 'express', price: '$45', label: t('pricing.tiers.express', 'Express'), time: t('pricing.tiers.expressTime', '1–5 hours') },
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50" id="pricing">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-10 lg:mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t('pricing.sectionTitle')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('pricing.sectionSubtitle')}
            </p>
          </motion.div>

          {/* Two Cards: Free + Certified */}
          <div className="grid md:grid-cols-2 gap-6 lg:gap-8 mb-10">
            {/* Free AI Draft */}
            <motion.div
              className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6 lg:p-8 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <div className="mb-6">
                <span className="inline-block bg-green-100 text-green-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {t('pricing.free.badge', 'FREE')}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('pricing.free.title', 'AI Draft')}</h3>
                <p className="text-sm text-gray-500">{t('pricing.free.subtitle', 'Try instantly — no payment required')}</p>
              </div>

              <div className="flex items-baseline mb-6">
                <span className="text-4xl font-bold text-gray-900">{t('pricing.free.price', 'Free')}</span>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {freeFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <svg className="w-5 h-5 text-green-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={onGetStarted}
                className="w-full py-3 px-6 rounded-lg border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-colors"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('pricing.free.cta', 'Get Started Free')}
              </motion.button>
            </motion.div>

            {/* Certified Translation */}
            <motion.div
              className="relative bg-white rounded-2xl shadow-xl border-2 border-blue-500 p-6 lg:p-8 flex flex-col"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.15 }}
            >
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2 z-10">
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white px-5 py-1.5 rounded-full text-xs font-semibold shadow-md">
                  {t('pricing.mostPopular')}
                </div>
              </div>

              <div className="mb-6">
                <span className="inline-block bg-blue-100 text-blue-700 text-xs font-semibold px-3 py-1 rounded-full mb-3">
                  {t('pricing.certified.badge', 'CERTIFIED')}
                </span>
                <h3 className="text-xl font-bold text-gray-900 mb-1">{t('pricing.certified.title', 'Certified Translation')}</h3>
                <p className="text-sm text-gray-500">{t('pricing.certified.subtitle', 'Expert-reviewed & tamper-proof')}</p>
              </div>

              <div className="flex items-baseline mb-2">
                <span className="text-sm text-gray-500 mr-1">{t('pricing.certified.from', 'from')}</span>
                <span className="text-4xl font-bold text-gray-900">$30</span>
                <div className="ml-2">
                  <span className="text-base font-semibold text-gray-700">USD</span>
                  <span className="text-xs text-gray-500 block">{t('pricing.perBulletin')}</span>
                </div>
              </div>
              <p className="text-xs text-gray-400 mb-6">{t('pricing.noSubscription')}</p>

              <ul className="space-y-3 mb-8 flex-1">
                {certifiedFeatures.map((feature, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-600">
                    <svg className="w-5 h-5 text-blue-500 mr-2 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>

              <motion.button
                onClick={onGetStarted}
                className="w-full btn-primary text-base py-3 px-6"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('pricing.startTranslation')}
              </motion.button>
            </motion.div>
          </div>

          {/* Speed Tiers */}
          <motion.div
            className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 lg:p-8"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <h3 className="text-center text-lg font-semibold text-gray-900 mb-6">
              {t('pricing.tiers.title', 'Delivery Speed Options')}
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {tiers.map((tier, i) => (
                <div
                  key={tier.key}
                  className={`rounded-xl p-4 text-center border ${
                    i === 1
                      ? 'border-blue-200 bg-blue-50'
                      : 'border-gray-200 bg-gray-50'
                  }`}
                >
                  <p className="text-sm font-semibold text-gray-800 mb-1">{tier.label}</p>
                  <p className="text-2xl font-bold text-gray-900">{tier.price} <span className="text-xs font-normal text-gray-500">{t('pricing.perBulletin')}</span></p>
                  <p className="text-xs text-gray-500 mt-1">{tier.time}</p>
                </div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-4">{t('pricing.securePayment')}</p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
