"use client"; // Mark this component as a Client Component

import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin } from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'

function AgentDetail({ listingDetail }) {
  const [showContact, setShowContact] = useState(false)
  const router = useRouter()
  const auth = useAuth()
  const user = auth?.user

  const handleGetContact = async () => {
    if (auth && user) {
      setShowContact(true)
    } else {
      router.push('/sign-in')
    }
  }

  return (
    <div className='flex flex-col gap-5 p-5 rounded-lg shadow-md border my-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold'>Contact Property Owner</h2>
        </div>
        {!showContact && (
          <Button onClick={handleGetContact}>
            {auth && user ? 'Get Contact' : 'Sign In to Get Contact'}
          </Button>
        )}
      </div>
      {showContact && auth && user && (
        <div className='mt-4'>
          <p className='font-semibold'>Contact Information:</p>
          <p>{listingDetail.contactname || 'Property Owner'}: {listingDetail.createdBy || 'Contact number not available'}</p>
          <h2 className='text-gray-500 text-lg flex gap-2'>
          Address <MapPin /> {listingDetail?.address}</h2>
        </div>
      )}
    </div>
  )
}

export default AgentDetail
