// src/components/map/RiversLayer.js
import React from "react";
import { LineLayer, SymbolLayer } from "@maplibre/maplibre-react-native";

export default function RiversLayer({
  visible = true,
  aboveLayerID,
  belowLayerID,
}) {
//  if (!visible) return null;

  const SOURCE_ID = "rivers-src";
  const SOURCE_LAYER = "rivers";

  return (
    <>
      <LineLayer
        id="rivers-line"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          lineColor: "#2980b9",
          lineWidth: 1.2,
          lineOpacity: 0.9,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <SymbolLayer
        id="rivers-label"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          symbolPlacement: "line",
          textField: ["get", "RIVER_NAME"],
          textSize: 12,
          textColor: "#111",
          textHaloColor: "#fff",
          textHaloWidth: 1,
          textFont: ["Noto Sans Regular"],
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
    </>
  );
}
