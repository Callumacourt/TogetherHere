"use client";

import { useState } from "react";
import Map, { Popup, Marker } from "react-map-gl/mapbox";
import 'mapbox-gl/dist/mapbox-gl.css';
import PopupCard from "./Popup/PopupCard"
import WaveForm from "./WaveForm/WaveForm";

export default function MapComponent() {
  const bounds: mapboxgl.LngLatBoundsLike = [
    [-3.195, 51.47],
    [-3.17, 51.495],
  ];
  
  type Note = {
    id: number;
    lat: number;
    lon: number;
    location: string;
    timeAgo: string;
    audioUrl: string;
    imgUrl: string;
  }

  const [selectedNote, setSelectedNote] = useState<Note | null>(null);

  const mockData: Note[] = [
    {
      id: 1,
      lat: 51.4790,
      lon: -3.1750,
      location: "The Hayes",
      timeAgo: "12 minutes ago",
      audioUrl: "/audio/testAudio.mp3",
      imgUrl: "/mapImg1.jpg",
    },
    {
      id: 2,
      lat: 51.4815,
      lon: -3.1820,
      location: "Cardiff Castle grounds",
      timeAgo: "1 hour ago",
      audioUrl: "/audio/testAudio.mp3",
      imgUrl: "/mapImg2.jpg",
    },
    {
      id: 3,
      lat: 51.4760,
      lon: -3.1900,
      location: "Sophia Gardens riverside",
      timeAgo: "Yesterday",
      audioUrl: "/audio/testAudio.mp3",
      imgUrl: "/mapImg3.jpg",
    },

  ]

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
          <WaveForm/>
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
            audioUrl = {selectedNote.audioUrl}
            location={selectedNote.location}
            timeAgo={selectedNote.timeAgo}
          />
        </Popup>
      )}
    </Map>
  );
}