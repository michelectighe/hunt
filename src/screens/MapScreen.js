// ─────────────────────────────────────────────────────────────────────────────
// File: src/screens/TestMap.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback, useState } from "react";
import {
  View,
  StyleSheet,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
} from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

import offlineStyle from "../../assets/styles/offline-basic.json";
import regions from "../../assets/geo/regions_slim.json";
import units from "../../assets/geo/units_slim.json";
import { ToggleBar } from "../components/ToggleBar";

import synopsisByUnit from "../../assets/data/synopsis_regions_3_4_8.json";

import RegionsLayer from "../components/map/RegionsLayer";
import UnitsLayer from "../components/map/UnitsLayer";
import HillshadeLayer from "../components/map/HillshadeLayer";
import PrivateLandLayer from "../components/map/PrivateLandLayer";
import FirstNationsLayer from "../components/map/FirstNationsLayer";
import LakesLayer from "../components/map/LakesLayer";
import RiversLayer from "../components/map/RiversLayer";
import PinsLayer from "../components/map/PinsLayer";

import SelectionPill from "../components/SelectionPill";
import SearchBar from "../components/SearchBar";
import LocateMeButton from "../components/LocateMeButton";
import FollowButton from "../components/FollowButton";
import MyLocationLayer from "../components/map/MyLocationLayer";
import useMapSelection from "../hooks/useMapSelection";
import useUserLocation from "../hooks/useUserLocation";

import * as Location from "expo-location";
import { styles } from "./MapScreen.Styles";
//import { CoordPanel } from "../components/CoordPanel";
import { EditPinModal } from "../components/EditPinModal";
import { parseCoordToken } from "../lib/parseCoordToken";
import { usePins } from "../hooks/usePins";
import { getMoonData } from "../lib/moon";
import MapCompass from "../components/MapCompass";

//import { useBreadcrumbs } from "../hooks/useBreadcrumbs";
import { MoonPhase } from "../components/MoonPhase";

