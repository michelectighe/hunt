import React from "react";
import { View, Text, TextInput, TouchableOpacity } from "react-native";

interface CoordPanelProps {
  styles: any; // reuse your existing StyleSheet
  latText: string;
  lonText: string;
  setLatText: (v: string) => void;
  setLonText: (v: string) => void;
  onGoToCoord: () => void;
  onCancel: () => void;
}

export const CoordPanel: React.FC<CoordPanelProps> = ({
  styles,
  latText,
  lonText,
  setLatText,
  setLonText,
  onGoToCoord,
  onCancel,
}) => {
  return (
    <View style={styles.coordPanel}>
      <Text style={styles.coordTitle}>Go to coordinates</Text>
      <Text style={styles.coordHint}>
        Decimal degrees. Examples: Lat 51.87096 • Lon -119.10225 • 51.87096N / 119.10225W
      </Text>

      <View style={styles.coordRow}>
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Latitude</Text>
          <TextInput
            style={styles.coordInput}
            placeholder="e.g., 51.87096 or 51.87096N"
            placeholderTextColor="#7a8a82"
            value={latText}
            onChangeText={setLatText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            returnKeyType="next"
          />
        </View>
        <View style={{ width: 10 }} />
        <View style={{ flex: 1 }}>
          <Text style={styles.label}>Longitude</Text>
          <TextInput
            style={styles.coordInput}
            placeholder="e.g., -119.10225 or 119.10225W"
            placeholderTextColor="#7a8a82"
            value={lonText}
            onChangeText={setLonText}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="numbers-and-punctuation"
            returnKeyType="go"
            onSubmitEditing={onGoToCoord}
          />
        </View>
      </View>

      <View style={{ flexDirection: "row", gap: 12, marginTop: 10 }}>
        <TouchableOpacity style={styles.coordGo} onPress={onGoToCoord}>
          <Text style={styles.coordGoText}>Go & Pin</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.coordCancel} onPress={onCancel}>
          <Text style={styles.coordCancelText}>Cancel</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
