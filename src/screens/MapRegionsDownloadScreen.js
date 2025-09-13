// screens/MapRegionsDownloadScreen.js
import React, {
  useMemo,
  useRef,
  useState,
  useCallback,
  useEffect,
} from "react";
import {
  View,
  Text,
  Pressable,
  Alert,
  StyleSheet,
  SafeAreaView,
  FlatList,
} from "react-native";
import {
  MapView,
  ShapeSource,
  FillLayer,
  Camera,
} from "@maplibre/maplibre-react-native";

// If you have a style JSON, import it; or remove styleJSON prop below
import offlineStyle from "../../assets/styles/offline-basic.json";
import regions from "../../assets/geo/regions_slim.json";

// OPTIONAL: if you want region filtering behavior, plug in your hook/component
// import useMapSelection from "../hooks/useMapSelection";
// import RegionsLayer from "../components/map/RegionsLayer";

import {
  buildPackId,
  buildLayerZipUrl,
  installPack,
  scanInstalled,
} from "../lib/offlinePacks";

const LAYER_OPTIONS = [
  { key: "units", label: "Units" },
  { key: "lakes", label: "Lakes" },
  { key: "rivers", label: "Rivers" },
  { key: "hillside", label: "Hillside" },
];

// Set your local server base here:
const BASE_URL = "http://10.0.0.17:8000";

export default function MapRegionsDownloadScreen() {
  const cameraRef = useRef(null);

  // Toggle state for which layers to download upon region tap
  const [selected, setSelected] = useState({
    units: false,
    lakes: false,
    rivers: false,
    hillside: false,
  });

  const [installed, setInstalled] = useState({}); // {packId: bool}
  const [downloading, setDownloading] = useState({}); // {packId: bool}
  const [progress, setProgress] = useState({}); // {packId: 0..1}

  const regionsGeoJSON = useMemo(() => regions, []);

  // Optionally scan what’s already on disk (if your packIds are predictable)
  // Since we don’t know region until user taps, we’ll just update as we install.
  // If you have a fixed region list like r01..r08, you could pre-scan here.

  const onToggle = useCallback((key) => {
    setSelected((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  const selectedKeys = useMemo(
    () => Object.keys(selected).filter((k) => selected[k]),
    [selected]
  );

  const markInstalled = useCallback(async (packIds) => {
    const scan = await scanInstalled(packIds);
    setInstalled((s) => ({ ...s, ...scan }));
  }, []);

  const onRegionPress = useCallback(
    (e) => {
      const feature = e?.features?.[0];
      if (!feature) return;

      // Adjust the property names to match your regions file
      const regionId =
        feature.properties?.id ||
        feature.properties?.REGION_ID ||
        feature.id ||
        "unknown";
      const regionName =
        feature.properties?.name ||
        feature.properties?.REGION_NAME ||
        `Region ${regionId}`;

      if (selectedKeys.length === 0) {
        Alert.alert(
          "No layers selected",
          "Toggle one or more layers at the top, then tap a region to download."
        );
        return;
      }

      Alert.alert(
        "Download data",
        `Download ${selectedKeys.join(", ")} for ${regionName}?`,
        [
          { text: "Cancel", style: "cancel" },
          {
            text: "Download",
            onPress: async () => {
              try {
                // For each selected layer, build packId and URL, then install
                const packIds = selectedKeys.map((layerKey) =>
                  buildPackId(regionId, layerKey)
                );

                for (const layerKey of selectedKeys) {
                  const packId = buildPackId(regionId, layerKey);
                  const url = buildLayerZipUrl(BASE_URL, regionId, layerKey);

                  setDownloading((s) => ({ ...s, [packId]: true }));
                  setProgress((s) => ({ ...s, [packId]: 0 }));

                  await installPack({
                    url,
                    packId,
                    onProgress: (p) =>
                      setProgress((s) => ({ ...s, [packId]: p })),
                  });

                  setDownloading((s) => ({ ...s, [packId]: false }));
                }

                await markInstalled(packIds);
                Alert.alert("Done", "Selected layers have been installed.");
              } catch (err) {
                console.error(err);
                Alert.alert("Download failed", String(err?.message ?? err));
              }
            },
          },
        ]
      );
    },
    [selectedKeys, markInstalled]
  );

  return (
    <SafeAreaView style={styles.safe}>
      {/* Toggle bar */}
      <View style={styles.toggleBar}>
        <FlatList
          horizontal
          data={LAYER_OPTIONS}
          keyExtractor={(item) => item.key}
          contentContainerStyle={{ paddingHorizontal: 12 }}
          ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
          renderItem={({ item }) => {
            const active = !!selected[item.key];
            return (
              <Pressable
                onPress={() => onToggle(item.key)}
                style={[
                  styles.toggleChip,
                  active ? styles.toggleChipOn : styles.toggleChipOff,
                ]}
              >
                <Text
                  style={[
                    styles.toggleText,
                    active ? styles.toggleTextOn : styles.toggleTextOff,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          }}
        />
      </View>

      {/* Map with ONLY the Regions layer visible */}
      <View style={styles.mapWrap}>
        <MapView
          style={StyleSheet.absoluteFill}
          styleJSON={JSON.stringify(offlineStyle)}
        >
          <Camera
            ref={cameraRef}
            defaultSettings={{
              centerCoordinate: [-124.5, 54.5],
              zoomLevel: 4.5,
              pitch: 0,
              heading: 0,
            }}
          />

          {/* Direct Regions layer (tap to download) */}
          <ShapeSource
            id="regions-source"
            shape={regionsGeoJSON}
            onPress={onRegionPress}
          >
            <FillLayer
              id="regions-fill"
              style={{
                fillOpacity: 0.35,
                fillColor: "#3A7BD5",
                fillOutlineColor: "#1F3C88",
              }}
            />
          </ShapeSource>

          {/* No other layers on load */}
        </MapView>
      </View>

      {/* Optional tiny status footer */}
      <View style={styles.footer}>
        {Object.keys(downloading).some((k) => downloading[k]) ? (
          <Text style={styles.footerText}>
            Downloading…{" "}
            {Object.entries(progress)
              .filter(([k, v]) => downloading[k])
              .map(([k, v]) => `${k}: ${Math.round((v || 0) * 100)}%`)
              .join("  ")}
          </Text>
        ) : (
          <Text style={styles.footerTextDim}>Tap a region to download</Text>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#0b0b0b" },
  toggleBar: {
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
    backgroundColor: "#0b0b0b",
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleChipOn: {
    backgroundColor: "#1e90ff22",
    borderColor: "#1e90ff",
  },
  toggleChipOff: {
    backgroundColor: "#111",
    borderColor: "#333",
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
  toggleTextOn: { color: "#cfe8ff" },
  toggleTextOff: { color: "#aaa" },
  mapWrap: { flex: 1 },
  footer: {
    padding: 8,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "#333",
    backgroundColor: "#0b0b0b",
  },
  footerText: { color: "#cfe8ff", fontSize: 12 },
  footerTextDim: { color: "#888", fontSize: 12 },
});
