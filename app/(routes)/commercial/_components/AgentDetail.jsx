import { Button } from '@/components/ui/button'
import Image from 'next/image'
import React, { useState } from 'react'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'

function AgentDetail({ listingDetail }) {
  const [showContact, setShowContact] = useState(false)
  const { isSignedIn, user } = useUser()
  const router = useRouter()

  const handleGetContact = () => {
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