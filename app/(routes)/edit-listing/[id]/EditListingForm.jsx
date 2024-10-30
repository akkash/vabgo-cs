'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Formik, Form, Field } from 'formik'
import { toast } from 'sonner'
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import FileUpload from '../_components/FileUpload'
import { Loader } from 'lucide-react'

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

  const onSubmitHandler = async (values) => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('listing')
        .update({
          ...values,
          active: true
        })
        .eq('id', initialListing.id)
        .select();

      if (error) throw error;

      // Handle image upload here if needed

      toast('Listing updated successfully!');
      router.push('/');
    } catch (error) {
      console.error('Error updating listing:', error);
      toast('Error updating listing');
    } finally {
      setLoading(false);
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
          price: initialListing.price || '',
          build_up_area: initialListing.build_up_area || '',
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
              <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                {/* Listing Type */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Do you want to Rent it or Sell it?</h2>
                  <Field name="listing_type">
                    {({ field }) => (
                      <RadioGroup
                        {...field}
                        value={values.listing_type}
                        onValueChange={(v) => setFieldValue('listing_type', v)}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Sell" id="Sell" />
                          <Label htmlFor="Sell" className="text-lg">Sell</Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="Rent" id="Rent" />
                          <Label htmlFor="Rent" className="text-lg">Rent</Label>
                        </div>
                      </RadioGroup>
                    )}
                  </Field>
                </div>

                {/* City */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>City</h2>
                  <Input type="text" placeholder="Erode" onChange={handleChange} value={values.city} name="city" />
                </div>

                {/* Locality */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Locality</h2>
                  <Input type="text" placeholder="Erode" onChange={handleChange} value={values.locality} name="locality" />
                </div>
                
                {/* Property Type */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Property Type</h2>
                  <Select onValueChange={(e) => setFieldValue('property_type', e)} value={values.property_type}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial Property">Commercial Property</SelectItem>
                      <SelectItem value="Factory & Industrial Building">Factory & Industrial Building</SelectItem>
                      <SelectItem value="Warehouse & Cold Storage">Warehouse & Cold Storage</SelectItem>
                      <SelectItem value="Land & Plots">Land & Plots</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Sub Property Type */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Sub Property Type</h2>
                  <Select onValueChange={(e) => setFieldValue('sub_property_type', e)} value={values.sub_property_type}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Sub Property Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Commercial Office Space">Commercial Office Space</SelectItem>
                      <SelectItem value="Coworking Space">Co-Working Space</SelectItem>
                      <SelectItem value="Commercial Shop">Commercial Shop</SelectItem>
                      <SelectItem value="Commercial Showroom">Commercial Showroom</SelectItem>
                      <SelectItem value="Office In IT SEZ Park">Office In IT SEZ Park</SelectItem>
                      <SelectItem value="Industrial Land">Industrial Land</SelectItem>
                      <SelectItem value="Commercial Land">Commercial Land</SelectItem>
                      <SelectItem value="Warehouse">Warehouse</SelectItem>
                      <SelectItem value="Factory">Factory</SelectItem>
                      <SelectItem value="Industrial Shed">Industrial Shed</SelectItem>
                      <SelectItem value="Industrial Building">Industrial Building</SelectItem>
                      <SelectItem value="Other Business">Other Business</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Location Type */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Location Type</h2>
                  <Select onValueChange={(e) => setFieldValue('location_type', e)} value={values.location_type}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Location Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Business Park">Business Park</SelectItem>
                      <SelectItem value="IT Park">IT Park</SelectItem>
                      <SelectItem value="Mall">Mall</SelectItem>
                      <SelectItem value="Industrial">Industrial</SelectItem>
                      <SelectItem value="Commercial">Commercial</SelectItem>
                      <SelectItem value="Residential">Residential</SelectItem>
                      <SelectItem value="Open Space">Open Space</SelectItem>
                      <SelectItem value="Agricultural Zone">Agricultural Zone</SelectItem>
                      <SelectItem value="SEZ">Special Economic Zone</SelectItem>
                      <SelectItem value="Others">Others</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Property Ownership */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Ownership</h2>
                  <Select onValueChange={(e) => setFieldValue('property_ownership', e)} value={values.property_ownership}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Ownership Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Freehold">Freehold</SelectItem>
                      <SelectItem value="Lease Hold">Lease Hold</SelectItem>
                      <SelectItem value="Cooperative Society">Cooperative Society</SelectItem>
                      <SelectItem value="Power of Attorney">Power of Attorney</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Description */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Description</h2>
                  <Textarea placeholder="" name="description" onChange={handleChange} value={values.description} />
                </div>

                {/* Price */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Price</h2>
                  <Input type="number" placeholder="Ex.1,00,000 ₹" onChange={handleChange} value={values.price} name="price" />
                </div>

                {/* Build Up Area */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Commercial Build Up Area (Sq.Ft)</h2>
                  <Input type="number" placeholder="Ex.4000 Sq.ft" value={values.build_up_area} name="build_up_area" onChange={handleChange} />
                </div>

                {/* Carpet Area */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Carpet Area (Sq.Ft)</h2>
                  <Input type="number" placeholder="Ex.7000 Sq.ft" value={values.carpet_area} name="carpet_area" onChange={handleChange} />
                </div>

                {/* Lock In Period */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Lock In Period</h2>
                  <Input type="number" placeholder="Ex.1 Year" name="lock_in_period" onChange={handleChange} value={values.lock_in_period} />
                </div>

                {/* Age of Property */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Age Of Property</h2>
                  <Select onValueChange={(e) => setFieldValue('age_of_property', e)} value={values.age_of_property}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Age Of Property" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Under Construction">Under Construction</SelectItem>
                      <SelectItem value="Less than a Year">Less than a Year</SelectItem>
                      <SelectItem value="1 to 5 Year">1 to 5 Year</SelectItem>
                      <SelectItem value="5 to 10 Year">5 to 10 Year</SelectItem>
                      <SelectItem value="More than 10 Year">More than 10 Year</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Floor */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Floor</h2>
                  <Select onValueChange={(e) => setFieldValue('floor', e)} value={values.floor}>
                    <SelectTrigger className="w-[180px]">
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

                {/* Power Backup */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Power Backup</h2>
                  <Select onValueChange={(e) => setFieldValue('power_backup', e)} value={values.power_backup}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Full">Full</SelectItem>
                      <SelectItem value="DG Backup">DG Backup</SelectItem>
                      <SelectItem value="Need to Arrange">Need to Arrange</SelectItem>
                      <SelectItem value="None">None</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Lift */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Lift</h2>
                  <Select onValueChange={(e) => setFieldValue('lift', e)} value={values.lift}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Common">Common</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Parking */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Parking</h2>
                  <Select onValueChange={(e) => setFieldValue('parking', e)} value={values.parking}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="None">None</SelectItem>
                      <SelectItem value="Public And Reserved">Public And Reserved</SelectItem>
                      <SelectItem value="Public">Public</SelectItem>
                      <SelectItem value="Reserved">Reserved</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Washroom */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Washroom</h2>
                  <Select onValueChange={(e) => setFieldValue('washroom', e)} value={values.washroom}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Shared">Shared</SelectItem>
                      <SelectItem value="No Washroom">No Washroom</SelectItem>
                      <SelectItem value="Private">Private</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Water Storage */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Water Storage</h2>
                  <Select onValueChange={(e) => setFieldValue('water', e)} value={values.water}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Security */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Security</h2>
                  <Select onValueChange={(e) => setFieldValue('property_security', e)} value={values.property_security}>
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Select Option" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Yes">Yes</SelectItem>
                      <SelectItem value="No">No</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Latitude */}
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Latitude</h2>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="Ex. 11.3410" 
                    onChange={async (e) => {
                      handleChange(e);
                      if (e.target.value && values.longitude) {
                        try {
                          const { city, locality } = await getCityAndLocalityFromCoordinates(e.target.value, values.longitude);
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
                <div className='flex gap-2 flex-col'>
                  <h2 className='text-gray-500'>Longitude</h2>
                  <Input 
                    type="number" 
                    step="any"
                    placeholder="Ex. 77.7172" 
                    onChange={async (e) => {
                      handleChange(e);
                      if (e.target.value && values.latitude) {
                        try {
                          const { city, locality } = await getCityAndLocalityFromCoordinates(values.latitude, e.target.value);
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
              </div>

              {/* Image Upload */}
              <div>
                <h2 className='font-lg text-gray-500 my-2'>Upload Property Images</h2>
                <FileUpload
                  setImages={setImages}
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
