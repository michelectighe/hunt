import { DEFAULT_SPECIES } from "./src/data/speciesStore";
export type Species = (typeof DEFAULT_SPECIES)[number] | string;

export type Own = "crown" | "private" | "unknown";

export type Pin = {
  id: string;
  lat: number;
  lon: number;
  ts: number;
  own: "crown" | "private" | "unknown";
  species: string; // or your union
  note: string | null;
  // NEW (optional on old rows)
  moonPhase?: string; // e.g., "Waxing Gibbous"
  moonIllum?: number; // 0..1 (store fraction)
};
export type Track = {
  id: string; // uuid
  name?: string | null;
  startedTs: number; // ms
  endedTs?: number | null;
  distance?: number; // meters
};

export type TrackPoint = {
  id?: number; // autoincrement
  trackId: string;
  ts: number; // ms
  lat: number;
  lon: number;
  accuracy?: number | null;
  speed?: number | null;
  heading?: number | null;
};
