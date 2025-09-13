// src/screens/UnitsByRegionScreen.js
import React, { useMemo, useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";
import UnitsLayer from "../components/map/UnitsLayer";
import { UNITS_BY_REGION, toRegionCode } from "../data/unitsIndex";
import { mergeFeatureCollectionsSafe, sanitizeFeatureCollection } from "../utils/geojson";

// Whatever regions you support in UI:
const REGION_CHOICES = ["r01", "r02", "r03", "r04", "r05", "r06", "r07a", "r07b", "r08"];

export default function UnitsByRegionScreen() {
  const [activeRegions, setActiveRegions] = useState(new Set()); // e.g. Set(["r03","r07"])
  const [showLabels, setShowLabels] = useState(true);

  const toggleRegion = useCallback((code) => {
    setActiveRegions((prev) => {
      const next = new Set(prev);
      if (next.has(code)) next.delete(code);
      else next.add(code);
      return next;
    });
  }, []);


// // Also try r02 alone to confirm:
// useEffect(() => {
//   const r02 = UNITS_BY_REGION.r02;
//   const clean = sanitizeFeatureCollection(r02, "r02");
//   console.log("[r02] features valid:", clean.features.length);
// }, []);



  // Build one FC with only selected regions
const unitsFC = useMemo(() => {
  if (activeRegions.size === 0)
    return { type: "FeatureCollection", features: [] };
  const tagged = [];
  for (const code of activeRegions) {
    const raw = UNITS_BY_REGION[code];
    // Drop "crs" & "name" by re-wrapping (sanitize does it anyway)
    tagged.push({ fc: raw, regionCode: code });
  }
  return mergeFeatureCollectionsSafe(tagged);
}, [activeRegions]);


  // Example: highlight filter (MapLibre-style filter expression)
  // Replace UNIT_ID_FIELD with your actual import if needed
  const unitFilter = undefined; // or like ["==", ["get", "UNIT_ID"], pickedUnitId]

  const onUnitPress = useCallback((e) => {
    const feat = e?.features?.[0];
    if (!feat) return;
    // Handle tap on a unit polygon
    // console.log("Tapped unit:", feat.properties);
  }, []);

  return (
    <SafeAreaView style={styles.safe}>
      {/* Region toggle bar */}
      <View style={styles.toggleBar}>
        <FlatList
          horizontal
          data={REGION_CHOICES}
          keyExtractor={(k) => k}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item: code }) => {
            const active = activeRegions.has(code);
            return (
              <Pressable
                onPress={() => toggleRegion(code)}
                style={[styles.chip, active ? styles.chipOn : styles.chipOff]}
              >
                <Text
                  style={[
                    styles.chipText,
                    active ? styles.chipTextOn : styles.chipTextOff,
                  ]}
                >
                  {code.toUpperCase()}
                </Text>
              </Pressable>
            );
          }}
        />
        <Pressable
          onPress={() => setShowLabels((s) => !s)}
          style={[
            styles.chip,
            showLabels ? styles.chipOn : styles.chipOff,
            { marginLeft: 8 },
          ]}
        >
          <Text
            style={[
              styles.chipText,
              showLabels ? styles.chipTextOn : styles.chipTextOff,
            ]}
          >
            Labels
          </Text>
        </Pressable>
      </View>

      <View style={styles.mapWrap}>
        <MapView style={StyleSheet.absoluteFill}>
          <Camera
            defaultSettings={{
              centerCoordinate: [-124.5, 54.5], // BC-ish
              zoomLevel: 4.8,
              pitch: 0,
              heading: 0,
            }}
          />
          <UnitsLayer
            unitsFC={unitsFC}
            onPress={onUnitPress}
            unitFilter={unitFilter}
            showUnitLabels={showLabels}
          />
        </MapView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  mapWrap: { flex: 1 },
  toggleBar: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
    backgroundColor: "#0b0b0b",
    flexDirection: "row",
  },
  chip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  chipOn: {
    backgroundColor: "#1e90ff22",
    borderColor: "#1e90ff",
  },
  chipOff: {
    backgroundColor: "#111",
    borderColor: "#333",
  },
  chipText: { fontSize: 14, fontWeight: "600" },
  chipTextOn: { color: "#cfe8ff" },
  chipTextOff: { color: "#aaa" },
});
