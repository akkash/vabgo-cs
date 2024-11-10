export const dynamic = 'force-static'
export const revalidate = 3600 // revalidate every hour

export default async function sitemap() {
  const baseUrl = process.env.SITE_URL || 'https://vabgo.com'

  // Add your static routes
  const routes = [
    '',
    '/about',
    '/contact',
    // add more static routes
  ]

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date().toISOString(),
    changeFrequency: 'daily',
    priority: 1,
  }))
} 