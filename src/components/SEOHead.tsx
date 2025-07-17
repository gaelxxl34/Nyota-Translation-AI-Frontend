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
  image = "https://nyotatranslate.com/hero%20seo.png",
  url = "https://nyotatranslate.com/",
  type = "website",
  canonicalUrl
}) => {
  const siteName = "Nyota Translation Center";
  const author = "IUEA Innovations - International University of East Africa";
  
  // Ensure absolute URL for image
  const absoluteImageUrl = image?.startsWith('http') ? image : `https://nyotatranslate.com${image?.startsWith('/') ? '' : '/'}${image}`;
  const absoluteUrl = url?.startsWith('http') ? url : `https://nyotatranslate.com${url?.startsWith('/') ? '' : '/'}${url}`;
  
  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta name="image" content={absoluteImageUrl} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={absoluteUrl} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={absoluteImageUrl} />
      <meta property="og:image:secure_url" content={absoluteImageUrl} />
      <meta property="og:image:alt" content={`${siteName} - ${title}`} />
      <meta property="og:image:width" content="1200" />
      <meta property="og:image:height" content="630" />
      <meta property="og:image:type" content="image/png" />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={absoluteUrl} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={absoluteImageUrl} />
      <meta property="twitter:image:alt" content={`${siteName} - ${title}`} />
      <meta name="twitter:image:width" content="1200" />
      <meta name="twitter:image:height" content="630" />
      
      {/* Canonical URL */}
      {canonicalUrl && <link rel="canonical" href={canonicalUrl} />}
      
      {/* Additional Meta Tags */}
      <meta name="application-name" content={siteName} />
      <meta name="apple-mobile-web-app-title" content={siteName} />
    </Helmet>
  );
};

export default SEOHead;
