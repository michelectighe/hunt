// ─────────────────────────────────────────────────────────────────────────────
// File: src/hooks/useUserLocation.js
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useRef, useState } from "react";
import * as Location from "expo-location";

export default function useUserLocation() {
  const [coords, setCoords] = useState(null);
  const [permission, setPermission] = useState(null);
  const [servicesEnabled, setServicesEnabled] = useState(true);
  const [following, setFollowing] = useState(false);
  const subRef = useRef(null);

  const ensureReady = async () => {
    try {
      let { status } = await Location.getForegroundPermissionsAsync();
      if (status !== "granted") {
        ({ status } = await Location.requestForegroundPermissionsAsync());
      }
      const on = await Location.hasServicesEnabledAsync();
      setPermission(status);
      setServicesEnabled(on);
      return status === "granted" && on;
    } catch (e) {
      // If something odd happens, be conservative
      setPermission("denied");
      setServicesEnabled(false);
      return false;
    }
  };

  // One-shot initial location so the map can zoom on first render
  useEffect(() => {
    let cancelled = false;
    (async () => {
      const ok = await ensureReady();
      if (!ok) return;

      try {
        // Try fast path first
        let loc = await Location.getLastKnownPositionAsync();
        if (!loc) {
          // Fall back to an active fix with a short timeout
          loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
            maximumAge: 10000,
            timeout: 5000,
          });
        }
        if (!cancelled && loc?.coords) setCoords(loc.coords);
      } catch {
        // Ignore — coords will stay null; UI can handle fallback (e.g., zoomToBC)
      }
    })();

    return () => {
      cancelled = true;
      subRef.current?.remove?.();
      subRef.current = null;
    };
  }, []);

  const startFollowing = async () => {
    const ok = await ensureReady();
    if (!ok) return false;

    if (!subRef.current) {
      subRef.current = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.Balanced,
          timeInterval: 2000,
          distanceInterval: 5,
        },
        (loc) => {
          if (loc?.coords) setCoords(loc.coords);
        }
      );
    }
    setFollowing(true);
    return true;
  };

  const stopFollowing = () => {
    subRef.current?.remove?.();
    subRef.current = null;
    setFollowing(false);
  };

  const toggleFollowing = async () => {
    if (following) stopFollowing();
    else await startFollowing();
  };

  return {
    coords,
    permission,
    servicesEnabled,
    following,
    startFollowing,
    stopFollowing,
    toggleFollowing,
    ensureReady,
  };
}
