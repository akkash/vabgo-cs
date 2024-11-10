export default async function robots() {
  const baseUrl = process.env.SITE_URL || 'https://vabgo.com'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin/', '/api/'],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  }
} 