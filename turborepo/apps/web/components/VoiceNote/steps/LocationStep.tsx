import { Map, Marker, NavigationControl, MapRef, MapInstance }from "react-map-gl/mapbox"
import { useState, useEffect, useRef } from "react";
import dynamic from "next/dynamic";
import styles from "./LocationStep.module.css";
import type { Theme } from '@mapbox/search-js-web'
import LoadingSpinner from "../../LoadingSpinner/LoadingSpinner";
import { getInAppBrowser, isAndroid, buildAndroidChromeIntentUrl } from "../../../utils/inAppBrowser";

const SearchBox = dynamic(
    () => import("@mapbox/search-js-react").then(m => m.SearchBox),
    { ssr: false }
);

type Props = {
    pin: { lat: number, lng: number } | null,
    onPinChange: (pin: {lat: number, lng: number }) => void,
    onConfirm: () => void
}

const SearchTheme: Theme = {
    variables: {
        colorBackground: '#111',
        colorText: '#ffffff',
        colorBackgroundHover: '#222',
        fontFamily: 'var(--font-inter)',
        borderRadius: '8px',
        border: '1px solid rgba(255,255,255,0.15)',
        colorPrimary: '#ffffff',
    }
}

export default function LocationStep ({pin, onPinChange, onConfirm} : Props) {

    const [isDesktop, setIsDesktop] = useState(false);
    const [geoError, setGeoError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false)
    const [mapInstance, setMapInstance] = useState<MapInstance | undefined>(undefined);
    const [inAppBrowser, setInAppBrowser] = useState<ReturnType<typeof getInAppBrowser>>(null);
    const [linkCopied, setLinkCopied] = useState(false);
    const mapRef = useRef<MapRef | null>(null);
    const pendingPin = useRef<{lat: number, lng: number} | null>(null);
    const geoResolvedRef = useRef(false);

    const inAppBrowserLabel = inAppBrowser
        ? inAppBrowser[0]!.toUpperCase() + inAppBrowser.slice(1)
        : "";

    // Android in-app WebViews will honor a Chrome intent link as a real
    // navigation. No iOS equivalent exists, so fall back to copy-to-clipboard
    const androidChromeUrl = typeof window !== "undefined" && isAndroid()
        ? buildAndroidChromeIntentUrl(window.location.href)
        : null;

    async function handleCopyLink() {
        try {
            await navigator.clipboard.writeText(window.location.href);
            setLinkCopied(true);
            setTimeout(() => setLinkCopied(false), 2500);
        } catch {}
    }

    function onLocationGet (location : GeolocationPosition) {
        const lng = location.coords.longitude;
        const lat = location.coords.latitude;
        // Store the pin regardless of whether map is ready yet
        pendingPin.current = { lat, lng };
        onPinChange({ lat, lng });
        geoResolvedRef.current = true;
        // Only flyTo if map is already loaded, otherwise onLoad will handle it
        if (!mapRef.current) return;
        mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
    }
    
    useEffect(() => {
        let cancelled = false;
        let watchId: number | null = null;

        // Instagram/Facebook/TikTok in-app browsers frequently never honor a
        // granted geolocation permission — detect them so we can explain why
        // rather than let it look like a broken "Allow" button
        const detectedInAppBrowser = getInAppBrowser();
        setInAppBrowser(detectedInAppBrowser);

        const succeed = (pos: GeolocationPosition) => {
            if (cancelled) return;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            onLocationGet(pos);
            setLoading(false);
        };

        const fail = (message: string) => {
            if (cancelled) return;
            if (watchId !== null) {
                navigator.geolocation.clearWatch(watchId);
                watchId = null;
            }
            setGeoError(message);
            setLoading(false);
        };

        if (!("geolocation" in navigator)) {
            setGeoError("Location isn't available here, please use the searchbar");
        } else {
            setLoading(true);
            navigator.geolocation.getCurrentPosition(
                succeed,
                (err) => {
                    if (cancelled) return;
                    if (err.code === err.PERMISSION_DENIED) {
                        fail(
                            detectedInAppBrowser
                                ? "This app's browser doesn't support location, please use the searchbar or open this page in Safari/Chrome"
                                : "Location permission denied, please use the searchbar"
                        );
                        return;
                    }
                    // Slow first fix (common on desktop): keep listening via
                    // watchPosition and take the first result. In-app browsers
                    // rarely recover here, so fail faster and point at the searchbar
                    watchId = navigator.geolocation.watchPosition(
                        succeed,
                        () => fail(
                            detectedInAppBrowser
                                ? "This app's browser doesn't support location, please use the searchbar or open this page in Safari/Chrome"
                                : "Error finding your location, please use the searchbar"
                        ),
                        { enableHighAccuracy: true, timeout: detectedInAppBrowser ? 8_000 : 20_000, maximumAge: 0 }
                    );
                },
                { maximumAge: 300_000, timeout: 10_000 }
            );
        }

        const mq = window.matchMedia("(min-width:1008px)");
        const onChange = (e: MediaQueryListEvent | MediaQueryList) => setIsDesktop(Boolean("matches" in e ? e.matches : mq.matches));
        setIsDesktop(mq.matches);
        if (mq.addEventListener) mq.addEventListener("change", onChange);
        else mq.addListener(onChange);
        return () => {
            cancelled = true;
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
            if (mq.removeEventListener) mq.removeEventListener("change", onChange as any);
            else mq.removeListener(onChange as any);
        };
    }, []);

    return (
        <>
        {inAppBrowser && (
            <div className={styles.inAppBanner}>
                <p>{inAppBrowserLabel}&apos;s browser can&apos;t detect your location.</p>
                {androidChromeUrl ? (
                    <a href={androidChromeUrl} className={styles.bannerLink}>
                        Open in Chrome
                    </a>
                ) : (
                    <a href="#" className={styles.bannerLink} onClick={(e) => { e.preventDefault(); handleCopyLink(); }}>
                        {linkCopied ? "Copied! Paste in Safari" : "Copy link to open in Safari"}
                    </a>
                )}
            </div>
        )}
        <div className = {styles.searchBoxContainer}>
        <SearchBox
            theme={SearchTheme}
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN!}
            map={mapInstance}
            onRetrieve={(result) => {
                const coords = result.features[0]?.geometry.coordinates as [number, number] | undefined
                if (!coords) return
                const [lng, lat] = coords
                onPinChange({ lat, lng })
                mapRef.current?.flyTo({ center: [lng, lat], zoom: 15 })
            }}
         />
         </div>
         <div className={styles.mapContainer}>
            {loading && (
                <LoadingSpinner loading = {loading} caption="Finding your location"/>
            )}
         <Map
            ref={mapRef}
            onLoad={() => {
                setMapInstance(mapRef.current?.getMap() ?? undefined);
                // If geolocation resolved before map loaded, fly now
                if (pendingPin.current) {
                    mapRef.current?.flyTo({ center: [pendingPin.current.lng, pendingPin.current.lat], zoom: 15 });
                } else if (geoResolvedRef.current) {
                    setLoading(false);
                }
            }}
            onMoveEnd={() => {
                if (geoResolvedRef.current) {
                    setLoading(false);
                    if (pendingPin.current) {
                        onPinChange(pendingPin.current);
                        pendingPin.current = null;
                    }
                }
            }}
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
                        color="black"
                        onDrag={(e) => onPinChange({ lat: e.lngLat.lat, lng: e.lngLat.lng})}
                    />
                )}
                {isDesktop && (
                  <NavigationControl position="top-right" showCompass={false} />
              )}
            </Map>
            </div>
            <span className = {styles.locationNav}>
                {geoError && !inAppBrowser && (<>{geoError}</>)}
                <button className = {styles.continueBtn} type="button" onClick={onConfirm}>Continue</button>
            </span>
        </>
    )
}