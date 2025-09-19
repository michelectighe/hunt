import React from "react";
import { View, FlatList, Pressable, Text, StyleSheet } from "react-native";

const LAYER_OPTIONS = [
  { key: "lakes", label: "Lakes" },
  { key: "rivers", label: "Rivers" },
  { key: "fn", label: "First Nations"},
  { key: "private", label: "Private Land"},
  { key: "hillside", label: "Hillside" },
];

export function ToggleBar({ selected = {}, onToggle }) {
  return (
    <View style={styles.toggleBar}>
      <FlatList
        horizontal
        data={LAYER_OPTIONS}
        keyExtractor={(item) => item.key}
        contentContainerStyle={{ paddingHorizontal: 12 }}
        ItemSeparatorComponent={() => <View style={{ width: 8 }} />}
        renderItem={({ item }) => {
          const active = !!selected[item.key];
          return (
            <Pressable
              onPress={() => onToggle?.(item.key)}
              style={[
                styles.toggleChip,
                active ? styles.toggleChipOn : styles.toggleChipOff,
              ]}
            >
              <Text
                style={[
                  styles.toggleText,
                  active ? styles.toggleTextOn : styles.toggleTextOff,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  toggleBar: {
    marginTop: 60,
    marginHorizontal: 8,
    borderRadius: 10,
    overflow: "hidden",
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#333",
    backgroundColor: "#0b0b0b",
    zIndex: 3,
  },
  toggleChip: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 999,
    borderWidth: 1,
  },
  toggleChipOn: {
    backgroundColor: "#1e90ff22",
    borderColor: "#1e90ff",
  },
  toggleChipOff: {
    backgroundColor: "#111",
    borderColor: "#333",
  },
  toggleText: { fontSize: 14, fontWeight: "600" },
  toggleTextOn: { color: "#cfe8ff" },
  toggleTextOff: { color: "#aaa" },
});
