"use client";

import Map, { Popup, Marker } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from "./Map.module.css";

export default function MapComponent() {
  const bounds: mapboxgl.LngLatBoundsLike = [
    [-3.195, 51.47],
    [-3.17, 51.495],
  ];

  return (
    <Map 
        mapboxAccessToken= {process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        maxBounds={bounds}
        initialViewState={
            {
                longitude: -3.1791,
                latitude: 51.4756,
                zoom: 12.5
            }}  
            mapStyle= "mapbox://styles/mapbox/dark-v11"
            minZoom={11}
            maxZoom={17}
    >
        <Marker longitude={-3.1836} latitude={51.4823} anchor="bottom">
            <div className = {styles.mapMarker}>

            </div>
        </Marker>
        <Marker longitude={-3.1854} latitude={51.4821} anchor="bottom">
            <div className = {styles.mapMarker}>

            </div>
        </Marker>
        <Marker longitude={-3.1890} latitude={51.4840} anchor="bottom">
            <div className = {styles.mapMarker}>

            </div>
        </Marker>
    </Map>
  );
}