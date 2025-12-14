// PartnersSection Component - Trusted by / Our Partners section
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const PartnersSection: React.FC = () => {
  const { t } = useTranslation();

  // Partners array - add more partners as needed
  const partners = [
    {
      id: 'iuea',
      name: 'International University of East Africa',
      shortName: 'IUEA',
      logo: '/iuea-Logo.png', // IUEA logo in public folder
      description: t('partners.iuea.description'),
      website: 'https://iuea.ac.ug',
    },
    // Add more partners here as they come
    // {
    //   id: 'partner2',
    //   name: 'Partner Name',
    //   shortName: 'PN',
    //   logo: '/partners/partner2-logo.png',
    //   description: t('partners.partner2.description'),
    //   website: 'https://partner2.com',
    // },
  ];

  return (
    <section className="py-16 lg:py-20 bg-gradient-to-b from-white to-gray-50" id="partners">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-5xl mx-auto">
          {/* Section Header */}
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              {t('partners.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t('partners.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('partners.subtitle')}
            </p>
          </motion.div>

          {/* Partners Grid */}
          <div className="flex flex-wrap justify-center gap-8">
            {partners.map((partner, index) => (
              <motion.a
                key={partner.id}
                href={partner.website}
                target="_blank"
                rel="noopener noreferrer"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 max-w-sm w-full"
              >
                {/* Partner Logo */}
                <div className="flex items-center justify-center h-20 mb-4">
                  <img
                    src={partner.logo}
                    alt={`${partner.name} logo`}
                    className="max-h-full max-w-full object-contain"
                    onError={(e) => {
                      // Fallback to text if logo doesn't load
                      e.currentTarget.style.display = 'none';
                      e.currentTarget.nextElementSibling?.classList.remove('hidden');
                    }}
                  />
                  {/* Fallback text logo */}
                  <div className="hidden bg-gradient-to-br from-primary-600 to-secondary-600 text-white font-bold text-2xl px-6 py-3 rounded-xl">
                    {partner.shortName}
                  </div>
                </div>

                {/* Partner Info */}
                <div className="text-center">
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                    {partner.name}
                  </h3>
                  <p className="text-gray-600 text-sm">
                    {partner.description}
                  </p>
                </div>

                {/* Visit link indicator */}
                <div className="flex items-center justify-center mt-4 text-primary-600 text-sm font-medium">
                  <span>{t('partners.visitWebsite')}</span>
                  <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </div>
              </motion.a>
            ))}
          </div>

          {/* Become a Partner CTA */}
          <motion.div
            className="text-center mt-12"
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <p className="text-gray-600 mb-4">
              {t('partners.becomePartner')}
            </p>
            <a
              href="mailto:partnerships@nyotatranslate.com"
              className="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              {t('partners.contactUs')}
            </a>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default PartnersSection;
