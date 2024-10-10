"use client"; // Mark this component as a Client Component

import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export async function getStaticPaths() {
  // Fetch the list of listings to generate paths
  const supabase = createClientComponentClient()
  const { data: listings } = await supabase.from('listings').select('id')

  const paths = listings.map(listing => ({
    params: { id: listing.id.toString() }
  }))

  return { paths, fallback: false }
}

export async function getStaticProps({ params }) {
  const supabase = createClientComponentClient()
  const { data: listingDetail } = await supabase
    .from('listings')
    .select('*')
    .eq('id', params.id)
    .single()

  return {
    props: {
      listingDetail
    }
  }
}

function AgentDetail({ listingDetail }) {
  const [showContact, setShowContact] = useState(false)
  const [isSignedIn, setIsSignedIn] = useState(false)
  const router = useRouter()
  const supabase = createClientComponentClient()

  useEffect(() => {
    async function checkSession() {
      const { data: { session } } = await supabase.auth.getSession()
      setIsSignedIn(!!session)
    }
    checkSession()
  }, [supabase.auth])

  const handleGetContact = async () => {
    if (isSignedIn) {
      setShowContact(true)
    } else {
      // Redirect to sign-in page
      router.push('/sign-in')
    }
  }

  return (
    <div className='flex flex-col gap-5 p-5 rounded-lg shadow-md border my-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold'>Contact Property Owner</h2>
          <h2 className='text-gray-500'>{listingDetail.contactname || 'Property Owner'}</h2>
        </div>
        {!showContact && (
          <Button onClick={handleGetContact}>
            {isSignedIn ? 'Get Contact' : 'Sign In to Get Contact'}
          </Button>
        )}
      </div>
      {showContact && isSignedIn && (
        <div className='mt-4'>
          <p className='font-semibold'>Contact Information:</p>
          <p>{listingDetail.contactname || 'Property Owner'}: {listingDetail.createdBy || 'Contact number not available'}</p>
        </div>
      )}
    </div>
  )
}

export default AgentDetail