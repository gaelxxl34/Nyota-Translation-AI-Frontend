import React from 'react';
import { Helmet } from 'react-helmet-async';

interface SEOHeadProps {
  title?: string;
  description?: string;
  keywords?: string;
  image?: string;
  url?: string;
  type?: string;
  canonicalUrl?: string;
}

const SEOHead: React.FC<SEOHeadProps> = ({
  title = "Nyota Translation Center - AI-Powered Academic Document Translation | IUEA Innovations",
  description = "Transform your French school bulletins and academic documents into professional English reports with AI. Trusted by International University of East Africa (IUEA). Fast, accurate, and secure translation services.",
  keywords = "IUEA, International University of East Africa, Nyota Translation Center, AI translation, academic documents, school bulletin translation, French to English, education technology, IUEA innovations, academic transcripts, report cards, document conversion",
  image = "https://nyotatranslate.com/hero.png",
  url = "https://nyotatranslate.com/",
  type = "website",
  canonicalUrl
}) => {
  const siteName = "Nyota Translation Center";
  const author = "IUEA Innovations - International University of East Africa";
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image} />
      <meta property="og:image:alt" content={`${siteName} - ${title}`} />
      <meta property="og:site_name" content={siteName} />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image} />
      <meta property="twitter:image:alt" content={`${siteName} - ${title}`} />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional Meta Tags */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Helmet>
  );
};

export default SEOHead;
