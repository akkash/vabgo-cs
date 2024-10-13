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
    <div>
      <div className="text-black py-20 px-4 mb-8">
        <div className="container mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            Find Commercial Property On The Go
          </h1>
          <p className="text-xl text-blue-900 md:text-2xl">
            Discover the perfect space for your business
          </p>
        </div>
      </div>
      
      <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
        <div>
            <Listing listing={listing}
            handleSearchClick={handleSearchClick}
            searchedAddress={(v)=>setSearchedAddress(v)}
            setBathCount={setBathCount}
            setBedCount={setBedCount}
            setParkingCount={setParkingCount}
            setHomeType={setHomeType}
            setCoordinates={setCoordinates}
            />
        </div>
        <div className='fixed right-10 h-full 
        md:w-[350px] lg:w-[450px] xl:w-[650px]'>
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
