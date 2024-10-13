"use client"
import React, { useEffect, useState } from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner';
import GoogleMapSection from './GoogleMapSection';

function ListingMapView() {

    const [listing,setListing]=useState([]);
    const [searchedAddress,setSearchedAddress]=useState();
    const [listingType,setListingType]=useState(0);
    const [propertyType,setPropertyType]=useState(0);
    const [subPropertyType,setSubPropertyType]=useState(0);
    const [ageOfProperty,setAgeOfProperty]=useState();
    const [coordinates,setCoordinates]=useState();


    useEffect(()=>{
        getLatestListing();
    },[])

    const getLatestListing=async()=>{
        const {data,error}=await supabase
        .from('listing')
        .select(`*,listingImages(
            url,
            listing_id
        )`)
        .eq('active',true)
        .order('id',{ascending:false})

        if(data)
        {
            setListing(data);
        }
        if(error)
        {
            toast('Server Side Error')
        }
    }

    const handleSearchClick=async()=>{
        console.log(searchedAddress);
        const searchTerm=searchedAddress?.value?.structured_formatting?.main_text
        
        let query =  supabase
        .from('listing')
        .select(`*,listingImages(
            url,
            listing_id
        )`)
        .eq('active',true)
        .eq('listingType',listingType)
        .eq('propertyType',propertyType)
        .eq('subPropertyType',subPropertyType)
        .eq('ageOfProperty',ageOfProperty)
        .like('address','%'+searchTerm+'%')
        .order('id',{ascending:false});


        const {data,error}=await query;
        if(data)
        {
            setListing(data);
        }

    }
  return (
    <div className="container mx-auto">
      <div className="text-black py-6 sm:py-8 md:py-10 lg:py-12 xl:py-16 mb-4 sm:mb-6 md:mb-8">
        <div className="container mx-auto text-center px-4">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-2 sm:mb-3 md:mb-4">
            Find Commercial Property On The Go
          </h1>
          <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-blue-900">
            Discover the perfect space for your business
          </p>
        </div>
      </div>
      
      <div className='grid grid-cols-1 lg:grid-cols-2 gap-8'>
        <div className="lg:col-span-1">
          <Listing
            listing={listing}
            handleSearchClick={handleSearchClick}
            searchedAddress={(v)=>setSearchedAddress(v)}
            setListingType={setListingType}
            setPropertyType={setPropertyType}
            setSubPropertyType={setSubPropertyType}
            setAgeOfProperty={setAgeOfProperty}
            setCoordinates={setCoordinates}
          />
        </div>
        <div className='lg:col-span-1 h-[calc(100vh-200px)] sticky top-24'>
          <GoogleMapSection
            listing={listing}
            coordinates={coordinates}
          />
        </div>
      </div>
    </div>
  )
}

export default ListingMapView
