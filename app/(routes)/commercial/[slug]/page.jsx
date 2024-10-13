import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import Slider from '../_components/Slider';
import ClientDetails from '../_components/ClientDetails';

export default async function ViewListing({ params }) {
  const supabase = createServerComponentClient({ cookies })
  
  const { data: listing, error } = await supabase
    .from('listing')
    .select('*,listingImages(url,listing_id)')
    .eq('slug', params.slug)
    .eq('active', true)
    .single()

  if (error || !listing) {
    return <div>Error fetching listing</div>
  }

  return (
    <div className='px-4 md:px-32 lg:px-56 py-5'>
      <Slider imageList={listing.listingImages} />
      <ClientDetails listingDetail={listing} />
    </div>
  )
}
