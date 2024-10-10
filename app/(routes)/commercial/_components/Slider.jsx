"use client"; // Ensure this is a Client Component

import React, { useState, useRef, useEffect } from 'react'
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel"
import Image from 'next/image'

function Slider({ imageList }) {
    const [currentIndex, setCurrentIndex] = useState(0)
    const [api, setApi] = useState(null)
    const carouselRef = useRef(null)

    useEffect(() => {
        if (api) {
            api.on('select', () => {
                setCurrentIndex(api.selectedScrollSnap())
            })
        }
    }, [api])

    const handleThumbnailClick = (index) => {
        if (api) {
            api.scrollTo(index)
        }
    }

    if (!imageList || imageList.length === 0) {
        return (
            <div className='w-full h-[200px] bg-slate-200 animate-pulse rounded-lg'></div>
        )
    }

    return (
        <div>
            <Carousel ref={carouselRef} setApi={setApi} className="mb-4">
                <CarouselContent>
                    {imageList.map((item, index) => (
                        <CarouselItem key={index}>
                            <Image 
                                src={item.url} 
                                width={800}
                                height={300}
                                alt={`image-${index}`}
                                className='rounded-xl object-cover h-[360px] w-full'
                            />
                        </CarouselItem>
                    ))}
                </CarouselContent>
                <CarouselPrevious />
                <CarouselNext />
            </Carousel>

            <div className="flex overflow-x-auto space-x-2 pb-2">
                {imageList.map((item, index) => (
                    <div 
                        key={index}
                        className={`cursor-pointer transition-all duration-300 ${index === currentIndex ? 'border-2 border-blue-500' : 'opacity-70 hover:opacity-100'}`}
                        onClick={() => handleThumbnailClick(index)}
                    >
                        <Image 
                            src={item.url} 
                            width={100}
                            height={60}
                            alt={`thumbnail-${index}`}
                            className='rounded object-cover h-[60px] w-[100px]'
                        />
                    </div>
                ))}
            </div>
        </div>
    )
}

export default Slider