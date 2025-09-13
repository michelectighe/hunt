// src/components/map/PublicLandLayer.js
import React from "react";
import {
  VectorSource,
  FillLayer,
  LineLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";

export default function LakesLayer({
  visible = true,
  minZoom = 0,
  maxZoom = 22,
}) {
  if (!visible) return null;

  return (
    <VectorSource
      id="lakes"
      tileUrlTemplates={["asset://tiles/lakes/{z}/{x}/{y}.pbf"]}
      minZoomLevel={0}
      maxZoomLevel={22}
    >
      <FillLayer
        id="lakes-fill"
        sourceID="lakes"
        sourceLayerID="lakes" // ← matches tippecanoe -L land_type:...
        style={{
          fillColor: [
            "match",
            ["get", "LAKE_NAME"], // ← property name is UPPERCASE in your tiles
            "",
            "blue",
            "blue",
          ],
          fillOpacity: 0.35,
        }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />

      <LineLayer
        id="lakes-outline"
        sourceID="lakes"
        sourceLayerID="lakes"
        style={{ lineColor: "#404040", lineWidth: 0.5, lineOpacity: 0.7 }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />
      {/* Labels */}
      <SymbolLayer
        id="lakes-label"
        sourceID="lakes"
        sourceLayerID="lakes"
        minZoomLevel={0} // show labels from z7+ (tweak as you like)
        maxZoomLevel={22}
        style={{
          symbolPlacement: "point",
          textField: ["get", "LAKE_NAME"], // field is UPPERCASE in your tiles
          textTransform: "uppercase",
          textSize: ["interpolate", ["linear"], ["zoom"], 7, 10, 12, 14],
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
    </VectorSource>
  );
}
