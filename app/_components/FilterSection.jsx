import * as React from 'react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
  } from "@/components/ui/select"
import { Store, Factory, LandPlot, Warehouse,ReceiptIndianRupee,Captions } from 'lucide-react'
  
function FilterSection({setListingType,setPropertyType,setSubPropertyType,setAgeOfProperty}) {
  return (
    <div className='px-3 py-2 grid grid-cols-2 
    md:flex gap-2'>
        <Select onValueChange={setListingType}>
        <SelectTrigger className="w-[180px]">
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
        <SelectTrigger className="w-[180px]">
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

        <Select  onValueChange={setSubPropertyType}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sub Property Type" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="Commercial Office Space">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Commercial Office Space</h2>
            </SelectItem>
            <SelectItem value="Co-Working Space">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Co-Working Space</h2>
            </SelectItem>
            <SelectItem value="Commercial Shop">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Commercial Shop</h2>
            </SelectItem>
            <SelectItem value="Office In IT SEZ Park">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Office In IT SEZ Park</h2>
            </SelectItem>
            <SelectItem value="Industrial Land">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Industrial Land</h2>
            </SelectItem>
            <SelectItem value="Commercial Land">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Commercial Land</h2>
            </SelectItem>
            <SelectItem value="Warehouse">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Warehouse</h2>
            </SelectItem>
            <SelectItem value="Factory">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Factory</h2>
            </SelectItem>
            <SelectItem value="Industrial Shed">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Industrial Shed</h2>
            </SelectItem>
            <SelectItem value="Industrial Building">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Industrial Building</h2>
            </SelectItem>
            <SelectItem value="Other Business">
                <h2 className='flex gap-2'>
                     <Captions className='h-5 w-5 text-primary'/>Other Business</h2>
            </SelectItem>
          
          
        </SelectContent>
        </Select>
        <Select  onValueChange={(value)=>value=='All'?
        setAgeOfProperty(null): setAgeOfProperty(value)}>
        <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Age of Property" />
        </SelectTrigger>
        <SelectContent>
        <SelectItem value="Under Construction">
        Under Construction
            </SelectItem>
            <SelectItem value="Less than a Year">
            Less than a Year
            </SelectItem>
            <SelectItem value="1 to 5 Year">
            1 to 5 Year
            </SelectItem>
            <SelectItem value="5 to 10 Year">
            5 to 10 Year
            </SelectItem>
            <SelectItem value="More than 10 Year">
            More than 10 Year
            </SelectItem>
          
          
        </SelectContent>
        </Select>

    </div>
  )
}

export default FilterSection