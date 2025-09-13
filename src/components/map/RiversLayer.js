// src/components/map/PublicLandLayer.js
import React from "react";
import {
  VectorSource,
  FillLayer,
  LineLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";

export default function RiversLayer({
  visible = true,
  minZoom = 0,
  maxZoom = 22,
}) {
  if (!visible) return null;

  return (
    <VectorSource
      id="rivers"
      tileUrlTemplates={["asset://tiles/rivers/{z}/{x}/{y}.pbf"]}
      minZoomLevel={0}
      maxZoomLevel={22}
    >
      {/* <FillLayer
        id="rivers-fill"
        sourceID="rivers"
        sourceLayerID="rivers" // ← matches tippecanoe -L land_type:...
        style={{
          fillColor: [
            "match",
            ["get", "RIVER_NAME"], // ← property name is UPPERCASE in your tiles
            "",
            "blue",
            "blue",
          ],
          fillOpacity: 0.35,
        }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      /> */}

      <LineLayer
        id="rivers-outline"
        sourceID="rivers"
        sourceLayerID="rivers"
        style={{ lineColor: "blue", lineWidth: 0.5, lineOpacity: 0.7 }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />
      {/* Labels */}
      <SymbolLayer
        id="rivers-label"
        sourceID="rivers"
        sourceLayerID="rivers"
        minZoomLevel={7} // show labels from z7+ (tweak as you like)
        maxZoomLevel={22}
        style={{
          symbolPlacement: "line-center",
          textField: ["get", "RIVER_NAME"], // field is UPPERCASE in your tiles
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
