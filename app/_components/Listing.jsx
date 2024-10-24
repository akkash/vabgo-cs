import {  MapPin, Search } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import GoogleAddressSearch from './GoogleAddressSearch'
import { Button } from '@/components/ui/button'
import FilterSection from './FilterSection'
import Link from 'next/link'

function Listing({listing,handleSearchClick,searchedAddress,
    setListingType,
    setPropertyType,
    setSubPropertyType,
    setAgeOfProperty,
    setCoordinates,
}) {
  const [address,setAddress]=useState();
  return (
    <div>
      <div className='mb-4'>
        <div className='p-3 flex flex-col sm:flex-row gap-3 sm:gap-6'>
          <GoogleAddressSearch
            selectedAddress={(v) => {
              searchedAddress(v);
              setAddress(v);
            }}
            setCoordinates={setCoordinates}
            className="w-full sm:w-auto"
          />
          <Button className="flex gap-2 w-full sm:w-auto justify-center" onClick={handleSearchClick}>
            <Search className='h-4 w-4'/> 
            Search
          </Button>
        </div>
      </div>

      {/*
      <div className='mb-4'>
        <FilterSection
          setListingType={setListingType}
          setPropertyType={setPropertyType}
          setSubPropertyType={setSubPropertyType}
          setAgeOfProperty={setAgeOfProperty}
        />
      </div>
*/}
      {address&&<div className='px-3 my-5'>
         <h2 className='text-xl'>
         Found  <span className='font-bold'>{listing?.length}</span> Result in <span className='text-primary font-bold'>{address?.label}</span></h2> 
         
      </div>}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
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
          ))
      :[1,2,3,4,5,6,7,8].map((item,index)=>(
          <div key={index} className='h-[230px] w-full
          bg-slate-200 animate-pulse rounded-lg
          '>

          </div>
      ))
      }
      </div>
    </div>
  )
}

export default Listing
