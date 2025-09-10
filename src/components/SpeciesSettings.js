// components/SpeciesSettings.tsx
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";
import { setUserSpecies } from "../data/speciesStore";
import { DEFAULT_SPECIES } from "../data/speciesStore";
import { useSpeciesCtx } from "../context/SpeciesContext";

export const SpeciesSettings: React.FC = () => {
  const { species, add, remove, resetToDefaults } = useSpeciesCtx();
  const [text, setText] = useState("");

  return (
    <View style={styles.box}>
      <Text style={styles.title}>Species</Text>
      <View style={{ flexDirection: "row", gap: 8, marginTop: 8 }}>
        <TextInput
          style={styles.input}
          placeholder="Add new species (e.g., cougar)"
          placeholderTextColor="#7a8a82"
          value={text}
          onChangeText={setText}
          autoCapitalize="none"
          autoCorrect={false}
        />
        <TouchableOpacity
          style={styles.addBtn}
          onPress={async () => {
            if (!text.trim()) return;
            await add(text.trim());
            setText("");
          }}
        >
          <Text style={styles.addBtnText}>Add</Text>
        </TouchableOpacity>
      </View>

      <View
        style={{
          flexDirection: "row",
          flexWrap: "wrap",
          gap: 8,
          marginTop: 12,
        }}
      >
        {species.map((sp) => (
          <TouchableOpacity
            key={sp}
            style={styles.pill}
            onLongPress={() => remove(sp)}
          >
            <Text style={styles.pillText}>{sp}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.hint}>Long-press a pill to remove.</Text>
      <TouchableOpacity
        style={{ marginTop: 12, alignSelf: "flex-start" }}
        onPress={async () => {
          await setUserSpecies([]); // clear user-added
          await resetToDefaults(); // hook refreshes to defaults + user (now none)
        }}
      >
        <Text style={{ color: "#7a8a82" }}>Reset to defaults</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  box: {
    backgroundColor: "#0d1411",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2a25",
    padding: 12,
  },
  title: { color: "#e8f1ec", fontWeight: "700", fontSize: 16 },
  input: {
    flex: 1,
    backgroundColor: "#1b241f",
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 8,
    color: "#e8f1ec",
    borderWidth: 1,
    borderColor: "#1f2a25",
  },
  addBtn: {
    backgroundColor: "#264133",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#3a6d55",
  },
  addBtnText: { color: "#e8f1ec", fontWeight: "700" },
  pill: {
    backgroundColor: "#1b241f",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 999,
  },
  pillText: { color: "#e8f1ec", fontWeight: "700", fontSize: 12 },
  hint: { marginTop: 8, color: "#7a8a82", fontSize: 12 },
});
