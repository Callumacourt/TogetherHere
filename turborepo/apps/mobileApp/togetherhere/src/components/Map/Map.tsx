import { fetchNotes } from '@/services/fetchNotes';
import { Map, MapRef } from '@maplibre/maplibre-react-native';
import { useEffect, useState, useRef } from 'react';
import { StyleSheet, View } from 'react-native';
import { MapBounds, NoteList } from '../../../types/types';

export default function MapComponent() {
  const [mapBounds, setMapBounds] = useState<MapBounds | undefined>(undefined);
  const [notesInBounds, setNotesInBounds] = useState<NoteList | null>();
  const mapElement = useRef<MapRef | null>(null);

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
      />
    </View>
  );
}

const styles = StyleSheet.create({
  map: {
    flex: 1,
    alignSelf: 'stretch',
  },
});
