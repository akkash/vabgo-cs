'use client'
import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Formik, Form, Field } from 'formik'
import { toast } from 'sonner'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import FileUpload from '../_components/FileUpload'
import { Loader } from 'lucide-react'
import { HelpCircle } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Plus } from 'lucide-react'

export default function EditListingForm({ initialListing }) {
  const router = useRouter();
  const [images, setImages] = useState(initialListing.listingImages || []);
  const [loading, setLoading] = useState(false);
  const supabase = createClientComponentClient()

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

          if (results[0]) {
            for (let result of results) {
              for (let component of result.address_components) {
                if (component.types.includes("administrative_area_level_3")) {
                  city = component.long_name;
                }
                if (component.types.includes("administrative_area_level_4")) {
                  locality = component.long_name;
                }
                if (city && locality) break;
              }
              if (city && locality) break;
            }
          }
          resolve({ city, locality });
        } else {
          reject("Geocoder failed due to: " + status);
        }
      });
    });
  };

  // Add this function to generate the title
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
    if (values.locality || values.city) {
      parts.push("in");
      if (values.locality) parts.push(values.locality);
      if (values.locality && values.city) parts.push(",");
      if (values.city) parts.push(values.city);
    }
    
    // Add area
    if (values.carpet_area && values.carpet_area_type) {
      parts.push(`${values.carpet_area} ${values.carpet_area_type}`);
    }
    
    return parts.join(" ");
  };

  // Add this function to generate URL-friendly slug
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
    if (values.locality || values.city) {
      parts.push("in");
      if (values.locality) parts.push(values.locality);
      if (values.locality && values.city) parts.push(",");
      if (values.city) parts.push(values.city);
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

  const onSubmitHandler = async (values) => {
    setLoading(true);
    try {
      // Generate title and slug before submitting
      const title = generateTitle(values);
      const slug = generateSlug(values);
      
      // Exclude latitude and longitude from the update
      const { latitude, longitude, ...updateValues } = values;

      const { data, error } = await supabase
        .from('listing')
        .update({
          ...updateValues,
          property_title: title,
          slug,
          active: true
        })
        .eq('id', initialListing.id)
        .select();

      if (error) throw error;

      // Handle image upload
      for (const image of images) {
        setLoading(true);
        const file = image;
        const fileName = Date.now().toString();
        const fileExt = fileName.split('.').pop();
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('listingImages')
          .upload(`${fileName}`, file, {
            contentType: `image/${fileExt}`,
            upsert: false
          });

        if (uploadError) {
          setLoading(false);
          toast('Error while uploading images');
        } else {
          const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName;
          const { data: insertData, error: insertError } = await supabase
            .from('listingImages')
            .insert([
              { url: imageUrl, listing_id: initialListing.id }
            ])
            .select();

          if (insertData) {
            setLoading(false);
          }
          if (insertError) {
            setLoading(false);
          }
        }
        setLoading(false);
      }

      toast('Listing updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast('Error updating listing');
    } finally {
      setLoading(false);
    }
  };

  // Add this object to map property types to their sub-properties
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
    ]
    ,
    "Land": [
      "Commercial Land",
      "Industrial Land",
      "Commercial Plot",
      "Industrial Plot",
      "Agricultural Land"
    ]
    ,
    "Others": [
      "Others"
    ]
  };

  // Update the helper functions to ensure proper number handling
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

  // Add a function to update price per sq.ft
  const updatePricePerSqft = (price, area, areaType, setFieldValue) => {
    const areaInSqFt = convertToSqFt(area, areaType);
    const pricePerUnit = calculatePricePerUnit(price, areaInSqFt);
    setFieldValue('price_per_sqft', pricePerUnit);
  };

  const nextHandler = async (values) => {
    setLoader(true);
    let coordinates = null;
    if (values.latitude && values.longitude) {
      coordinates = {
        lat: parseFloat(values.latitude),
        lng: parseFloat(values.longitude)
      };
    }
    try {
      let cityData = { city: "", locality: "" };
      if (coordinates) {
        try {
          cityData = await getCityAndLocalityFromCoordinates(coordinates.lat, coordinates.lng);
        } catch (geocodeError) {
          console.error('Error getting city and locality:', geocodeError);
          // Continue with empty city if geocoding fails
        }
      }
      const { data, error } = await supabase
        .from('listing')
        .insert([
          {
            address: values.address,
            contactname: values.contactname,
            coordinates: coordinates,
            email: values.email,
            createdBy: user?.phone,
            city: cityData.city,
            locality: cityData.locality,
            userType: values.userType,
          },
        ])
        .select();

      if (error) throw error;

      // Handle success (e.g., navigate to another page or show a success message)
    } catch (error) {
      console.error('Error inserting listing:', error);
      // Handle error (e.g., show an error message)
    } finally {
      setLoader(false);
    }
  };

  return (
    <div className='px-10 md:px-36 my-10'>
      <h2 className='font-bold text-2xl'>Enter some more details about your listing</h2>

      <Formik
        initialValues={{
          listing_type: initialListing.listing_type || '',
          city: initialListing.city || '',
          locality: initialListing.locality || '',
          property_type: initialListing.property_type || '',
          sub_property_type: initialListing.sub_property_type || '',
          location_type: initialListing.location_type || '',
          property_ownership: initialListing.property_ownership || '',
          description: initialListing.description || '',
          expected_price: initialListing.expected_price || '',
          built_up_area: initialListing.built_up_area || '',
          carpet_area: initialListing.carpet_area || '',
          lock_in_period: initialListing.lock_in_period || '',
          age_of_property: initialListing.age_of_property || '',
          floor: initialListing.floor || '',
          power_backup: initialListing.power_backup || '',
          lift: initialListing.lift || '',
          parking: initialListing.parking || '',
          washroom: initialListing.washroom || '',
          water: initialListing.water || '',
          property_security: initialListing.property_security || '',
          latitude: initialListing.latitude || '',
          longitude: initialListing.longitude || '',
          built_up_area_type: initialListing.built_up_area_type || 'Sq.Ft',
          carpet_area_type: initialListing.carpet_area_type || 'Sq.Ft',
          super_built_up_area: initialListing.super_built_up_area || '',
          super_built_up_area_type: initialListing.super_built_up_area_type || 'Sq.Ft',
          air_conditioning: initialListing.air_conditioning || '',
          oxygen_duct: initialListing.oxygen_duct || '',
          fire_safety: initialListing.fire_safety || '',
          price_per_sqft: initialListing.price_per_sqft || '',
          tax_govt_charges_excluded: initialListing.tax_govt_charges_excluded || false,
          price_negotiable: initialListing.price_negotiable || false,
          show_maintenance_booking: initialListing.show_maintenance_booking || false,
          maintenance_amount: initialListing.maintenance_amount || '',
          maintenance_duration: initialListing.maintenance_duration || '',
          booking_amount: initialListing.booking_amount || '',
          total_floor: initialListing.total_floor || '',
        }}
        enableReinitialize={true}
        onSubmit={onSubmitHandler}
      >
        {({
          values,
          handleChange,
          handleSubmit,
          setFieldValue
        }) => (
          <form onSubmit={handleSubmit}>
            <div className='p-5 border rounded-lg shadow-md grid gap-7 mt-6'>
              <h1><b>Property Details</b></h1>
              <div className='grid grid-cols-1 gap-10'>
                {/* Listing Type */}
                <div className='flex gap-2 flex-col'>
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
                </div>

                  
                {/* Property Type */}
                <div className='flex gap-2 flex-col'>
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
                </div>

                {/* Sub Property Type */}
                {values.property_type && (
                  <div className='flex gap-2 flex-col'>
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
                <div className='flex gap-2 flex-col'>
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
                </div>

                {/* Property Ownership */}
                <div className='flex gap-2 flex-col'>
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
                </div>

                {/* Description */}
                <div className='flex gap-2 flex-col max-w-[600px]'>
                  <h2 className='text-gray-500'>Description</h2>
                  <Textarea 
                    placeholder="" 
                    name="description" 
                    onChange={handleChange} 
                    value={values.description} 
                  />
                </div>


                {/* City */}
                <div className='flex gap-2 flex-col max-w-[300px]'>
                  <h2 className='text-gray-500'>City</h2>
                  <Input 
                    type="text" 
                    placeholder="Erode" 
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
                    placeholder="Erode" 
                    onChange={handleChange} 
                    value={values.locality} 
                    name="locality"
                    className="w-[300px]"
                  />
                </div>

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
                      setFieldValue('coordinates', { lat, lng });

                      if (lat && lng) {
                        try {
                          const { city, locality } = await getCityAndLocalityFromCoordinates(lat, lng);
                          if (city) setFieldValue('city', city);
                          if (locality) setFieldValue('locality', locality);
                        } catch (error) {
                          console.error('Error getting location:', error);
                        }
                      }
                    }}
                    value={values.latitude} 
                    name="latitude" 
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
                      setFieldValue('coordinates', { lat, lng });

                      if (lat && lng) {
                        try {
                          const { city, locality } = await getCityAndLocalityFromCoordinates(lat, lng);
                          if (city) setFieldValue('city', city);
                          if (locality) setFieldValue('locality', locality);
                        } catch (error) {
                          console.error('Error getting location:', error);
                        }
                      }
                    }}
                    value={values.longitude} 
                    name="longitude" 
                  />
                </div>


                                {/* Carpet Area with Info Icon */}
                                <div className='flex gap-2 flex-col max-w-[600px]'>
                  <div className="flex items-center gap-2 group relative">
                    <h2 className='text-gray-500'>Carpet Area</h2>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-[250px] p-2 bg-white border rounded-md shadow-md text-sm text-gray-600 z-10">
                      Carpet Area is the actual usable floor area that you can cover with a carpet. It excludes common areas like lift lobby, stairs, and walls.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Ex. 7000" 
                      value={values.carpet_area} 
                      name="carpet_area" 
                      onChange={(e) => {
                        handleChange(e);
                        updatePricePerSqft(
                          values.expected_price,
                          e.target.value,
                          values.carpet_area_type,
                          setFieldValue
                        );
                      }}
                      className="w-[300px]"
                    />
                    <Select 
                      onValueChange={(e) => {
                        setFieldValue('carpet_area_type', e);
                        updatePricePerSqft(
                          values.expected_price,
                          values.carpet_area,
                          e,
                          setFieldValue
                        );
                      }} 
                      value={values.carpet_area_type}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Unit" />
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

                {/* Built Up Area with Info Icon */}
                <div className='flex gap-2 flex-col max-w-[600px]'>
                  <div className="flex items-center gap-2 group relative">
                    <h2 className='text-gray-500'>Built Up Area</h2>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-[250px] p-2 bg-white border rounded-md shadow-md text-sm text-gray-600 z-10">
                      Built Up Area includes the total carpet area plus the area covered by walls. It represents the total area within the walls of your property.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Ex. 4000" 
                      value={values.built_up_area} 
                      name="built_up_area" 
                      onChange={handleChange}
                      className="w-[300px]"
                    />
                    <Select 
                      onValueChange={(e) => setFieldValue('built_up_area_type', e)} 
                      value={values.built_up_area_type}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Unit" />
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

                {/* Super Built Up Area with Info Icon */}
                <div className='flex gap-2 flex-col max-w-[600px]'>
                  <div className="flex items-center gap-2 group relative">
                    <h2 className='text-gray-500'>Super Built Up Area</h2>
                    <HelpCircle className="h-4 w-4 text-gray-500 cursor-help" />
                    <div className="invisible group-hover:visible absolute left-0 top-6 w-[300px] p-2 bg-white border rounded-md shadow-md text-sm text-gray-600 z-10">
                      Super Built Up Area includes the built-up area plus proportionate common areas such as lift, lobby, corridor, stairs, shaft, elevator, security room, etc. This is typically the largest measurement of the three areas.
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Input 
                      type="number" 
                      placeholder="Ex. 5000" 
                      value={values.super_built_up_area} 
                      name="super_built_up_area" 
                      onChange={handleChange}
                      className="w-[300px]"
                    />
                    <Select 
                      onValueChange={(e) => setFieldValue('super_built_up_area_type', e)} 
                      value={values.super_built_up_area_type}
                    >
                      <SelectTrigger className="w-[150px]">
                        <SelectValue placeholder="Select Unit" />
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

                {/* Lock In Period */}
                <div className='flex gap-2 flex-col max-w-[300px]'>
                  <h2 className='text-gray-500'>Lock In Period</h2>
                  <Input 
                    type="number" 
                    placeholder="Ex.1 Year" 
                    name="lock_in_period" 
                    onChange={handleChange} 
                    value={values.lock_in_period}
                    className="w-[300px]"
                  />
                </div>

                {/* Age of Property */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Age Of Property</h2>
                  <div className="flex flex-wrap gap-2">
                    {[
                      "Under Construction",
                      "Less than a Year",
                      "1 to 5 Year",
                      "5 to 10 Year",
                      "More than 10 Year"
                    ].map((type) => (
                      <button
                        key={type}
                        type="button"
                        className={`px-4 py-2 rounded-md ${
                          values.age_of_property === type
                            ? 'bg-primary text-white'
                            : 'bg-gray-100 hover:bg-gray-200'
                        }`}
                        onClick={() => setFieldValue('age_of_property', type)}
                      >
                        {type}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Floor */}
                <div className='flex gap-2 flex-col max-w-[300px]'>
                  <h2 className='text-gray-500'>Floor</h2>
                  <Select onValueChange={(e) => setFieldValue('floor', e)} value={values.floor}>
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lower Basement">Lower Basement</SelectItem>
                      <SelectItem value="Upper Basement">Upper Basement</SelectItem>
                      <SelectItem value="Ground">Ground</SelectItem>
                      <SelectItem value="Full Building">Full Building</SelectItem>
                      {[...Array(18)].map((_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Total Floor */}
                <div className='flex gap-2 flex-col max-w-[300px]'>
                  <h2 className='text-gray-500'>Total Floor</h2>
                  <Select 
                    onValueChange={(e) => setFieldValue('total_floor', e)} 
                    value={values.total_floor}
                  >
                    <SelectTrigger className="w-[300px]">
                      <SelectValue placeholder="Select Total Floor" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Lower Basement">Lower Basement</SelectItem>
                      <SelectItem value="Upper Basement">Upper Basement</SelectItem>
                      <SelectItem value="Ground">Ground</SelectItem>
                      <SelectItem value="Full Building">Full Building</SelectItem>
                      {[...Array(18)].map((_, i) => (
                        <SelectItem key={i} value={(i + 1).toString()}>{i + 1}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Price Details */}
              <div className='p-5 border rounded-lg shadow-md grid gap-7 mt-6'>
                <h1><b>Price Details</b></h1>
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
                      "Available",
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
                      // Convert string to array if it's not already
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
                              // If "Not Available" is clicked, clear other selections
                              newValue = [type];
                            } else if (fireSafetyArray.includes("Not Available")) {
                              // If a feature is selected and "Not Available" was previously selected,
                              // remove "Not Available" and add the new feature
                              newValue = [type];
                            } else {
                              // Toggle the selected feature
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

              {/* Image Upload */}
              <div>
                <h2 className='font-lg text-gray-500 my-2'>Upload Property Images</h2>
                <FileUpload
                  setImages={(value) => setImages(value)}
                  imageList={images}
                />
              </div>

              

              {/* Submit Button */}
              <div className='flex gap-7 justify-end'>
                <Button type="submit" disabled={loading} className="bg-primary text-white">
                  {loading ? <Loader className='animate-spin' /> : 'Save and Publish'}
                </Button>
              </div>
            </div>
          </form>
        )}
      </Formik>
    </div>
  )
}
