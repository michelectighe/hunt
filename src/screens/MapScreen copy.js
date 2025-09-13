// screens/MapScreen.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import * as Location from "expo-location";
import { Pin, Species } from "../../types";
import { styles } from "./MapScreen.Styles";
import { CoordPanel } from "../components/CoordPanel";
import { EditPinModal } from "../components/EditPinModal";
import { parseCoordToken } from "../lib/parseCoordToken";
import { usePins } from "../hooks/usePins";
import { getMoonData } from "../lib/moon";
import { MapCompass } from "../components/MapCompass";
import MapView, { Marker, PROVIDER_DEFAULT, Polyline } from "react-native-maps";
import { useBreadcrumbs } from "../hooks/useBreadcrumbs";


export default function MapScreen() {
  const [region, setRegion] = useState({
    latitude: 50.705,
    longitude: -119.295,
    latitudeDelta: 0.03,
    longitudeDelta: 0.03,
  });
  const [status, setStatus] = useState < string > "…";
  const mapRef = useRef < MapView > null;
  const [currentSpecies, setCurrentSpecies] = useState < Species > "other";
  const [moon, setMoon] = useState(() => getMoonData(new Date()));

  // coord panel state
  const [coordMode, setCoordMode] = useState(false);
  const [latText, setLatText] = useState("");
  const [lonText, setLonText] = useState("");

  // editor state
  const [editPin, setEditPin] = (useState < Pin) | (null > null);
  const [editSpecies, setEditSpecies] = (useState < Species) | (null > null);
  const [editNote, setEditNote] = useState < string > "";

  const { tracking, points, distance, start, pause, resume, stop } =
    useBreadcrumbs({ mapRef, setStatus });

  const { pins, loadPins, dropPin, dropPinAt, saveEdit, deleteById } = usePins({
    currentSpecies,
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

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.mapWrap}>
        <View style={{ position: "absolute", top: 12, left: 12, zIndex: 2 }}>
          <View
            style={{
              backgroundColor: "#0d1411",
              borderColor: "#1f2a25",
              borderWidth: 1,
              paddingVertical: 6,
              paddingHorizontal: 10,
              borderRadius: 10,
            }}
          >
            <Text style={{ color: "#e8f1ec", fontWeight: "700", fontSize: 12 }}>
              {moon.emoji} {moon.phaseName} •{" "}
              {Math.round(moon.illumination * 100)}%
            </Text>
          </View>
        </View>
        {/* COORD toggle button */}
        <TouchableOpacity
          style={styles.topRightBtn}
          onPress={() => setCoordMode((v) => !v)}
          activeOpacity={0.85}
        >
          <Text style={styles.topRightBtnText}>COORD</Text>
        </TouchableOpacity>
        <MapCompass mapRef={mapRef} />
        {/* Coordinate panel */}
        {coordMode && (
          <CoordPanel
            styles={styles}
            latText={latText}
            lonText={lonText}
            setLatText={setLatText}
            setLonText={setLonText}
            onGoToCoord={onGoToCoord}
            onCancel={() => setCoordMode(false)}
          />
        )}

        <MapView
          ref={mapRef}
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={region}
          showsUserLocation
          showsMyLocationButton
          showsCompass
          rotateEnabled
          onLongPress={(e) => {
            const { latitude, longitude } = e.nativeEvent.coordinate;
            dropPinAt(latitude, longitude);
          }}
        >
          {pins.map((p) => (
            <Marker
              key={p.id}
              coordinate={{ latitude: p.lat, longitude: p.lon }}
              // title={`${new Date(
              //   p.ts
              // ).toLocaleTimeString()} • ${p.own.toUpperCase()} • ${p.species.toUpperCase()}`}
              // description={`${p.lat.toFixed(5)}, ${p.lon.toFixed(5)}`}
              // pinColor={
              //   p.own === "crown"
              //     ? "#00A36C"
              //     : p.own === "private"
              //     ? "#C23B22"
              //     : "#808080"
              // }
              onPress={() => openEditor(p)}
            />
          ))}
        </MapView>

        <TouchableOpacity
          style={styles.bigBtn}
          onPress={dropPin}
          activeOpacity={0.8}
        >
          <Text style={styles.bigBtnText}>DROP PIN</Text>
        </TouchableOpacity>

        {/* <View style={styles.status}>
          <Text style={styles.statusText}>{status} • R9</Text>
        </View> */}

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
      </View>
    </SafeAreaView>
  );
}
