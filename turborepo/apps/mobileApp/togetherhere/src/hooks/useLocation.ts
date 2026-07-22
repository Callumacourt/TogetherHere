import { useState, useEffect, useRef } from 'react';
import * as location from 'expo-location';
import haversine from 'haversine-distance';

type Coordinate = {
  lat: number;
  lng: number;
};

export default function useLocation() {
  const [userLocation, setUserLocation] =
    useState<location.LocationObject | null>(null);
  const locationSubscription = useRef<location.LocationSubscription | null>(
    null,
  );
  const [error, setError] = useState<string | null>(null);
  const watching = useRef<boolean>(false);

  function locationCallback(location: location.LocationObject) {
    setUserLocation(location);
  }

  async function startWatching() {
    if (watching.current === true) return;
    const { status } = await location.requestForegroundPermissionsAsync();

    if (status !== 'granted') {
      setError('Location access denied');
      return;
    }

    locationSubscription.current = await location.watchPositionAsync(
      { accuracy: location.Accuracy.BestForNavigation },
      locationCallback,
    );

    watching.current = true;
  }

  function stopWatching() {
    locationSubscription.current?.remove();
    watching.current = false;
  }

  async function getLocationOnce() {
    const { status } = await location.requestForegroundPermissionsAsync();
    if (status !== 'granted') {
      setError('Location access denied');
      return null;
    }

    try {
      const current = await location.getCurrentPositionAsync({
        accuracy: location.Accuracy.BestForNavigation,
      });
      setUserLocation(current);
      return current;
    } catch (e) {
      setError('Could not determine location');
      return null;
    }
  }

  function withinDistance(target: Coordinate, radiusMeters = 15) {
    if (!userLocation || !userLocation.coords.accuracy) return false;
    return (
      haversine(target, userLocation.coords) <=
      radiusMeters + userLocation.coords.accuracy
    );
  }

  useEffect(() => {
    (async () => {
      startWatching();
    })();

    return () => {
      stopWatching();
    };
  }, []);

  return {
    userLocation,
    error,
    startWatching,
    stopWatching,
    getLocationOnce,
    withinDistance,
  };
}
