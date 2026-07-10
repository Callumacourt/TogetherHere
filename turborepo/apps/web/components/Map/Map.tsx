"use client";
import { useEffect, useState } from "react";
import Map, { Popup, Marker, NavigationControl } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import styles from "./Map.module.css";
import PopupCard from "./Popup/PopupCard"
import WaveForm from "./WaveForm/WaveForm";

type Note = {
    id: number;
    lat: number;
    lon: number;
    location: string;
    timeAgo: string;
    audioUrl: string;
    imgUrl: string;
  };

export default function MapComponent() {
  const [isDesktop, setIsDesktop] = useState(false);
  const [selectedNote, setSelectedNote] = useState<Note | null>(null);


  const bounds: mapboxgl.LngLatBoundsLike = [
    [-3.255, 51.438],
    [-3.115, 51.529],
  ];

  useEffect(() => {
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

  const mockData: Note[] = [
    {
      id: 1,
      lat: 51.4837,
      lon: -3.1759,
      location: "Cardiff University",
      timeAgo: "12 minutes ago",
      audioUrl: "/audio/uniAudio.mp3",
      imgUrl: "/images/map/uniImg.jpg",
    },
    {
      id: 2,
      lat: 51.4816,
      lon: -3.1820,
      location: "Cardiff Castle",
      timeAgo: "1 hour ago",
      audioUrl: "/audio/castleAudio.m4a",
      imgUrl: "/images/map/castle.jpg",
    },
    {
      id: 3,
      lat: 51.4854,
      lon: -3.1917,
      location: "Sophia Gardens Riverside",
      timeAgo: "Yesterday",
      audioUrl: "/audio/butePark.m4a",
      imgUrl: "/images/map/bute.jpg",
    },
  ]

  useEffect(() => {
    mockData.forEach(({ imgUrl }) => {
      const img = new Image();
      img.src = imgUrl;
    });
}, []);

  return (
    <div className={styles.mapContainer}>
    <Map
      reuseMaps
      mapboxAccessToken= {process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      maxBounds={bounds}
      dragRotate={false}
      touchPitch={false}
      onLoad={(e) => e.target.touchZoomRotate.disableRotation()}
      onIdle={(e) => e.target.stop()}
      initialViewState={
          {
              longitude: -3.1832,
              latitude: 51.4836,
              zoom: 13.5
          }}
          mapStyle= "mapbox://styles/mapbox/dark-v11"
          minZoom={13}
          maxZoom={18}
          style={{ width: "100%", height: "100%" }}
    >
      {isDesktop && (
          <NavigationControl position="top-right" showCompass={false} />
      )}

      {mockData.map((data) => (
        <Marker 
          key={data.id} 
          longitude={data.lon} 
          latitude={data.lat} 
          anchor="bottom" 
          onClick={(e) => { 
            e.originalEvent.stopPropagation()
            setSelectedNote(data);
          }}>
          <WaveForm seed={data.id}/>
        </Marker>
      ))}
      {selectedNote && (
        <Popup
          latitude={selectedNote.lat}
          longitude={selectedNote.lon}
          onClose={() => setSelectedNote(null)}
          closeButton={false}
          anchor="bottom"
          offset={100}
        >
          <PopupCard
            url={selectedNote.imgUrl}
            key={selectedNote.id}
            audioUrl = {selectedNote.audioUrl}
            location={selectedNote.location}
            timeAgo={selectedNote.timeAgo}
          />
        </Popup>
      )}
    </Map>
    </div>
  );
}
