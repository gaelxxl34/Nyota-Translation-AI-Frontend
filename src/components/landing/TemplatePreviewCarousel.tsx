// TemplatePreviewCarousel Component - Interactive carousel showcasing available templates
import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';

interface TemplatePreviewCarouselProps {
  onTemplateSelect?: (template: 'form4' | 'form6' | 'stateDiploma') => void;
  onPreviewModal?: (template: 'form4' | 'form6' | 'stateDiploma') => void;
}

const TemplatePreviewCarousel: React.FC<TemplatePreviewCarouselProps> = ({ 
  onTemplateSelect, 
  onPreviewModal 
}) => {
  const { t } = useTranslation();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);
  const [isPaused, setIsPaused] = useState(false);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const templates = [
    {
      id: 'stateDiploma' as const,
      title: t('templates.stateDiploma.title'),
      subtitle: t('templates.stateDiploma.subtitle'),
      image: '/state diploma.png',
      color: 'purple',
      gradient: 'from-purple-500 to-purple-600',
      borderColor: 'border-purple-200',
      bgColor: 'bg-purple-50'
    },
    {
      id: 'form6' as const,
      title: t('templates.form6.title'),
      subtitle: t('templates.form6.subtitle'),
      image: '/form 6 template.png',
      color: 'blue',
      gradient: 'from-blue-500 to-blue-600',
      borderColor: 'border-blue-200',
      bgColor: 'bg-blue-50'
    },
    {
      id: 'form4' as const,
      title: t('templates.form4.title'),
      subtitle: t('templates.form4.subtitle'),
      image: '/form 4 template.png',
      color: 'green',
      gradient: 'from-green-500 to-green-600',
      borderColor: 'border-green-200',
      bgColor: 'bg-green-50'
    }
  ];

  // Auto-play functionality
  useEffect(() => {
    if (!isAutoPlaying || isPaused) return;

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % templates.length);
    }, 4000); // Change slide every 4 seconds

    return () => clearInterval(interval);
  }, [isAutoPlaying, isPaused, templates.length]);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % templates.length);
    setIsAutoPlaying(false); // Pause auto-play when user interacts
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume after 8 seconds
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + templates.length) % templates.length);
    setIsAutoPlaying(false); // Pause auto-play when user interacts
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume after 8 seconds
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
    setIsAutoPlaying(false); // Pause auto-play when user interacts
    setTimeout(() => setIsAutoPlaying(true), 8000); // Resume after 8 seconds
  };

  // Touch gesture handlers
  const minSwipeDistance = 50;

  const onTouchStart = (e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsPaused(true);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (!touchStart || !touchEnd) {
      setIsPaused(false);
      return;
    }
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
    
    setTimeout(() => setIsPaused(false), 500);
  };

  return (
    <section className="py-10 lg:py-16 bg-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          {/* Section Header */}
          <motion.div 
            className="text-center mb-8 lg:mb-16"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-2xl lg:text-4xl font-heading font-bold text-gray-900 mb-3 lg:mb-4 px-4">
              {t('templates.sectionTitle')}
            </h2>
            <p className="text-base lg:text-lg text-gray-600 max-w-2xl mx-auto px-4">
              {t('templates.sectionSubtitle')}
            </p>
          </motion.div>

          {/* Responsive Carousel Container */}
          <div className="relative">
            {/* Mobile/Tablet View - Swipe-friendly full-width carousel */}
            <div className="block lg:hidden">
              <div 
                className="relative overflow-hidden rounded-2xl bg-gray-100"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={onTouchStart}
                onTouchMove={onTouchMove}
                onTouchEnd={onTouchEnd}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className="relative"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.5,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <div className={`${templates[currentIndex].bgColor} p-6`}>
                      {/* Mobile Template Preview - Image First */}
                      <div className="mb-6">
                        <motion.div 
                          className={`relative rounded-xl overflow-hidden shadow-lg border-2 ${templates[currentIndex].borderColor} mx-auto max-w-sm`}
                          initial={{ opacity: 0, scale: 0.9 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.1, duration: 0.5 }}
                        >
                          <img
                            src={templates[currentIndex].image}
                            alt={templates[currentIndex].title}
                            className="w-full h-48 object-contain bg-white"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/5 to-transparent"></div>
                        </motion.div>
                      </div>

                      {/* Mobile Template Info - Centered */}
                      <div className="text-center">
                        <motion.div 
                          className={`inline-flex items-center space-x-2 bg-gradient-to-r ${templates[currentIndex].gradient} text-white px-3 py-1.5 rounded-full mb-3 text-xs font-semibold`}
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                        >
                          <span>{t('templates.featured')}</span>
                        </motion.div>
                        
                        <motion.h3 
                          className="text-xl font-heading font-bold text-gray-900 mb-2"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.3 }}
                        >
                          {templates[currentIndex].title}
                        </motion.h3>
                        
                        <motion.p 
                          className="text-gray-600 text-sm mb-4 px-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.4 }}
                        >
                          {templates[currentIndex].subtitle}
                        </motion.p>

                        {/* Mobile Swipe Hint */}
                        <motion.div 
                          className="flex items-center justify-center space-x-2 text-xs text-gray-400 mb-4 lg:hidden"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.6 }}
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16l-4-4m0 0l4-4m-4 4h18" />
                          </svg>
                          <span>Swipe to navigate</span>
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                          </svg>
                        </motion.div>

                        <motion.div 
                          className="flex flex-col gap-2 px-4"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.5 }}
                        >
                          <button
                            onClick={() => onTemplateSelect?.(templates[currentIndex].id)}
                            className="btn-primary text-sm py-2.5"
                          >
                            {t('templates.useTemplate')}
                          </button>
                          <button
                            onClick={() => onPreviewModal?.(templates[currentIndex].id)}
                            className="btn-secondary text-sm py-2.5"
                          >
                            {t('templates.fullPreview')}
                          </button>
                        </motion.div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>

                {/* Mobile Navigation Arrows - Overlay Style */}
                <button
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 z-10"
                  aria-label={t('templates.navigation.previous')}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>

                <button
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full shadow-md flex items-center justify-center hover:bg-white transition-all duration-200 z-10"
                  aria-label={t('templates.navigation.next')}
                  onTouchStart={() => setIsPaused(true)}
                  onTouchEnd={() => setIsPaused(false)}
                >
                  <svg className="w-5 h-5 text-gray-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Desktop View - External navigation with side-by-side layout */}
            <div className="hidden lg:flex items-center gap-6">
              {/* Left Navigation Button */}
              <button
                onClick={prevSlide}
                className="flex-shrink-0 w-14 h-14 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 group z-10"
                aria-label={t('templates.navigation.previous')}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </button>

              {/* Desktop Main Carousel */}
              <div 
                className="flex-1 relative overflow-hidden rounded-2xl bg-gray-100"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentIndex}
                    className="relative"
                    initial={{ opacity: 0, x: 100 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -100 }}
                    transition={{ 
                      duration: 0.6,
                      ease: [0.4, 0, 0.2, 1]
                    }}
                  >
                    <div className={`${templates[currentIndex].bgColor} p-8 lg:p-12`}>
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
                        {/* Desktop Template Info */}
                        <div className="order-2 lg:order-1">
                          <motion.div 
                            className={`inline-flex items-center space-x-2 bg-gradient-to-r ${templates[currentIndex].gradient} text-white px-4 py-2 rounded-full mb-4`}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                          >
                            <span className="text-sm font-semibold">
                              {t('templates.featured')}
                            </span>
                          </motion.div>
                          
                          <motion.h3 
                            className="text-2xl lg:text-3xl font-heading font-bold text-gray-900 mb-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                          >
                            {templates[currentIndex].title}
                          </motion.h3>
                          
                          <motion.p 
                            className="text-gray-600 text-lg mb-6"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                          >
                            {templates[currentIndex].subtitle}
                          </motion.p>

                          <motion.div 
                            className="flex flex-col sm:flex-row gap-3"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                          >
                            <button
                              onClick={() => onTemplateSelect?.(templates[currentIndex].id)}
                              className={`btn-primary`}
                            >
                              {t('templates.useTemplate')}
                            </button>
                            <button
                              onClick={() => onPreviewModal?.(templates[currentIndex].id)}
                              className="btn-secondary"
                            >
                              {t('templates.fullPreview')}
                            </button>
                          </motion.div>
                        </div>

                        {/* Desktop Template Preview */}
                        <div className="order-1 lg:order-2">
                          <motion.div 
                            className={`relative rounded-xl overflow-hidden shadow-2xl border-4 ${templates[currentIndex].borderColor}`}
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                          >
                            <img
                              src={templates[currentIndex].image}
                              alt={templates[currentIndex].title}
                              className="w-full h-auto max-h-96 object-contain bg-white"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent"></div>
                          </motion.div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
              </div>

              {/* Right Navigation Button */}
              <button
                onClick={nextSlide}
                className="flex-shrink-0 w-14 h-14 bg-white rounded-full shadow-xl border border-gray-200 flex items-center justify-center hover:bg-gray-50 hover:shadow-2xl transition-all duration-300 group z-10"
                aria-label={t('templates.navigation.next')}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
              >
                <svg className="w-6 h-6 text-gray-600 group-hover:text-primary-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>

          {/* Enhanced Dots Indicator with Progress - Mobile Optimized */}
          <div className="flex justify-center mt-6 lg:mt-8 space-x-2 lg:space-x-3">
            {templates.map((_, index) => (
              <button
                key={index}
                onClick={() => goToSlide(index)}
                className={`relative overflow-hidden rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-6 lg:w-8 h-2 lg:h-3 bg-primary-600' 
                    : 'w-2 lg:w-3 h-2 lg:h-3 bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`${t('templates.navigation.goToSlide')} ${index + 1}`}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
                onTouchStart={() => setIsPaused(true)}
                onTouchEnd={() => setIsPaused(false)}
              >
                {/* Auto-play progress indicator for active dot */}
                {index === currentIndex && isAutoPlaying && !isPaused && (
                  <motion.div
                    className="absolute inset-0 bg-primary-800"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 4, ease: 'linear' }}
                    key={`progress-${currentIndex}`}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Auto-play Control Button - Mobile Optimized */}
          <div className="flex justify-center mt-3 lg:mt-4">
            <button
              onClick={() => setIsAutoPlaying(!isAutoPlaying)}
              className="flex items-center space-x-2 text-xs lg:text-sm text-gray-600 hover:text-primary-600 transition-colors px-3 py-2 rounded-full hover:bg-gray-50"
              onTouchStart={() => setIsPaused(true)}
              onTouchEnd={() => setIsPaused(false)}
            >
              {isAutoPlaying ? (
                <>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">{t('templates.pauseAutoplay') || 'Pause Auto-play'}</span>
                  <span className="sm:hidden">Pause</span>
                </>
              ) : (
                <>
                  <svg className="w-3 h-3 lg:w-4 lg:h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span className="hidden sm:inline">{t('templates.resumeAutoplay') || 'Resume Auto-play'}</span>
                  <span className="sm:hidden">Play</span>
                </>
              )}
            </button>
          </div>

        </div>
      </div>
    </section>
  );
};

export default TemplatePreviewCarousel;
