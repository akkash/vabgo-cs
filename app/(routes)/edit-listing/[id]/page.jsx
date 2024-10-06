"use client"
import React, { useEffect, useState } from 'react'
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
import { Formik, Field } from 'formik'
import { useRouter } from 'next/navigation'
import { supabase } from '@/utils/supabase/client'
import { toast } from 'sonner'
import { useUser } from '@clerk/nextjs'
import FileUpload from '../_components/FileUpload'
import { Loader } from 'lucide-react'

function EditListing({ params }) {
    const { user } = useUser();
    const router = useRouter();
    const [listing, setListing] = useState([]);
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        user && verifyUserRecord();
    }, [user]);

    const verifyUserRecord = async () => {
        const { data, error } = await supabase
            .from('listing')
            .select('*,listingImages(listing_id,url)')
            .eq('createdBy', user?.primaryPhoneNumber.phoneNumber)
            .eq('id', params.id);
        if (data) {
            console.log(data)
            setListing(data[0]);
        }
        if (data?.length <= 0) {
            router.replace('/')
        }
    }

    const onSubmitHandler = async (formValue) => {
        setLoading(true);
        if(images?.length==0)
        {
            setLoading(false);
            toast('Please add atleast 1 Image')
            return ;
        }

        const newTitle = `${formValue.build_up_area} sqft for ${formValue.listing_type} ${formValue.sub_property_type} in ${formValue.city}`;
        const slug = newTitle.toLowerCase().replace(/[^a-z0-9]+/g, '-').trim() + '-' + Date.now();
        const shouldUpdateSlug = formValue.slug === null || slug !== formValue.slug;

        const { data, error } = await supabase
            .from('listing')
            .update({
                ...formValue,
                property_title: newTitle,
                slug: shouldUpdateSlug ? slug : formValue.slug
            })
            .eq('id', params.id)
            .select();

        if (data) {
            console.log(data);
            toast('Listing updated and Published');
            setLoading(false)
            publishBtnHandler();
        }
        for (const image of images) {
            setLoading(true)
            const file = image;
            const fileName = Date.now().toString();
            const fileExt = fileName.split('.').pop();
            const { data, error } = await supabase.storage
                .from('listingImages')
                .upload(`${fileName}`, file, {
                    contentType: `image/${fileExt}`,
                    upsert: false
                });

            if (error) {
                setLoading(false)
                toast('Error while uploading images')
            }

            else {

                const imageUrl = process.env.NEXT_PUBLIC_IMAGE_URL + fileName;
                const { data, error } = await supabase
                    .from('listingImages')
                    .insert([
                        { url: imageUrl, listing_id: params?.id }
                    ])
                    .select();

                if (data) {
                    setLoading(false);
                    
                }
                if (error) {
                    setLoading(false)
                }

            }
            setLoading(false);
        }

    }

    const publishBtnHandler = async () => {
        const { data, error } = await supabase
            .from('listing')
            .update({ active: true })
            .eq('id', params.id)
            .select();

        if (error) {
            console.error('Error publishing listing:', error);
            toast('Error publishing listing');
        } else {
            toast('Listing published!');
        }
        router.replace('/');

    };

    return (
        <div className='px-10 md:px-36 my-10'>
            <h2 className='font-bold text-2xl'>Enter some more details about your listing</h2>

            <Formik
                initialValues={{
                    listing_type: listing?.listing_type || '',
                    city: listing?.city || '',
                    property_type: listing?.property_type || '',
                    sub_property_type: listing?.sub_property_type || '',
                    location_type: listing?.location_type || '',
                    property_ownership: listing?.property_ownership || '',
                    description: listing?.description || '',
                    price: listing?.price || '',
                    build_up_area: listing?.build_up_area || '',
                    carpet_area: listing?.carpet_area || '',
                    lock_in_period: listing?.lock_in_period || '',
                    age_of_property: listing?.age_of_property || '',
                    floor: listing?.floor || '',
                    power_backup: listing?.power_backup || '',
                    lift: listing?.lift || '',
                    parking: listing?.parking || '',
                    washroom: listing?.washroom || '',
                    water: listing?.water || '',
                    property_security: listing?.property_security || '',
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

                                <div className='flex gap-2 flex-col'   >
                                    <h2 className='text-gray-500'>City</h2>
                                    <Input type="text" placeholder="Erode"
                                            onChange={handleChange}
                                            defaultValue={listing?.city} name="city" />
                                </div>
                                
                                <div className='flex gap-2 flex-col'>
                                    <h2 className='text-gray-500'>Property Type</h2>
                                    <Select
                                        onValueChange={(e) => values.property_type = e}
                                        name="property_type"
                                        defaultValue={listing?.property_type}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={listing?.property_type ? listing?.property_type : "Select Property Type"} />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="Commercial Property">Commercial Property</SelectItem>
                                            <SelectItem value="Factory & Industrial Building">Factory & Industrial Building</SelectItem>
                                            <SelectItem value="Warehouse & Cold Storage">Warehouse & Cold Storage</SelectItem>
                                            <SelectItem value="Land & Plots">Land & Plots</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='flex gap-2 flex-col'>
                                    <h2 className='text-gray-500'>Sub Property Type</h2>
                                    <Select
                                        onValueChange={(e) => values.sub_property_type = e}
                                        name="sub_property_type"
                                        defaultValue={listing?.sub_property_type}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={listing?.sub_property_type ? listing?.sub_property_type : "Select Sub Property Type"} />
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
                                <div className='flex gap-2 flex-col'>
                                    <h2 className='text-gray-500'>Location Type</h2>
                                    <Select
                                        onValueChange={(e) => values.location_type = e}
                                        name="location_type"
                                        defaultValue={listing?.location_type}
                                    >
                                        <SelectTrigger className="w-[180px]">
                                            <SelectValue placeholder={listing?.location_type ? listing?.location_type : "Select Location Type"} />
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
                                <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Ownership</h2>
                                        <Select
                                            onValueChange={(e) => values.property_ownership = e}
                                            name="property_ownership"
                                            defaultValue={listing?.property_ownership}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.property_ownership ? listing?.property_ownership : "Select Ownership Type"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Freehold">Freehold</SelectItem>
                                                <SelectItem value="Lease Hold">Lease Hold</SelectItem>
                                                <SelectItem value="Cooperative Society">Cooperative Society</SelectItem>
                                                <SelectItem value="Power of Attorney">Power of Attorney</SelectItem>
                                            </SelectContent>
                                        </Select>
                                </div>

                            </div>
                            <div className='grid  grid-cols-1  gap-10'>
                                <div className='flex gap-2 flex-col'>
                                    <h2 className='text-gray-500'>Description</h2>
                                    <Textarea placeholder="" name="description"
                                        onChange={handleChange}
                                        defaultValue={listing?.description} />
                                </div>
                            </div>
                            <div className='grid  grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10'>
                                    <div className='flex gap-2 flex-col'   >
                                        <h2 className='text-gray-500'>Price</h2>
                                        <Input type="number" placeholder="Ex.1,00,000 ₹"
                                            onChange={handleChange}
                                            defaultValue={listing?.price} name="price" />
                                    </div>
                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Commercial Build Up Area (Sq.Ft)</h2>
                                        <Input type="number" placeholder="Ex.4000 Sq.ft"
                                            defaultValue={listing?.build_up_area}
                                            name="build_up_area"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Carpet Area (Sq.Ft)</h2>
                                        <Input type="number" placeholder="Ex.7000 Sq.ft"
                                            defaultValue={listing?.carpet_area}
                                            name="carpet_area"
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'   >Lock In Period</h2>
                                        <Input type="number" placeholder="Ex.1 Year" name="lock_in_period"
                                            onChange={handleChange}
                                            defaultValue={listing?.lock_in_period} />
                                    </div>
                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Age Of Property</h2>
                                        <Select
                                            onValueChange={(e) => values.age_of_property = e}
                                            name="age_of_property"
                                            defaultValue={listing?.age_of_property}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.age_of_property ? listing?.age_of_property : "Select Age Of Property"} />
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

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Floor</h2>
                                        <Select
                                            onValueChange={(e) => values.floor = e}
                                            name="floor"
                                            defaultValue={listing?.floor}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.floor ? listing?.floor : "Select Floor"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Lower Basement">Lower Basement</SelectItem>
                                                <SelectItem value="Upper Basement">Upper Basement</SelectItem>
                                                <SelectItem value="Ground">Ground</SelectItem>
                                                <SelectItem value="Full Building">Full Building</SelectItem>
                                                <SelectItem value="1">1</SelectItem>
                                                <SelectItem value="2">2</SelectItem>
                                                <SelectItem value="3">3</SelectItem>
                                                <SelectItem value="4">4</SelectItem>
                                                <SelectItem value="5">5</SelectItem>
                                                <SelectItem value="6">6</SelectItem>
                                                <SelectItem value="7">7</SelectItem>
                                                <SelectItem value="8">8</SelectItem>
                                                <SelectItem value="9">9</SelectItem>
                                                <SelectItem value="10">10</SelectItem>
                                                <SelectItem value="11">11</SelectItem>
                                                <SelectItem value="12">12</SelectItem>
                                                <SelectItem value="13">13</SelectItem>
                                                <SelectItem value="14">14</SelectItem>
                                                <SelectItem value="15">15</SelectItem>
                                                <SelectItem value="16">16</SelectItem>
                                                <SelectItem value="17">17</SelectItem>
                                                <SelectItem value="18">18</SelectItem>
                                                
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    
                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Power Backup</h2>
                                        <Select
                                            onValueChange={(e) => values.power_backup = e}
                                            name="power_backup"
                                            defaultValue={listing?.power_backup}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.power_backup ? listing?.power_backup : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Full">Full</SelectItem>
                                                <SelectItem value="DG Backup">DG Backup</SelectItem>
                                                <SelectItem value="Need to Arrange">Need to Arrange</SelectItem>
                                                <SelectItem value="None">None</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Lift</h2>
                                        <Select
                                            onValueChange={(e) => values.lift = e}
                                            name="lift"
                                            defaultValue={listing?.lift}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.lift ? listing?.lift : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Personal">Personal</SelectItem>
                                                <SelectItem value="Common">Common</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Parking</h2>
                                        <Select
                                            onValueChange={(e) => values.parking = e}
                                            name="parking"
                                            defaultValue={listing?.parking}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.parking ? listing?.parking : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="None">None</SelectItem>
                                                <SelectItem value="Public And Reserved">Public And Reserved</SelectItem>
                                                <SelectItem value="Public">Public</SelectItem>
                                                <SelectItem value="Reserved">Reserved</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Washroom</h2>
                                        <Select
                                            onValueChange={(e) => values.washroom = e}
                                            name="washroom"
                                            defaultValue={listing?.washroom}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.washroom ? listing?.washroom : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Shared">Sharede</SelectItem>
                                                <SelectItem value="No Washroom">No Washroom</SelectItem>
                                                <SelectItem value="Private">Private</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Water Storage</h2>
                                        <Select
                                            onValueChange={(e) => values.water = e}
                                            name="water"
                                            defaultValue={listing?.water}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.water ? listing?.water : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>

                                    <div className='flex gap-2 flex-col'>
                                        <h2 className='text-gray-500'>Security</h2>
                                        <Select
                                            onValueChange={(e) => values.property_security = e}
                                            name="property_security"
                                            defaultValue={listing?.property_security}
                                        >
                                            <SelectTrigger className="w-[180px]">
                                                <SelectValue placeholder={listing?.property_security ? listing?.property_security : "Select Option"} />
                                            </SelectTrigger>
                                            <SelectContent>
                                                <SelectItem value="Yes">Yes</SelectItem>
                                                <SelectItem value="No">No</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>


                                </div>
                            <div>
                                <h2 className='font-lg text-gray-500 my-2'>Upload Property Images</h2>
                                <FileUpload
                                    setImages={(value) => setImages(value)}
                                    imageList={listing.listingImages}
                                />
                            </div>
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

export default EditListing