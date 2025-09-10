// hooks/usePins.ts
import { useState, RefObject } from "react";
import MapView from "react-native-maps";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import { ownershipAt } from "../utils/ownership";
import {
  addPin,
  getPins as dbGetPins,
  updatePin as dbUpdatePin,
  deletePin as dbDeletePin,
} from "../data/db";
import { Pin, Species } from "../../types";
import { getMoonData } from "../lib/moon";

// hooks/usePins.ts
type UsePinsArgs = {
  currentSpecies: Species;
  mapRef?: React.RefObject<MapView | null> | null;
  setStatus?: (s: string) => void;
};

export function usePins({
  currentSpecies,
  mapRef = null,
  setStatus,
}: UsePinsArgs) {
  const [pins, setPins] = useState([]);

  async function loadPins() {
    const existing = await dbGetPins();
    setPins(existing);
  }

  async function dropPin() {
    try {
      setStatus?.("Getting GPS…");
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      await dropPinAt(loc.coords.latitude, loc.coords.longitude);
    } catch (e) {
      setStatus?.("Failed");
      throw e;
    }
  }

  async function dropPinAt(lat: number, lon: number) {
    try {
      setStatus?.("Classifying…");
      const own = ownershipAt(lat, lon);
      const m = getMoonData(new Date());
      const pin: Pin = {
        id: Crypto.randomUUID(),
        lat,
        lon,
        ts: Date.now(),
        own,
        species: currentSpecies,
        note: null,
        moonPhase: m.phaseName,
        moonIllum: Number(m.illumination.toFixed(3)),
      };
      await addPin(pin);
      setPins((p) => [pin, ...p]);
      setStatus?.(
        `Pinned: ${own.toUpperCase()} • ${currentSpecies.toUpperCase()} • ${
          m.emoji
        } ${Math.round(m.illumination * 100)}%`
      );

      // optional camera move if provided
      mapRef?.current?.animateToRegion(
        {
          latitude: lat,
          longitude: lon,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500
      );
    } catch (e) {
      setStatus?.("Failed");
      throw e;
    }
  }

  async function saveEdit(
    editPin: Pin,
    species: Species,
    note: string | null | undefined
  ) {
    const updated: Pin = { ...editPin, species, note: note ?? null };
    await dbUpdatePin({
      id: updated.id,
      species: updated.species,
      note: updated.note,
    });
    setPins((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function deleteById(id: string) {
    await dbDeletePin(id);
    setPins((prev) => prev.filter((x) => x.id !== id));
  }

  return {
    pins,
    setPins, // exposed in case you need manual tweaks
    loadPins,
    dropPin,
    dropPinAt,
    saveEdit,
    deleteById,
  };
}
