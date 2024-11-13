"use client"
import * as React from 'react';
import GooglePlacesAutocomplete, { geocodeByAddress, getLatLng } from 'react-google-places-autocomplete'

function GoogleAddressSearch({selectedAddress, setCoordinates, setSelectedLocality, setSubLocality}) {
  const [isLoading, setIsLoading] = React.useState(false);
  const [error, setError] = React.useState(null);

  const clearAllStates = () => {
    selectedAddress(null);
    setCoordinates(null);
    setSelectedLocality(null);
    setSubLocality(null);
  };

  return (
    <div className='flex flex-col sm:flex-row items-center w-full gap-2'>
        <div className="w-full relative">
          {error && (
            <div className="text-red-500 text-sm mb-2 absolute -top-6 left-0">
              {error}
            </div>
          )}
          <GooglePlacesAutocomplete
            apiKey={process.env.NEXT_PUBLIC_GOOGLE_PLACE_API_KEY}
            selectProps={{
                placeholder:'Search Your City',
                isClearable: true,
                className: 'w-full',
                isLoading,
                isDisabled: isLoading,
                onChange: async (place) => {
                    setError(null);
                    setIsLoading(true);

                    try {
                        if (!place?.label) {
                            clearAllStates();
                            return;
                        }

                        selectedAddress(place);
                        
                        const results = await geocodeByAddress(place.label);
                        if (!results?.[0]) {
                            throw new Error('No location data found');
                        }

                        const addressComponents = results[0].address_components;
                        if (!addressComponents) {
                            throw new Error('Invalid address data received');
                        }

                        let locality = null;
                        let sublocality = null;
                        let administrativeArea = null;

                        for (let component of addressComponents) {
                            if (component.types.includes('locality')) {
                                locality = component.long_name;
                            }
                            if (component.types.includes('sublocality')) {
                                sublocality = component.long_name;
                            }
                            if (component.types.includes('administrative_area_level_1')) {
                                administrativeArea = component.long_name;
                            }
                        }

                        setSelectedLocality(sublocality || locality || administrativeArea || null);
                        setSubLocality(sublocality || null);

                        const coordinates = await getLatLng(results[0]);
                        
                        // Validate coordinates
                        if (!coordinates || 
                            typeof coordinates.lat !== 'number' || 
                            typeof coordinates.lng !== 'number' ||
                            isNaN(coordinates.lat) || 
                            isNaN(coordinates.lng)) {
                            throw new Error('Invalid coordinates received');
                        }

                        setCoordinates(coordinates);

                    } catch (error) {
                        console.error('Error processing location:', error);
                        setError(error.message || 'Failed to process location. Please try again.');
                        clearAllStates();
                    } finally {
                        setIsLoading(false);
                    }
                }
            }}
          />
          {isLoading && (
            <div className="absolute right-10 top-1/2 -translate-y-1/2">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-blue-500 rounded-full animate-spin"></div>
            </div>
          )}
        </div>
    </div>
  )
}

export default GoogleAddressSearch
