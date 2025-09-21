// hooks/usePins.js
import { useState } from "react";
import * as Location from "expo-location";
import * as Crypto from "expo-crypto";
import { getMoonData } from "../lib/moon";
import { ownershipAt } from "../utils/ownership";
import {
  addPin,
  getPins as dbGetPins,
  updatePin as dbUpdatePin,
  deletePin as dbDeletePin,
} from "../data/db";

export function usePins({ currentSpecies, mapRef, cameraRef = null, setStatus }) {
  const [pins, setPins] = useState([]);

  // --- add these helpers at top of the file ---
  const R = 6371000; // earth radius (m)
  function toRad(x) {
    return (x * Math.PI) / 180;
  }
  function haversineMeters(lat1, lon1, lat2, lon2) {
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }
  function findNearbyPin(pins, lat, lon, radiusM = 10) {
    return pins.find((p) => haversineMeters(lat, lon, p.lat, p.lon) <= radiusM);
  }

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

  async function dropPinAt(lat, lon) {
    try {
      setStatus?.("Checking…");

      // 0) duplicate check (10 m radius — tune as you like)
      const existing = findNearbyPin(pins, lat, lon, 10);
      if (existing) {
        // setStatus?.("Already pinned here");
        // // just recenter on the existing pin
        // cameraRef?.current?.setCamera({
        //   centerCoordinate: [existing.lon, existing.lat],
        //   zoomLevel: 13,
        //   animationDuration: 250,
        //   animationMode: "easeTo",
        // });
        return; // 🚫 don’t create a new pin
      }

      // 1) center first so hit-testing is fast (if you classify ownership)
      cameraRef?.current?.setCamera({
        centerCoordinate: [lon, lat],
        zoomLevel: 13,
        animationDuration: 200,
        animationMode: "easeTo",
      });

      // 2) classify (use your current ownership helper)
      setStatus?.("Classifying…");
      const own = await ownershipAt(mapRef, lon, lat, {
        fnFillLayerId: "fn-fill",
        privateFillLayerId: "private-fill",
        paddingPx: 2,
      });

      // 3) create pin
      const m = getMoonData(new Date());
      const pin = {
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
      setPins((prev) => [pin, ...prev]);

      setStatus?.(
        `Pinned: ${own.toUpperCase()} • ${currentSpecies.toUpperCase()} • ${
          m.emoji
        } ${Math.round(m.illumination * 100)}%`
      );
    } catch (e) {
      setStatus?.("Failed");
      throw e;
    }
  }

  async function saveEdit(editPin, species, note) {
    const updated = { ...editPin, species, note: note ?? null };
    await dbUpdatePin({
      id: updated.id,
      species: updated.species,
      note: updated.note,
    });
    setPins((prev) => prev.map((x) => (x.id === updated.id ? updated : x)));
  }

  async function deleteById(id) {
    await dbDeletePin(id);
    setPins((prev) => prev.filter((x) => x.id !== id));
  }

  return { pins, setPins, loadPins, dropPin, dropPinAt, saveEdit, deleteById };
}
