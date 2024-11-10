/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || 'https://vabgo.com',
  generateRobotsTxt: true,
  exclude: ['/admin/*', '/api/*'], // Add paths you want to exclude
  generateIndexSitemap: true,
  changefreq: 'daily',
  priority: 0.7,
  sitemapSize: 7000,
} 