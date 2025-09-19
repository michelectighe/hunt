// ─────────────────────────────────────────────────────────────────────────────
// File: src/screens/TestMap.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

import offlineStyle from "../../assets/styles/offline-basic.json";
import regions from "../../assets/geo/regions_slim.json";
import units from "../../assets/geo/units_slim.json";
import { ToggleBar } from "../components/map/ToggleBar";

import synopsisByUnit from "../../assets/data/synopsis_regions_3_4_8.json";

import RegionsLayer from "../components/map/RegionsLayer";
import UnitsLayer from "../components/map/UnitsLayer";
import HillshadeLayer from "../components/map/HillshadeLayer";
import PublicLandLayer from "../components/map/PublicLandLayer";
import FirstNationsLayer from "../components/map/FirstNationsLayer";
import LakesLayer from "../components/map/LakesLayer";
import RiversLayer from "../components/map/RiversLayer";

import SelectionPill from "../components/SelectionPill";
import SearchBar from "../components/SearchBar";
import LocateMeButton from "../components/LocateMeButton";
import FollowButton from "../components/FollowButton";
import MyLocationLayer from "../components/map/MyLocationLayer";
import useMapSelection from "../hooks/useMapSelection";
import useUserLocation from "../hooks/useUserLocation";

export default function TestMap() {
  const cameraRef = useRef(null);
  const didInitialZoom = useRef(false);
  const [styleReady, setStyleReady] = useState(false);
  const [selectedLayers, setSelectedLayers] = useState({
    lakes: false,
    rivers: false,
    fn: false,
    private: false,
    hillside: false,
  });

  const {
    selected,
    setSelected,
    showRegions,
    showUnitLabels,
    unitFilter,
    regionFilter,
    handleUnitPress,
    handleMapLongPress,
    goToUnit,
    zoomToBC,
  } = useMapSelection({
    regionsFC: regions,
    unitsFC: units,
    synopsisByUnit,
    cameraRef,
  });

  const { coords, following, toggleFollowing, ensureReady } = useUserLocation();

  useEffect(() => {
    if (coords && cameraRef.current && !didInitialZoom.current) {
      didInitialZoom.current = true;
      cameraRef.current.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 12,
        animationDuration: 500,
        animationMode: "easeTo",
      });
    }
  }, [coords]);

  useEffect(() => {
    if (following && coords && cameraRef.current) {
      cameraRef.current.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 12,
        animationDuration: 500,
        animationMode: "easeTo",
      });
    }
  }, [coords, following]);

  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const showToast = (msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast(msg);
    toastTimer.current = setTimeout(() => setToast(null), 2000);
  };

  const onToggleLayer = useCallback((key) => {
    setSelectedLayers((prev) => ({ ...prev, [key]: !prev[key] }));
  }, []);

  // build a small key from the toggles
  const vectorKey = [
    selectedLayers.private ? 1 : 0,
    selectedLayers.fn ? 1 : 0,
    selectedLayers.lakes ? 1 : 0,
    selectedLayers.rivers ? 1 : 0,
  ].join("");

  const onUnitPress = useCallback((e) => {
    const feat = e?.features?.[0];
    if (!feat) return;
    handleUnitPress();
    console.log("Tapped unit:", feat.properties);
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ToggleBar selected={selectedLayers} onToggle={onToggleLayer} />

      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={offlineStyle}
        onDidFinishLoadingStyle={() => setStyleReady(true)}
        onMapReady={() => setStyleReady(true)}
        onLongPress={handleMapLongPress}
      >
        <Camera ref={cameraRef} />

        {styleReady && (
          <>
            {/* Vector PBF polygons — fixed order */}
            <PublicLandLayer visible={selectedLayers.private} />
            <FirstNationsLayer visible={selectedLayers.fn} />
            <LakesLayer visible={selectedLayers.lakes} />

            {/* Your GeoJSON overlays */}
            <RegionsLayer
              regionsFC={regions}
              visible={showRegions}
              regionFilter={regionFilter}
            />
            <UnitsLayer
              unitsFC={units}
              onPress={handleUnitPress}
              unitFilter={unitFilter}
              showUnitLabels={showUnitLabels}
            />
            <MyLocationLayer coords={coords} />

            {/* Linework last so it’s always on top */}
            <RiversLayer visible={selectedLayers.rivers} />
          </>
        )}
      </MapView>

      <SelectionPill
        selected={selected}
        onClose={() => setSelected(null)}
        synopsisByUnit={synopsisByUnit}
      />

      <FollowButton
        following={following}
        onToggle={async () => {
          const ok = await ensureReady();
          if (!ok) {
            showToast("Location permission or services off");
            return;
          }
          toggleFollowing();
        }}
        style={{ position: "absolute", right: 12, bottom: 76 }}
      />

      <LocateMeButton cameraRef={cameraRef} onToast={showToast} />

      {toast ? (
        <View style={styles.toast}>
          <Text style={styles.toastText}>{toast}</Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  toast: {
    position: "absolute",
    bottom: 130,
    right: 12,
    backgroundColor: "rgba(0,0,0,0.9)",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toastText: { color: "#fff", fontSize: 12, fontWeight: "700" },
});
