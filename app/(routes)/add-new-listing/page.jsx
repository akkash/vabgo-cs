"use client"
import React, { useState , useEffect} from 'react'
import GoogleAddressSearch from '@/app/_components/GoogleAddressSearch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'  // Add this import
import { supabase } from '@/utils/supabase/client';
import { useAuth } from '../../contexts/AuthContext'

import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Define LocationSchema outside of the component
const LocationSchema = Yup.object().shape({
    contactname: Yup.string().required('Contact Name is required'),
    address: Yup.string().required('Address is required'),
    latitude: Yup.string().nullable(),
    longitude: Yup.string().nullable(),
});

function AddNewListing() {
    console.log("Google Maps API Key:", process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY);
    const { user } = useAuth();  // Use the useAuth hook
    const [loader, setLoader] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Load Google Maps API script
        const script = document.createElement('script');
        script.src = `https://maps.googleapis.com/maps/api/js?key=${process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY}&libraries=places`;
        script.async = true;
        script.defer = true;
        document.head.appendChild(script);

        return () => {
            document.head.removeChild(script);
        };
    }, []);

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
                        createdBy: user?.phone,
                        city: cityData.city,
                        locality: cityData.locality
                    },
                ])
                .select();

            if (data) {
                setLoader(false);
                console.log("New Data added,", data);
                toast.success("New Address added for listing");
                router.replace('/edit-listing/' + data[0].id);
            }
            if (error) {
                setLoader(false);
                console.log('Error', error);
                toast.error("Server side error");
            }
        } catch (error) {
            setLoader(false);
            console.log('Error:', error);
            toast.error("An error occurred while adding the listing");
        }
    };

    return (
        <div className='mt-10 md:mx-56 lg:mx-80'>
            <div className='p-10 flex flex-col gap-5 items-center justify-center'>
                <h2 className='font-bold text-3xl'>Add New Listing</h2>

                <Formik
                    initialValues={{
                        address: '',
                        contactname:'',
                        latitude: '',
                        longitude: '',
                    }}
                    validationSchema={LocationSchema}
                    onSubmit={nextHandler}
                >
                    {({ errors, touched, setFieldValue, values }) => (
                        <Form className='w-full max-w-md'>

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

                            <div className='mb-4'>
                                <label htmlFor="latitude" className='block text-sm font-medium text-gray-700'>Latitude (optional)</label>
                                <Field
                                    name="latitude"
                                    type="text"
                                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    placeholder="Enter latitude"
                                />
                                {errors.latitude && touched.latitude && <div className='text-red-500 text-sm mt-1'>{errors.latitude}</div>}
                            </div>

                            <div className='mb-4'>
                                <label htmlFor="longitude" className='block text-sm font-medium text-gray-700'>Longitude (optional)</label>
                                <Field
                                    name="longitude"
                                    type="text"
                                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    placeholder="Enter longitude"
                                />
                                {errors.longitude && touched.longitude && <div className='text-red-500 text-sm mt-1'>{errors.longitude}</div>}
                            </div>

                            <div className='flex justify-between'>
                                <Button type="submit" disabled={loader} className='bg-green-500 text-white'>
                                    {loader ? <Loader className='animate-spin' /> : 'Submit'}
                                </Button>
                            </div>
                        </Form>
                    )}
                </Formik>
            </div>
        </div>
    );
}

export default AddNewListing;
