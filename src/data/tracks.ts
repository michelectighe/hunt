// data/tracks.ts
import * as SQLite from "expo-sqlite";
import * as Crypto from "expo-crypto";
import { Track, TrackPoint } from "../../types";

const db = SQLite.openDatabaseSync("pins.db");

export async function ensureTracksSchema() {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS tracks (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT,
      startedTs INTEGER NOT NULL,
      endedTs INTEGER,
      distance REAL DEFAULT 0
    );
    CREATE TABLE IF NOT EXISTS track_points (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      trackId TEXT NOT NULL,
      ts INTEGER NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      accuracy REAL,
      speed REAL,
      heading REAL,
      FOREIGN KEY (trackId) REFERENCES tracks(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_track_points_track_ts ON track_points(trackId, ts);
  `);
}

export async function createTrack(name: string | null = null): Promise<Track> {
  const t: Track = {
    id: Crypto.randomUUID(),
    name, // already null or string
    startedTs: Date.now(),
    endedTs: null,
    distance: 0,
  };

  await db.runAsync(
    `INSERT INTO tracks (id, name, startedTs, endedTs, distance) VALUES (?, ?, ?, ?, ?)`,
    t.id,
    t.name ?? null, // <- coalesce
    t.startedTs,
    t.endedTs ?? null, // <- coalesce
    t.distance ?? 0
  );

  return t;
}

export async function appendPoint(p: TrackPoint) {
  await db.runAsync(
    `INSERT INTO track_points (trackId, ts, lat, lon, accuracy, speed, heading)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    p.trackId,
    p.ts,
    p.lat,
    p.lon,
    p.accuracy ?? null, // <- coalesce
    p.speed ?? null,
    p.heading ?? null
  );
}

export async function updateTrackDistance(
  trackId: string,
  distanceMeters: number
) {
  await db.runAsync(
    `UPDATE tracks SET distance = ? WHERE id = ?`,
    distanceMeters,
    trackId
  );
}

export async function endTrack(trackId: string, endedTs: number = Date.now()) {
  await db.runAsync(
    `UPDATE tracks SET endedTs = ? WHERE id = ?`,
    endedTs,
    trackId
  );
}

export async function getTrackPoints(trackId: string): Promise<TrackPoint[]> {
  return db.getAllAsync<TrackPoint>(
    `SELECT id, trackId, ts, lat, lon, accuracy, speed, heading
     FROM track_points WHERE trackId = ? ORDER BY ts ASC`,
    trackId
  );
}

export async function getTracks(): Promise<Track[]> {
  return db.getAllAsync<Track>(
    `SELECT id, name, startedTs, endedTs, distance
     FROM tracks ORDER BY startedTs DESC`
  );
}

export async function updateTrackName(trackId: string, name: string | null) {
  await db.runAsync(
    `UPDATE tracks SET name = ? WHERE id = ?`,
    name ?? null,
    trackId
  );
}

export async function incrementTrackDistance(
  trackId: string,
  deltaMeters: number
) {
  await db.runAsync(
    `UPDATE tracks SET distance = COALESCE(distance,0) + ? WHERE id = ?`,
    deltaMeters,
    trackId
  );
}
