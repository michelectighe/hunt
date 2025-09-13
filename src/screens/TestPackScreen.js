// screens/TestPacksScreen.js
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  Text,
  Pressable,
  ActivityIndicator,
  Alert,
  FlatList,
} from "react-native";
import regions from "../../assets/geo/regions_slim.json";
import RegionsLayer from "../components/map/RegionsLayer";
import {
  MapView,
  VectorSource,
  FillLayer,
  Camera,
} from "@maplibre/maplibre-react-native";

import {
  fileTemplate,
  packInstallPath,
  exists,
  installPack,
  removePack,
} from "../lib/offlinePacks";

const PACKS = [
  {
    id: "r03_vector",
    name: "Region 3 Vector (test)",
    type: "vector",
    url: "http://10.0.0.17:8000/r03_vector.zip",
    sourceLayer: "r03_vector",
    minzoom: 6,
    maxzoom: 14,
  },
];

export default function TestPacksScreen() {
  const [installed, setInstalled] = useState({});
  const [downloading, setDownloading] = useState({});
  const [progress, setProgress] = useState({}); // 0..1

  useEffect(() => {
    (async () => {
      const result = {};
      for (const p of PACKS) {
        result[p.id] = await exists(packInstallPath(p.id));
      }
      setInstalled(result);
    })();
  }, []);

  const onInstall = async (pack) => {
    try {
      setDownloading((s) => ({ ...s, [pack.id]: true }));
      setProgress((s) => ({ ...s, [pack.id]: 0 }));

      await installPack({
        url: pack.url,
        packId: pack.id,
        onProgress: (p) => setProgress((s) => ({ ...s, [pack.id]: p })),
      });

      setInstalled((s) => ({ ...s, [pack.id]: true }));
    } catch (e) {
      console.error(e);
      Alert.alert("Install failed", String(e?.message ?? e));
    } finally {
      setDownloading((s) => ({ ...s, [pack.id]: false }));
    }
  };

  const onRemove = async (pack) => {
    try {
      await removePack(pack.id);
      setInstalled((s) => ({ ...s, [pack.id]: false }));
    } catch (e) {
      Alert.alert("Remove failed", String(e?.message ?? e));
    }
  };

  const renderItem = ({ item: pack }) => {
    const isInstalled = !!installed[pack.id];
    const isLoading = !!downloading[pack.id];
    const pct = Math.round((progress[pack.id] ?? 0) * 100);

    return (
      <View style={{ padding: 12, borderBottomWidth: 1, borderColor: "#eee" }}>
        <Text style={{ fontWeight: "600" }}>{pack.name}</Text>
        <Text style={{ color: "#666", marginTop: 2 }}>{pack.id}</Text>

        <View
          style={{
            flexDirection: "row",
            alignItems: "center",
            marginTop: 8,
            gap: 12,
          }}
        >
          {!isInstalled ? (
            <Pressable
              onPress={() => onInstall(pack)}
              style={{
                backgroundColor: "#0a7",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 8,
              }}
              disabled={isLoading}
            >
              <Text style={{ color: "white", fontWeight: "700" }}>
                {isLoading ? `Downloading… ${pct}%` : "Install"}
              </Text>
            </Pressable>
          ) : (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <View
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: 4,
                  backgroundColor: "#0a7",
                }}
              />
              <Text style={{ color: "#0a7", fontWeight: "700" }}>
                Installed
              </Text>
              <Pressable
                onPress={() => onRemove(pack)}
                style={{
                  marginLeft: 12,
                  backgroundColor: "#eee",
                  paddingHorizontal: 10,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                <Text style={{ color: "#333" }}>Remove</Text>
              </Pressable>
            </View>
          )}
          {isLoading ? <ActivityIndicator /> : null}
        </View>
      </View>
    );
  };

  const demoPack = PACKS[0];
  const isDemoInstalled = installed[demoPack.id];

  return (
    <View style={{ flex: 1, marginTop: 50 }}>
      <FlatList
        data={PACKS}
        keyExtractor={(p) => p.id}
        renderItem={renderItem}
        ListHeaderComponent={
          <Text style={{ fontSize: 18, fontWeight: "700", padding: 12 }}>
            Test Packs
          </Text>
        }
      />

      {isDemoInstalled ? (
        <View style={{ flex: 4, borderTopWidth: 1, borderColor: "#ddd" }}>
          <MapView style={{ flex: 1 }}>
            <Camera
              defaultSettings={{
                centerCoordinate: [-126.5, 54.0],
                zoomLevel: 6.5,
              }}
            />
            <RegionsLayer regionsFC={regions} visible={true} />

            <VectorSource
              id="r03"
              tileUrlTemplates={[fileTemplate("r03_vector", "pbf")]}
              minZoomLevel={0}
              maxZoomLevel={22}
            >
              <FillLayer
                id="r03-fill"
                sourceID="r03"
                sourceLayerID="r03_vector"
                minZoomLevel={0}
                maxZoomLevel={22}
                style={{
                  fillColor: "rgba(200,0,0,0.4)",
                  fillOutlineColor: "#000",
                }}
              />
            </VectorSource>
          </MapView>
        </View>
      ) : null}
    </View>
  );
}
