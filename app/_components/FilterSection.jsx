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
    sortBy,
    onSort,
    onClearFilters,
}) {
    return (
        <div className="flex flex-wrap gap-3 items-center">
            {/* Single row layout with equal widths */}
            <div className='flex flex-1 gap-2'>
                <Select onValueChange={setListingType} className="w-full max-w-[200px]">
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

                <Select onValueChange={setPropertyType} className="w-full max-w-[200px]">
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Property Type" />
                </SelectTrigger>
                <SelectContent>
             
                    <SelectItem value="Commercial Office Space">
                        <h2 className='flex gap-2'>
                             <Store className='h-5 w-5 text-primary'/>Commercial Office Space</h2>
                    </SelectItem>
                    <SelectItem value="Commercial Retail Space">
                        <h2 className='flex gap-2'>
                             <Factory className='h-5 w-5 text-primary'/>Commercial Retail Space</h2>
                    </SelectItem>
                    <SelectItem value="Factory & Industrial">
                        <h2 className='flex gap-2'>
                             <Warehouse className='h-5 w-5 text-primary'/>Factory & Industrial</h2>
                    </SelectItem>
                    <SelectItem value="Warehouse & Cold Storage">
                        <h2 className='flex gap-2'>
                             <LandPlot className='h-5 w-5 text-primary'/>Warehouse & Cold Storage</h2>
                    </SelectItem>
                    <SelectItem value="Land & Plots">
                        <h2 className='flex gap-2'>
                             <LandPlot className='h-5 w-5 text-primary'/>Land & Plots</h2>
                    </SelectItem>
                    <SelectItem value="Others">
                        <h2 className='flex gap-2'>
                             <LandPlot className='h-5 w-5 text-primary'/>Others</h2>
                    </SelectItem>
                </SelectContent>
                </Select>

                <Select onValueChange={onSort} className="w-full max-w-[200px]">
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Sort By" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="newest">
                            <span className="flex gap-2">Newest First</span>
                        </SelectItem>
                        <SelectItem value="oldest">
                            <span className="flex gap-2">Oldest First</span>
                        </SelectItem>
                        <SelectItem value="price-asc">
                            <span className="flex gap-2">Lowest Price</span>
                        </SelectItem>
                        <SelectItem value="price-desc">
                            <span className="flex gap-2">Highest Price</span>
                        </SelectItem>
                        <SelectItem value="area-asc">
                            <span className="flex gap-2">Lowest Area</span>
                        </SelectItem>
                        <SelectItem value="area-desc">
                            <span className="flex gap-2">Highest Area</span>
                        </SelectItem>
                    </SelectContent>
                </Select>

                <Button 
                    variant="outline" 
                    onClick={onClearFilters}
                    size="sm"
                    className="w-full max-w-[200px]"
                >
                    Clear Filters
                </Button>
            </div>
        </div>
    )
}

export default FilterSection
