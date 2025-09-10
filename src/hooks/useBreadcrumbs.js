import { useEffect, useRef, useState, useCallback } from "react";
import * as Location from "expo-location";
import MapView from "react-native-maps";
import { Track } from "../../types";
import { ensureTracksSchema, createTrack, endTrack } from "../data/tracks";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  TASK_NAME,
  KEY_ACTIVE_TRACK_ID,
  KEY_LAST_POINT,
} from "../background/trackTask";

type Args = {
  mapRef?: React.RefObject<MapView | null>;
  setStatus?: (s: string) => void;
  accuracy?: Location.LocationAccuracy; // default: Balanced
  distanceInterval?: number; // meters, default 8
  timeIntervalMs?: number; // ms, default 4000
  minAccuracy?: number; // discard points with worse (higher) accuracy, default 50m
};

export function useBreadcrumbs({
  mapRef,
  setStatus,
  accuracy = Location.Accuracy.Balanced,
  distanceInterval = 8,
  timeIntervalMs = 4000,
  minAccuracy = 50,
}: Args = {}) {
  const [activeTrack, setActiveTrack] = useState(null);
  const [points, setPoints] = useState([]);
  const [distance, setDistance] = useState(0); // meters (UI only)
  const watcher = useRef(null);
  const lastUiPoint = useRef(null);

  // Haversine meters
  const haversine = (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number }
  ) => {
    const R = 6371000;
    const dLat = (Math.PI / 180) * (b.latitude - a.latitude);
    const dLon = (Math.PI / 180) * (b.longitude - a.longitude);
    const lat1 = (Math.PI / 180) * a.latitude;
    const lat2 = (Math.PI / 180) * b.latitude;
    const sinDLat = Math.sin(dLat / 2);
    const sinDLon = Math.sin(dLon / 2);
    const c =
      2 *
      Math.asin(
        Math.sqrt(
          sinDLat * sinDLat +
            Math.cos(lat1) * Math.cos(lat2) * sinDLon * sinDLon
        )
      );
    return R * c;
  };

  // Foreground watcher: ONLY updates UI (polyline + UI distance).
  // The background task writes to DB.
  const startUiWatcher = useCallback(async () => {
    watcher.current?.remove();
    watcher.current = await Location.watchPositionAsync(
      {
        accuracy,
        timeInterval: timeIntervalMs,
        distanceInterval,
        mayShowUserSettingsDialog: true,
      },
      (loc) => {
        const c = loc.coords;
        if (c.accuracy != null && c.accuracy > minAccuracy) return;

        const pt = { latitude: c.latitude, longitude: c.longitude };
        setPoints((prev) => [...prev, pt]);

        const last = lastUiPoint.current;
        lastUiPoint.current = pt;

        if (last) {
          const d = haversine(last, pt);
          if (d >= 0.5) setDistance((m) => m + d); // UI accumulation
        }

        // Optionally keep camera near:
        // mapRef?.current?.animateCamera({ center: pt }, { duration: 300 });
      }
    );
  }, [accuracy, distanceInterval, minAccuracy, timeIntervalMs /*, mapRef*/]);

  const stopUiWatcher = useCallback(() => {
    watcher.current?.remove();
    watcher.current = null;
  }, []);

  const start = useCallback(
    async (name?: string | null) => {
      await ensureTracksSchema();

      const fg = await Location.requestForegroundPermissionsAsync();
      if (fg.status !== "granted") {
        setStatus?.("Location permission required");
        return;
      }
      const bg = await Location.requestBackgroundPermissionsAsync();
      if (bg.status !== "granted") {
        setStatus?.("Background permission required");
        return;
      }

      const t = await createTrack(name ?? null);
      setActiveTrack(t);
      setPoints([]);
      setDistance(0);
      lastUiPoint.current = null;

      // mark active for BG task and reset last point used by task
      await AsyncStorage.setItem(KEY_ACTIVE_TRACK_ID, t.id);
      await AsyncStorage.removeItem(KEY_LAST_POINT);

      // start background updates (DB writes happen in the task)
      await Location.startLocationUpdatesAsync(TASK_NAME, {
        accuracy,
        distanceInterval,
        timeInterval: timeIntervalMs,
        showsBackgroundLocationIndicator: true, // iOS pill
        pausesUpdatesAutomatically: false,
        activityType: Location.ActivityType.Fitness,
        foregroundService: {
          notificationTitle: "Recording track",
          notificationBody: "Your path is being recorded.",
        },
      });

      // start foreground watcher for live UI
      await startUiWatcher();

      setStatus?.("REC • breadcrumb on");
    },
    [accuracy, distanceInterval, timeIntervalMs, setStatus, startUiWatcher]
  );

  const pause = useCallback(async () => {
    // stop both BG + FG updates, keep activeTrack to allow resume
    stopUiWatcher();
    try {
      const started = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
      if (started) await Location.stopLocationUpdatesAsync(TASK_NAME);
    } catch {}
    setStatus?.("REC • paused");
  }, [stopUiWatcher, setStatus]);

  const resume = useCallback(async () => {
    if (!activeTrack) return;

    const fg = await Location.getForegroundPermissionsAsync();
    if (fg.status !== "granted") return;

    // restart BG updates
    await AsyncStorage.setItem(KEY_ACTIVE_TRACK_ID, activeTrack.id);
    // Do NOT clear KEY_LAST_POINT here; keep last seen for correct distance in BG
    await Location.startLocationUpdatesAsync(TASK_NAME, {
      accuracy,
      distanceInterval,
      timeInterval: timeIntervalMs,
      showsBackgroundLocationIndicator: true,
      pausesUpdatesAutomatically: false,
      activityType: Location.ActivityType.Fitness,
      foregroundService: {
        notificationTitle: "Recording track",
        notificationBody: "Your path is being recorded.",
      },
    });

    // restart UI watcher
    await startUiWatcher();

    setStatus?.("REC • breadcrumb on");
  }, [
    activeTrack,
    accuracy,
    distanceInterval,
    timeIntervalMs,
    startUiWatcher,
    setStatus,
  ]);

  const stop = useCallback(async (): Promise<string | null> => {
    // stop watchers
    stopUiWatcher();
    try {
      const started = await Location.hasStartedLocationUpdatesAsync(TASK_NAME);
      if (started) await Location.stopLocationUpdatesAsync(TASK_NAME);
    } catch {}

    // clear BG flags
    await AsyncStorage.removeItem(KEY_ACTIVE_TRACK_ID);
    await AsyncStorage.removeItem(KEY_LAST_POINT);

    const id = activeTrack?.id ?? null;
    if (activeTrack) {
      await endTrack(activeTrack.id, Date.now());
    }
    setStatus?.("REC • stopped");
    setActiveTrack(null);
    lastUiPoint.current = null;
    return id;
  }, [activeTrack, stopUiWatcher, setStatus]);

  // cleanup on unmount
  useEffect(() => {
    return () => stopUiWatcher();
  }, [stopUiWatcher]);

  return {
    tracking: !!watcher.current, // foreground UI watcher state
    activeTrack,
    points, // for <Polyline />
    distance, // meters (UI only; DB distance is maintained by BG task)
    start,
    pause,
    resume,
    stop,
    clearLocal: () => {
      setPoints([]);
      setDistance(0);
      lastUiPoint.current = null;
    },
  };
}
