// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/SelectionPill.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from "react-native";
import { getSynopsisFor } from "../utils/misc";

const renderSeasons = (label, seasons) => {
  if (!seasons || !seasons.length) return null;
  return (
    <>
      <Text style={styles.spLabel}>{label}</Text>
      {seasons.map((s, i) => {
        const hasDates = s.open && s.open !== "—" && s.close && s.close !== "—";
        const when = hasDates ? `${s.open}–${s.close}` : "";
        const bag = s.bag && s.bag !== "—" ? ` · bag ${s.bag}` : "";
        const notes = s.notes ? ` · ${s.notes}` : "";
        const cls = s.class ? s.class + (when ? ": " : " ") : "";
        return (
          <Text key={`${label}-${i}`} style={styles.spRow}>
            {`${cls}${when}${bag}${notes}`.trim()}
          </Text>
        );
      })}
    </>
  );
};

export default function SelectionPill({ selected, onClose, synopsisByUnit }) {
  if (!selected) return null;

  return (
    <View style={styles.pill}>
      <View style={styles.pillHeader}>
        <Text style={styles.pillTitle}>
          {selected.type === "unit"
            ? `Unit ${selected.id ?? "?"}`
            : `Region ${selected.name ?? selected.id ?? "?"}`}
        </Text>
        <TouchableOpacity
          onPress={onClose}
          hitSlop={{ top: 10, right: 10, bottom: 10, left: 10 }}
        >
          <Text style={styles.pillClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.pillScroll}
        showsVerticalScrollIndicator={false}
      >
        {selected.type === "unit" ? (
          (() => {
            const s = getSynopsisFor(selected.id, synopsisByUnit);
            return (
              <>
                {renderSeasons("Elk", s?.elk)}
                {renderSeasons("Mule deer", s?.mule_deer)}
                {renderSeasons("White-tailed deer", s?.white_tailed_deer)}
                {renderSeasons("Moose", s?.moose)}
                {renderSeasons("Black bear", s?.black_bear)}
                {renderSeasons("Cougar", s?.cougar)}
                {renderSeasons("Wolf", s?.wolf)}
                {renderSeasons("Coyote", s?.coyote)}
                {renderSeasons("Bobcat", s?.bobcat)}
                {renderSeasons("Lynx", s?.lynx)}
                {renderSeasons("Grouse", s?.upland_grouse)}
                {renderSeasons("Ptarmigan", s?.ptarmigan)}
                {renderSeasons("Partridge", s?.partridge)}
                {renderSeasons("Pheasant", s?.pheasant)}
                {renderSeasons("Quail", s?.quail)}
                {renderSeasons("Dove", s?.dove)}
                {renderSeasons("Band-tailed pigeon", s?.band_tailed_pigeon)}
                {s?.waterfowl?.length ? (
                  <>
                    <Text style={styles.spLabel}>Waterfowl</Text>
                    {s.waterfowl.map((w, i) => (
                      <Text key={`wf-${i}`} style={styles.spRow}>
                        {(w.class ? w.class + ": " : "") +
                          `${w.open}–${w.close}` +
                          (w.bag ? ` · bag ${w.bag}` : "") +
                          (w.notes ? ` · ${w.notes}` : "")}
                      </Text>
                    ))}
                  </>
                ) : null}
                {Array.isArray(s?.notes) && s.notes.length > 0 ? (
                  <Text style={styles.pillBodyMuted}>
                    {s.notes.join(" • ")}
                  </Text>
                ) : null}
              </>
            );
          })()
        ) : (
          <Text style={styles.pillBodyMuted}>
            Long-press on the map to select a region; tap on a unit to see
            unit-specific seasons.
          </Text>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  pill: {
    position: "absolute",
    bottom: 64,
    alignSelf: "center",
    width: "94%",
    backgroundColor: "rgba(0,0,0,0.85)",
    borderRadius: 16,
    paddingHorizontal: 14,
    paddingTop: 10,
    paddingBottom: 12,
  },
  pillHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  pillClose: { color: "#9ca3af", fontSize: 18, fontWeight: "700" },
  pillScroll: { maxHeight: 280 },
  pillTitle: { color: "#fff", fontSize: 16, fontWeight: "700" },
  pillBodyMuted: { color: "#d1d5db", fontSize: 13, marginTop: 8 },
  spLabel: { color: "#f3f4f6", fontSize: 13, fontWeight: "700", marginTop: 6 },
  spRow: { color: "#fff", fontSize: 13, marginTop: 2 },
});
