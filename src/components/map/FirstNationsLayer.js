// src/components/map/PublicLandLayer.js
import React from "react";
import {
  VectorSource,
  FillLayer,
  LineLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";

export default function FirstNationsLayer({
  visible = true,
  minZoom = 0,
  maxZoom = 22,
}) {
  if (!visible) return null;

  return (
    <VectorSource
      id="fn"
      tileUrlTemplates={["asset://tiles/fn/{z}/{x}/{y}.pbf"]}
      minZoomLevel={0}
      maxZoomLevel={22}
    >
      <FillLayer
        id="fn-fill"
        sourceID="fn"
        sourceLayerID="fn" // ← matches tippecanoe -L land_type:...
        style={{
          fillColor: [
            "match",
            ["get", "ENGLISH_NAME"], // ← property name is UPPERCASE in your tiles
            "",
            "red",
            "#CCC",
          ],
          fillOpacity: 0.35,
        }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />

      <LineLayer
        id="fn-outline"
        sourceID="fn"
        sourceLayerID="fn"
        style={{ lineColor: "#404040", lineWidth: 0.5, lineOpacity: 0.7 }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />
      {/* Labels */}
      <SymbolLayer
        id="fn-label"
        sourceID="fn"
        sourceLayerID="fn"
        minZoomLevel={7} // show labels from z7+ (tweak as you like)
        maxZoomLevel={22}
        style={{
          symbolPlacement: "point",
          textField: ["get", "ENGLISH_NAME"], // field is UPPERCASE in your tiles
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
