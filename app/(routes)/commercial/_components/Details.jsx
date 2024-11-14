import React from 'react'
import GoogleMapSection from '@/app/_components/GoogleMapSection'
import { Button } from '@/components/ui/button'
import { Bath, SquareParking, ArrowUpFromDot, Droplet, ShowerHead, ShieldBan, BatteryFull, CarFront, Drill, Home, LandPlot, MapPin, Share, Eye, ChevronDown, X } from 'lucide-react'
import AgentDetail from './AgentDetail'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'
import Slider from '../_components/Slider';

function Details({listingDetail}) {
  const { user } = useAuth();
  const router = useRouter();
  const [isDescriptionExpanded, setIsDescriptionExpanded] = React.useState(false);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: listingDetail?.property_title,
          text: `Check out this property: ${listingDetail?.property_title}`,
          url: window.location.href,
        });
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      // Fallback - copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      // You might want to add a toast notification here
    }
  };

  if (isDialogOpen) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white p-6 rounded-lg max-w-md w-full m-4">
          <button 
            onClick={() => setIsDialogOpen(false)} 
            className="float-right text-gray-500 hover:text-gray-700"
          >
            <X className="h-6 w-6" />
          </button>
          
          <h3 className="text-lg font-semibold mb-4">Contact Information</h3>
          
          <div className="grid gap-4">
            <p><span className="font-semibold">Owner: </span>{listingDetail.contactname}</p>
            <p>
              <span className="font-semibold">Contact: </span>
              <a href={`tel:${listingDetail.createdBy}`} className="text-blue-600 hover:underline">
                {listingDetail.createdBy}
              </a>
            </p>
            <p className="flex items-center gap-2 text-gray-500">
              Address of Property
              <MapPin size={18} />
              <span>{listingDetail.address}</span>
            </p>
          </div>

          <div className="mt-6 flex justify-center">
            <Button onClick={() => setIsDialogOpen(false)}>Close</Button>
          </div>
        </div>
      </div>
    );
  }

  return listingDetail&&(
    <div className='container mx-auto px-4 my-6 flex gap-6 flex-col max-w-7xl'>
        <div className='bg-white p-6 rounded-lg shadow-sm'>
            <div className='flex flex-col gap-2'>
                <h1 className='font-bold text-xl text-blue-600'>{listingDetail?.property_title}</h1>
                <div className='text-gray-600'>{listingDetail?.locality}, {listingDetail?.city}</div>
                <div className='flex justify-between items-center mt-4'>
                    <div className='text-xl font-bold flex items-center gap-2'>
                        <span><span className='text-primary'>₹</span> {listingDetail?.expected_price}</span>
                        <span className='text-base font-normal text-gray-500'>
                            (₹{Math.round(listingDetail?.price_per_sqft)}/sq.ft)
                        </span>
                    </div>
                    <div className='flex gap-2'>
                        <Button 
                            variant="outline" 
                            onClick={handleShare}
                            className='flex items-center gap-2'
                        >
                            <Share size={18} />
                            Share
                        </Button>
                        <Button 
                            className='bg-primary text-white hover:bg-primary/90'
                            onClick={() => {
                                if (user) {
                                    setIsDialogOpen(true);
                                } else {
                                    router.push('/sign-in');
                                }
                            }}
                        >
                            {user ? 'Contact Seller' : 'Sign In to Contact Seller'}
                        </Button>
                    </div>
                </div>
            </div>
        </div>
        
        <Slider imageList={listingDetail?.listingImages} />
        
        <section className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 bg-white p-4 md:p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center justify-center text-center p-2 md:p-3 border rounded-lg">
                <div className="font-semibold text-base md:text-lg">{listingDetail?.carpet_area} sq.ft</div>
                <div className="text-gray-500 text-xs md:text-sm">Carpet Area</div>
            </div>


            <div className="flex flex-col items-center justify-center text-center p-2 md:p-3 border rounded-lg">
                <div className="font-semibold text-base md:text-lg">{listingDetail?.listing_type}</div>
                <div className="text-gray-500 text-xs md:text-sm">Listing Type</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-2 md:p-3 border rounded-lg">
                <div className="font-semibold text-base md:text-lg">{listingDetail?.age_of_property} </div>
                <div className="text-gray-500 text-xs md:text-sm">Age of Property</div>
            </div>
            <div className="flex flex-col items-center justify-center text-center p-2 md:p-3 border rounded-lg">
                <div className="font-semibold text-base md:text-lg">{listingDetail?.floor} / {listingDetail?.total_floor}</div>
                <div className="text-gray-500 text-xs md:text-sm">Floors</div>
            </div>
        </section>

        <section className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
            <h2 className='font-bold text-xl text-blue-600 mb-4'>Property Details</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Property Type</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.property_type}</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Sub Type</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.sub_property_type}</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Built Up Area</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.built_up_area} SqFt</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Carpet Area</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.carpet_area} SqFt</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Ownership Type</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.property_ownership}</div>
                    </div>
                </div>
                
                <div className='space-y-4'>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Lock In Period</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.lock_in_period} years</div>
                    </div>
                </div>
            </div>
        </section>

        <section className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
          <h2 className='font-bold text-xl text-blue-600 mb-4'>About the property</h2>
          <div>
            <div className={`relative ${!isDescriptionExpanded ? 'max-h-full' : 'max-h-[100px]'} overflow-hidden`}>
              <p className='text-gray-600 leading-relaxed'>
                {listingDetail?.description}
              </p>
              {isDescriptionExpanded && (
                <div className="absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent" />
              )}
            </div>
            <button
              onClick={() => setIsDescriptionExpanded(!isDescriptionExpanded)}
              className="mt-2 text-primary font-medium hover:underline cursor-pointer"
            >
              {!isDescriptionExpanded ? 'Collapse' : 'Read more'}
            </button>
          </div>
        </section>

        <section className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
            <h2 className='font-bold text-xl text-blue-600 mb-4'>Financial Details</h2>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                <div className='space-y-4'>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Price</div>
                        <div className='w-1/2 font-medium'>₹ {listingDetail?.expected_price}</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Price per sq/ft</div>
                        <div className='w-1/2 font-medium'>₹ {Math.round(listingDetail?.price_per_sqft)}</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Security Deposit</div>
                        <div className='w-1/2 font-medium'>₹ {listingDetail?.security_deposit || 'Not specified'}</div>
                    </div>
                </div>
                
                <div className='space-y-4'>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Maintenance</div>
                        <div className='w-1/2 font-medium'>
                            ₹ {listingDetail?.maintenance_amount || 'Not specified'}
                            {listingDetail?.maintenance_amount && listingDetail?.maintenance_duration && 
                                ` / ${listingDetail.maintenance_duration}`
                            }
                        </div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Booking Amount</div>
                        <div className='w-1/2 font-medium'>₹ {listingDetail?.booking_amount || 'Not specified'}</div>
                    </div>
                    <div className='flex border-b pb-3'>
                        <div className='w-1/2 text-gray-500'>Tax & Govt Charges</div>
                        <div className='w-1/2 font-medium'>{listingDetail?.tax_govt_charges_included ? 'Included' : 'Not included'}</div>
                    </div>
                </div>
            </div>
        </section>

        <section className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
            <h2 className='font-bold text-xl text-blue-600 mb-4'>Property Features</h2>
            <div className='grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4'>
                <div className='flex items-center gap-2'>
                    <CarFront size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Parking: {listingDetail?.parking}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <Bath size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Washroom: {listingDetail?.washroom}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <ArrowUpFromDot size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Lift: {listingDetail?.lift}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <BatteryFull size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Power Backup: {listingDetail?.power_backup}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <Droplet size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Water: {listingDetail?.water}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <ShieldBan size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Security: {listingDetail?.property_securities}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <ShowerHead size={20} className="text-gray-600" />
                    <span className='text-gray-700'>AC: {listingDetail?.air_conditioning}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <Drill size={20} className="text-gray-600" />
                    <span className='text-gray-700'>Oxygen Duct: {listingDetail?.oxygen_duct}</span>
                </div>
                <div className='flex items-center gap-2'>
                    <Droplet size={20} className="text-gray-600" />
                    <span className='text-gray-700'>
                        Fire Safety: {typeof listingDetail?.fire_safety === 'string' 
                            ? JSON.parse(listingDetail.fire_safety).join(', ')
                            : Array.isArray(listingDetail?.fire_safety)
                                ? listingDetail.fire_safety.join(', ')
                                : listingDetail?.fire_safety}
                    </span>
                </div>
            </div>
        </section>

        <section className='bg-white p-4 md:p-6 rounded-lg shadow-sm'>
            <h2 className='font-bold text-xl text-blue-600 mb-4'>Find On Map</h2>
            {user ? (
                <GoogleMapSection
                    coordinates={listingDetail.coordinates}
                    listing={[listingDetail]}
                />
            ) : (
                <div className="bg-gray-100 p-4 rounded-lg text-center">
                    <p className="text-primary mb-2">Please log in to have access to this Map View feature</p>
                    <Button variant="outline" onClick={() => router.push('/sign-in')}>Log In</Button>
                </div>
            )}
        </section>

        <AgentDetail listingDetail={listingDetail} />
    </div>
  )
}

export default Details
