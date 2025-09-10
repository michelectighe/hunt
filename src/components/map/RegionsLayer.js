// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/map/RegionsLayer.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  ShapeSource,
  LineLayer,
  FillLayer,
} from "@maplibre/maplibre-react-native";

export default function RegionsLayer({ regionsFC, visible, regionFilter }) {
  if (!visible) return null;
  return (
    <ShapeSource id="regions-src" shape={regionsFC}>
      <FillLayer
        id="regions-hit"
        style={{ fillColor: "#000000", fillOpacity: 0.01 }}
      />
      <LineLayer
        id="regions-outline"
        style={{ lineColor: "#111827", lineWidth: 2, lineJoin: "round" }}
      />
      <LineLayer
        id="regions-highlight"
        filter={regionFilter}
        style={{ lineColor: "#2563eb", lineWidth: 4 }}
      />
    </ShapeSource>
  );
}
