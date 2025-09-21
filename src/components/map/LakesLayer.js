// src/components/map/LakesLayer.js
import React from "react";
import { FillLayer, LineLayer, SymbolLayer } from "@maplibre/maplibre-react-native";

export default function LakesLayer({
  visible = true,
  aboveLayerID,
  belowLayerID,
}) {
 // if (!visible) return null;

  const SOURCE_ID = "lakes-src"; // must match offline-basic.json
  const SOURCE_LAYER = "lakes"; // confirm this is the internal layer name

  return (
    <>
      <FillLayer
        id="lakes-fill"
        visibility={visible}
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          fillColor: "#4fa3ff",
          fillOpacity: 0.35,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <LineLayer
        id="lakes-outline"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          lineColor: "#1d78d6",
          lineWidth: 0.6,
          lineOpacity: 0.9,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <SymbolLayer
        id="lakes-label"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        minZoomLevel={0} // show labels from z7+ (tweak as you like)
        style={{
          visibility: visible ? "visible" : "none",
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
    </>
  );
}
