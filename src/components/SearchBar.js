// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/SearchBar.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
} from "react-native";

export default function SearchBar({ onGoToUnit }) {
  const [searchText, setSearchText] = useState("");
  const go = () => onGoToUnit?.(searchText);

  return (
    <View style={styles.searchBar}>
      <TextInput
        placeholder="Go to Unit (e.g., 3-12)"
        placeholderTextColor="#bbb"
        value={searchText}
        onChangeText={setSearchText}
        onSubmitEditing={go}
        style={styles.searchInput}
        autoCorrect={false}
        autoCapitalize="none"
        returnKeyType="go"
      />
      <TouchableOpacity onPress={go} style={styles.searchBtn}>
        <Text style={styles.searchBtnText}>Go</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  searchBar: {
    position: "absolute",
    top: 60,
    left: 12,
    right: 12,
    flexDirection: "row",
    gap: 8,
    alignItems: "center",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.75)",
    color: "#fff",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    fontSize: 14,
  },
  searchBtn: {
    backgroundColor: "rgba(0,0,0,0.85)",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  searchBtnText: { color: "#fff", fontSize: 14, fontWeight: "700" },
});
