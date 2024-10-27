import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Store, Factory, LandPlot, Warehouse,ReceiptIndianRupee,Captions } from 'lucide-react'
import { Button } from "@/components/ui/button"

function FilterSection({ 
    setListingType, 
    setPropertyType,
}) {
    return (
        <div className="flex flex-wrap gap-4 mb-6 items-center">
            {/* Filters row */}
            <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2'>
                <Select onValueChange={setListingType}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Listing Type" />
                    </SelectTrigger>
                    <SelectContent>
                    
                        <SelectItem value="Sell">
                            <h2 className='flex gap-2'>
                                 <ReceiptIndianRupee className='h-5 w-5 text-primary'/>Sell</h2>
                        </SelectItem>
                        <SelectItem value="Rent">
                            <h2 className='flex gap-2'>
                                 <ReceiptIndianRupee className='h-5 w-5 text-primary'/>Rent</h2>
                        </SelectItem>
                        
                    
                    </SelectContent>
                </Select>

                <Select  onValueChange={setPropertyType}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
             
                    <SelectItem value="Commercial Property">
                        <h2 className='flex gap-2'>
                             <Store className='h-5 w-5 text-primary'/>Commercial Property</h2>
                    </SelectItem>
                    <SelectItem value="Factory & Industrial Building3">
                        <h2 className='flex gap-2'>
                             <Factory className='h-5 w-5 text-primary'/>Factory & Industrial Building</h2>
                    </SelectItem>
                    <SelectItem value="Warehouse & Cold Storage">
                        <h2 className='flex gap-2'>
                             <Warehouse className='h-5 w-5 text-primary'/>Warehouse & Cold Storage</h2>
                    </SelectItem>
                    <SelectItem value="Land & Plots">
                        <h2 className='flex gap-2'>
                             <LandPlot className='h-5 w-5 text-primary'/>Land & Plots</h2>
                    </SelectItem>
                </SelectContent>
                </Select>

            </div>
        </div>
    )
}

export default FilterSection
