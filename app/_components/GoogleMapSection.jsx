"use client";
import React, { useCallback, useEffect, useState } from 'react'
import { GoogleMap, useJsApiLoader } from '@react-google-maps/api';
import MarkerItem from './MarkerItem';
const containerStyle = {
    width: '100%',
    height: '80vh',
    borderRadius:13
  };
  

function GoogleMapSection({coordinates,listing}) {
    const defaultCenter = {
        lat: 11.342423,
        lng: 77.728165
    };
   
    const [center, setCenter] = useState(defaultCenter);
    const [map, setMap] = useState(null)
      useEffect(() => {
        if (coordinates && typeof coordinates.lat === 'number' && typeof coordinates.lng === 'number') {
            setCenter(coordinates);
        }
    }, [coordinates]);
     
      useEffect(() => {
        if (map) {
          
            map.setZoom(10);
        }
    }, [map]);
      const onLoad = useCallback(function callback(map) {
        // This is just an example of getting and using the map instance!!! don't just blindly copy!
        const bounds = new window.google.maps.LatLngBounds(center);
        map.fitBounds(bounds);
        setMap(map)
       
      }, [])
      const onUnmount = React.useCallback(function callback(map) {
        setMap(null)
      }, [])
  return (
    <div>
        <GoogleMap
        mapContainerStyle={containerStyle}
        center={center}
        zoom={13}
        onLoad={map=>setMap(map)}
        
        onUnmount={onUnmount}
        gestureHandling="greedy"
      >
        { /* Child components, such as markers, info windows, etc. */ }
        {listing.map((item,index)=>(
            <MarkerItem
                key={index}
                item={item}
            />
        ))}
      </GoogleMap>
    </div>
  )
}

export default GoogleMapSection