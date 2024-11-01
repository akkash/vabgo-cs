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
    userType: Yup.string().required('Please select Owner or Agent'),
    contactname: Yup.string().required('Contact Name is required'),
    email: Yup.string().email('Invalid email'),
    address: Yup.string().required('Address is required'),
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

    const nextHandler = async (values) => {
        setLoader(true);
        try {
            const { data, error } = await supabase
                .from('listing')
                .insert([
                    {
                        address: values.address,
                        contactname: values.contactname,
                        email: values.email,
                        createdBy: user?.phone,
                        userType: values.userType,
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
        <div>
            <div className='mt-10 md:mx-10 lg:mx-10'>
                <div className='p-10 flex flex-col gap-5 items-center justify-center'>
                    <h2 className='font-bold text-3xl'>Sell or Rent Your Commercial Property at <span className="text-blue-500">199₹</span> with Vabgo.com.</h2>

                    <Formik
                        initialValues={{
                            userType: '',
                            address: '',
                            contactname: '',
                            email: '',
                        }}
                        validationSchema={LocationSchema}
                        onSubmit={nextHandler}
                    >
                        {({ errors, touched, setFieldValue, values }) => (
                            <Form className='w-full max-w-md mb-20 bg-white rounded-lg shadow-md border border-gray-200 p-8'>
                                <h3 className='text-2xl font-semibold mb-8 text-center'>Personal Details</h3>
                                <div className='flex gap-2 flex-col mb-6'>
                                    <label className='block text-sm font-medium text-gray-700'>I am</label>
                                    <div className='flex gap-4'>
                                        <label className='flex items-center gap-2'>
                                            <Field
                                                type="radio"
                                                name="userType"
                                                value="owner"
                                                className="form-radio text-blue-500"
                                            />
                                            <span>Owner</span>
                                        </label>
                                        <label className='flex items-center gap-2'>
                                            <Field
                                                type="radio"
                                                name="userType"
                                                value="agent"
                                                className="form-radio text-blue-500"
                                            />
                                            <span>Agent</span>
                                        </label>
                                    </div>
                                    {errors.userType && touched.userType && (
                                        <div className='text-red-500 text-sm mt-1'>{errors.userType}</div>
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
                                    <label htmlFor="email" className='block text-sm font-medium text-gray-700'>Email Address</label>
                                    <Field
                                        as={Input}
                                        type="email"
                                        placeholder="Email Address"
                                        name="email"
                                        className='mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50'
                                    />
                                    {errors.email && touched.email && <div className='text-red-500 text-sm mt-1'>{errors.email}</div>}
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
        </div>
    );
}

export default AddNewListing;
