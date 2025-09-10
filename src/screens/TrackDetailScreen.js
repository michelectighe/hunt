import React, { useEffect, useRef, useState } from "react";
import { SafeAreaView, View, Text, StyleSheet } from "react-native";
import MapView, { Polyline } from "react-native-maps";
import { getTrackPoints } from "../data/tracks";
import type { TrackPoint } from "../../types";
import { useRoute } from "@react-navigation/native";

export default function TrackDetailScreen() {
  const { params } = useRoute();
  const trackId: string = params.trackId;
  const mapRef = useRef(null);
  const [pts, setPts] = useState<([]);

  useEffect(() => {
    (async () => {
      const rows = await getTrackPoints(trackId);
      const coords = rows.map((r: TrackPoint) => ({ latitude: r.lat, longitude: r.lon }));
      setPts(coords);
      if (coords.length > 0) {
        setTimeout(() => {
          mapRef.current?.fitToCoordinates(coords, {
            edgePadding: { top: 40, right: 40, bottom: 40, left: 40 },
            animated: true,
          });
        }, 100);
      }
    })();
  }, [trackId]);

  return (
    <SafeAreaView style={s.container}>
      <MapView ref={mapRef} style={s.map} showsUserLocation showsCompass>
        {pts.length > 1 && <Polyline coordinates={pts} strokeWidth={4} strokeColor="#3a6d55" />}
      </MapView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0d" },
  map: { flex: 1 },
});
