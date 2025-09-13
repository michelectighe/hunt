// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/map/RegionsLayer.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  ShapeSource,
  LineLayer,
  FillLayer,
  SymbolLayer,
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
      <SymbolLayer
        id="region-label"
        sourceID="regions"
        sourceLayerID="regions"
        minZoomLevel={0} // show labels from z7+ (tweak as you like)
        maxZoomLevel={22}
        style={{
          symbolPlacement: "point",
          textField: ["get", "REGION_ID"], // field is UPPERCASE in your tiles
          textTransform: "uppercase",
          textSize: ["interpolate", ["linear"], ["zoom"], 7, 10, 12, 34],
          textColor: "#111",
          textFont: ["Noto Sans Regular"],
          textHaloColor: "#ffffff",
          textHaloWidth: 1.2,
          textAllowOverlap: false,
          textIgnorePlacement: false,
          textOptional: true,
          textRadialOffset: 0.2,
        }}
      />
    </ShapeSource>
  );
}
