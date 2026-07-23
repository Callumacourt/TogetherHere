import { fetchNotes } from '@/services/fetchNotes';
import {
  GeoJSONSource,
  Map,
  MapRef,
  Layer,
} from '@maplibre/maplibre-react-native';
import { useEffect, useState, useRef, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapBounds, NoteList } from '../../../types/types';

const toFeatureCollection = (
  notesInBounds: NoteList,
): GeoJSON.FeatureCollection => ({
  type: 'FeatureCollection',
  features: notesInBounds.map((note) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [note.lng, note.lat] },
    properties: { id: note.id },
  })),
});

export default function MapComponent() {
  const [mapBounds, setMapBounds] = useState<MapBounds | null>(null);
  const [notesInBounds, setNotesInBounds] = useState<NoteList>([]);

  const noteFeatures = useMemo(
    () => toFeatureCollection(notesInBounds),
    [notesInBounds],
  );

  const mapElement = useRef<MapRef | null>(null);

  // Fetch all voice notes within map bounds
  useEffect(() => {
    (async () => {
      if (!mapBounds) return;
      const { data, error } = await fetchNotes(mapBounds);
      if (error) {
        console.error(error);
        return;
      }
      setNotesInBounds(data);
    })();
    return () => {};
  }, [mapBounds]);

  // Callback on map nav
  const handleRegionChange = async () => {
    if (!mapElement.current) {
      throw new Error('No map element defined');
    }

    const bounds = await mapElement.current.getBounds();
    const [west, south, east, north] = bounds;
    setMapBounds({ minLng: west, minLat: south, maxLng: east, maxLat: north });
  };

  return (
    <View style={styles.map}>
      <Map
        ref={mapElement}
        onRegionDidChange={handleRegionChange}
        mapStyle={'https://tiles.openfreemap.org/styles/dark'}
      >
        <GeoJSONSource id="notes-source" data={noteFeatures}>
          <Layer
            id="notes-layer"
            type="circle"
            paint={{ 'circle-radius': 8, 'circle-color': '#ff3b30' }}
          />
        </GeoJSONSource>
      </Map>
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
