"use client"
import React, { useState , useEffect} from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'  // Add this import
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext'

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from '@/components/ui/textarea';
import FileUpload from '../../_components/FileUpload';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from 'lucide-react';
import { X } from 'lucide-react';
import { Phone } from 'lucide-react';

// Define LocationSchema outside of the component
const LocationSchema = Yup.object().shape({
    ownerType: Yup.string().required('Please select Owner or Agent'),
    contactname: Yup.string().required('Contact Name is required'),
    address: Yup.string().required('Address is required'),
    listing_type: Yup.string().required('Listing type is required'),
    property_type: Yup.string().required('Property type is required'),
    location_type: Yup.string().required('Location type is required'),
    property_ownership: Yup.string().required('Property ownership is required'),
    description: Yup.string().required('Description is required'),
});

// Add these functions before the nextHandler
const generateTitle = (values) => {
    const parts = [];
    
    // Add sub property type
    if (values.sub_property_type) {
        parts.push(values.sub_property_type);
    }
    
    // Add listing type
    if (values.listing_type) {
        parts.push("for", values.listing_type);
    }
    
    // Add location
    if (values.sub_locality || values.locality || values.city) {
        parts.push("in");
        if (values.sub_locality) {
            // If sub_locality exists, use sub_locality and city
            parts.push(values.sub_locality);
            if (values.city) {
                parts.push(",", values.city);
            }
        } else {
            // Otherwise use locality and city
            if (values.locality) parts.push(values.locality);
            if (values.locality && values.city) parts.push(",");
            if (values.city) parts.push(values.city);
        }
    }
    
    // Add area
    if (values.carpet_area && values.carpet_area_type) {
        parts.push(`${values.carpet_area} ${values.carpet_area_type}`);
    }
    
    return parts.join(" ");
};

const generateSlug = (values) => {
    const parts = [];
    
    // Add sub property type
    if (values.sub_property_type) {
        parts.push(values.sub_property_type);
    }
    
    // Add listing type
    if (values.listing_type) {
        parts.push("for", values.listing_type);
    }
    
    // Add location
    if (values.sub_locality || values.locality || values.city) {
        parts.push("in");
        if (values.sub_locality) {
            // If sub_locality exists, use sub_locality and city
            parts.push(values.sub_locality);
            if (values.city) {
                parts.push(",", values.city);
            }
        } else {
            // Otherwise use locality and city
            if (values.locality) parts.push(values.locality);
            if (values.locality && values.city) parts.push(",");
            if (values.city) parts.push(values.city);
        }
    }
    
    // Add area
    if (values.carpet_area && values.carpet_area_type) {
        parts.push(`${values.carpet_area}-${values.carpet_area_type}`);
    }
    
    // Add current timestamp
    parts.push(Date.now().toString());
    
    // Convert to lowercase, replace spaces with hyphens, and remove special characters
    return parts.join(" ")
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '') // Remove special characters except hyphens
        .replace(/\s+/g, '-')         // Replace spaces with hyphens
        .replace(/-+/g, '-')          // Replace multiple hyphens with single hyphen
        .trim();                      // Remove leading/trailing spaces or hyphens
};

