// navigation/Tabs.tsx
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MapScreen from "../screens/MapScreen";
import TestMap from "../screens/TestMap";
import LogbookScreen from "../screens/LogbookScreen";
import SettingsScreen from "../screens/SettingsScreen";
import MapRegionsDownloadScreen from "../screens/MapRegionsDownloadScreen";
import TrackScreen from "../screens/TrackScreen";
import { Ionicons } from "@expo/vector-icons";
import TrackStack from "./TrackStack";


import TestPacksScreen from "../screens/TestPackScreen";

const Tab = createBottomTabNavigator();

export default function Tabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: "#0d1411", borderTopColor: "#1f2a25" },
        tabBarActiveTintColor: "#e8f1ec",
        tabBarInactiveTintColor: "#7a8a82",
      }}
    >
      <Tab.Screen
        name="ALL"
        component={TestMap}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="map-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Track"
        component={TrackStack}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="navigate-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Log"
        component={LogbookScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}
