"use client"
import { MapPin } from 'lucide-react';
import * as React from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete'

function GoogleAddressSearch({selectedAddress,setCoordinates}) {
  return (
    // Added flex-col for mobile and sm:flex-row for larger screens
    // Added gap-2 for spacing between elements
    <div className='flex flex-col sm:flex-row items-center w-full gap-2'>
        <div className="w-full">
          <GooglePlacesAutocomplete
                apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
            selectProps={{
                placeholder:'Search Your City',
                isClearable:true,
                className:'w-full',
                onChange:(place) => {
                    console.log(place);
                    if (place && place.label) {
                        selectedAddress(place);
                        geocodeByAddress(place.label)
                            .then(result => getLatLng(result[0]))
                            .then(({lat, lng}) => {
                                setCoordinates({lat, lng})
                            })
                            .catch(error => console.error('Error', error));
                    } else {
                        // Handle the case when place is cleared or invalid
                        selectedAddress(null);
                        setCoordinates(null);
                    }
                }
            }}
          />
        </div>
    </div>
  )
}

export default GoogleAddressSearch
