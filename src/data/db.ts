import * as SQLite from "expo-sqlite";
import { Pin } from "../../types";

const db = SQLite.openDatabaseSync("pins.db");

export async function ensureSchema() {
  //  await db.execAsync(`DROP TABLE IF EXISTS "pins";`);
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS pins (
      id TEXT PRIMARY KEY NOT NULL,
      lat REAL NOT NULL,
      lon REAL NOT NULL,
      ts INTEGER NOT NULL,
      own TEXT NOT NULL,
      species TEXT,
      note TEXT,
      moonPhase TEXT,
      moonIllum REAL
    );
  `);
}

export async function getPins(): Promise<Pin[]> {
  return db.getAllAsync<Pin>("SELECT * FROM pins ORDER BY ts DESC");
}

export async function addPin(pin: Pin) {
  await db.runAsync(
    "INSERT INTO pins (id, lat, lon, ts, own, species, note, moonPhase, moonIllum) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
    pin.id,
    pin.lat,
    pin.lon,
    pin.ts,
    pin.own,
    pin.species,
    pin.note ?? null,
    pin.moonPhase ?? null,
    pin.moonIllum ?? null
  );
}

export async function clearPins() {
  await db.runAsync("DELETE FROM pins");
}

export async function updatePin(pin: {
  id: string;
  species: string;
  note?: string | null;
}) {
  await db.runAsync(
    "UPDATE pins SET species=?, note=? WHERE id=?",
    pin.species,
    pin.note ?? null,
    pin.id
  );
}

export async function deletePin(id: string) {
  await db.runAsync("DELETE FROM pins WHERE id=?", id);
}

export { db };
