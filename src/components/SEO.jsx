import React from 'react';
import { Helmet } from 'react-helmet';

/**
 * SEO component for managing meta tags
 */
const SEO = ({
  title = 'Excel Meet - Connect with Nigerian Professionals',
  description = 'Excel Meet is Nigeria\'s premier platform for connecting professionals, finding opportunities, and building meaningful business relationships.',
  keywords = 'excel meet, nigeria professionals, networking, job opportunities, business connections',
  author = 'Excel Meet',
  image = '/assets/images/og-image.jpg',
  url = window.location.href,
  type = 'website',
  twitterCard = 'summary_large_image',
  twitterHandle = '@excelmeet',
  locale = 'en_NG',
  siteName = 'Excel Meet'
}) => {
  // Construct full URL for image
  const fullImageUrl = image.startsWith('http') 
    ? image 
    : `${window.location.origin}${image}`;

  return (
    <Helmet>
      {/* Primary Meta Tags */}
      <title>{title}</title>
      <meta name="title" content={title} />
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <link rel="canonical" href={url} />

      {/* Open Graph / Facebook */}
      <meta property="og:type" content={type} />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={fullImageUrl} />
      <meta property="og:site_name" content={siteName} />
      <meta property="og:locale" content={locale} />

      {/* Twitter */}
      <meta property="twitter:card" content={twitterCard} />
      <meta property="twitter:url" content={url} />
      <meta property="twitter:title" content={title} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={fullImageUrl} />
      <meta property="twitter:creator" content={twitterHandle} />

      {/* Additional Meta Tags */}
      <meta name="robots" content="index, follow" />
      <meta name="language" content="English" />
      <meta name="revisit-after" content="7 days" />
      <meta httpEquiv="Content-Type" content="text/html; charset=utf-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />

      {/* Favicon */}
      <link rel="icon" type="image/x-icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" href="/favicon.ico" />

      {/* Theme Color */}
      <meta name="theme-color" content="#000000" />
      <meta name="msapplication-TileColor" content="#000000" />
    </Helmet>
  );
};

export default SEO;