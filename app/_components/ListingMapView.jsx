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
    const [sortBy, setSortBy] = useState('newest'); // Add at the top with other state declarations
    const [SubLocality, setSubLocality] = useState(null);
    const [SelectedLocality, setSelectedLocality] = useState(null);
    const [isButtonVisible, setIsButtonVisible] = useState(false);

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

    useEffect(() => {
        if (SelectedLocality || SubLocality) {
            handleSearchClick();
        }
    }, [SelectedLocality, SubLocality]);

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

            if (SelectedLocality || SubLocality) {
                const locationFilters = []
                
                if (SelectedLocality) {
                    locationFilters.push(
                        `city.ilike.%${SelectedLocality}%`,
                        `locality.ilike.%${SelectedLocality}%`
                    )
                }
                
                if (SubLocality) {
                    locationFilters.push(`sub_locality.ilike.%${SubLocality}%`)
                }

                query = query.or(locationFilters.join(','))
            }

            const { data, error } = await query.order('id', { ascending: false });

            if (error) throw error;
            setListing(data || []);
            
            // Validate and set coordinates if available
            if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
                setCoordinates(coordinates);
            } else {
                console.warn('Invalid coordinates:', coordinates);
                setCoordinates(null); // or handle invalid coordinates appropriately
            }
            
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

    const handleSort = async (sortValue) => {
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

            // Apply sorting
            switch (sortValue) {
                case 'price-asc':
                    query = query.order('price', { ascending: true });
                    break;
                case 'price-desc':
                    query = query.order('price', { ascending: false });
                    break;
                case 'newest':
                    query = query.order('created_at', { ascending: false });
                    break;
                case 'oldest':
                    query = query.order('created_at', { ascending: true });
                    break;
                case 'area-asc':
                    query = query.order('carpet_area', { ascending: true });
                    break;
                case 'area-desc':
                    query = query.order('carpet_area', { ascending: false });
                    break;
                default:
                    query = query.order('id', { ascending: false });
            }

            const { data, error } = await query;

            if (error) throw error;
            setListing(data || []);
            setSortBy(sortValue);
            
        } catch (error) {
            console.error('Error in handleSort:', error);
            toast.error('Failed to sort listings');
        }
    }

    return (
        <div className="min-h-screen pb-24">
            {/* Hero Banner Section */}
            <div className="relative w-full h-[300px] sm:h-[218px] mb-4 sm:mb-8">
                <img 
                    src="/warehouse.jpg" 
                    alt="Find Commercial Property" 
                    className="w-full h-full object-cover"
                />
                {/* Overlay Content */}
                <div className="absolute inset-0 bg-black/40">
                    <div className="container mx-auto h-full px-4">
                        <div className="flex flex-col justify-center items-center h-full max-w-3xl mx-auto text-center p-4">
                            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2 sm:mb-4">
                                Discover the perfect space for your business
                            </h1>
                            <p className="text-sm sm:text-lg md:text-xl text-black/90 mb-4 sm:mb-0">
                                Office Space, Showrooms, Shops, Warehouses, Godowns, Industry Buildings, Commercial Plots etc.
                            </p>
                            
                            {/* Search Bar */}
                            <div className="mt-2 sm:mt-6 flex gap-2 sm:gap-3 w-full max-w-2xl">
                                <div className="flex-1">
                                    <GoogleAddressSearch
                                        selectedAddress={setSearchedAddress}
                                        setCoordinates={setCoordinates}
                                        setSelectedLocality={setSelectedLocality}
                                        setSubLocality={setSubLocality}
                                        className="w-full"
                                    />
                                </div>
                                {isButtonVisible && (
                                    <Button 
                                        className="bg-primary text-white hover:bg-primary/90 flex gap-2" 
                                        onClick={handleSearchClick}
                                    >
                                        <Search className='h-4 w-4'/> 
                                        <span className="hidden sm:inline">Search</span>
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="container mx-auto px-4">
                {/* Filter Section with Listing Count */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full">
                        <div className="flex flex-wrap gap-3 items-center">
                            <FilterSection
                                setListingType={setListingType}
                                setPropertyType={setPropertyType}
                                sortBy={sortBy}
                                onSort={handleSort}
                                onClearFilters={() => {
                                    setListingType(0);
                                    setPropertyType(0);
                                    setSearchedAddress(null);
                                    setSortBy('newest');
                                    handleSort('newest');
                                }}
                            />
                        </div>
                    </div>
                </div>

                <div className="px-3 mb-2">
                    <span className="text-sm text-muted-foreground text-left">
                        {listing.length} {listing.length === 1 ? 'Property' : 'Properties'} Available
                    </span>
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
                                        onClick={() => router.push(`/commercial/${item.slug}`)}
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
                                                                ₹{item.expected_price ? (typeof item.expected_price === 'number' ? item.expected_price.toLocaleString() : item.expected_price) : 'N/A'}/mo
                                                            </span>
                                                        </div>
                                                    </div>

                                                    {/* Property Details */}
                                                    <div className="space-y-2">

                                                    <div className="flex items-center gap-4 text-sm text-gray-600">
                                                            <span>{item.property_type}</span>
                                                            <span>•</span>
                                                            <span>Built-up Area: {item.built_up_area ? (typeof item.built_up_area === 'number' ? item.built_up_area.toLocaleString() : item.built_up_area) : 'N/A'} sqft</span>
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

                {/* How It Works Section */}
                <div className="mt-16 px-4">
                    <h2 className="text-2xl md:text-3xl font-bold text-center mb-12">
                        How It Works
                    </h2>
                    
                    {/* Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
                        {/* Step 1 */}
                        <div className="text-center">
                            <div className="mb-6">
                                <img 
                                    src="/post.jpg" 
                                    alt="Post Property" 
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary font-bold">1</span>
                            </div>
                            <h3 className="font-semibold mb-2">Post your Property Ad</h3>
                            <p className="text-gray-600 text-sm">
                                Enter all details like locality name, amenities etc. along with uploading Photos
                            </p>
                        </div>

                        {/* Step 2 */}
                        <div className="text-center">
                            <div className="mb-6">
                                <img 
                                    src="/post_property.jpg" 
                                    alt="Check Responses" 
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary font-bold">2</span>
                            </div>
                            <h3 className="font-semibold mb-2">Check Responses on Dashboard</h3>
                            <p className="text-gray-600 text-sm">
                                Get access to Buyer/Tenant contact details & connect easily
                            </p>
                        </div>

                        {/* Step 3 */}
                        <div className="text-center">
                            <div className="mb-6">
                                <img 
                                    src="https://illustrations.popsy.co/sky/success.svg" 
                                    alt="Close Deal" 
                                    className="w-48 h-48 mx-auto"
                                />
                            </div>
                            <div className="bg-primary/10 w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4">
                                <span className="text-primary font-bold">3</span>
                            </div>
                            <h3 className="font-semibold mb-2">Buy/Rent faster with instant Connect</h3>
                            <p className="text-gray-600 text-sm">
                                Negotiate with your prospective Buyer/Tenant & mutually close the deal (site-visit)
                            </p>
                        </div>
                    </div>

                    {/* Tips and Benefits Sections */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                        {/* Tips Section */}
                        <div className="relative">
                            <svg 
                                className="absolute right-0 top-0 w-32 h-32 text-gray-200"
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                            </svg>
                            <h3 className="text-xl font-bold mb-6">Tips on Selling a Property Online</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <svg 
                                            className="w-5 h-5 text-green-500"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Add Quality Photos</h4>
                                        <p className="text-gray-600 text-sm">
                                            Do not forget to add high-quality photos as it's key for any property to stand out.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <svg 
                                            className="w-5 h-5 text-green-500"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Choose Correct Locality/Address</h4>
                                        <p className="text-gray-600 text-sm">
                                            Make sure to accurately map your locality while filling in the details of your property.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Benefits Section */}
                        <div className="relative">
                            <svg 
                                className="absolute right-0 top-0 w-32 h-32 text-gray-200"
                                xmlns="http://www.w3.org/2000/svg" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                            </svg>
                            <h3 className="text-xl font-bold mb-6">Benefits of Buying Your Property Online</h3>
                            <div className="space-y-4">
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <svg 
                                            className="w-5 h-5 text-yellow-500"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Time-Efficient</h4>
                                        <p className="text-gray-600 text-sm">
                                            Save time, manage your bookings at your convenience and receive quality leads quickly.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    <div className="mt-1">
                                        <svg 
                                            className="w-5 h-5 text-yellow-500"
                                            xmlns="http://www.w3.org/2000/svg" 
                                            viewBox="0 0 20 20" 
                                            fill="currentColor"
                                        >
                                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                        </svg>
                                    </div>
                                    <div>
                                        <h4 className="font-semibold mb-2">Get Better Exposure</h4>
                                        <p className="text-gray-600 text-sm">
                                            Reach a larger audience of prospective buyers who search online.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ListingMapView
