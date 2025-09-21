       import { useState } from "react";
       import { View, Text } from "react-native";
       import { getMoonData } from "../lib/moon";


       export const MoonPhase = () => {
  const [moon, setMoon] = useState(() => getMoonData(new Date()));
       return(
       <View
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            backgroundColor: "#0d1411",
            borderColor: "#1f2a25",
            borderWidth: 1,
            paddingVertical: 14,
            paddingHorizontal: 10,
            borderRadius: 10,
          }}
        >
          <Text style={{ color: "#e8f1ec", fontWeight: "700", fontSize: 12 }}>
            {moon.emoji} {moon.phaseName} •{" "}
            {Math.round(moon.illumination * 100)}%
          </Text>
        </View>
       )}