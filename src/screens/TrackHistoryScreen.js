import React, { useCallback, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  StyleSheet,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from "react-native";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { getTracks } from "../data/tracks";
import type { Track } from "../../types";

export default function TrackHistoryScreen() {
  const nav = useNavigation();
  const [tracks, setTracks] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  async function load() {
    const rows = await getTracks();
    setTracks(rows);
  }
  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  return (
    <SafeAreaView style={styles.container}>
      <View style={{ paddingHorizontal: 14, paddingTop: 10, flex: 1 }}>
        <Text style={styles.title}>Tracks</Text>
        <FlatList
          data={tracks}
          keyExtractor={(t) => t.id}
          ItemSeparatorComponent={() => <View style={styles.sep} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                load().finally(() => setRefreshing(false));
              }}
            />
          }
          renderItem={({ item }) => {
            const dur = item.endedTs
              ? Math.max(0, Math.floor((item.endedTs - item.startedTs) / 1000))
              : 0;
            const hh = String(Math.floor(dur / 3600)).padStart(2, "0");
            const mm = String(Math.floor((dur % 3600) / 60)).padStart(2, "0");
            const ss = String(dur % 60).padStart(2, "0");
            const distKm = ((item.distance ?? 0) / 1000).toFixed(2);

            const dateStr = new Date(item.startedTs).toLocaleString();
            const title = item.name ?? dateStr;
            const meta = `${distKm} km • ${hh}:${mm}:${ss}${
              item.name ? ` • ${dateStr}` : ""
            }`;

            return (
              <TouchableOpacity
                style={styles.row}
                onPress={() =>
                  nav.navigate("TrackDetail", { trackId: item.id, title })
                }
              >
                <Text style={styles.rowMain}>{title}</Text>
                <Text style={styles.rowSub}>{meta}</Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0d" },
  title: { color: "#fff", fontSize: 16, fontWeight: "700", marginBottom: 6 },
  sep: { height: 1, backgroundColor: "#25302a" },
  row: { paddingVertical: 10 },
  rowMain: { color: "#e8f1ec", fontWeight: "700" },
  rowSub: { color: "#9fb1a7", fontSize: 12, marginTop: 2 },
});
