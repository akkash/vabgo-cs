
import GoogleMapSection from '@/app/_components/GoogleMapSection'
import { Button } from '@/components/ui/button'
import { Bath,SquareParking,ArrowUpFromDot,Droplet,ShowerHead,ShieldBan, BatteryFull, CarFront, Drill, Home, LandPlot, MapPin, Share } from 'lucide-react'

import React from 'react'
import AgentDetail from './AgentDetail'

function Details({listingDetail}) {
  return listingDetail&&(
    <div className='my-6 flex gap-2 flex-col'>
        <h2 className='font-bold text-3xl '>{listingDetail?.property_title}</h2>


    <div className='flex justify-between items-center'>
        <div>
            <h2 className='font-bold text-xl'>For : {listingDetail?.listing_type}</h2>
            <h2 className='font-bold text-xl'>Price : {listingDetail?.price}₹</h2>
            
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
                Built Up Area  {listingDetail?.build_up_area} SqFt 
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

    <div>
        <h2 className='font-bold text-2xl '>Find On Map</h2>
        <GoogleMapSection
        coordinates={listingDetail.coordinates}
        listing={[listingDetail]}
        />
    </div>

</div>
  )
}

export default Details