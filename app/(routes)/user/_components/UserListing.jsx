'use client'; // Ensure this component is treated as a client component

import { Button } from '@/components/ui/button';
import { supabase } from '@/utils/supabase/client'
import { Bath, BedDouble, MapPin, Ruler, Trash } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useState } from 'react'
import { useAuth } from '../../../contexts/AuthContext';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { toast } from 'sonner';

function UserListing() {
    const { user, loading } = useAuth();
    const [listing, setListing] = useState();
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        console.log('Auth state:', { user, loading });
        if (user) {
            console.log('User is logged in:', user);
            getUserListing();
        } else if (!loading) {
            console.log('Not loading, but no user');
            setIsLoading(false);
        }
    }, [user, loading])

    const getUserListing = async () => {
        setIsLoading(true);
        try {
            if (!user?.phone) {
                toast.error('Unable to fetch listings: User information missing');
                return;
            }

            const { data, error } = await supabase
                .from('listing')
                .select(`*,listingImages(url,listing_id)`)
                .eq('createdBy', '+91' + user.phone);

            if (error) throw error;

            if (!data || data.length === 0) {
                toast.info('No listings found');
            } else {
                setListing(data);
            }
        } catch (error) {
            toast.error('Failed to fetch listings: ' + error.message);
        } finally {
            setIsLoading(false);
        }
    }

    /**
     * Delete Property 
     */
    const deleteListing = async (id) => {
        //Delete Images Record First
        await supabase
            .from('listingImages')
            .delete()
            .eq('listing_id', id);

        //Delete Actual Listing
        const { data, error } = await supabase
            .from('listing')
            .delete()
            .eq('id', id);

        toast('Record deleted!');
        getUserListing();
    }

    return (
        <div>
            <h2 className='font-bold text-2xl'>Manage your listing</h2>
            {isLoading ? (
                <p>Loading your listings...</p>
            ) : !user ? (
                <>
                    <p>Please log in to view your listings.</p>
                    <p>Debug: user = {JSON.stringify(user)}, loading = {loading.toString()}</p>
                </>
            ) : listing && listing.length > 0 ? (
                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                    {listing.map((item, index) => (
                        <div key={index} className='p-3 hover:border hover:border-primary rounded-lg cursor-pointer'>
                            <h2 className='bg-primary m-1 rounded-lg text-white absolute px-2 text-sm p-1'>{item.active ? 'Published' : 'Draft'}</h2>
                            <Image src={item?.listingImages[0] ?
                                item?.listingImages[0]?.url
                                : '/placeholder.svg'
                            }
                                width={800}
                                height={150}
                                alt={`Listing ${index + 1}`}
                                className='rounded-lg object-cover h-[170px]'
                            />
                            <div className='flex mt-2 flex-col gap-2'>
                                <h2 className='font-bold text-xl'>${item?.property_title}</h2>
                                <h2 className='flex gap-2 text-sm text-gray-400 '>
                                    <MapPin className='h-4 w-4' />
                                    {item.price}</h2>
                                <div className='flex gap-2 justify-between'>
                                    <Link href={'/commercial/' + item.property_title} className="w-full">
                                        <Button size="sm" variant="outline">
                                            View</Button>
                                    </Link>
                                    <Link href={'/edit-listing/' + item.id} className="w-full">
                                        <Button size="sm" className="w-full">Edit</Button>
                                    </Link>

                                    <AlertDialog>
                                        <AlertDialogTrigger asChild>
                                            <Button size="sm" variant="destructive" className="w-full">
                                                <Trash />
                                            </Button>
                                        </AlertDialogTrigger>
                                        <AlertDialogContent>
                                            <AlertDialogHeader>
                                                <AlertDialogTitle>Ready to Delete?</AlertDialogTitle>
                                                <AlertDialogDescription>
                                                    Do you really want to Delete the listing?
                                                </AlertDialogDescription>
                                            </AlertDialogHeader>
                                            <AlertDialogFooter>
                                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                <AlertDialogAction onClick={() => deleteListing(item.id)} >
                                                    Continue
                                                </AlertDialogAction>
                                            </AlertDialogFooter>
                                        </AlertDialogContent>
                                    </AlertDialog>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p>You don't have any listings yet.</p>
            )}
        </div>
    )
}

export default UserListing
