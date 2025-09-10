// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/map/UnitsLayer.js
// ─────────────────────────────────────────────────────────────────────────────
import React from "react";
import {
  ShapeSource,
  LineLayer,
  FillLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
import { UNIT_ID_FIELD } from "../../utils/fields";

export default function UnitsLayer({
  unitsFC,
  onPress,
  unitFilter,
  showUnitLabels,
}) {
  return (
    <ShapeSource id="units-src" shape={unitsFC} onPress={onPress}>
      <FillLayer
        id="units-fill"
        style={{
          fillColor: "#999999",
          fillOpacity: 0.06,
          fillAntialias: false,
        }}
      />
      <LineLayer
        id="units-outline"
        style={{
          lineColor: "#c2410c",
          lineWidth: 1.6,
          lineJoin: "round",
          lineOpacity: 0.9,
        }}
      />
      <FillLayer
        id="units-highlight"
        filter={unitFilter}
        style={{ fillColor: "#f59e0b", fillOpacity: 0.18 }}
      />
      <LineLayer
        id="units-highlight-outline"
        filter={unitFilter}
        style={{ lineColor: "#f59e0b", lineWidth: 3 }}
      />
      {showUnitLabels ? (
        <SymbolLayer
          id="units-labels"
          style={{
            textField: ["to-string", ["get", UNIT_ID_FIELD]],
            textSize: [
              "interpolate",
              ["linear"],
              ["zoom"],
              5,
              10,
              7,
              12,
              10,
              14,
            ],
            textFont: ["Noto Sans Regular"],
            textColor: "#111827",
            textHaloColor: "#ffffff",
            textHaloWidth: 1.2,
            textAllowOverlap: false,
            symbolPlacement: "point",
            textOpacity: ["step", ["zoom"], 0, 6.2, 1],
            textPadding: 2,
          }}
        />
      ) : null}
    </ShapeSource>
  );
}
