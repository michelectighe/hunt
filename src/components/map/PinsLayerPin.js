import React, { useMemo } from "react";
import { ShapeSource, SymbolLayer } from "@maplibre/maplibre-react-native";

export default function PinsLayer({ pins = [], onPress }) {
  const fc = useMemo(
    () => ({
      type: "FeatureCollection",
      features: pins.map((p) => ({
        type: "Feature",
        properties: {
          id: p.id,
          species: p.species,
          label: "📍", // add a property for the symbol
        },
        geometry: { type: "Point", coordinates: [p.lon, p.lat] },
      })),
    }),
    [pins]
  );

  return (
    <ShapeSource id="pins-src" shape={fc} onPress={onPress}>
      <SymbolLayer
        id="pins-symbols"
        style={{
          textField: ["get", "label"], // use the 📍 property
          textFont: ["Noto Sans Regular"],
          textSize: 24, // scale up or down
          textAllowOverlap: true,
          textAnchor: "bottom", // so the point of the pin sits on the coord
          symbolZOrder: 1,
        }}
      />
    </ShapeSource>
  );
}
