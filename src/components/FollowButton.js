// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/FollowButton.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import { View, TouchableOpacity, Text, StyleSheet } from "react-native";

export default function FollowButton({ following, onToggle, style }) {
  return (
    <View style={[styles.wrapper, style]}>
      <TouchableOpacity
        style={[styles.fab, following && styles.fabActive]}
        onPress={onToggle}
      >
        <Text style={styles.fabText}>🧭</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { position: "absolute", right: 12 },
  fab: {
    backgroundColor: "rgba(0,0,0,0.9)",
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: "center",
    justifyContent: "center",
  },
  fabActive: { backgroundColor: "#2563eb" },
  fabText: { color: "#fff", fontSize: 18 },
});
