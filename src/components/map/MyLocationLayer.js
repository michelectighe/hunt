// File: src/components/map/MyLocationLayer.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo } from "react";
import { ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";

export default function MyLocationLayer({ coords }) {
  const shape = useMemo(() => {
    if (!coords) return null;
    return {
      type: "FeatureCollection",
      features: [
        {
          type: "Feature",
          geometry: {
            type: "Point",
            coordinates: [coords.longitude, coords.latitude],
          },
          properties: {},
        },
      ],
    };
  }, [coords]);

  if (!shape) return null;
  return (
    <ShapeSource id="me-src" shape={shape}>
      <SymbolLayer
        id="me-dot"
        style={{
          textField: "•",
          textSize: 36,
          textColor: "#0ea5e9",
          textFont: ["Noto Sans Regular"],
          textHaloColor: "#ffffff",
          textHaloWidth: 1.5,
          textAllowOverlap: true,
          symbolPlacement: "point",
        }}
      />
    </ShapeSource>
  );
}
