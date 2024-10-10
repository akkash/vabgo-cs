import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Slider from '../_components/Slider';
import Details from '../_components/Details';

export async function generateStaticParams() {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: listings, error } = await supabase
    .from('listing')
    .select('slug')
    .eq('active', true)

  // Check if listings is null or if there's an error
  if (error || !listings) {
    return [] // Return an empty array if there's an error
  }

  return listings.map((listing) => ({
    slug: listing.slug,
  }))
}

export default async function ViewListing({ params }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data, error } = await supabase
    .from('listing')
    .select('*,listingImages(url,listing_id)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (error || !data) {
    return <div>Error fetching listing</div>
  }

  return (
    <div className='px-4 md:px-32 lg:px-56 py-5'>
      <Slider imageList={data.listingImages} />
      <Details listingDetail={data} />
    </div>
  )
}