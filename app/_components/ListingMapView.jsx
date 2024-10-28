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
                        <div className="space-y-4">
                            {listing.map((item) => (
                                <div 
                                    key={item.id} 
                                    className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow cursor-pointer" 
                                    onClick={() => router.push(`/commercial/${item.property_title}`)}
                                >
                                    {/* Main Card Container */}
                                    <div className="flex flex-col sm:flex-row">
                                        {/* Image Section */}
                                        <div className="relative sm:w-64 h-48 sm:h-full" itemScope itemType="https://schema.org/Photograph">
                                            {item.listingImages?.[0]?.url && (
                                                <img 
                                                    src={item.listingImages[0].url}
                                                    alt={`${item.title}`}
                                                    className="w-full h-48 object-cover rounded-t-lg sm:rounded-l-lg sm:rounded-tr-none"
                                                    loading="lazy"
                                                    itemProp=""
                                                />
                                            )}
                                            {/* Photo count indicator */}
                                            <div className="absolute bottom-2 right-2 bg-black/70 text-white px-2 py-1 rounded text-sm flex items-center gap-1">
                                                <img 
                                                    width="14" 
                                                    height="12" 
                                                    src="/camera-icon.svg" 
                                                    alt="" 
                                                    className="brightness-0 invert"
                                                />
                                                <span>{item.listingImages?.length || 0}</span>
                                            </div>
                                        </div>

                                        {/* Content Section */}
                                        <div className="flex-1 p-4">
                                            <div className="flex flex-col h-full justify-between">
                                                {/* Price and Title Section */}
                                                <div>
                                                    <h2 className="text-base font-medium text-foreground">
                                                      {item.property_title}
                                                    </h2>
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <span className="text-base font-medium text-primary">
                                                            ₹{item.price ? (typeof item.price === 'number' ? item.price.toLocaleString() : item.price) : 'N/A'}/mo
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Property Details */}
                                                <div className="space-y-2">

                                                <div className="flex items-center gap-4 text-sm text-gray-600">
                                                        <span>{item.property_type}</span>
                                                        <span>•</span>
                                                        <span>Built-up Area: {item.build_up_area ? (typeof item.build_up_area === 'number' ? item.build_up_area.toLocaleString() : item.build_up_area) : 'N/A'} sqft</span>
                                                        <span>•</span>
                                                        <span>Carpet Area: {item.carpet_area ? (typeof item.carpet_area === 'number' ? item.carpet_area.toLocaleString() : item.carpet_area) : 'N/A'} sqft</span>
                                                    </div>

                                                    <div className="text-sm text-gray-600">
                                                        <div>{item.address}</div>
                                                        <div>{item.city}</div>
                                                    </div>
                                  
                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center p-8 bg-gray-50 rounded-lg">
                            <p className="text-xl text-gray-600 mb-2">No Commercial listings found</p>
                            <p className="text-sm text-gray-500">Try adjusting your filters or search criteria</p>
                        </div>
                    )}
                </div>
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
            </div>
        </div>
    )
}

export default ListingMapView
