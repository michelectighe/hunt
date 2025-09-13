// ─────────────────────────────────────────────────────────────────────────────
// File: src/screens/TestMap.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useEffect, useRef, useCallback, useMemo, useState } from "react";
import { View, StyleSheet, Text } from "react-native";
import { MapView, Camera } from "@maplibre/maplibre-react-native";

import offlineStyle from "../../assets/styles/offline-basic.json";
import regions from "../../assets/geo/regions_slim.json";
import { UNITS_BY_REGION, toRegionCode } from "../data/unitsIndex";
import { mergeFeatureCollectionsSafe } from "../utils/geojson";

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
  const [activeRegions, setActiveRegions] = useState(new Set());


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
     // unitsFC: units1,
     synopsisByUnit,
     cameraRef,
   });

   const { coords, following, toggleFollowing, ensureReady } =
     useUserLocation();



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

   // Build one FC with only selected regions
   const unitsFC = useMemo(() => {
     if (activeRegions.size === 0) {
       return { type: "FeatureCollection", features: [] };
     }
     const fcs = [];
     for (const code of activeRegions) {
       // If you pre-added properties.regionCode in the source json, great.
       // Otherwise, you can wrap and tag here:
       const base = UNITS_BY_REGION[code];
       // Optionally inject regionCode so our merge helper can use it
       const tagged =
         base?.type === "FeatureCollection"
           ? {
               ...base,
               properties: { ...(base.properties || {}), regionCode: code },
             }
           : base;
       if (tagged) fcs.push(tagged);
     }
     return mergeFeatureCollectionsSafe(fcs);
   }, [activeRegions]);
   // Example: highlight filter (MapLibre-style filter expression)
   // Replace UNIT_ID_FIELD with your actual import if needed
  // const unitFilter = undefined; // or like ["==", ["get", "UNIT_ID"], pickedUnitId]

   const onUnitPress = useCallback((e) => {
     const feat = e?.features?.[0];
     if (!feat) return;
     handleUnitPress();
      console.log("Tapped unit:", feat.properties);
   }, []);

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
         <PrivateLandLayer visible minZoom={0} maxZoom={22} />
         <FirstNationsLayer visible minZoom={0} maxZoom={22} />
         <LakesLayer visible minZoom={0} maxZoom={22} />
         <RiversLayer visible minZoom={0} maxZoom={22} />
         <RegionsLayer
           regionsFC={regions}
           visible={showRegions}
           regionFilter={regionFilter}
         />
         <UnitsLayer
           unitsFC={unitsFC}
           onPress={handleUnitPress}
           unitFilter={unitFilter}
           showUnitLabels={showUnitLabels}
         />
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
