import * as FileSystem from "expo-file-system";
import { lon2tile, lat2tile } from "../lib/tiles";

export type Region = {
  latitude: number;
  longitude: number;
  latitudeDelta: number;
  longitudeDelta: number;
};

const ROOT = `${FileSystem.documentDirectory}tiles`;

// Very small demo downloader (1 zoom level)
export async function downloadTilesForRegion(
  region: Region,
  zoom = 14,
  maxTiles = 150,
  tileURL?: (z: number, x: number, y: number) => string
) {
  const { latitude, longitude, latitudeDelta, longitudeDelta } = region;

  const north = latitude + latitudeDelta / 2;
  const south = latitude - latitudeDelta / 2;
  const east = longitude + longitudeDelta / 2;
  const west = longitude - longitudeDelta / 2;

  const xMin = Math.min(lon2tile(west, zoom), lon2tile(east, zoom));
  const xMax = Math.max(lon2tile(west, zoom), lon2tile(east, zoom));
  const yMin = Math.min(lat2tile(north, zoom), lat2tile(south, zoom));
  const yMax = Math.max(lat2tile(north, zoom), lat2tile(south, zoom));

  const jobs: Array<{
    z: number;
    x: number;
    y: number;
    url: string;
    path: string;
  }> = [];
  for (let x = xMin; x <= xMax; x++) {
    for (let y = yMin; y <= yMax; y++) {
      const url = tileURL
        ? tileURL(zoom, x, y)
        : `https://tile.openstreetmap.org/${zoom}/${x}/${y}.png`; // ⚠️ for testing only
      const path = `${ROOT}/${zoom}/${x}/${y}.png`;
      jobs.push({ z: zoom, x, y, url, path });
    }
  }

  if (jobs.length > maxTiles)
    throw new Error(
      `Refusing to download ${jobs.length} tiles (max ${maxTiles}). Zoom in or reduce area.`
    );

  // ensure dirs
  await FileSystem.makeDirectoryAsync(ROOT, { intermediates: true }).catch(
    () => {}
  );
  await Promise.all(
    Array.from(new Set(jobs.map((j) => `${ROOT}/${zoom}/${j.x}`))).map(
      async (dir) => {
        await FileSystem.makeDirectoryAsync(dir, { intermediates: true }).catch(
          () => {}
        );
      }
    )
  );

  // simple 4-at-a-time queue
  const CONCURRENCY = 4;
  let i = 0;
  async function worker() {
    while (i < jobs.length) {
      const j = jobs[i++];
      const info = await FileSystem.getInfoAsync(j.path);
      if (info.exists) continue;
      await FileSystem.downloadAsync(j.url, j.path);
    }
  }
  await Promise.all(new Array(CONCURRENCY).fill(0).map(worker));

  return { count: jobs.length, folder: `${ROOT}/${zoom}` };
}

export const localTilePathTemplate = `${ROOT}/{z}/{x}/{y}.png`;
