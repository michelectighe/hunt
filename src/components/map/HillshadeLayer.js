// src/components/map/HillshadeLayer.js
import React from "react";
import { RasterSource, RasterLayer } from "@maplibre/maplibre-react-native";

export default function HillshadeLayer({
  visible = true,
  opacity = 0.55,
  minZoom = 4,
  maxZoom = 22,
}) {
  if (!visible) return null;

  // Use asset:// so it works offline (ensure the folder is bundled)
  const tiles = ["asset://tiles/hillshade/{z}/{x}/{y}.png"];

  return (
    <RasterSource id="hillshade" tileUrlTemplates={tiles} tileSize={256}>
      <RasterLayer
        id="hillshade-layer"
        style={{
          rasterOpacity: opacity,
          rasterResampling: "linear",
          visibility: visible ? "visible" : "none",
        }}
        minZoomLevel={minZoom}
        maxZoomLevel={maxZoom}
      />
    </RasterSource>
  );
}
