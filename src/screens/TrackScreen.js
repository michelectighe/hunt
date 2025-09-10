// screens/TrackScreen.tsx
import React, { useMemo, useRef, useState, useEffect } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import * as Location from "expo-location";
import { Alert, Platform, Modal, TextInput } from "react-native";
import { updateTrackName } from "../data/tracks";

import MapView, { Polyline, PROVIDER_DEFAULT } from "react-native-maps";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { MapCompass } from "../components/MapCompass"; // optional if you added it
import { LocalTile } from "react-native-maps";
import {
  downloadTilesForRegion,
  localTilePathTemplate,
  Region,
} from "../data/offlineTiles";

export default function TrackScreen() {
  const mapRef = useRef(null);
  const [status, setStatus] = useState("Ready");
  const nav = useNavigation();
  const {
    tracking,
    activeTrack,
    points,
    distance,
    start,
    pause,
    resume,
    stop,
    clearLocal,
  } = useBreadcrumbs({ mapRef, setStatus });
  const [nameModal, setNameModal] = useState({ open: false });
  // state to track region + offline toggle
  const [region, setRegion] = useState(null);
  const [offline, setOffline] = useState(false);
  const [dlBusy, setDlBusy] = useState(false);

  // basic region; center once when points appear
  useEffect(() => {
    if (points.length > 0) {
      const last = points[points.length - 1];
      mapRef.current?.animateCamera(
        { center: last, pitch: 0, heading: 0, zoom: 16 },
        { duration: 500 }
      );
    }
  }, [points.length]);

  // zoom to current location on mount
  useEffect(() => {
    (async () => {
      const perm = await Location.requestForegroundPermissionsAsync();
      if (perm.status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });
      const { latitude, longitude } = loc.coords;
      mapRef.current?.animateToRegion(
        {
          latitude,
          longitude,
          latitudeDelta: 0.01, // zoom level ~ streets
          longitudeDelta: 0.01,
        },
        600
      );
    })();
  }, []);

  // duration timer while tracking
  const [startedAt, setStartedAt] = useState(null);
  useEffect(() => {
    let id: any;
    if (tracking && startedAt == null) setStartedAt(Date.now());
    if (tracking) {
      id = setInterval(() => setTick((t) => t + 1), 1000);
    }
    return () => clearInterval(id);
  }, [tracking]);
  const [tick, setTick] = useState(0);
  const durationStr = useMemo(() => {
    if (!startedAt) return "00:00:00";
    const sec = Math.max(0, Math.floor((Date.now() - startedAt) / 1000));
    const h = String(Math.floor(sec / 3600)).padStart(2, "0");
    const m = String(Math.floor((sec % 3600) / 60)).padStart(2, "0");
    const s = String(sec % 60).padStart(2, "0");
    return `${h}:${m}:${s}`;
  }, [tick, startedAt]);

  async function onStopped(trackId: string) {
    if (!trackId) return;
    if (Platform.OS === "ios") {
      Alert.prompt("Name this track", "Optional", [
        { text: "Skip", style: "cancel" },
        {
          text: "Save",
          onPress: async (text) =>
            updateTrackName(trackId, (text ?? "").trim() || null),
        },
      ]);
    } else {
      setNameModal({ open: true, trackId });
    }
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrap}>
        <View style={{ position: "absolute", left: 12, bottom: 24, gap: 8, zIndex: 2 }}>
          <TouchableOpacity
            style={[styles.secondary, { opacity: dlBusy || !region ? 0.6 : 1 }]}
            disabled={dlBusy || !region}
            onPress={async () => {
              if (!region) return;
              try {
                setDlBusy(true);
                const res = await downloadTilesForRegion(region, 14, 150);
                setStatus?.(`Offline saved: ${res.count} tiles (z14)`);
              } catch (e) {
                setStatus?.(String(e));
              } finally {
                setDlBusy(false);
              }
            }}
          >
            <Text style={styles.secondaryText}>
              {dlBusy ? "Downloading…" : "Download area"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.secondary}
            onPress={() => setOffline((o) => !o)}
          >
            <Text style={styles.secondaryText}>
              {offline ? "Offline tiles: ON" : "Offline tiles: OFF"}
            </Text>
          </TouchableOpacity>
        </View>
        <View style={styles.historyBtn}>
          <Text
            onPress={() => nav.navigate("TrackHistory")}
            style={styles.historyText}
          >
            History »
          </Text>
        </View>
        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          rotateEnabled
          initialRegion={
            region ?? {
              latitude: 50,
              longitude: -120,
              latitudeDelta: 4,
              longitudeDelta: 4,
            }
          }
          onRegionChangeComplete={(r) => setRegion(r)}
        >
          {offline && (
            <LocalTile pathTemplate={localTilePathTemplate} zIndex={-1} />
          )}
          {points.length > 1 && (
            <Polyline
              coordinates={points}
              strokeWidth={4}
              strokeColor="#3a6d55"
            />
          )}
        </MapView>

        {/* optional compass */}
        <MapCompass mapRef={mapRef} />

        {/* status + stats chip */}
        <View style={styles.stats}>
          <Text style={styles.statsText}>
            {tracking ? "REC • " : ""}
            {(distance / 1000).toFixed(2)} km • {durationStr}
          </Text>
        </View>

        {/* controls cluster */}
        <View style={styles.controls}>
          {!tracking ? (
            <>
              <TouchableOpacity
                style={styles.primary}
                onPress={() => {
                  clearLocal();
                  setStartedAt(null);
                  start(null);
                }}
              >
                <Text style={styles.primaryText}>START</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.secondary} onPress={resume}>
                <Text style={styles.secondaryText}>RESUME</Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <TouchableOpacity style={styles.pause} onPress={pause}>
                <Text style={styles.primaryText}>PAUSE</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.stop}
                onPress={async () => {
                  const id = await stop();
                  setStartedAt(null);
                  if (id != null) {
                    // narrows to string
                    await onStopped(id); // make onStopped(trackId: string)
                  }
                }}
              >
                <Text style={styles.primaryText}>STOP</Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0d" },
  mapWrap: { flex: 1 },
  historyBtn: {
    position: "absolute",
    left: 12,
    top: 56,
    zIndex: 2,
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#0d1411",
    borderColor: "#1f2a25",
    borderWidth: 1,
    borderRadius: 10,
  },
  historyText: { color: "#e8f1ec", fontWeight: "700", fontSize: 12 },
  map: { flex: 1 },

  controls: {
    position: "absolute",
    right: 12,
    bottom: 24,
    gap: 8,
    zIndex: 2,
    alignItems: "flex-end",
  },
  primary: {
    backgroundColor: "#b90e0a",
    borderColor: "#ff3b30",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  pause: {
    backgroundColor: "#db7b0b",
    borderColor: "#fcb560",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  stop: {
    backgroundColor: "#333333",
    borderColor: "#555",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  secondary: {
    backgroundColor: "#1b241f",
    borderColor: "#1f2a25",
    borderWidth: 1,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  primaryText: { color: "#fff", fontWeight: "800", fontSize: 12 },
  secondaryText: { color: "#e8f1ec", fontWeight: "800", fontSize: 12 },

  stats: {
    position: "absolute",
    left: 12,
    top: 12,
    backgroundColor: "#0d1411",
    borderColor: "#1f2a25",
    borderWidth: 1,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 10,
    zIndex: 2,
  },
  statsText: { color: "#e8f1ec", fontWeight: "700", fontSize: 12 },
});
