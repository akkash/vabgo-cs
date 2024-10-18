import { createClient } from '@supabase/supabase-js'
import EditListingForm from './EditListingForm'

export async function generateStaticParams() {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: listings } = await supabase.from('listing').select('id')
  return listings.map((listing) => ({ id: listing.id.toString() }))
}

export default async function EditListing({ params }) {
  const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
  const { data: listing, error } = await supabase
    .from('listing')
    .select('*')
    .eq('id', params.id)
    .single()

  if (error || !listing) {
    return <div>Error loading listing</div>
  }

  return <EditListingForm initialListing={listing} />
}
