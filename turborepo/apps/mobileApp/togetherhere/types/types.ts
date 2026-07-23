export type Coordinate = {
  lat: number;
  lng: number;
};

export type MapBounds = {
  minLat: number;
  minLng: number;
  maxLat: number;
  maxLng: number;
};

export type NoteList = {
  id: string;
  created_at: string;
  lat: number;
  lng: number;
  audioUrl: string;
  duration_s: number | null;
  photo_url: string;
  geography: string;
}[];
