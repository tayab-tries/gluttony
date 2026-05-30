import { useEffect, useState } from 'react';
import { DEFAULT_CUSTOMER_LOCATION } from '../lib/delivery';

const STORAGE_KEY = 'gluttony_delivery_location';

function readStoredLocation() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : DEFAULT_CUSTOMER_LOCATION;
  } catch {
    return DEFAULT_CUSTOMER_LOCATION;
  }
}

export function useDeliveryLocation() {
  const [location, setLocation] = useState(readStoredLocation);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState('');

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(location));
  }, [location]);

  const updateLocationDetails = updates => {
    setLocation(prev => ({ ...prev, ...updates }));
  };

  const detectCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Geolocation is not available in this browser.');
      return;
    }

    setIsDetectingLocation(true);
    setLocationError('');

    navigator.geolocation.getCurrentPosition(
      position => {
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        setLocation(prev => ({
          ...prev,
          lat,
          lng,
          source: 'browser',
          label: 'Current location',
          address: prev.address?.trim() ? prev.address : `${lat}, ${lng}`,
        }));
        setIsDetectingLocation(false);
      },
      error => {
        setLocationError(error.message || 'Unable to detect your location.');
        setIsDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  };

  return {
    location,
    setLocation: updateLocationDetails,
    detectCurrentLocation,
    isDetectingLocation,
    locationError,
  };
}
