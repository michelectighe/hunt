import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ViewStyle,
} from "react-native";

const MOON_PHASES = [
  "New Moon",
  "Waxing Crescent",
  "First Quarter",
  "Waxing Gibbous",
  "Full Moon",
  "Waning Gibbous",
  "Last Quarter",
  "Waning Crescent",
] as const;
export type MoonPhase = (typeof MOON_PHASES)[number];

function emojiForPhase(name: string): string {
  switch (name) {
    case "New Moon":
      return "🌑";
    case "Waxing Crescent":
      return "🌒";
    case "First Quarter":
      return "🌓";
    case "Waxing Gibbous":
      return "🌔";
    case "Full Moon":
      return "🌕";
    case "Waning Gibbous":
      return "🌖";
    case "Last Quarter":
      return "🌗";
    case "Waning Crescent":
      return "🌘";
    default:
      return "🌙";
  }
}

type Props = {
  value: MoonPhase | "all";
  onChange: (v: MoonPhase | "all") => void;
  title?: string;
  style?: ViewStyle;
};

export const MoonPhaseFilterList: React.FC<Props> = ({
  value,
  onChange,
  title = "Moon phase",
  style,
}) => {
  const data: (MoonPhase | "all")[] = ["all", ...MOON_PHASES];

  return (
    <View style={[styles.card, style]}>
      <Text style={styles.title}>{title}</Text>

      <FlatList
        data={data}
        keyExtractor={(v) => (v === "all" ? "all" : v)}
        style={{ maxHeight: 200 }} // <- vertical scroll area height
        showsVerticalScrollIndicator
        renderItem={({ item }) => {
          const active = value === item;
          const label =
            item === "all" ? "All phases" : `${emojiForPhase(item)} ${item}`;
          return (
            <TouchableOpacity
              onPress={() => onChange(item)}
              style={[styles.row, active && styles.rowActive]}
              activeOpacity={0.8}
            >
              <Text style={[styles.rowText, active && styles.rowTextActive]}>
                {label}
              </Text>
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
  row: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: "#1b241f",
  },
  rowActive: {
    backgroundColor: "#264133",
    borderWidth: 1,
    borderColor: "#3a6d55",
  },
  rowText: { color: "#e8f1ec", fontWeight: "700", fontSize: 12 },
  rowTextActive: { color: "#e8f1ec" },
  sep: { height: 6 },
});
