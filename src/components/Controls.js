// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/Controls.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";

export default function Controls({
  zoomToBC,
  showUnitLabels,
  setShowUnitLabels,
}) {
  return (
    <View style={styles.controls}>
      {/* <TouchableOpacity onPress={zoomToBC} style={styles.btn}>
        <Text style={styles.btnText}>Zoom to BC</Text>
      </TouchableOpacity> */}
      {/* <TouchableOpacity
        onPress={() => setShowUnitLabels((s) => !s)}
        style={styles.btn}
      >
        <Text style={styles.btnText}>
          {showUnitLabels ? "Hide IDs" : "Show IDs"}
        </Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  controls: { position: "absolute", right: 12, bottom: 24, gap: 8 },
  btn: {
    backgroundColor: "rgba(0,0,0,0.82)",
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  btnText: { color: "#fff", fontSize: 13, fontWeight: "700" },
});
