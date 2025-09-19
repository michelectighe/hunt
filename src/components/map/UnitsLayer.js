// ─────────────────────────────────────────────────────────────────────────────
// File: src/components/map/UnitsLayer.js
// ─────────────────────────────────────────────────────────────────────────────
import React, { useMemo } from "react";
import {
  ShapeSource,
  LineLayer,
  FillLayer,
  SymbolLayer,
} from "@maplibre/maplibre-react-native";
// If you want to keep bundle size small, prefer the scoped imports:
import centroid from "@turf/centroid";
import { featureCollection } from "@turf/helpers";
import unitLabels from "../../../assets/geo/unitPoints.json"

export default function UnitsLayer({
  unitsFC,
  onPress,
  unitFilter,
  showUnitLabels,
}) {
  // Build a centroid FeatureCollection (one point per polygon feature)
  const unitCentroids = useMemo(() => {
    if (!unitsFC?.features?.length) return featureCollection([]);

    const points = [];
    for (const f of unitsFC.features) {
      try {
        if (!f?.geometry) continue; // guard against no-geometry features
        const c = centroid(f, { properties: f.properties || {} });
        points.push(c);
      } catch (e) {
        // bad/empty geometry — skip
      }
    }
    return featureCollection(points);
  }, [unitsFC]);

  return (
    <>
      {/* POLYGON SOURCE */}
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
      </ShapeSource>

      <ShapeSource id="unit-labels" shape={unitLabels}>
        <SymbolLayer
          id="unit-labels-layer"
          style={{
            symbolPlacement: "point",
            textField: ["get", "UNIT_ID"],
            textSize: 12,
            textFont: ["Noto Sans Regular"],
            textColor: "#111",
            textHaloColor: "#fff",
            textHaloWidth: 1,
          }}
        />
      </ShapeSource>

      {/* {showUnitLabels ? (
        <ShapeSource id="unit-centroids-src" shape={unitCentroids}>
          <SymbolLayer
            id="unit-label"
            style={{
              // Force point placement (single label per centroid)
              symbolPlacement: "point",
              textField: ["get", "UNIT_ID"], // uses existing property
              textTransform: "uppercase",
              textSize: ["interpolate", ["linear"], ["zoom"], 7, 10, 12, 34],
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
        </ShapeSource>
      ) : null} */}
    </>
  );
}
