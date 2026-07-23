import { supabase } from '@/lib/supabase';
import type { MapBounds } from '../../types/types';

export async function fetchNotes(mapBounds: MapBounds) {
  try {
    const notes = await supabase.rpc('notes_in_bounds', {
      min_lng: mapBounds.minLng,
      min_lat: mapBounds.minLat,
      max_lng: mapBounds.maxLng,
      max_lat: mapBounds.maxLat,
    });
    return notes;
  } catch (e) {
    return { data: null, error: e };
  }
}
