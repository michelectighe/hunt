import React, { useCallback, useMemo, useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { getPins } from "../data/db";
import { Pin, Species } from "../../types";
import { useSpeciesCtx } from "../context/SpeciesContext";
import { getMoonData } from "../lib/moon";
import { SpeciesFilterList } from "../components/filters/SpeciesFilterList";
import {
  MoonPhaseFilterList,
  MoonPhase,
} from "../components/filters/MoonPhaseFilterList";

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

function getDisplayMoon(p: Pin) {
  if (p.moonPhase && p.moonIllum != null) {
    return {
      name: p.moonPhase,
      pct: Math.round(p.moonIllum * 100),
      emoji: emojiForPhase(p.moonPhase),
    };
  }
  const m = getMoonData(new Date(p.ts));
  return {
    name: m.phaseName,
    pct: Math.round(m.illumination * 100),
    emoji: emojiForPhase(m.phaseName),
  };
}

export default function LogbookScreen() {
  const [pins, setPins] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  const { species: speciesList } = useSpeciesCtx();
  const [speciesFilter, setSpeciesFilter] = useState<Species | "all">("all");
  const [moonFilter, setMoonFilter] = useState<MoonPhase | "all">("all");

  async function load() {
    const rs = await getPins();
    setPins(rs);
  }

  useFocusEffect(
    useCallback(() => {
      load();
    }, [])
  );

  const filtered = useMemo(() => {
    return pins.filter((p) => {
      const speciesOk = speciesFilter === "all" || p.species === speciesFilter;
      const moonOk =
        moonFilter === "all" || getDisplayMoon(p).name === moonFilter;
      return speciesOk && moonOk;
    });
  }, [pins, speciesFilter, moonFilter]);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.listWrap}>
        <Text style={styles.listTitle}>Recent Pins</Text>

        {/* Side-by-side vertical filters */}
        <View style={styles.filtersRow}>
          <SpeciesFilterList
            items={speciesList}
            value={speciesFilter}
            onChange={setSpeciesFilter}
            style={{ marginRight: 8 }}
          />
          <MoonPhaseFilterList
            value={moonFilter}
            onChange={setMoonFilter}
            style={{ marginLeft: 8 }}
          />
        </View>

        <FlatList
          data={filtered}
          keyExtractor={(i) => i.id}
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
            const moon = getDisplayMoon(item);
            return (
              <View style={styles.row}>
                <Text style={styles.rowMain}>
                  {item.own.toUpperCase()} • {item.species.toUpperCase()} •{" "}
                  {new Date(item.ts).toLocaleString()}
                </Text>
                <Text style={styles.rowSub}>
                  {item.lat.toFixed(5)}, {item.lon.toFixed(5)}
                </Text>
                <Text style={styles.rowSub}>
                  {moon.emoji} {moon.name} • {moon.pct}%
                </Text>
                {item.note ? (
                  <Text style={[styles.rowSub, { marginTop: 4 }]}>
                    {item.note}
                  </Text>
                ) : null}
              </View>
            );
          }}
        />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#0b0f0d" },
  listWrap: { flex: 1, paddingHorizontal: 14, paddingTop: 10 },
  listTitle: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 6,
  },
  sep: { height: 1, backgroundColor: "#25302a" },
  row: { paddingVertical: 8 },
  rowMain: { color: "#e8f1ec", fontWeight: "600" },
  rowSub: { color: "#9fb1a7", fontSize: 12, marginTop: 2 },

  filtersRow: { flexDirection: "row", gap: 0, marginBottom: 10 },
});
