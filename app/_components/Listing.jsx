import { MapPin, SearchX } from 'lucide-react'
import Image from 'next/image'
import React from 'react'
import Link from 'next/link'

function Listing({listing}) {
  return (
    <div>
      {/* Results Section */}
      {listing.length > 0 ? (
        <div className="grid grid-cols-1 gap-6">
          {listing?.length>0? listing.map((item,index)=>item?.listingImages[0]?.url&&(
             <Link href={'/commercial/'+item?.slug} key={index}>
             <div className='p-3 hover:border hover:border-primary rounded-lg cursor-pointer'>
                  <div className='relative'>
                      <Image
                          src={item?.listingImages[0]?.url}
                          width={800}
                          height={150}
                          className='rounded-lg object-cover h-[170px]'
                          alt={item.property_title}
                      />
                      <div className='absolute top-2 left-2 bg-primary text-white px-2 py-1 rounded text-sm'>
                          {item.listing_type}
                      </div>
                      <div className='absolute bottom-0 center-2 bg-primary text-white px-4 py-1 rounded text-sm'>
                          {item.property_title}
                      </div>
                  </div>
                  <div className='flex mt-2 flex-col gap-2'>
                      
                      <h2 className='flex gap-2 text-xl'>
                          <MapPin className='h-4 w-4'/>
                      {item.property_title}</h2>
                      <h2 className='font-bold  text-blue-800 text-xl'>₹{item?.price}</h2>
                  </div>
              </div>
              </Link>
          )) : (
            [1,2,3,4,5,6,7,8].map((item,index)=>(
              <div key={index} className='h-[230px] w-full bg-slate-200 animate-pulse rounded-lg'></div>
            ))
          )}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg shadow-sm">
          <SearchX className="h-12 w-12 text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-900">No Commercial listings found</h3>
          <p className="text-gray-500 text-center mt-2">
            Try adjusting your filters or search criteria
          </p>
        </div>
      )}
    </div>
  )
}

export default Listing
