import React, { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import MapView from "react-native-maps";
import * as Location from "expo-location";

type Props = {
  mapRef: React.RefObject<MapView | null>;
  style?: object;
};

export const MapCompass: React.FC<Props> = ({ mapRef, style }) => {
  const [heading, setHeading] = useState(0); // 0..360
  const [follow, setFollow] = useState(false); // follow device heading

  useEffect(() => {
    let sub: Location.LocationSubscription | null = null;
    (async () => {
      // try to ensure we have permission (usually already granted in your app)
      const perm = await Location.getForegroundPermissionsAsync();
      if (perm.status !== "granted") {
        const req = await Location.requestForegroundPermissionsAsync();
        if (req.status !== "granted") return;
      }

      sub = await Location.watchHeadingAsync((h) => {
        const deg =
          (Number.isFinite(h.trueHeading) && h.trueHeading >= 0
            ? h.trueHeading
            : h.magHeading) ?? 0;
        setHeading(deg);

        if (follow) {
          mapRef.current?.animateCamera({ heading: deg }, { duration: 80 });
        }
      });
    })();

    return () => sub?.remove();
  }, [follow, mapRef]);

  const snapNorth = () => {
    setFollow(false);
    mapRef.current?.animateCamera({ heading: 0 }, { duration: 250 });
  };

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={snapNorth}
      onLongPress={() => setFollow((v) => !v)}
      style={[styles.wrap, style]}
    >
      {/* dial */}
      <View style={styles.dial}>
        {/* N marker */}
        <Text style={styles.nMark}>N</Text>
        {/* needle -> rotate to device heading */}
        <View
          style={[styles.needle, { transform: [{ rotate: `${heading}deg` }] }]}
        >
          <View style={styles.needleTip} />
        </View>
      </View>

      <Text style={styles.meta}>
        {Math.round(heading)}°{follow ? " • AUTO" : ""}
      </Text>
      <Text style={styles.hint}>tap: north • long-press: follow</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  wrap: {
    position: "absolute",
    //  right: 12,
    top: 60, // tuck under your COORD button
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
    // little triangular cap:
    borderTopLeftRadius: 1,
    borderTopRightRadius: 1,
  },
  meta: { color: "#0d1411", fontSize: 10, marginTop: 4, fontWeight: "700" },
  hint: { color: "#7a8a82", fontSize: 9, marginTop: 2 },
});
