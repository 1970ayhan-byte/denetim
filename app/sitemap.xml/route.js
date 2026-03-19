// Dynamic Sitemap Generator
// Returns XML sitemap for SEO

export async function GET() {
  const baseUrl = 'https://www.anaokuludenetim.com'
  
  // Static pages
  const staticPages = [
    { url: '/', priority: '1.0', changefreq: 'weekly' },
    { url: '/#hizmetler', priority: '0.9', changefreq: 'monthly' },
    { url: '/#iletisim', priority: '0.8', changefreq: 'monthly' },
    { url: '/#fiyatlar', priority: '0.8', changefreq: 'monthly' },
    { url: '/#hakkimizda', priority: '0.7', changefreq: 'monthly' },
  ]
  
  const currentDate = new Date().toISOString().split('T')[0]
  
  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
        xsi:schemaLocation="http://www.sitemaps.org/schemas/sitemap/0.9
        http://www.sitemaps.org/schemas/sitemap/0.9/sitemap.xsd">
${staticPages.map(page => `  <url>
    <loc>${baseUrl}${page.url}</loc>
    <lastmod>${currentDate}</lastmod>
    <changefreq>${page.changefreq}</changefreq>
    <priority>${page.priority}</priority>
  </url>`).join('\n')}
</urlset>`

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400', // Cache for 1 day
    },
  })
}
