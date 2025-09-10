import React from "react";
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  ScrollView,
} from "react-native";
import { useSpeciesCtx } from "../context/SpeciesContext"; // provides species[]
export type Species = string;

type Props = {
  selected: Species | null;
  onSelect: (s: Species) => void;
};

export const SpeciesBar: React.FC<Props> = ({ selected, onSelect }) => {
  const { species } = useSpeciesCtx();

  return (
    <View style={styles.wrap}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {species.map((sp) => (
          <TouchableOpacity
            key={sp}
            onPress={() => onSelect(sp)}
            activeOpacity={0.8}
            style={[styles.item, selected === sp && styles.itemActive]}
          >
            <Text style={styles.itemText}>{sp}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

// same styles as above

const styles = StyleSheet.create({
  wrap: {
  //  position: "absolute",
  //  left: 10,
  //  right: 10,
  //  bottom: 86,
    backgroundColor: "#0d1411",
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1f2a25",
    zIndex: 1,
  },
  row: {
    paddingHorizontal: 8,
    gap: 8,
    flexDirection: "row",
    alignItems: "center",
  },
  item: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#1b241f",
    borderRadius: 10,
  },
  itemActive: {
    backgroundColor: "#264133",
    borderWidth: 1,
    borderColor: "#3a6d55",
  },
  itemText: {
    color: "#e8f1ec",
    fontWeight: "700",
    fontSize: 12,
  },
});
