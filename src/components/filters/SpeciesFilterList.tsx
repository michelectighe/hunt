import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList, ViewStyle } from "react-native";
import { Species } from "../../../types"; // adjust path if needed

type Props = {
  items: Species[];
  value: Species | "all";
  onChange: (v: Species | "all") => void;
  title?: string;
  style?: ViewStyle;
};

export const SpeciesFilterList: React.FC<Props> = ({ items, value, onChange, title = "Species", style }) => {
  const data: (Species | "all")[] = ["all", ...items];

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        data={data}
        keyExtractor={(v) => v}
        style={{ maxHeight: 200 }} // <- vertical scroll area height
        showsVerticalScrollIndicator
        renderItem={({ item }) => {
          const active = value === item;
          const label = item === "all" ? "All species" : item.charAt(0).toUpperCase() + item.slice(1);
          return (
            <TouchableOpacity
              onPress={() => onChange(item)}
              style={[styles.row, active && styles.rowActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.rowText, active && styles.rowTextActive]}>{label}</Text>
            </TouchableOpacity>
          );
        }}
        ItemSeparatorComponent={() => <View style={styles.sep} />}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: "#0d1411",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2a25",
    padding: 10,
  },
  title: { color: "#e8f1ec", fontWeight: "700", fontSize: 14, marginBottom: 8 },
  row: { paddingVertical: 8, paddingHorizontal: 10, borderRadius: 8, backgroundColor: "#1b241f" },
  rowActive: { backgroundColor: "#264133", borderWidth: 1, borderColor: "#3a6d55" },
  rowText: { color: "#e8f1ec", fontWeight: "700", fontSize: 12 },
  rowTextActive: { color: "#e8f1ec" },
  sep: { height: 6 },
});
