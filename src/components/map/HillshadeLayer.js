// src/components/map/HillshadeLayer.js
import React from "react";
import { RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";

export default function HillshadeLayer({
  visible = true,
  opacity = 0.55,
  minZoom = 4,
}) {
  if (!visible) return null;

  // Use asset:// so it works offline (ensure the folder is bundled)
  const tiles = ["asset://tiles/hillshade/{z}/{x}/{y}.png"];

  return (
    <RasterSource
      id="hillshade"
      tileUrlTemplates={["asset://tiles/hillshade/{z}/{x}/{y}.png"]}
      tileSize={256}
      minZoomLevel={5}
    >
      <RasterLayer
        id="hillshade-layer"
        sourceID="hillshade"
        style={{ rasterOpacity: 0.55 }}
      />
    </RasterSource>
  );
}