export default function MapScreen() {
  const cameraRef = useRef();
  const mapRef = useRef();
  const didInitialZoom = useRef(false);
  const [styleReady, setStyleReady] = useState(false);
  const [region, setRegion] = useState({
    latitude: 50.705,
    longitude: -119.295,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const [status, setStatus] = useState("…");
  const [currentSpecies, setCurrentSpecies] = useState("other");
  const [moon, setMoon] = useState(() => getMoonData(new Date()));

  // editor state
  const [editPin, setEditPin] = useState(null);
  const [editSpecies, setEditSpecies] = useState(null);
  const [editNote, setEditNote] = useState("");
  const [mapBearing, setMapBearing] = useState(0);

  const { pins, loadPins, dropPin, dropPinAt, saveEdit, deleteById } = usePins({
    currentSpecies,
    cameraRef,
    mapRef,
    setStatus,
  });

  useEffect(() => {
    // refresh hourly; super cheap
    const id = setInterval(
      () => setMoon(getMoonData(new Date())),
      60 * 60 * 1000
    );
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    (async () => {
      const { status: perm } =
        await Location.requestForegroundPermissionsAsync();
      if (perm !== "granted") {
        Alert.alert("Location denied", "Grant permission to drop pins.");
        return;
      }
      await loadPins();

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });
      setRegion((r) => ({
        ...r,
        latitude: loc.coords.latitude,
        longitude: loc.coords.longitude,
      }));
      setStatus("Ready");
    })().catch((e) => setStatus(`Error: ${String(e)}`));
  }, [loadPins]);

  function onGoToCoord() {
    const lat = parseCoordToken(latText, "lat");
    const lon = parseCoordToken(lonText, "lon");
    if (lat == null || lon == null) {
      Alert.alert(
        "Invalid coordinates",
        "Use decimal degrees.\nExamples:\n  Lat: 51.87096   Lon: -119.10225\n  Lat: 51.87096N  Lon: 119.10225W"
      );
      return;
    }
    setCoordMode(false);
    setLatText("");
    setLonText("");
    dropPinAt(lat, lon);
  }

  function openEditor(p) {
    setEditPin(p);
    setEditSpecies(p.species);
    setEditNote(p.note ?? "");
  }

  async function onSaveEdit() {
    if (!editPin) return;
    const species = editSpecies ?? editPin.species;
    await saveEdit(editPin, species, editNote);
    setEditPin(null);
  }

  async function onDeleteEdit() {
    if (!editPin) return;
    await deleteById(editPin.id);
    setEditPin(null);
  }

  const [selectedLayers, setSelectedLayers] = useState({
    lakes: true,
    rivers: true,
    fn: true,
    private: true,
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
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      {/* <View style={{width:"45%"}}> */}
      <ToggleBar selected={selectedLayers} onToggle={onToggleLayer} />
      {/* </View> */}
      {/* <View
          style={{
            backgroundColor: "#0d1411",
            borderColor: "#1f2a25",
            borderWidth: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            borderRadius: 10,
            width: "60%",
          }}
        >
          <Text style={{ color: "#e8f1ec", fontWeight: "700", fontSize: 12 }}>
            {moon.emoji} {moon.phaseName} •{" "}
            {Math.round(moon.illumination * 100)}%
          </Text>
        </View> */}

      {/* <View style={{ flex: 1 }}> */}
      <View style={styles.mapWrap}>
        {/* COORD toggle button */}
        {/* <TouchableOpacity
                  style={styles.topRightBtn}
                  onPress={() => setCoordMode((v) => !v)}
                  activeOpacity={0.85}
                >
                  <Text style={styles.topRightBtnText}>COORD</Text>
                </TouchableOpacity> */}

        <MapCompass cameraRef={cameraRef} mapBearing={mapBearing} />

        {/* Coordinate panel */}
        {/* {coordMode && (
                  <CoordPanel
                    styles={styles}
                    latText={latText}
                    lonText={lonText}
                    setLatText={setLatText}
                    setLonText={setLonText}
                    onGoToCoord={onGoToCoord}
                    onCancel={() => setCoordMode(false)}
                  />
                )} */}

        <MapView
          ref={mapRef}
          style={[StyleSheet.absoluteFill, { zIndex: -1 }]}
          mapStyle={offlineStyle}
          onDidFinishLoadingStyle={() => setStyleReady(true)}
          onMapReady={() => setStyleReady(true)}
          onLongPress={handleMapLongPress}
          onRegionDidChange={(e) => {
            const b = e?.properties?.heading ?? e?.properties?.bearing ?? 0;
            setMapBearing(b || 0);
          }}
        >
          <Camera ref={cameraRef} />

          {styleReady && (
            <>
              {/* Vector PBF polygons — fixed order */}
              <PrivateLandLayer visible={selectedLayers.private} />
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
              <PinsLayer
                pins={pins}
                onPress={(e) => {
                  const feat = e?.features?.[0];
                  if (!feat) return;
                  // find the full pin by id so editor has the note/species/etc.
                  const pin = pins.find((p) => p.id === feat.properties.id);
                  if (pin) openEditor(pin);
                }}
              />
            </>
          )}
        </MapView>
        <TouchableOpacity
          style={styles.bigBtn}
          onPress={dropPin}
          activeOpacity={0.8}
        >
          <Text style={styles.bigBtnText}>DROP PIN</Text>
        </TouchableOpacity>

        <EditPinModal
          styles={styles}
          visible={!!editPin}
          pin={editPin}
          editSpecies={editSpecies}
          setEditSpecies={(s) => setEditSpecies(s)}
          editNote={editNote}
          setEditNote={setEditNote}
          onSave={onSaveEdit}
          onDelete={onDeleteEdit}
          onClose={() => setEditPin(null)}
        />

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

        {/* <LocateMeButton cameraRef={cameraRef} onToast={showToast} /> */}
        <MoonPhase />
        {toast ? (
          <View style={styles.toast}>
            <Text style={styles.toastText}>{toast}</Text>
          </View>
        ) : null}
      </View>
    </SafeAreaView>
  );
}