function AddNewListing() {
    console.log("Google Maps API Key:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    const { user } = useAuth();  // Use the useAuth hook
    const [loader, setLoader] = useState(false);
    const router = useRouter();
    const supabase = createClientComponentClient();
    const [images, setImages] = useState([]);
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showExitModal, setShowExitModal] = useState(false);

    useEffect(() => {
        // Check if the script is already loaded
        if (window.google) {
            return;
        }

        // Load Google Maps API script only if not already present
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        
        // Add an ID to identify the script
        script.id = 'google-maps-script';
        
        document.head.appendChild(script);

        return () => {
            // Only remove the script if we added it
            const scriptElement = document.getElementById('google-maps-script');
            if (scriptElement) {
                document.head.removeChild(scriptElement);
            }
        };
    }, []);

    useEffect(() => {
        // Show modal after 2 minutes (120000 milliseconds)
        const timer = setTimeout(() => {
            setShowExitModal(true);
        }, 120000);

        return () => clearTimeout(timer);
    }, []);

    // Add the property type mapping
    const propertyTypeToSubProperties = {
        "Commercial Office Space": [
            "Ready to Move Office Space",
            "Bare Shell Office Space",
            "Coworking Space"
        ],
        "Commercial Retail Space": [
            "Commercial Shops",
            "Commercial Showroom"
        ],
        "Factory & Industrial": [
            "Factory",
            "Industrial Shed",
            "Industrial Building"
        ],
        "Warehouse & Cold Storage": [
            "Warehouse",
            "Cold Storage",
            "Godown"
        ],
        "Land & Plots": [
            "Commercial Land",
            "Industrial Land",
            "Commercial Plot",
            "Industrial Plot",
            "Agricultural Land"
        ],
        "Others": [
            "Others"
        ]
    };

    const nextHandler = async (values) => {
        setLoader(true);
        
        // Validate images before proceeding
        const validImages = images.filter(image => image.url && typeof image.url === 'string');
        if (images.length > 0 && validImages.length === 0) {
            setLoader(false);
            toast.error("Failed to process images. Please try uploading them again.");
            return;
        }

        let coordinates = null;
        if (values.latitude && values.longitude) {
            coordinates = {
                lat: parseFloat(values.latitude),
                lng: parseFloat(values.longitude)
            };
        }

        try {
            let cityData = { city: "", locality: "", sub_locality: "" };
            if (coordinates) {
                try {
                    cityData = await getCityAndLocalityFromCoordinates(coordinates.lat, coordinates.lng);
                } catch (geocodeError) {
                    console.error('Error getting city and locality:', geocodeError);
                }
            }

            // Generate title and slug
            const title = generateTitle(values);
            const slug = generateSlug(values);

            // First, insert the listing
            const { data: listingData, error: listingError } = await supabase
                .from('listing')
                .insert([
                    {
                        property_title: title,
                        slug,
                        address: values.address,
                        contactname: values.contactname,
                        coordinates: coordinates,
                        createdBy: user?.phone,
                        city: values.city || cityData.city,
                        locality: values.locality || cityData.locality,
                        sub_locality: values.sub_locality || cityData.sub_locality,
                        ownerType: values.ownerType,
                        listing_type: values.listing_type,
                        property_type: values.property_type,
                        sub_property_type: values.sub_property_type,
                        location_type: values.location_type,
                        property_ownership: values.property_ownership,
                        description: values.description,
                        // Area Details
                        carpet_area: values.carpet_area,
                        carpet_area_type: values.carpet_area_type,
                        built_up_area: values.built_up_area,
                        built_up_area_type: values.built_up_area_type,
                        super_built_up_area: values.super_built_up_area,
                        super_built_up_area_type: values.super_built_up_area_type,
                        // Price Details
                        expected_price: values.expected_price,
                        price_per_sqft: values.price_per_sqft,
                        tax_govt_charges_excluded: values.tax_govt_charges_excluded,
                        price_negotiable: values.price_negotiable,
                        maintenance_amount: values.maintenance_amount,
                        maintenance_duration: values.maintenance_duration,
                        booking_amount: values.booking_amount,
                        // Property Features
                        power_backup: values.power_backup,
                        lift: values.lift,
                        parking: values.parking,
                        washroom: values.washroom,
                        water: values.water,
                        property_security: values.property_security,
                        air_conditioning: values.air_conditioning,
                        oxygen_duct: values.oxygen_duct,
                        fire_safety: values.fire_safety,
                    },
                ])
                .select();

            if (listingError) {
                setLoader(false);
                console.log('Error', listingError);
                toast.error("Server side error");
                return;
            }

            // If we have valid images and the listing was created successfully, insert the images
            if (validImages.length > 0 && listingData?.[0]?.id) {
                const imageInsertPromises = validImages.map(async (image, index) => {
                    try {
                        const { data: imageData, error: imageError } = await supabase
                            .from('listingImages')
                            .insert([
                                {
                                    listing_id: listingData[0].id,
                                    url: image.url,
                                    order: index
                                }
                            ]);

                        if (imageError) {
                            console.error('Error inserting image:', imageError);
                            return null;
                        }
                        return imageData;
                    } catch (error) {
                        console.error('Failed to insert image:', error);
                        return null;
                    }
                });

                // Wait for all valid images to be inserted
                const results = await Promise.all(imageInsertPromises);
                const successfulInserts = results.filter(Boolean);
                console.log(`Successfully inserted ${successfulInserts.length} of ${validImages.length} images`);

                // Show warning if some images failed to upload
                if (successfulInserts.length < validImages.length) {
                    toast.warning("Some images failed to upload");
                }
            }

            setLoader(false);
            setShowSuccessDialog(true);

        } catch (error) {
            setLoader(false);
            console.log('Error:', error);
            toast.error("An error occurred while adding the listing");
        }
    };

    // First, add this function at the component level, after your useState declarations
    const getCityAndLocalityFromCoordinates = async (lat, lng) => {
        return new Promise((resolve, reject) => {
            if (!window.google || !window.google.maps) {
                reject("Google Maps API not loaded");
                return;
            }

            const geocoder = new window.google.maps.Geocoder();
            const latlng = { lat: parseFloat(lat), lng: parseFloat(lng) };

            geocoder.geocode({ location: latlng }, (results, status) => {
                if (status === "OK") {
                    console.log("Geocoding results:", results);
                    let city = "";
                    let locality = "";
                    let sub_locality = "";

                    if (results[0]) {
                        for (let result of results) {
                            for (let component of result.address_components) {
                                if (component.types.includes("sublocality")) {
                                    sub_locality = component.long_name;
                                }
                                if (component.types.includes("administrative_area_level_3")) {
                                    city = component.long_name;
                                }
                                if (component.types.includes("locality")) {
                                    locality = component.long_name;
                                }
                                if (city && (sub_locality || locality)) break;
                            }
                            if (city && (sub_locality || locality)) break;
                        }
                    }
                    resolve({ sub_locality, city, locality });
                } else {
                    reject("Geocoder failed due to: " + status);
                }
            });
        });
    };

    // First, add these helper functions at the component level, after your useState declarations
    const calculatePricePerUnit = (price, area) => {
        const numPrice = parseFloat(price);
        const numArea = parseFloat(area);
        if (isNaN(numPrice) || isNaN(numArea) || numPrice <= 0 || numArea <= 0) return '';
        return (numPrice / numArea).toFixed(2);
    };

    const convertToSqFt = (value, unit) => {
        const numValue = parseFloat(value);
        if (isNaN(numValue) || !unit) return 0;
        const conversionRates = {
            'Sq.Ft': 1,
            'Sq.Yards': 9,
            'Sq.M': 10.764,
            'Acres': 43560,
            'Marla': 272.25,
            'Cents': 435.6,
            'Bigha': 27000,
            'Kanal': 5445,
            'Grounds': 2400,
            'Biswa': 1350,
            'Guntha': 1089,
            'Aankadam': 72,
            'Hectare': 107639,
            'Rood': 10890,
            'Chataks': 45,
            'Perch': 272.25
        };
        return numValue * (conversionRates[unit] || 1);
    };

    // Add this function to update price per sq.ft
    const updatePricePerSqft = (price, area, areaType, setFieldValue) => {
        const areaInSqFt = convertToSqFt(area, areaType);
        const pricePerUnit = calculatePricePerUnit(price, areaInSqFt);
        setFieldValue('price_per_sqft', pricePerUnit);
    };

    return (
        <div>
            <div className='mt-10 md:mx-10 lg:mx-10'>
                <div className='p-10 flex flex-col gap-5 items-center justify-center'>
                    <h2 className='font-bold text-3xl'>Sell or Rent Your Commercial Property at <span className="text-blue-500">199₹</span> with Vabgo.com.</h2>

                    <Formik
                        initialValues={{
                            ownerType: '',
                            address: '',
                            contactname: '',
                            listing_type: '',
                            property_type: '',
                            sub_property_type: '',
                            location_type: '',
                            property_ownership: '',
                            description: '',
                            city: '',
                            locality: '',
                            sub_locality: '',
                            expected_price: '',
                            price_per_sqft: '',
                            tax_govt_charges_excluded: false,
                            price_negotiable: false,
                            show_maintenance_booking: false,
                            maintenance_amount: '',
                            maintenance_duration: '',
                            booking_amount: '',
                        }}
                        validationSchema={LocationSchema}
                        onSubmit={nextHandler}
                    >
                        {({ errors, touched, setFieldValue, values, handleChange }) => (
                            <Form className='w-full max-w-4xl mb-20 bg-white rounded-lg shadow-md border border-gray-200 p-8'>
                                <h3 className='text-2xl font-semibold mb-8 text-center'>Personal Details</h3>
                                <div className='flex gap-2 flex-col mb-6'>
                                    <label className='block text-sm font-medium text-gray-700'>I am</label>
                                    <div className='flex gap-4'>
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue('ownerType', 'owner')}
                                            className={`px-4 py-2 rounded-md ${
                                                values.ownerType === 'owner'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300'
                                            }`}
                                        >
                                            Owner
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setFieldValue('ownerType', 'agent')}
                                            className={`px-4 py-2 rounded-md ${
                                                values.ownerType === 'agent'
                                                    ? 'bg-blue-500 text-white'
                                                    : 'bg-white text-gray-700 border border-gray-300'
                                            }`}
                                        >
                                            Agent
                                        </button>
                                    </div>
                                    {errors.ownerType && touched.ownerType && (
                                        <div className='text-red-500 text-sm mt-1'>{errors.ownerType}</div>
                                    )}
                                </div>

                                <div className='flex gap-2 flex-col mb-4'>
                                    <label htmlFor="contactname" className='block text-sm font-medium text-gray-700'>Contact Name</label>
                                    <Field
                                        as={Input}
                                        type="text"
                                        placeholder="Contact Name"
                                        name="contactname"
                                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    />
                                    {errors.contactname && touched.contactname && <div className='text-red-500 text-sm mt-1'>{errors.contactname}</div>}
                                </div>

                                <div className='flex gap-2 flex-col mb-4'>
                                    <label htmlFor="address" className='block text-sm font-medium text-gray-700'>Property Address</label>
                                    <Field
                                        as={Input}
                                        type="text"
                                        placeholder="Property Address"
                                        name="address"
                                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    />
                                    {errors.address && touched.address && <div className='text-red-500 text-sm mt-1'>{errors.address}</div>}
                                </div>

                                <div className='mb-8'>
                                    <h3 className='text-2xl font-semibold mb-6'>Property Details</h3>
                                    
                                    {/* Listing Type */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>I'm looking to</h2>
                                        <Field name="listing_type">
                                            {({ field }) => (
                                                <div className="flex gap-4">
                                                    <button
                                                        type="button"
                                                        className={`px-6 py-2 rounded-md ${
                                                            values.listing_type === 'Sell'
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('listing_type', 'Sell')}
                                                    >
                                                        Sell
                                                    </button>
                                                    <button
                                                        type="button"
                                                        className={`px-6 py-2 rounded-md ${
                                                            values.listing_type === 'Rent'
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('listing_type', 'Rent')}
                                                    >
                                                        Rent / Lease
                                                    </button>
                                                </div>
                                            )}
                                        </Field>
                                        {errors.listing_type && touched.listing_type && (
                                            <div className='text-red-500 text-sm mt-1'>{errors.listing_type}</div>
                                        )}
                                    </div>

                                    {/* Property Type */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Property Type</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {Object.keys(propertyTypeToSubProperties).map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`px-4 py-2 rounded-md ${
                                                        values.property_type === type
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                    onClick={() => {
                                                        setFieldValue('property_type', type);
                                                        setFieldValue('sub_property_type', '');
                                                    }}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.property_type && touched.property_type && (
                                            <div className='text-red-500 text-sm mt-1'>{errors.property_type}</div>
                                        )}
                                    </div>

                                    {/* Sub Property Type */}
                                    {values.property_type && (
                                        <div className='flex gap-2 flex-col mb-6'>
                                            <h2 className='text-gray-500'>Sub Property Type</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {propertyTypeToSubProperties[values.property_type]?.map((subType) => (
                                                    <button
                                                        key={subType}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.sub_property_type === subType
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('sub_property_type', subType)}
                                                    >
                                                        {subType}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Location Type */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Location Type</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                "Business Park",
                                                "IT Park",
                                                "Mall",
                                                "Industrial",
                                                "Commercial",
                                                "Residential",
                                                "Open Space",
                                                "Agricultural Zone",
                                                "Special Economic Zone",
                                                "Others"
                                            ].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`px-4 py-2 rounded-md ${
                                                        values.location_type === type
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                    onClick={() => setFieldValue('location_type', type)}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.location_type && touched.location_type && (
                                            <div className='text-red-500 text-sm mt-1'>{errors.location_type}</div>
                                        )}
                                    </div>

                                    {/* Property Ownership */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Ownership</h2>
                                        <div className="flex flex-wrap gap-2">
                                            {[
                                                "Freehold",
                                                "Lease Hold",
                                                "Cooperative Society",
                                                "Power of Attorney"
                                            ].map((type) => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    className={`px-4 py-2 rounded-md ${
                                                        values.property_ownership === type
                                                            ? 'bg-primary text-white'
                                                            : 'bg-gray-100 hover:bg-gray-200'
                                                    }`}
                                                    onClick={() => setFieldValue('property_ownership', type)}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                        {errors.property_ownership && touched.property_ownership && (
                                            <div className='text-red-500 text-sm mt-1'>{errors.property_ownership}</div>
                                        )}
                                    </div>

                                    {/* Description */}
                                    <div className='flex gap-2 flex-col max-w-[600px] mb-6'>
                                        <h2 className='text-gray-500'>Description</h2>
                                        <Textarea 
                                            placeholder="Describe your property" 
                                            name="description" 
                                            onChange={handleChange} 
                                            value={values.description}
                                            className="min-h-[100px]"
                                        />
                                        {errors.description && touched.description && (
                                            <div className='text-red-500 text-sm mt-1'>{errors.description}</div>
                                        )}
                                    </div>
                                </div>

                                {/* Coordinates and Location Section */}
                                <div className='grid grid-cols-1 gap-10'>
                                    {/* Latitude */}
                                    <div className='flex gap-2 flex-col max-w-[300px]'>
                                        <h2 className='text-gray-500'>Latitude</h2>
                                        <Input 
                                            type="number" 
                                            step="any"
                                            placeholder="Ex. 11.3410" 
                                            onChange={async (e) => {
                                                handleChange(e);
                                                const lat = e.target.value;
                                                const lng = values.longitude;

                                                if (lat && lng) {
                                                    try {
                                                        const { city, locality, sub_locality } = await getCityAndLocalityFromCoordinates(lat, lng);
                                                        if (city) setFieldValue('city', city);
                                                        if (locality) setFieldValue('locality', locality);
                                                        if (sub_locality) setFieldValue('sub_locality', sub_locality);
                                                    } catch (error) {
                                                        console.error('Error getting location:', error);
                                                    }
                                                }
                                            }}
                                            value={values.latitude} 
                                            name="latitude"
                                            className="w-[300px]"
                                        />
                                    </div>

                                    {/* Longitude */}
                                    <div className='flex gap-2 flex-col max-w-[300px]'>
                                        <h2 className='text-gray-500'>Longitude</h2>
                                        <Input 
                                            type="number" 
                                            step="any"
                                            placeholder="Ex. 77.7172" 
                                            onChange={async (e) => {
                                                handleChange(e);
                                                const lng = e.target.value;
                                                const lat = values.latitude;

                                                if (lat && lng) {
                                                    try {
                                                        const { city, locality, sub_locality } = await getCityAndLocalityFromCoordinates(lat, lng);
                                                        if (city) setFieldValue('city', city);
                                                        if (locality) setFieldValue('locality', locality);
                                                        if (sub_locality) setFieldValue('sub_locality', sub_locality);
                                                    } catch (error) {
                                                        console.error('Error getting location:', error);
                                                    }
                                                }
                                            }}
                                            value={values.longitude} 
                                            name="longitude"
                                            className="w-[300px]"
                                        />
                                    </div>

                                    {/* City */}
                                    <div className='flex gap-2 flex-col max-w-[300px]'>
                                        <h2 className='text-gray-500'>City</h2>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter city name" 
                                            onChange={handleChange} 
                                            value={values.city} 
                                            name="city"
                                            className="w-[300px]"
                                        />
                                    </div>

                                    {/* Locality */}
                                    <div className='flex gap-2 flex-col max-w-[300px]'>
                                        <h2 className='text-gray-500'>Locality</h2>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter locality" 
                                            onChange={handleChange} 
                                            value={values.locality} 
                                            name="locality"
                                            className="w-[300px]"
                                        />
                                    </div>

                                    {/* Sub Locality */}
                                    <div className='flex gap-2 flex-col max-w-[300px]'>
                                        <h2 className='text-gray-500'>Sub Locality</h2>
                                        <Input 
                                            type="text" 
                                            placeholder="Enter sub locality" 
                                            onChange={handleChange} 
                                            value={values.sub_locality} 
                                            name="sub_locality"
                                            className="w-[300px]"
                                        />
                                    </div>
                                </div>

                                <div className='mb-8'>
                                    <h3 className='text-2xl font-semibold mb-6'>Area Details</h3>
                                    
                                    {/* Carpet Area */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Carpet Area</h2>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="number" 
                                                placeholder="Enter carpet area" 
                                                onChange={(e) => {
                                                    handleChange(e);
                                                    updatePricePerSqft(
                                                        values.expected_price,
                                                        e.target.value,
                                                        values.carpet_area_type,
                                                        setFieldValue
                                                    );
                                                }}
                                                value={values.carpet_area} 
                                                name="carpet_area"
                                                className="w-[300px]"
                                            />
                                            <Select 
                                                onValueChange={(value) => {
                                                    setFieldValue('carpet_area_type', value);
                                                    updatePricePerSqft(
                                                        values.expected_price,
                                                        values.carpet_area,
                                                        value,
                                                        setFieldValue
                                                    );
                                                }}
                                                value={values.carpet_area_type}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[
                                                        "Sq.Ft",
                                                        "Sq.Yards",
                                                        "Sq.M",
                                                        "Acres",
                                                        "Marla",
                                                        "Cents",
                                                        "Bigha",
                                                        "Kanal",
                                                        "Grounds",
                                                        "Biswa",
                                                        "Guntha",
                                                        "Aankadam",
                                                        "Hectare",
                                                        "Rood",
                                                        "Chataks",
                                                        "Perch"
                                                    ].map((unit) => (
                                                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Built Up Area */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Built Up Area</h2>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="number" 
                                                placeholder="Enter built up area" 
                                                onChange={handleChange}
                                                value={values.built_up_area} 
                                                name="built_up_area"
                                                className="w-[300px]"
                                            />
                                            <Select 
                                                onValueChange={(value) => setFieldValue('built_up_area_type', value)} 
                                                value={values.built_up_area_type}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[
                                                        "Sq.Ft",
                                                        "Sq.Yards",
                                                        "Sq.M",
                                                        "Acres",
                                                        "Marla",
                                                        "Cents",
                                                        "Bigha",
                                                        "Kanal",
                                                        "Grounds",
                                                        "Biswa",
                                                        "Guntha",
                                                        "Aankadam",
                                                        "Hectare",
                                                        "Rood",
                                                        "Chataks",
                                                        "Perch"
                                                    ].map((unit) => (
                                                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>

                                    {/* Super Built Up Area */}
                                    <div className='flex gap-2 flex-col mb-6'>
                                        <h2 className='text-gray-500'>Super Built Up Area</h2>
                                        <div className="flex gap-2">
                                            <Input 
                                                type="number" 
                                                placeholder="Enter super built up area" 
                                                onChange={handleChange}
                                                value={values.super_built_up_area} 
                                                name="super_built_up_area"
                                                className="w-[300px]"
                                            />
                                            <Select 
                                                onValueChange={(value) => setFieldValue('super_built_up_area_type', value)} 
                                                value={values.super_built_up_area_type}
                                            >
                                                <SelectTrigger className="w-[200px]">
                                                    <SelectValue placeholder="Select unit" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {[
                                                        "Sq.Ft",
                                                        "Sq.Yards",
                                                        "Sq.M",
                                                        "Acres",
                                                        "Marla",
                                                        "Cents",
                                                        "Bigha",
                                                        "Kanal",
                                                        "Grounds",
                                                        "Biswa",
                                                        "Guntha",
                                                        "Aankadam",
                                                        "Hectare",
                                                        "Rood",
                                                        "Chataks",
                                                        "Perch"
                                                    ].map((unit) => (
                                                        <SelectItem key={unit} value={unit}>{unit}</SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                </div>

                                {/* Price Details */}
                                <div className='mb-8'>
                                    <h3 className='text-2xl font-semibold mb-6'>Price Details</h3>
                                    <div className='p-5 border rounded-lg shadow-md grid gap-7'>
                                        <div className='grid grid-cols-1 gap-10'>
                                            {/* Expected Price */}
                                            <div className='flex gap-2 flex-col max-w-[300px]'>
                                                <h2 className='text-gray-500'>Expected Price</h2>
                                                <Input 
                                                    type="number" 
                                                    placeholder="₹ Enter expected price" 
                                                    name="expected_price"
                                                    onChange={(e) => {
                                                        handleChange(e);
                                                        updatePricePerSqft(
                                                            e.target.value,
                                                            values.carpet_area,
                                                            values.carpet_area_type,
                                                            setFieldValue
                                                        );
                                                    }}
                                                    value={values.expected_price}
                                                    className={`w-[300px] ${!values.expected_price && 'border-red-500'}`}
                                                />
                                                {!values.expected_price && (
                                                    <span className="text-red-500 text-sm">Please specify the price</span>
                                                )}
                                            </div>

                                            {/* Price per sq.ft */}
                                            <div className='flex gap-2 flex-col max-w-[300px]'>
                                                <h2 className='text-gray-500'>Price per sq.ft</h2>
                                                <Input 
                                                    type="text" 
                                                    placeholder="₹ Price per sq.ft" 
                                                    name="price_per_sqft"
                                                    value={values.price_per_sqft}
                                                    disabled
                                                    className="w-[300px] bg-gray-50"
                                                />
                                            </div>

                                            {/* Tax and Price Negotiable */}
                                            <div className='flex gap-4 flex-col'>
                                                {/* Tax and Govt Charges */}
                                                <div className='flex gap-2 flex-col'>
                                                    <h2 className='text-gray-500'>Tax and Govt. charges excluded</h2>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            "Yes",
                                                            "No"
                                                        ].map((type) => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                className={`px-4 py-2 rounded-md ${
                                                                    (values.tax_govt_charges_excluded && type === "Yes") || 
                                                                    (!values.tax_govt_charges_excluded && type === "No")
                                                                        ? 'bg-primary text-white'
                                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                                }`}
                                                                onClick={() => setFieldValue('tax_govt_charges_excluded', type === "Yes")}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>

                                                {/* Price Negotiable */}
                                                <div className='flex gap-2 flex-col'>
                                                    <h2 className='text-gray-500'>Price Negotiable</h2>
                                                    <div className="flex flex-wrap gap-2">
                                                        {[
                                                            "Yes",
                                                            "No"
                                                        ].map((type) => (
                                                            <button
                                                                key={type}
                                                                type="button"
                                                                className={`px-4 py-2 rounded-md ${
                                                                    (values.price_negotiable && type === "Yes") || 
                                                                    (!values.price_negotiable && type === "No")
                                                                        ? 'bg-primary text-white'
                                                                        : 'bg-gray-100 hover:bg-gray-200'
                                                                }`}
                                                                onClick={() => setFieldValue('price_negotiable', type === "Yes")}
                                                            >
                                                                {type}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Maintenance and Booking Amount */}
                                            <div className='flex gap-2 flex-col'>
                                                <button
                                                    type="button"
                                                    onClick={() => setFieldValue('show_maintenance_booking', !values.show_maintenance_booking)}
                                                    className="flex items-center text-primary hover:text-primary/80 text-sm w-fit"
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Maintenance and Booking Amount
                                                </button>

                                                {values.show_maintenance_booking && (
                                                    <div className="grid gap-6 mt-2">
                                                        <div className='flex gap-2 flex-col'>
                                                            <h2 className='text-gray-500'>Maintenance Details</h2>
                                                            <div className="flex gap-2">
                                                                <div className="flex-1 max-w-[300px]">
                                                                    <Input 
                                                                        type="number" 
                                                                        placeholder="₹ Enter maintenance amount" 
                                                                        name="maintenance_amount"
                                                                        onChange={handleChange}
                                                                        value={values.maintenance_amount}
                                                                        className="w-full"
                                                                    />
                                                                </div>
                                                                <Select 
                                                                    onValueChange={(e) => setFieldValue('maintenance_duration', e)} 
                                                                    value={values.maintenance_duration}
                                                                >
                                                                    <SelectTrigger className="w-[200px]">
                                                                        <SelectValue placeholder="Select Duration" />
                                                                    </SelectTrigger>
                                                                    <SelectContent>
                                                                        <SelectItem value="Monthly">Monthly</SelectItem>
                                                                        <SelectItem value="Annually">Annually</SelectItem>
                                                                        <SelectItem value="One Time">One Time</SelectItem>
                                                                        <SelectItem value="Per Unit/Monthly">Per Unit/Monthly</SelectItem>
                                                                    </SelectContent>
                                                                </Select>
                                                            </div>
                                                        </div>
                                                        
                                                        <div className='flex gap-2 flex-col max-w-[300px]'>
                                                            <h2 className='text-gray-500'>Booking Amount</h2>
                                                            <Input 
                                                                type="number" 
                                                                placeholder="₹ Enter booking amount" 
                                                                name="booking_amount"
                                                                onChange={handleChange}
                                                                value={values.booking_amount}
                                                                className="w-[300px]"
                                                            />
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Property Features */}
                                <div className='mb-8'>
                                    <h3 className='text-2xl font-semibold mb-6'>Property Features</h3>
                                    <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                                        {/* Power Backup */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Power Backup</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Full",
                                                    "DG Backup",
                                                    "Need to Arrange",
                                                    "None"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.power_backup === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('power_backup', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Lift */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Lift</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Available",
                                                    "Not Available"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.lift === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('lift', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Parking */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Parking</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Private Parking",
                                                    "Public Parking",
                                                    "Multi Level Parking",
                                                    "Not Available"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.parking === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('parking', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Washroom */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Washroom</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Shared",
                                                    "No Washroom",
                                                    "Private"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.washroom === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('washroom', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Water Storage */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Water Storage</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Yes",
                                                    "No"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.water === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('water', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Security */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Security</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Yes",
                                                    "No"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.property_security === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('property_security', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Air Conditioning */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Air Conditioning</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Duct Only",
                                                    "Available",
                                                    "Not Available"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.air_conditioning === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('air_conditioning', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Oxygen Duct */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Oxygen Duct</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Available",
                                                    "Not Available"
                                                ].map((type) => (
                                                    <button
                                                        key={type}
                                                        type="button"
                                                        className={`px-4 py-2 rounded-md ${
                                                            values.oxygen_duct === type
                                                                ? 'bg-primary text-white'
                                                                : 'bg-gray-100 hover:bg-gray-200'
                                                        }`}
                                                        onClick={() => setFieldValue('oxygen_duct', type)}
                                                    >
                                                        {type}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        {/* Fire Safety */}
                                        <div className='flex gap-2 flex-col'>
                                            <h2 className='text-gray-500'>Fire Safety (Select multiple)</h2>
                                            <div className="flex flex-wrap gap-2">
                                                {[
                                                    "Fire Extinguisher",
                                                    "Fire Sensor",
                                                    "Sprinklers",
                                                    "Firehose",
                                                    "Not Available"
                                                ].map((type) => {
                                                    const fireSafetyArray = Array.isArray(values.fire_safety) 
                                                        ? values.fire_safety 
                                                        : values.fire_safety ? [values.fire_safety] : [];

                                                    return (
                                                        <button
                                                            key={type}
                                                            type="button"
                                                            className={`px-4 py-2 rounded-md ${
                                                                fireSafetyArray.includes(type)
                                                                    ? 'bg-primary text-white'
                                                                    : 'bg-gray-100 hover:bg-gray-200'
                                                            }`}
                                                            onClick={() => {
                                                                let newValue;
                                                                if (type === "Not Available") {
                                                                    newValue = [type];
                                                                } else if (fireSafetyArray.includes("Not Available")) {
                                                                    newValue = [type];
                                                                } else {
                                                                    newValue = fireSafetyArray.includes(type)
                                                                        ? fireSafetyArray.filter(item => item !== type)
                                                                        : [...fireSafetyArray, type];
                                                                }
                                                                setFieldValue('fire_safety', newValue);
                                                            }}
                                                        >
                                                            {type}
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Image Upload */}
                                <div className='mb-8'>
                                    <h2 className='font-lg text-gray-500 my-2'>Upload Property Images</h2>
                                    <FileUpload
                                        setImages={(value) => setImages(value)}
                                        imageList={images}
                                    />
                                </div>

                                <div className='flex justify-between'>
                                    <Button 
                                        type="submit" 
                                        disabled={loader} 
                                        className='bg-blue-500 hover:bg-blue-600 text-white w-full py-2 text-lg font-medium transition-colors'
                                    >
                                        {loader ? <Loader className='animate-spin' /> : 'Next'}
                                    </Button>
                                </div>
                            </Form>
                        )}
                    </Formik>


                    {/* Tips Section */}
                    <div className='w-full max-w-4xl mb-10'>
                        <h3 className='text-2xl font-bold mb-6'>Tips on Selling a Property Online</h3>
                        <div className='grid md:grid-cols-2 gap-6'>
                            <div className='p-6 border rounded-lg shadow-sm'>
                                <h4 className='font-semibold mb-2'>Add Quality Photos</h4>
                                <p className='text-gray-600'>Add high-quality photos as it's key for any property to stand out.</p>
                            </div>
                            <div className='p-6 border rounded-lg shadow-sm'>
                                <h4 className='font-semibold mb-2'>Choose Correct Locality/Address</h4>
                                <p className='text-gray-600'>Accurately map your locality to receive genuine queries for your property.</p>
                            </div>
                            <div className='p-6 border rounded-lg shadow-sm'>
                                <h4 className='font-semibold mb-2'>Write a Great Description</h4>
                                <p className='text-gray-600'>Provide a short description highlighting key USPs and relevant details.</p>
                            </div>
                            <div className='p-6 border rounded-lg shadow-sm'>
                                <h4 className='font-semibold mb-2'>Add Additional Details</h4>
                                <p className='text-gray-600'>Include all relevant details about furnishing, flooring, water supply, etc.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Success Dialog */}
            {showSuccessDialog && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <button 
                            onClick={() => {
                                setShowSuccessDialog(false);
                                router.replace('/');
                            }} 
                            className="float-right text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mt-4">
                            <h2 className="text-xl font-semibold mb-2">
                                Listing Submitted Successfully!
                            </h2>
                            <p className="text-gray-600 mb-6">
                                Your property listing has been submitted successfully. The Vabgo team will verify and publish it soon.
                            </p>
                            <Button
                                type="button"
                                variant="default"
                                onClick={() => {
                                    setShowSuccessDialog(false);
                                    router.replace('/');
                                }}
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            {/* Exit Intent Modal */}
            {showExitModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-lg max-w-md w-full">
                        <button 
                            onClick={() => setShowExitModal(false)} 
                            className="float-right text-gray-500 hover:text-gray-700"
                        >
                            <X size={24} />
                        </button>
                        
                        <div className="text-center mt-4">
                            <h2 className="text-xl font-semibold mb-2">
                                Stuck in the form?
                            </h2>
                            <p className="text-gray-600 mb-6">
                                There are other ways to upload your property
                            </p>

                            {/* Call Option */}
                            <div className="flex items-center gap-4 mb-4 p-4 border rounded-lg">
                                <div className="p-2 bg-blue-100 rounded-full">
                                    <Phone className="h-6 w-6 text-blue-500" />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm text-gray-500">Call us on</div>
                                    <div className="font-semibold">08048811281</div>
                                </div>
                            </div>

                            {/* Divider */}
                            <div className="flex items-center gap-4 my-4">
                                <div className="flex-1 h-px bg-gray-200"></div>
                                <div className="text-gray-500">OR</div>
                                <div className="flex-1 h-px bg-gray-200"></div>
                            </div>

                            {/* WhatsApp Option */}
                            <div className="flex items-center gap-4 p-4 border rounded-lg">
                                <div className="p-2 bg-green-100 rounded-full">
                                    <img 
                                        src="/whatsapp-icon.png" 
                                        alt="WhatsApp" 
                                        className="h-6 w-6"
                                    />
                                </div>
                                <div className="text-left">
                                    <div className="text-sm text-gray-500">Scan the QR Code to</div>
                                    <div className="font-semibold">Post Via WhatsApp</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

export default AddNewListing;
