"use client"
import React, { useEffect, useState } from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner';
import GoogleMapSection from './GoogleMapSection';
import { useAuth } from '@/app/contexts/AuthContext'; // Update this import
import { Button } from '@/components/ui/button'; // Add this import at the top of the file
import { useRouter } from 'next/navigation'; // Add this import at the top of the file

function ListingMapView() {
    const router = useRouter(); // Add this line inside the component

    const [listing,setListing]=useState([]);
    const [searchedAddress,setSearchedAddress]=useState();
    const [listingType,setListingType]=useState(0);
    const [propertyType,setPropertyType]=useState(0);
    const [subPropertyType,setSubPropertyType]=useState(0);
    const [ageOfProperty,setAgeOfProperty]=useState();
    const [coordinates,setCoordinates]=useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { user, loading } = useAuth(); // Use the useAuth hook

    useEffect(()=>{
        getLatestListing();
        if (!loading) {
            setIsLoggedIn(!!user);
        }
    },[user, loading])

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
        {!loading && (
          isLoggedIn ? (
            <div className='lg:col-span-1 h-[300px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24 mb-8 lg:mb-0'>
              <GoogleMapSection
                listing={listing}
                coordinates={coordinates}
              />
            </div>
          ) : (
            <div className='lg:col-span-1 h-[300px] lg:h-[calc(100vh-200px)] lg:sticky lg:top-24 mb-8 lg:mb-0 flex items-center justify-center bg-gray-100 rounded-lg'>
              <div className='text-center'>
                <p className='text-lg text-gray-600 mb-4'>
                  Please log in to access the Map View feature
                </p>
                <Button variant="outline" onClick={() => router.push('/sign-in')}>
                  Login
                </Button>
              </div>
            </div>
          )
        )}
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
      </div>
    </div>
  )
}

export default ListingMapView
