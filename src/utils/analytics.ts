// Google Analytics and SEO Tracking Utilities
// Add your Google Analytics ID and other tracking services here

declare global {
  interface Window {
    gtag?: (...args: any[]) => void;
    dataLayer?: any[];
  }
}

export const GA_TRACKING_ID = process.env.NEXT_PUBLIC_GA_ID || process.env.VITE_GA_ID;

// Initialize Google Analytics
export const initGA = () => {
  if (typeof window !== 'undefined' && GA_TRACKING_ID) {
    // Load Google Analytics
    const script1 = document.createElement('script');
    script1.async = true;
    script1.src = `https://www.googletagmanager.com/gtag/js?id=${GA_TRACKING_ID}`;
    document.head.appendChild(script1);

    const script2 = document.createElement('script');
    script2.innerHTML = `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${GA_TRACKING_ID}', {
        page_title: 'Nyota Translation Center',
        custom_map: {'custom_parameter': 'page_type'}
      });
    `;
    document.head.appendChild(script2);
  }
};

// Track page views
export const trackPageView = (url: string) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('config', GA_TRACKING_ID, {
      page_path: url,
    });
  }
};

// Track custom events
export const trackEvent = (action: string, category: string, label?: string, value?: number) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag('event', action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track document translation events
export const trackTranslation = (documentType: string, success: boolean) => {
  trackEvent(
    success ? 'translation_success' : 'translation_error',
    'document_translation',
    documentType,
    success ? 1 : 0
  );
};

// Track user registration
export const trackRegistration = (method: string) => {
  trackEvent('sign_up', 'user_engagement', method);
};

// Track user login
export const trackLogin = (method: string) => {
  trackEvent('login', 'user_engagement', method);
};

// Track PDF downloads
export const trackPDFDownload = (documentType: string) => {
  trackEvent('pdf_download', 'document_download', documentType);
};
