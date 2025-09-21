// src/components/MapCompass.js
import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import * as Location from "expo-location";

export default function MapCompass({ cameraRef, style }) {
  const [heading, setHeading] = useState(0); // 0..360
  const [follow, setFollow] = useState(false); // follow device heading
  const [valid, setValid] = useState(false); // is the heading usable?

  useEffect(() => {
    let sub = null;

    (async () => {
      // Request foreground location (compass piggybacks on this)
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== "granted") return;
      }

      sub = await Location.watchHeadingAsync((h) => {
        // On iOS, trueHeading === -1 when not yet calibrated/available
        const hasTrue = Number.isFinite(h.trueHeading) && h.trueHeading >= 0;
        const hasMag = Number.isFinite(h.magHeading) && h.magHeading >= 0;

        const deg = hasTrue ? h.trueHeading : hasMag ? h.magHeading : 0;
        setHeading(deg);
        setValid(hasTrue || hasMag);

        if (follow && cameraRef?.current) {
          cameraRef.current.setCamera({
            heading: deg,
            animationDuration: 80,
            animationMode: "easeTo",
          });
        }
      });
    })();

    return () => {
      try {
        sub && sub.remove && sub.remove();
      } catch {}
    };
  }, [follow, cameraRef]);

  const snapNorth = () => {
    setFollow(false);
    cameraRef?.current?.setCamera({
      heading: 0,
      animationDuration: 250,
      animationMode: "easeTo",
    });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={snapNorth}
      onLongPress={() => setFollow((v) => !v)}
      style={[styles.wrap, style]}
    >
      <View
        style={[
          styles.dial,
          { transform: [{ rotate: `${-heading}deg` }] }, // rotate the card
        ]}
      >
        <Text style={styles.nMark}>N</Text>
        {/* Needle stays pointing up, no rotation */}
        <View style={styles.needle}>
          <View style={styles.needleTip} />
        </View>
      </View>

      <Text style={styles.meta}>
        {valid ? Math.round(heading) + "°" : "CAL"}
        {follow ? " • AUTO" : ""}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    alignItems: "center",
    zIndex: 3,
  },
  dial: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#0d1411",
    borderWidth: 1,
    borderColor: "#1f2a25",
    justifyContent: "center",
    alignItems: "center",
  },
  nMark: {
    position: "absolute",
    top: 4,
    color: "#e8f1ec",
    fontWeight: "700",
    fontSize: 10,
  },
  needle: {
    width: 0,
    height: 0,
    alignItems: "center",
    justifyContent: "flex-start",
  },
  needleTip: {
    width: 2,
    height: 16,
    borderRadius: 1,
    backgroundColor: "#3a6d55",
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  meta: { color: "#0d1411", fontSize: 10, marginTop: 4, fontWeight: "700" },
  hint: { color: "#7a8a82", fontSize: 9, marginTop: 2 },
});
