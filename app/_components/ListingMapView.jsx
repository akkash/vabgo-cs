"use client"
import React, { useEffect, useState } from 'react'
import Listing from './Listing'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner';
import GoogleMapSection from './GoogleMapSection';
import { useAuth } from '@/app/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { Search } from 'lucide-react'
import GoogleAddressSearch from './GoogleAddressSearch'
import FilterSection from './FilterSection'

function ListingMapView() {
    const router = useRouter();

    const [listing, setListing] = useState([]);
    const [searchedAddress, setSearchedAddress] = useState();
    const [listingType, setListingType] = useState(0);
    const [propertyType, setPropertyType] = useState(0);
    const [coordinates, setCoordinates] = useState();
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const { user, loading } = useAuth();
    const [showMap, setShowMap] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        getLatestListing();
        if (!loading) {
            setIsLoggedIn(!!user);
        }
    }, [user, loading]);

    // Add this useEffect to trigger search when filters change
    useEffect(() => {
        handleSearchClick();
    }, [listingType, propertyType]);

    const getLatestListing = async () => {
        try {
            const { data, error } = await supabase
                .from('listing')
                .select(`*,listingImages(
                    url,
                    listing_id
                )`)
                .eq('active', true)
                .order('id', { ascending: false })

            if (error) throw error;
            
            if (data) {
                setListing(data);
            }
        } catch (error) {
            console.error('Error in getLatestListing:', error);
            toast.error('Failed to fetch listings: ' + error.message);
        }
    }

    const handleSearchClick = async () => {
        try {
            let query = supabase
                .from('listing')
                .select(`
                    *,
                    listingImages (
                        url,
                        listing_id
                    )
                `)
                .eq('active', true)

            if (listingType && listingType !== 0) {
                query = query.eq('listing_type', listingType)
            }

            if (propertyType && propertyType !== 0) {
                query = query.eq('property_type', propertyType)
            }

            const { data, error } = await query.order('id', { ascending: false });

            if (error) throw error;
            setListing(data || []);
            
        } catch (error) {
            console.error('Error in handleSearchClick:', error);
            toast.error('Failed to fetch listings');
        }
    }

    const toggleView = () => {
        setShowMap(!showMap);
    };

    // Add this useEffect after the existing ones
    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 1024); // 1024px is the 'lg' breakpoint in Tailwind
            if (window.innerWidth < 1024) {
                setShowMap(false);
            }
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    const clearFilters = () => {
        setListingType(0);
        setPropertyType(0);
        setSearchedAddress(null);
    };

    return (
        <div className="container mx-auto px-4 min-h-screen pb-24">
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

            {/* Search Section */}
            <div className='mb-4'>
                <div className='p-3 flex flex-col sm:flex-row gap-3 sm:gap-6'>
                    <GoogleAddressSearch
                        selectedAddress={(v) => {
                            searchedAddress(v);
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

            {/* Filter Section */}
            <div className="flex items-center justify-between px-3 mb-4">
                <FilterSection
                    setListingType={setListingType}
                    setPropertyType={setPropertyType}
                />
                <Button 
                    variant="outline" 
                    onClick={clearFilters}
                    size="sm"
                    className="ml-4"
                >
                    Clear Filters
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {!isMobile && showMap && (
                    <div className="w-full h-[500px] lg:h-screen lg:sticky lg:top-0">
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
                                <div className='h-full flex items-center justify-center bg-gray-100 rounded-lg'>
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
                <div className="w-full">
                    {!isMobile && !showMap && (
                        <Button 
                            onClick={toggleView} 
                            className="mb-4 float-right"
                            size="sm"
                        >
                            Show Map
                        </Button>
                    )}
                    {listing.length > 0 ? (
                        <Listing
                            listing={listing}
                            handleSearchClick={handleSearchClick}
                            searchedAddress={(v) => setSearchedAddress(v)}
                            setListingType={setListingType}
                            setPropertyType={setPropertyType}
                            setCoordinates={setCoordinates}
                            onClearFilters={clearFilters}
                        />
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-xl text-gray-600 mb-2">No Commercial listings found</p>
                            <p className="text-sm text-gray-500">Try adjusting your filters or search criteria</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ListingMapView
