// PricingSection Component - Single pricing card with features
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

interface PricingSectionProps {
  onGetStarted?: () => void;
}

const PricingSection: React.FC<PricingSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();

  const features = [
    t('pricing.features.aiExtraction'),
    t('pricing.features.editableReview'),
    t('pricing.features.instantDownload'),
    t('pricing.features.multipleFormats'),
    t('pricing.features.secureProcessing')
  ];

  return (
    <section className="py-12 lg:py-16 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
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

          {/* Pricing Card */}
          <motion.div 
            className="relative"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            {/* Popular Badge */}
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-10">
              <div className="bg-gradient-to-r from-primary-500 to-primary-600 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                {t('pricing.mostPopular')}
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8 lg:p-12 text-center">
              {/* Price */}
              <div className="mb-8">
                <div className="flex items-center justify-center mb-2">
                  <span className="text-5xl lg:text-6xl font-bold text-gray-900">65,000</span>
                  <div className="ml-3 text-left">
                    <div className="text-lg font-semibold text-gray-900">UGX</div>
                    <div className="text-sm text-gray-500">{t('pricing.perBulletin')}</div>
                  </div>
                </div>
                <p className="text-gray-600">
                  {t('pricing.noSubscription')}
                </p>
              </div>

              {/* Features List */}
              <div className="mb-8">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                  {t('pricing.whatsIncluded')}
                </h3>
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <motion.li
                      key={index}
                      className="flex items-center justify-center text-gray-600"
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: 0.1 * index }}
                    >
                      <svg className="w-5 h-5 text-green-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      <span>{feature}</span>
                    </motion.li>
                  ))}
                </ul>
              </div>

              {/* CTA Button */}
              <motion.button
                onClick={onGetStarted}
                className="w-full btn-primary text-lg py-4 px-8"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                {t('pricing.startTranslation')}
              </motion.button>

              {/* Additional Info */}
              <div className="mt-6 text-sm text-gray-500">
                <p>{t('pricing.securePayment')}</p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
