// src/components/map/PublicLandLayer.js
import React from "react";
import { FillLayer, LineLayer } from "@maplibre/maplibre-react-native";

export default function PublicLandLayer({
  visible = true,
  aboveLayerID,
  belowLayerID,
}) {
 // if (!visible) return null;
console.log("public visible:", visible);
  const SOURCE_ID = "fown-src";
  const SOURCE_LAYER = "fown"; // confirm internal layer name

  return (
    <>
      <FillLayer
        id="fown-fill"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          fillColor: "#22c55e",
          fillOpacity: 0.23,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <LineLayer
        id="fown-outline"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
          visibility: visible ? "visible" : "none",
          lineColor: "#15803d",
          lineWidth: 0.8,
          lineOpacity: 0.9,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
    </>
  );
}
