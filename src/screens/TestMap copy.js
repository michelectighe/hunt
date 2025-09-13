// ─────────────────────────────────────────────────────────────────────────────
// File: src/screens/TestMap.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

import offlineStyle from "../../assets/styles/offline-basic.json";
import regions from "../../assets/geo/regions_slim.json";
import units from "../../assets/geo/units_slim.json";
import synopsisByUnit from "../../assets/data/synopsis_regions_3_4_8.json";

import RegionsLayer from "../components/map/RegionsLayer";
import UnitsLayer from "../components/map/UnitsLayer";
 import HillshadeLayer from "../components/map/HillshadeLayer";
import PrivateLandLayer from "../components/map/PrivateLandLayer";
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

  // 🔹 Initial zoom once when coords are first available
  useEffect(() => {
    if (coords && cameraRef.current && !didInitialZoom.current) {
      console.log("getting in here");
      didInitialZoom.current = true;
      cameraRef.current.setCamera({
        centerCoordinate: [coords.longitude, coords.latitude],
        zoomLevel: 12,
        animationDuration: 500,
        animationMode: "easeTo",
      });
    }
  }, [coords]);

  // 🔹 Keep following logic for when user toggles follow mode
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

  return (
    <View style={{ flex: 1 }}>
      <MapView
        style={StyleSheet.absoluteFill}
        mapStyle={offlineStyle}
        onLongPress={handleMapLongPress}
      >
        <Camera ref={cameraRef} />
        {/* 1) Elevation background */}
        {/* <HillshadeLayer visible opacity={0.55} /> */}
        {/* Private land under everything else */}
        {/* <PrivateLandLayer visible minZoom={0} maxZoom={22} />
        <FirstNationsLayer visible minZoom={0} maxZoom={22} />
        <LakesLayer visible minZoom={0} maxZoom={22} />
        <RiversLayer visible minZoom={0} maxZoom={22} /> */}
        <RegionsLayer
          regionsFC={regions}
          visible={showRegions}
          regionFilter={regionFilter}
        />
        {/* <UnitsLayer
          unitsFC={units}
          onPress={handleUnitPress}
          unitFilter={unitFilter}
          showUnitLabels={showUnitLabels}
        /> */}

        <MyLocationLayer coords={coords} />
      {/* <HillshadeLayer/> */}
      </MapView>

      <SelectionPill
        selected={selected}
        onClose={() => setSelected(null)}
        synopsisByUnit={synopsisByUnit}
      />
      <SearchBar onGoToUnit={goToUnit} />

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
