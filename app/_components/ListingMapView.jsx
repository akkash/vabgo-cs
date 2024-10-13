"use client"
import React, { useEffect, useState } from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner';
import GoogleMapSection from './GoogleMapSection';

function ListingMapView() {

    const [listing,setListing]=useState([]);
    const [searchedAddress,setSearchedAddress]=useState();
    const [bedCount,setBedCount]=useState(0);
    const [bathCount,setBathCount]=useState(0);
    const [parkingCount,setParkingCount]=useState(0);
    const [homeType,setHomeType]=useState();
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
        .gte('bedroom',bedCount)
        .gte('bathroom',bathCount)
        .gte('parking',parkingCount)
        .like('address','%'+searchTerm+'%')
        .order('id',{ascending:false});

        if(homeType)
        {
            query=query.eq('property_type',homeType)
        }

        const {data,error}=await query;
        if(data)
        {
            setListing(data);
        }

    }
  return (
    <div className="container mx-auto">
      <div className="text-black py-10 md:py-20 px-4 mb-4 md:mb-8">
        <div className="container mx-auto text-center">
          <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-2 md:mb-4">
            Find Commercial Property On The Go
          </h1>
          <p className="text-lg md:text-xl lg:text-2xl text-blue-900">
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
            setBathCount={setBathCount}
            setBedCount={setBedCount}
            setParkingCount={setParkingCount}
            setHomeType={setHomeType}
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
