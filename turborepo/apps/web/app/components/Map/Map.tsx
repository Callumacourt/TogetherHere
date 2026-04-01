"use client";

import { useEffect, useRef } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import styles from "./Map.module.css";

export default function Map() {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  const bounds: mapboxgl.LngLatBoundsLike = [
    [-3.195, 51.47],
    [-3.17, 51.495],
  ];

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? "";

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/dark-v11",
      center: [-3.1791, 51.4756],
      maxBounds: bounds,
      zoom: 12.5,
      minZoom: 11,
      maxZoom: 17,
    });

    if (window.matchMedia("(min-width: 1024px)").matches) {
      map.addControl(new mapboxgl.NavigationControl(), "top-right");
    }

    mapRef.current = map;

    return () => {
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  return <div ref={mapContainerRef} id="map" className={styles.mapContainer} />;
}