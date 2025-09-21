// src/components/map/ToggleBar.js
import React, { useState, useMemo } from "react";
import { View, Pressable, Text, StyleSheet, Animated } from "react-native";

const LAYER_OPTIONS = [
  { key: "lakes", label: "Lakes" },
  { key: "rivers", label: "Rivers" },
  { key: "fn", label: "First Nations" },
  { key: "private", label: "Private Land" },
  { key: "hillside", label: "Hillside" },
];

export function ToggleBar({ selected = {}, onToggle, title = "Map Details" }) {
  const [open, setOpen] = useState(false);

  // simple arrow using rotation
  const rotation = useMemo(
    () => new Animated.Value(open ? 1 : 0),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
  // animate whenever open changes
  React.useEffect(() => {
    Animated.timing(rotation, {
      toValue: open ? 1 : 0,
      duration: 150,
      useNativeDriver: true,
    }).start();
  }, [open, rotation]);

  const rotateZ = rotation.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  return (
    <View style={styles.wrap}>
      {/* Header button */}
      <Pressable style={styles.headerBtn} onPress={() => setOpen((v) => !v)}>
        <Text style={styles.headerText}>{title}</Text>
        <Animated.View style={{ transform: [{ rotateZ }] }}>
          <Text style={styles.chevron}>▾</Text>
        </Animated.View>
      </Pressable>

      {/* Dropdown */}
      {open && (
        <View style={styles.menu}>
          {LAYER_OPTIONS.map((item) => {
            const active = !!selected[item.key];
            return (
              <Pressable
                key={item.key}
                onPress={() => onToggle?.(item.key)}
                style={[
                  styles.menuItem,
                  active ? styles.menuItemOn : styles.menuItemOff,
                ]}
              >
                <View
                  style={[styles.dot, active ? styles.dotOn : styles.dotOff]}
                />
                <Text
                  style={[
                    styles.itemText,
                    active ? styles.itemTextOn : styles.itemTextOff,
                  ]}
                >
                  {item.label}
                </Text>
              </Pressable>
            );
          })}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    marginHorizontal: 8,
    zIndex: 999, // keep above map controls
  },

  // header
  headerBtn: {
    backgroundColor: "#0b0b0b",
 //   width: "50%",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: "#333",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
  },
  headerText: {
    color: "#eee",
    fontSize: 14,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
  chevron: { color: "#ccc", fontSize: 18, marginLeft: 6 },

  // dropdown list
  menu: {
    //width: "50%",
    marginTop: 6,
    backgroundColor: "#0b0b0b",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#333",
    overflow: "hidden",
    // shadow
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  menuItem: {
    paddingVertical: 10,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "#222",
  },
  menuItemOn: { backgroundColor: "#1e90ff22" },
  menuItemOff: { backgroundColor: "transparent" },

  dot: {
    width: 10,
    height: 10,
    borderRadius: 999,
    borderWidth: 2,
  },
  dotOn: { borderColor: "#1e90ff", backgroundColor: "#1e90ff" },
  dotOff: { borderColor: "#444", backgroundColor: "transparent" },

  itemText: { fontSize: 14, fontWeight: "600" },
  itemTextOn: { color: "#cfe8ff" },
  itemTextOff: { color: "#aaa" },
});
