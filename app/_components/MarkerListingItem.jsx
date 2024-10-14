import { Button } from '@/components/ui/button'
import { Bath, BedDouble, MapPin, Ruler, X } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import * as React from 'react';

function MarkerListingItem({item,closeHandler}) {
  return item?.listingImages[0]?.url && (
    <div>
      <div className='rounded-lg cursor-pointer w-[180px] relative'>
        <X 
          onClick={() => closeHandler()} 
          className='absolute top-2 right-2 z-10 text-white cursor-pointer'
          size={20}
        />
        <Image 
          src={item?.listingImages[0]?.url}
          width={800}
          height={150}
          alt={`Image of ${item?.property_title}`}
          className='rounded-lg w-[180px] object-cover h-[120px]'
        />
        <div className='flex mt-2 flex-col gap-2 p-2 bg-white '>
          <h2 className='font-bold text-xl'>{item?.property_title}</h2>
          <h2 className='flex gap-2 text-sm text-gray-400 '>
            <MapPin className='h-4 w-4'/>
            ₹{item?.price} </h2>
          <Link href={'/commercial/'+item.slug} className='w-full'>
            <Button size="sm" className="w-full">View Detail</Button>
          </Link> 
        </div>
      </div>  
    </div>
  )
}

export default MarkerListingItem
