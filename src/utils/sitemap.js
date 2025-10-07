/**
 * Sitemap generator utility
 * Generates sitemap.xml for SEO
 */

/**
 * Generate sitemap XML
 */
export const generateSitemap = (baseUrl = 'https://excelmeet.com') => {
  const routes = [
    { path: '/', priority: 1.0, changefreq: 'daily' },
    { path: '/login', priority: 0.8, changefreq: 'monthly' },
    { path: '/register', priority: 0.8, changefreq: 'monthly' },
    { path: '/search', priority: 0.9, changefreq: 'daily' },
    { path: '/jobs', priority: 0.9, changefreq: 'daily' },
    { path: '/professionals', priority: 0.9, changefreq: 'daily' },
    { path: '/about', priority: 0.7, changefreq: 'monthly' },
    { path: '/contact', priority: 0.7, changefreq: 'monthly' },
    { path: '/privacy', priority: 0.5, changefreq: 'yearly' },
    { path: '/terms', priority: 0.5, changefreq: 'yearly' }
  ];

  const lastmod = new Date().toISOString().split('T')[0];

  const urlEntries = routes.map(route => `
  <url>
    <loc>${baseUrl}${route.path}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`).join('');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlEntries}
</urlset>`;
};

/**
 * Download sitemap as file
 */
export const downloadSitemap = (baseUrl) => {
  const sitemap = generateSitemap(baseUrl);
  const blob = new Blob([sitemap], { type: 'application/xml' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'sitemap.xml';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

export default {
  generateSitemap,
  downloadSitemap
};