"use client"; // Mark this component as a Client Component
import { Button } from '@/components/ui/button'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { MapPin, X ,createIcons, icons} from 'lucide-react'
import { useAuth } from '../../../contexts/AuthContext'


function CustomDialog({ isOpen, onClose, children }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded-lg max-w-md w-full">
        <button onClick={onClose} className="float-right text-gray-500 hover:text-gray-700">
          <X size={24} />
        </button>
        {children}
      </div>
    </div>
  );
}

function AgentDetail({ listingDetail }) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const router = useRouter()
  const auth = useAuth()
  const user = auth?.user

  const handleGetContact = () => {
    if (auth && user) {
      setIsDialogOpen(true);
    } else {
      router.push('/sign-in')
    }
  }

  return (
    <div className='flex flex-col gap-5 p-5 rounded-lg shadow-md border my-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h2 className='text-lg font-bold'>Property Contact & Address</h2>
        </div>
        <Button onClick={handleGetContact}>
          {auth && user ? 'Get Contact' : 'Sign In to Get Contact'}
        </Button>
      </div>

      <CustomDialog isOpen={isDialogOpen} onClose={() => setIsDialogOpen(false)}>
        <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
        <div className="grid gap-4">
          <p>
            <span className="font-semibold">Owner: </span>
            {listingDetail.contactname || 'Property Owner'}
          </p>
          <p>
            <span className="font-semibold">Contact: </span>
            {listingDetail.createdBy ? (
              <a href={`tel:${listingDetail.createdBy}`} className="text-blue-600 hover:underline">
                {listingDetail.createdBy}
              </a>
            ) : (
              'Contact number not available'
            )}
          </p>
          {listingDetail.createdBy && (
            <p>
              <span className="font-semibold">WhatsApp: </span>
              <a href={`https://api.whatsapp.com/send?phone=${listingDetail.createdBy}&text=Hi%20${listingDetail.contactname}%20%0A%0AI%20want%20to%20know%20more%20about%20this%20${listingDetail.sub_property_type}%20listing%3A%20https%3A%2F%2Fwww.vabgo.com/commercial/${listingDetail.slug}%20for%20${listingDetail.listing_type}%20in%20${listingDetail.locality}%20,%20${listingDetail.city}`}className="text-blue-600 hover:underline flex items-center">
                <span>Chat on WhatsApp</span>
              </a>
            </p>
          )}
          <p className="flex items-center gap-2 text-gray-500">Address of Property
            <MapPin size={18} />
            <span>{listingDetail?.address}</span>
          </p>
        </div>
        <div className="mt-6 flex justify-end">
          <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
        </div>
      </CustomDialog>
    </div>
  )
}

export default AgentDetail
