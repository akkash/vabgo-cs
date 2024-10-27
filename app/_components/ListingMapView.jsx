"use client"
import React, { useEffect, useState } from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner';
import GoogleMapSection from './GoogleMapSection';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import FilterSection from './FilterSection';

function ListingMapView() {
    const router = useRouter();

    const [listing, setListing] = useState([]);
    const [searchedAddress, setSearchedAddress] = useState();
    const [listingType, setListingType] = useState(0);
    const [propertyType, setPropertyType] = useState(0);
    const [subPropertyType, setSubPropertyType] = useState(0);
    const [ageOfProperty, setAgeOfProperty] = useState();
    const [coordinates, setCoordinates] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { user, loading } = useAuth();
    const [showMap, setShowMap] = useState(true);

    useEffect(() => {
        getLatestListing();
        if (!loading) {
            setIsLoggedIn(!!user);
        }
    }, [user, loading]);

    // Add this useEffect to trigger search when filters change
    useEffect(() => {
        handleSearchClick();
    }, [listingType, propertyType, subPropertyType, ageOfProperty]);

    const getLatestListing = async () => {
        const { data, error } = await supabase
            .from('listing')
            .select(`*,listingImages(
                url,
                listing_id
            )`)
            .eq('active', true)
            .order('id', { ascending: false })

        if (data) {
            setListing(data);
        }
        if (error) {
            toast('Server Side Error')
        }
    }

    const handleSearchClick = async () => {
        console.log(searchedAddress);
        const searchTerm = searchedAddress?.value?.structured_formatting?.main_text

        let query = supabase
            .from('listing')
            .select(`*,listingImages(
                url,
                listing_id
            )`)
            .eq('active', true)
            .eq('listingType', listingType)
            .eq('propertyType', propertyType)
            .eq('subPropertyType', subPropertyType)
            .eq('ageOfProperty', ageOfProperty)
            .like('address', '%' + searchTerm + '%')
            .order('id', { ascending: false });

        const { data, error } = await query;
        if (data) {
            setListing(data);
        }
    }

    const toggleView = () => {
        setShowMap(!showMap);
    };

    return (
        <div className="container mx-auto px-4 pb-16">
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
            
            {/* Add FilterSection here */}
            <FilterSection
                setListingType={setListingType}
                setPropertyType={setPropertyType}
                setSubPropertyType={setSubPropertyType}
                setAgeOfProperty={setAgeOfProperty}
            />

            <div className="flex flex-col lg:flex-row gap-4 lg:gap-8 relative">
                {showMap && (
                    <div className="w-full lg:w-1/2 lg:sticky lg:top-24 h-[300px] lg:h-[calc(100vh-280px)] z-10">
                        {!loading && (
                            isLoggedIn ? (
                                <div className='relative h-full'>
                                    <Button 
                                        onClick={toggleView} 
                                        className="absolute top-2 right-2 z-20"
                                    >
                                        Hide Map
                                    </Button>
                                    <GoogleMapSection
                                        listing={listing}
                                        coordinates={coordinates}
                                    />
                                </div>
                            ) : (
                                <div className='h-[300px] lg:h-[calc(100vh-280px)] lg:sticky lg:top-24 flex items-center justify-center bg-gray-100 rounded-lg'>
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
                    </div>
                )}
                <div className={`w-full lg:w-1/2 ${showMap ? 'lg:static absolute top-[300px] left-0 right-0 bg-white z-20' : 'z-10'}`}>
                    {!showMap && (
                        <Button 
                            onClick={toggleView} 
                            className="mb-4 float-right"
                            size="sm"
                        >
                            Show Map
                        </Button>
                    )}
                    <Listing
                        listing={listing}
                        handleSearchClick={handleSearchClick}
                        searchedAddress={(v) => setSearchedAddress(v)}
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
