export default async function sitemap() {
  // Get your dynamic routes/pages here
  const listings = await fetch('your-api-endpoint/listings').then(res => res.json())

  const listingsUrls = listings.map(listing => ({
    url: `${process.env.SITE_URL}/commercial/${listing.slug}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: 0.7,
  }))

  // Add your static routes
  const staticPages = [
    {
      url: `${process.env.SITE_URL}`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${process.env.SITE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    // Add more static pages as needed
  ]

  return [...staticPages, ...listingsUrls]
} 