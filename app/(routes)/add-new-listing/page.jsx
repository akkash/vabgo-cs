"use client"
import React, { useState } from 'react'
import GoogleAddressSearch from '@/app/_components/GoogleAddressSearch'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'  // Add this import
import { supabase } from '@/utils/supabase/client';
import { useUser } from '@clerk/nextjs';
import { Loader } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Formik, Form, Field } from 'formik';
import * as Yup from 'yup';

// Define LocationSchema outside of the component
const LocationSchema = Yup.object().shape({
    contactname: Yup.string().required('Contact Name is required'),
    address: Yup.string().required('Address is required'),
    latitude: Yup.string().required('Latitude is required'),
    longitude: Yup.string().required('Longitude is required'),
});

function AddNewListing() {
    const { user } = useUser();
    const [loader, setLoader] = useState(false);
    const router = useRouter();

    const nextHandler = async (values) => {
        setLoader(true);
        const coordinates = {
            lat: parseFloat(values.latitude),
            lng: parseFloat(values.longitude)
        };

        const { data, error } = await supabase
            .from('listing')
            .insert([
                {
                    address: values.address,
                    contactname: values.contactname,
                    coordinates: coordinates,
                    createdBy: user?.primaryPhoneNumber.phoneNumber
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
                                <label htmlFor="latitude" className='block text-sm font-medium text-gray-700'>Latitude</label>
                                <Field
                                    name="latitude"
                                    type="text"
                                    className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    placeholder="Enter latitude"
                                />
                                {errors.latitude && touched.latitude && <div className='text-red-500 text-sm mt-1'>{errors.latitude}</div>}
                            </div>

                            <div className='mb-4'>
                                <label htmlFor="longitude" className='block text-sm font-medium text-gray-700'>Longitude</label>
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