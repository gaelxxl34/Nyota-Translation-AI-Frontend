// ServicesSection Component - Display available and coming soon services
import React from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

const ServicesSection: React.FC = () => {
  const { t } = useTranslation();

  const services = [
    {
      id: 'academic',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l9-5-9-5-9 5 9 5z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      ),
      title: t('services.academic.title'),
      description: t('services.academic.description'),
      status: 'available',
      features: [
        t('services.academic.feature1'),
        t('services.academic.feature2'),
        t('services.academic.feature3'),
      ],
      color: 'green',
    },
    {
      id: 'official',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
      title: t('services.official.title'),
      description: t('services.official.description'),
      status: 'coming',
      features: [
        t('services.official.feature1'),
        t('services.official.feature2'),
        t('services.official.feature3'),
      ],
      color: 'blue',
    },
    {
      id: 'business',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
      ),
      title: t('services.business.title'),
      description: t('services.business.description'),
      status: 'coming',
      features: [
        t('services.business.feature1'),
        t('services.business.feature2'),
        t('services.business.feature3'),
      ],
      color: 'purple',
    },
    {
      id: 'personal',
      icon: (
        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      ),
      title: t('services.personal.title'),
      description: t('services.personal.description'),
      status: 'coming',
      features: [
        t('services.personal.feature1'),
        t('services.personal.feature2'),
        t('services.personal.feature3'),
      ],
      color: 'orange',
    },
  ];

  const colorClasses = {
    green: {
      bg: 'bg-green-100',
      text: 'text-green-600',
      border: 'border-green-200',
      badge: 'bg-green-500',
    },
    blue: {
      bg: 'bg-blue-100',
      text: 'text-blue-600',
      border: 'border-blue-200',
      badge: 'bg-blue-500',
    },
    purple: {
      bg: 'bg-purple-100',
      text: 'text-purple-600',
      border: 'border-purple-200',
      badge: 'bg-purple-500',
    },
    orange: {
      bg: 'bg-orange-100',
      text: 'text-orange-600',
      border: 'border-orange-200',
      badge: 'bg-orange-500',
    },
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <section className="py-16 lg:py-24 bg-gradient-to-b from-gray-50 to-white" id="services">
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
            <span className="inline-block bg-primary-100 text-primary-700 text-sm font-semibold px-4 py-1 rounded-full mb-4">
              {t('services.badge')}
            </span>
            <h2 className="text-3xl lg:text-4xl font-heading font-bold text-gray-900 mb-4">
              {t('services.title')}
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              {t('services.subtitle')}
            </p>
          </motion.div>

          {/* Services Grid */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
          >
            {services.map((service) => {
              const colors = colorClasses[service.color as keyof typeof colorClasses];
              return (
                <motion.div
                  key={service.id}
                  variants={itemVariants}
                  className={`relative bg-white rounded-2xl p-6 shadow-lg border ${colors.border} hover:shadow-xl transition-all duration-300 ${
                    service.status === 'available' ? 'ring-2 ring-green-500 ring-offset-2' : ''
                  }`}
                >
                  {/* Status Badge */}
                  <div className="absolute -top-3 right-4">
                    {service.status === 'available' ? (
                      <span className="inline-flex items-center gap-1 bg-green-500 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                        {t('services.statusAvailable')}
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 bg-gray-400 text-white text-xs font-semibold px-3 py-1 rounded-full">
                        {t('services.statusComing')}
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  <div className={`w-14 h-14 ${colors.bg} ${colors.text} rounded-xl flex items-center justify-center mb-4`}>
                    {service.icon}
                  </div>

                  {/* Content */}
                  <h3 className="text-lg font-heading font-semibold text-gray-900 mb-2">
                    {service.title}
                  </h3>
                  <p className="text-gray-600 text-sm mb-4">
                    {service.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {service.features.map((feature, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-sm text-gray-500">
                        <svg className={`w-4 h-4 ${colors.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default ServicesSection;
