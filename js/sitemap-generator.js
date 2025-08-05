// Auto-generate sitemap based on your pages
function generateSitemap() {
  const pages = [
    { url: '/', priority: '1.0', changefreq: 'daily' },
    { url: '/ourecosystem.html', priority: '0.9', changefreq: 'weekly' },
    { url: '/ourroadmap.html', priority: '0.8', changefreq: 'weekly' },
    { url: '/aboutus.html', priority: '0.7', changefreq: 'monthly' },
    { url: '/contactus.html', priority: '0.6', changefreq: 'monthly' },
    { url: '/policy.html', priority: '0.5', changefreq: 'monthly' }
  ];
  
  const baseUrl = 'https://royalvirtualassets.com';
  const currentDate = new Date().toISOString().split('T')[0];
  
  let sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`;
  
  pages.forEach(page => {
    sitemap += `
  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`;
  });
  
  sitemap += `
</urlset>`;
  
  console.log('Generated sitemap:', sitemap);
  return sitemap;
}

// Call this function when you want to update your sitemap
generateSitemap();