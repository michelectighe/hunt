// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/LocateMeButton.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  View,
  TouchableOpacity,
  Text,
  StyleSheet,
  ActivityIndicator,
  Alert,
  Linking,
} from "react-native";
import * as Location from "expo-location";

export default function LocateMeButton({ cameraRef, zoom = 12, onToast }) {
  const [busy, setBusy] = useState(false);

  const ensurePermissions = async () => {
    let { status } = await Location.getForegroundPermissionsAsync();
    if (status !== "granted") {
      ({ status } = await Location.requestForegroundPermissionsAsync());
    }
    return status === "granted";
  };

  const goToMe = async () => {
    if (!cameraRef?.current) {
      Alert.alert("Map not ready", "Try again in a second.");
      return;
    }
    setBusy(true);
    try {
      const ok = await ensurePermissions();
      if (!ok) {
        onToast?.("Location permission denied");
        Alert.alert(
          "Location permission needed",
          "Enable location access to center the map on you.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () =>
                Linking.openSettings ? Linking.openSettings() : null,
            },
          ]
        );
        return;
      }

      const servicesOn = await Location.hasServicesEnabledAsync();
      if (!servicesOn) {
        onToast?.("Location services are off");
        Alert.alert(
          "Location disabled",
          "Turn on Location Services in device settings.",
          [
            { text: "Cancel", style: "cancel" },
            {
              text: "Open Settings",
              onPress: () =>
                Linking.openSettings ? Linking.openSettings() : null,
            },
          ]
        );
        return;
      }

      let pos = null;
      try {
        pos = await Location.getLastKnownPositionAsync();
      } catch {}
      if (!pos) {
        pos = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
          maximumAge: 10000,
          timeout: 7000,
        });
      }

      const { latitude, longitude } = pos.coords;
      //  console.log("LocateMe → coords", { latitude, longitude });
      cameraRef.current.setCamera({
        centerCoordinate: [longitude, latitude],
        zoomLevel: zoom,
        animationDuration: 800,
        animationMode: "flyTo",
      });
    } catch (e) {
      Alert.alert("Could not get location", String(e?.message ?? e));
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={styles.wrapper}>
      <TouchableOpacity style={styles.fab} onPress={goToMe} disabled={busy}>
        {busy ? <ActivityIndicator /> : <Text style={styles.fabText}>📍</Text>}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", right: 12, bottom: 24 },
  fab: {
    backgroundColor: "rgba(0,0,0,0.9)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fabText: { color: "#fff", fontSize: 20 },
});
