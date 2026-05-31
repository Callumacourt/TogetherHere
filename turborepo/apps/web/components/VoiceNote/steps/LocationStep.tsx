import { Map, Marker, NavigationControl, MapRef, MapInstance }from "react-map-gl/mapbox"
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "./LocationStep.module.css";

const SearchBox = dynamic(
    () => import("@mapbox/search-js-react").then(m => m.SearchBox),
    { ssr: false }
);

type Props = {
    pin: { lat: number, lng: number } | null,
    onPinChange: (pin: {lat: number, lng: number }) => void,
    onConfirm: () => void
}

export default function LocationStep ({pin, onPinChange, onConfirm} : Props) {

    const [isDesktop, setIsDesktop] = useState(false);
    const [geoError, setGeoError] = useState(false);
    const [mapInstance, setMapInstance] = useState<MapInstance | undefined>(undefined);
    const mapRef = useRef<MapRef | null>(null);

    function onLocationGet (location : GeolocationPosition) {
        if (!mapRef.current) return;
        const lng = location.coords.longitude;
        const lat = location.coords.latitude;
        mapRef.current.flyTo({center: [lng, lat], zoom: 15});
        onPinChange({lat, lng});
    }
    
    useEffect(() => {
        navigator.geolocation.getCurrentPosition(
            (pos) => {onLocationGet(pos)},
            () => setGeoError(true)
        )
        const mq = window.matchMedia("(min-width:1008px)");
        const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(Boolean("matches" in e ? e.matches : mq.matches));
        setIsDesktop(mq.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);
        return () => {
            if (mq.removeEventListener) mq.removeEventListener("change", onChange as any);
            else mq.removeListener(onChange as any);
        };
    }, []);

    return (
        <>
        <SearchBox
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            map={mapInstance}
            onRetrieve={(result) => {
                const coords = result.features[0]?.geometry.coordinates as [number, number] | undefined
                if (!coords) return
                const [lng, lat] = coords
                onPinChange({ lat, lng })
            }}
         />
         <div className={styles.mapContainer}>
         <Map
            ref = {mapRef}
            onLoad={() => setMapInstance(mapRef.current?.getMap() ?? undefined)}
            reuseMaps
            mapboxAccessToken= {process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
                mapStyle= "mapbox://styles/mapbox/dark-v11"
                style={{ width: "100%", height: "100%" }}
                    initialViewState={
                    {
                        longitude: -3.1832,
                        latitude: 51.4836,
                        zoom: 14.5
                }}
            >
                {pin && (
                    <Marker
                        longitude={pin.lng}
                        latitude={pin.lat}
                        draggable
                        onDrag={(e) => onPinChange({ lat: e.lngLat.lat, lng: e.lngLat.lng})}
                    />
                )}
                {isDesktop && (
                  <NavigationControl position="top-right" showCompass={false} />
              )}
            </Map>
            </div>
            {geoError && (
                <>Please allow location permissions</>
            )}
            <button type="button" onClick={onConfirm}>Next</button>
        </>
    )
}