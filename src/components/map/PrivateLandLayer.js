// src/components/map/PublicLandLayer.js
import React from "react";
import {
  VectorSource,
  FillLayer,
  LineLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";

import { fileTemplate } from "../../utils/fileTemplates";

export default function PrivateLandLayer({
  visible = true,
  minZoom = 0,
  maxZoom = 22,
}) {
  if (!visible) return null;

  return (
    <VectorSource id="privateland" tileUrlTemplates={[fileTemplate("fown_province","pbf")]}>
    {/* <VectorSource
      id="privateland"
      tileUrlTemplates={["asset://tiles/fown/{z}/{x}/{y}.pbf"]}
      minZoomLevel={0}
      maxZoomLevel={22}
    > */}
      <FillLayer
        id="privateland-fill"
        sourceID="privateland"
        sourceLayerID="fown" // ← matches tippecanoe -L land_type:...
        style={{
          fillColor: [
            "match",
            ["get", "OWNER_TYPE"], // ← property name is UPPERCASE in your tiles
            "PRIVATE",
            "red",
            "#CCC",
          ],
          fillOpacity: 0.35,
        }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />

      <LineLayer
        id="privateland-outline"
        sourceID="privateland"
        sourceLayerID="fown"
        style={{ lineColor: "#404040", lineWidth: 0.5, lineOpacity: 0.7 }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />
      {/* Labels */}
      {/* <SymbolLayer
        id="privateland-label"
        sourceID="privateland"
        sourceLayerID="fown"
        minZoomLevel={7} // show labels from z7+ (tweak as you like)
        maxZoomLevel={22}
        style={{
          symbolPlacement: "point",
          textField: ["get", "OWNER_TYPE"], // field is UPPERCASE in your tiles
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
      /> */}
    </VectorSource>
  );
}
