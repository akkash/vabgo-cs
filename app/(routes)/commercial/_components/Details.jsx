import React from 'react'
import GoogleMapSection from '@/app/_components/GoogleMapSection'
import { Button } from '@/components/ui/button'
import { Bath, SquareParking, ArrowUpFromDot, Droplet, ShowerHead, ShieldBan, BatteryFull, CarFront, Drill, Home, LandPlot, MapPin, Share, Eye } from 'lucide-react'
import AgentDetail from './AgentDetail'
import { useAuth } from '@/app/contexts/AuthContext'
import { useRouter } from 'next/navigation'

function Details({listingDetail}) {
  const { user } = useAuth();
  const router = useRouter();

  return listingDetail&&(
    <div className='my-6 flex gap-2 flex-col'>
        <h2 className='font-bold text-3xl '>{listingDetail?.property_title}</h2>


    <div className='flex justify-between items-center'>
        <div>
            <h2 className='font-bold text-xl'>For : {listingDetail?.listing_type}</h2>
            <h2 className='font-bold text-xl'>Price : {listingDetail?.expected_price}₹</h2>
            
        </div>
    </div>

    <hr></hr>
    <div className='mt-4'>
        <h2 className='font-bold text-2xl '>Description</h2>
        <p className='text-gray-600 '>{listingDetail?.description}</p>
    </div>
   
    <hr></hr>
    <AgentDetail listingDetail={listingDetail} />
    <hr></hr>
     <div className='mt-4 flex flex-col gap-3'>
        <h2 className=' font-bold text-2xl'>Key Features</h2>
        <div className='grid grid-cols-2 md:grid-cols-3 gap-4 '>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <Home />
                {listingDetail?.property_type}
            </h2>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <Home />
                {listingDetail?.sub_property_type}
            </h2>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <Home />
                {listingDetail?.location_type} Area
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100
     rounded-lg p-3 text-primary'>
                <Drill />
                Built Up Area  {listingDetail?.built_up_area} SqFt 
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <LandPlot /> Carpet Area {listingDetail?.carpet_area} Sqft
            </h2>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <Home />Ownership Type {listingDetail?.property_ownership}
            </h2>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <Home />Lock In Period {listingDetail?.lock_in_period} years
            </h2>
            <h2 className='flex gap-2 items-center bg-blue-100 
    rounded-lg p-3 text-primary justify-center'>
                <SquareParking /> Parking {listingDetail.parking}
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100
     rounded-lg p-3 text-primary'>
                <Bath />Age Of Property {listingDetail.age_of_property}
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <CarFront />
                {listingDetail.parking} Parking
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <BatteryFull />Power Backup {listingDetail.power_backup}
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <ArrowUpFromDot />Lift {listingDetail.lift}
            </h2>
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <ShowerHead />Washroom {listingDetail.washroom}
            </h2>
            
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <Droplet />Water {listingDetail.water}
            </h2>
        
        
            <h2 className='flex gap-2 items-center justify-center bg-blue-100 rounded-lg p-3 text-primary'>
                <ShieldBan />Security {listingDetail.security}
            </h2>
        </div>
    </div> 

    <hr></hr>
    <div className='mt-4'>
        <h2 className='font-bold text-2xl mb-3'>Property Views</h2>
        <div className='bg-blue-100 rounded-lg p-4'>
            <div className='flex items-center justify-between mb-2'>
                <span className='text-primary font-semibold flex items-center gap-2'>
                    <Eye className='text-primary' size={20} />
                    Total Views
                </span>
                <span className='text-2xl font-bold text-primary'>{listingDetail.view_count}</span>
            </div>
            <div className='w-full bg-blue-200 rounded-full h-2.5'>
                <div 
                    className='bg-primary h-2.5 rounded-full' 
                    style={{width: `${Math.min((listingDetail.view_count / 1000) * 100, 100)}%`}}
                ></div>
            </div>
        </div>
    </div>

    <div>
        <h2 className='font-bold text-2xl '>Find On Map</h2>
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
    </div>

</div>
  )
}

export default Details
