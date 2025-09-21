// src/components/map/PrivateLandLayer.js
import React from "react";
import { FillLayer, LineLayer } from "@maplibre/maplibre-react-native";

export default function PrivateLandLayer({
  visible = true,
  aboveLayerID,
  belowLayerID,
}) {
 // if (!visible) return null;

  const SOURCE_ID = "fown-src";
  const SOURCE_LAYER = "fown"; 

  return (
    <>
      <FillLayer
        id="fown-fill"
        sourceID={SOURCE_ID}
        sourceLayerID={SOURCE_LAYER}
        style={{
            fillColor: "#22c55e",
            fillOpacity: visible ? 0.23 : 0.01,
        }}
        aboveLayerID={aboveLayerID}
        belowLayerID={belowLayerID}
      />
      <LineLayer
        id="private-outline"
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
