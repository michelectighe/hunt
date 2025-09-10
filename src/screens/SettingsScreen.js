import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { clearPins } from "../data/db";
import { SpeciesSettings } from "../components/SpeciesSettings"; // <-- add this


export default function SettingsScreen() {
  const [busy, setBusy] = useState(false);

  async function onClear() {
    if (busy) return;
    Alert.alert("Clear all pins?", "This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: async () => {
          setBusy(true);
          try {
            await clearPins();
            Alert.alert("Done", "All pins deleted.");
          } catch (e) {
            Alert.alert("Error", String(e));
          } finally {
            setBusy(false);
          }
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={Platform.OS === "ios" ? 64 : 0}
        style={{ flex: 1 }}
      >
        <View style={{ padding: 16, gap: 16 }}>
          <Text style={styles.h1}>Settings</Text>

          {/* Danger zone */}
          <TouchableOpacity
            onPress={onClear}
            style={[styles.btn, { opacity: busy ? 0.6 : 1 }]}
            disabled={busy}
          >
            <Text style={styles.btnText}>Clear all pins</Text>
          </TouchableOpacity>

          {/* --- Species quick-tags section --- */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Species quick-tags</Text>
            <SpeciesSettings />
          </View>

          {/* Roadmap list */}
          <View>
            <Text style={styles.p}>• Offline map packs (coming soon)</Text>
            <Text style={styles.p}>• Export GPX/KML/CSV</Text>
            <Text style={styles.p}>• Battery saver options</Text>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0d" },
  h1: { color: "#fff", fontSize: 20, fontWeight: "700" },
  p: { color: "#cfd8d4", marginTop: 6 },
  btn: {
    backgroundColor: "#C23B22",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    alignSelf: "flex-start",
  },
  btnText: { color: "#fff", fontWeight: "700" },

  // simple card styling for the species section
  card: {
    backgroundColor: "#0d1411",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2a25",
    padding: 12,
  },
  cardTitle: {
    color: "#e8f1ec",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 8,
  },
});
