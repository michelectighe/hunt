import React, { useEffect } from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "./src/screens/MapScreen";
import LogbookScreen from "./src/screens/LogbookScreen";
import SettingsScreen from "./src/screens/SettingsScreen";
import { ensureSchema } from "./src/data/db";
import { View, ActivityIndicator } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { SpeciesProvider } from "./src/context/SpeciesContext";
import Tabs from "./src/navigation/Tabs";
import "./src/background/trackTask";

// (Optional) splash-y init while DB is ensured
function Bootstrap({ children }: { children: React.ReactNode }) {
  const [ready, setReady] = React.useState(false);
  useEffect(() => {
    ensureSchema().then(() => setReady(true));
  }, []);
  if (!ready) {
    return (
      <View
        style={{
          flex: 1,
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#0b0f0d",
        }}
      >
        <ActivityIndicator />
      </View>
    );
  }
  return <>{children}</>;
}

const Tab = createBottomTabNavigator();

export default function App() {
  return (
    <SpeciesProvider>
      <NavigationContainer>
        <Bootstrap>
          <Tabs />
        </Bootstrap>
      </NavigationContainer>
    </SpeciesProvider>
  );
}
