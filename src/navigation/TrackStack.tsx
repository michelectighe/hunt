import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import TrackScreen from "../screens/TrackScreen";
import TrackHistoryScreen from "../screens/TrackHistoryScreen";
import TrackDetailScreen from "../screens/TrackDetailScreen";

const Stack = createNativeStackNavigator();

export default function TrackStack() {
  return (
    <Stack.Navigator screenOptions={{ headerStyle: { backgroundColor: "#0d1411" }, headerTintColor: "#e8f1ec" }}>
      <Stack.Screen name="TrackHome" component={TrackScreen} options={{ title: "Track" }} />
      <Stack.Screen name="TrackHistory" component={TrackHistoryScreen} options={{ title: "Track History" }} />
      <Stack.Screen name="TrackDetail" component={TrackDetailScreen} options={({ route }: any) => ({ title: route.params?.title ?? "Track" })} />
    </Stack.Navigator>
  );
}
