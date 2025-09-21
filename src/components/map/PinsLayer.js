// src/components/map/PinsLayer.
import React, { useMemo } from "react";
import { ShapeSource, CircleLayer } from "@maplibre/maplibre-react-native";

export default function PinsLayer({ pins = [], onPress }) {
  const fc = useMemo(
    () => ({
      type: "FeatureCollection",
      features: pins.map((p) => ({
        type: "Feature",
        properties: { id: p.id, species: p.species },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      })),
    }),
    [pins]
  );

  return (
    <ShapeSource id="pins-src" shape={fc} onPress={onPress}>
      <CircleLayer
        id="pins-circles"
        style={{
          circleRadius: 6,
          circleColor: "#22c55e",
          circleStrokeWidth: 2,
          circleStrokeColor: "#052e1f",
          circleOpacity: 0.95,
        }}
      />
    </ShapeSource>
  );
}
