"use client"
import { MapPin } from 'lucide-react';
import * as React from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete'

function GoogleAddressSearch({selectedAddress, setCoordinates, setSelectedCity}) {
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
                        // Get city from address components
                        geocodeByAddress(place.label)
                            .then(results => {
                                if (results[0]) {
                                    // Extract city from address components
                                    const addressComponents = results[0].address_components;
                                    let city = null;
                                    
                                    for (let component of addressComponents) {
                                        if (component.types.includes('locality')) {
                                            city = component.long_name;
                                            break;
                                        }
                                    }
                                    
                                    // Set city if found
                                    if (city) {
                                        setSelectedCity(city);
                                    }

                                    // Get coordinates
                                    return getLatLng(results[0]);
                                }
                            })
                            .then(({lat, lng}) => {
                                // Check if lat and lng are numbers
                                if (typeof lat === 'number' && typeof lng === 'number') {
                                    setCoordinates({lat, lng});
                                } else {
                                    console.error('Invalid coordinates:', {lat, lng});
                                    setCoordinates(null);
                                }
                            })
                            .catch(error => console.error('Error', error));
                    } else {
                        // Handle the case when place is cleared or invalid
                        selectedAddress(null);
                        setCoordinates(null);
                        setSelectedCity(null);
                    }
                }
            }}
          />
        </div>
    </div>
  )
}

export default GoogleAddressSearch
