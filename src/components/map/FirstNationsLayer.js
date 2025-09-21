// src/components/map/FirstNationsLayer.js
import React from "react";
import { FillLayer, LineLayer, SymbolLayer } from "@maplibre/maplibre-react-native";

export default function FirstNationsLayer({ visible = true, aboveLayerID, belowLayerID }) {
   // if (!visible) return null;

  const SOURCE_ID = "fn-src";
  const SOURCE_LAYER = "fn"; // confirm internal layer name

  return (
    <>
      <FillLayer
        id="fn-fill"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          fillColor: "#f59e0b",
          fillOpacity: 0.2,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <LineLayer
        id="fn-outline"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          lineColor: "#b45309",
          lineWidth: 0.8,
          lineOpacity: 0.9,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <SymbolLayer
        id="fn-label"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        minZoomLevel={0} // show labels from z7+ (tweak as you like)
        style={{
          visibility: visible ? "visible" : "none",
          symbolPlacement: "point",
          textField: ["get", "BAND_NAME"], // field is UPPERCASE in your tiles
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
