import { createClient } from '@supabase/supabase-js';
import Slider from '../_components/Slider';
import ClientDetails from '../_components/ClientDetails';
import { notFound } from 'next/navigation';

async function getListing(slug) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: listing, error } = await supabase
    .from('listing')
    .select('*,listingImages(url,listing_id)')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error || !listing) {
    return null;
  }

  return listing;
}

export async function generateStaticParams() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  try {
    const { data: listings, error } = await supabase
      .from('listing')
      .select('slug')
      .eq('active', true);

    if (error) throw error;

    return listings.map((listing) => ({
      slug: String(listing.slug), // Ensure slug is a string
    }));
  } catch (error) {
    console.error('Error generating static params:', error);
    return []; // Return an empty array if there's an error
  }
}

export default async function ViewListing({ params }) {
  const listing = await getListing(params.slug);

  if (!listing) {
    notFound();
  }

  return (
    <div className='px-4 md:px-32 lg:px-56 py-5'>
      <Slider imageList={listing.listingImages} />
      <ClientDetails listingDetail={listing} />
    </div>
  );
}

export async function generateMetadata({ params }) {
  const listing = await getListing(params.slug);
  return { title: listing ? listing.title : 'Listing Not Found' };
}
