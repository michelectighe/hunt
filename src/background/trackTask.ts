// background/trackTask.ts
import * as TaskManager from "expo-task-manager";
import type { LocationObject } from "expo-location";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { appendPoint, incrementTrackDistance } from "../data/tracks";

// keys used by the hook
export const TASK_NAME = "TRACK_LOCATION_BG";
export const KEY_ACTIVE_TRACK_ID = "bg_active_track_id";
export const KEY_LAST_POINT = "bg_last_point";

function dist(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371000;
  const dLat = (Math.PI / 180) * (b.latitude - a.latitude);
  const dLon = (Math.PI / 180) * (b.longitude - a.longitude);
  const lat1 = (Math.PI / 180) * a.latitude;
  const lat2 = (Math.PI / 180) * b.latitude;
  const sinDLat = Math.sin(dLat / 2);
  const sinDLon = Math.sin(dLon / 2);
  const c = 2 * Math.asin(Math.sqrt(sinDLat * sinDLat + Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon));
  return R * c;
}

// Must be defined at module scope (not inside a component)
TaskManager.defineTask(TASK_NAME, async ({ data, error }) => {
  if (error) return;

  const trackId = await AsyncStorage.getItem(KEY_ACTIVE_TRACK_ID);
  if (!trackId) return;

  const payload = data as { locations: LocationObject[] };
  const locs = payload?.locations ?? [];
  if (!locs.length) return;

  // last point for distance accumulation
  let lastJSON = await AsyncStorage.getItem(KEY_LAST_POINT);
  let last: { latitude: number; longitude: number } | null = lastJSON ? JSON.parse(lastJSON) : null;
  let delta = 0;

  for (const loc of locs) {
    const c = loc.coords;
    if (c.accuracy != null && c.accuracy > 50) continue; // discard noisy points

    const cur = { latitude: c.latitude, longitude: c.longitude };
    if (last) {
      const d = dist(last, cur);
      if (d > 0.5) delta += d; // ignore jitter
    }
    await appendPoint({
      trackId,
      ts: loc.timestamp ?? Date.now(),
      lat: c.latitude,
      lon: c.longitude,
      accuracy: c.accuracy ?? null,
      speed: c.speed ?? null,
      heading: Number.isFinite(c.heading) ? c.heading : null,
    });
    last = cur;
  }

  if (last) await AsyncStorage.setItem(KEY_LAST_POINT, JSON.stringify(last));
  if (delta > 0) await incrementTrackDistance(trackId, delta);
});
