// components/BoundariesOverlay.tsx
import React from "react";
import { Polygon, Polyline } from "react-native-maps";
import unitsFC from "../../assets/units.json"; // FeatureCollection
import regionsFC from "../../assets/regions.json"; // FeatureCollection

type LatLng = { latitude: number; longitude: number };

type Props = {
  showUnits?: boolean; // default true
  showRegions?: boolean; // default true
  unitsStroke?: string; // line color for units
  regionsStroke?: string; // line color for regions
  unitsFill?: string; // fill color for units polygons (usually transparent)
  strokeWidth?: number;
  zIndex?: number;
  // Optional: tap handler to show properties
  onFeaturePress?: (props: Record<string, any>) => void;
};

export const BoundariesOverlay: React.FC<Props> = ({
  showUnits = true,
  showRegions = true,
  unitsStroke = "#3a6d55",
  regionsStroke = "#7a8a82",
  unitsFill = "rgba(0,0,0,0)", // transparent
  strokeWidth = 1.5,
  zIndex = 1,
  onFeaturePress,
}) => {
  return (
    <>
      {showUnits &&
        renderFeatureCollectionAsPolygons(unitsFC, {
          strokeColor: unitsStroke,
          fillColor: unitsFill,
          strokeWidth,
          zIndex,
          onPress: onFeaturePress,
        })}
      {showRegions &&
        renderFeatureCollectionAsOutlines(regionsFC, {
          strokeColor: regionsStroke,
          strokeWidth,
          zIndex,
          onPress: onFeaturePress,
        })}
    </>
  );
};

// --- helpers ---

function renderFeatureCollectionAsPolygons(
  fc: any,
  style: {
    strokeColor: string;
    fillColor: string;
    strokeWidth: number;
    zIndex: number;
    onPress?: (props: Record<string, any>) => void;
  }
) {
  if (!fc || !fc.features) return null;

  const elems: React.ReactNode[] = [];
  let keyCounter = 0;

  for (const f of fc.features) {
    const g = f?.geometry;
    if (!g) continue;

    if (g.type === "Polygon") {
      const rings = g.coordinates as number[][][]; // [ [ [lon,lat], ... ] (outer), [ ... ] (holes)... ]
      const { outer, holes } = ringsToLatLng(rings);

      elems.push(
        <Polygon
          key={`poly-${keyCounter++}`}
          coordinates={outer}
          holes={holes}
          strokeColor={style.strokeColor}
          fillColor={style.fillColor}
          strokeWidth={style.strokeWidth}
          tappable={!!style.onPress}
          zIndex={style.zIndex}
          onPress={() => style.onPress?.(f.properties ?? {})}
        />
      );
    }

    if (g.type === "MultiPolygon") {
      const polys = g.coordinates as number[][][][]; // array of polygons (each with rings)
      for (const rings of polys) {
        const { outer, holes } = ringsToLatLng(rings);
        elems.push(
          <Polygon
            key={`mpoly-${keyCounter++}`}
            coordinates={outer}
            holes={holes}
            strokeColor={style.strokeColor}
            fillColor={style.fillColor}
            strokeWidth={style.strokeWidth}
            tappable={!!style.onPress}
            zIndex={style.zIndex}
            onPress={() => style.onPress?.(f.properties ?? {})}
          />
        );
      }
    }

    if (g.type === "LineString") {
      const pts = (g.coordinates as number[][]).map(ptToLatLng);
      elems.push(
        <Polyline
          key={`line-${keyCounter++}`}
          coordinates={pts}
          strokeColor={style.strokeColor}
          strokeWidth={style.strokeWidth}
          zIndex={style.zIndex}
          tappable={!!style.onPress}
          onPress={() => style.onPress?.(f.properties ?? {})}
        />
      );
    }

    if (g.type === "MultiLineString") {
      const lines = g.coordinates as number[][][];
      for (const line of lines) {
        const pts = line.map(ptToLatLng);
        elems.push(
          <Polyline
            key={`ml-${keyCounter++}`}
            coordinates={pts}
            strokeColor={style.strokeColor}
            strokeWidth={style.strokeWidth}
            zIndex={style.zIndex}
            tappable={!!style.onPress}
            onPress={() => style.onPress?.(f.properties ?? {})}
          />
        );
      }
    }
  }

  return <>{elems}</>;
}

function renderFeatureCollectionAsOutlines(
  fc: any,
  style: {
    strokeColor: string;
    strokeWidth: number;
    zIndex: number;
    onPress?: (props: Record<string, any>) => void;
  }
) {
  // Treat regions as outlines: if polygons, draw only the outer ring as a Polyline (no fill)
  if (!fc || !fc.features) return null;
  const elems: React.ReactNode[] = [];
  let keyCounter = 0;

  for (const f of fc.features) {
    const g = f?.geometry;
    if (!g) continue;

    if (g.type === "Polygon") {
      const rings = g.coordinates as number[][][];
      const outer = rings[0]?.map(ptToLatLng) ?? [];
      elems.push(
        <Polyline
          key={`reg-p-${keyCounter++}`}
          coordinates={outer}
          strokeColor={style.strokeColor}
          strokeWidth={style.strokeWidth}
          zIndex={style.zIndex}
          tappable={!!style.onPress}
          onPress={() => style.onPress?.(f.properties ?? {})}
        />
      );
    }

    if (g.type === "MultiPolygon") {
      const polys = g.coordinates as number[][][][];
      for (const rings of polys) {
        const outer = rings[0]?.map(ptToLatLng) ?? [];
        elems.push(
          <Polyline
            key={`reg-mp-${keyCounter++}`}
            coordinates={outer}
            strokeColor={style.strokeColor}
            strokeWidth={style.strokeWidth}
            zIndex={style.zIndex}
            tappable={!!style.onPress}
            onPress={() => style.onPress?.(f.properties ?? {})}
          />
        );
      }
    }

    if (g.type === "LineString") {
      const pts = (g.coordinates as number[][]).map(ptToLatLng);
      elems.push(
        <Polyline
          key={`reg-l-${keyCounter++}`}
          coordinates={pts}
          strokeColor={style.strokeColor}
          strokeWidth={style.strokeWidth}
          zIndex={style.zIndex}
          tappable={!!style.onPress}
          onPress={() => style.onPress?.(f.properties ?? {})}
        />
      );
    }

    if (g.type === "MultiLineString") {
      const lines = g.coordinates as number[][][];
      for (const line of lines) {
        const pts = line.map(ptToLatLng);
        elems.push(
          <Polyline
            key={`reg-ml-${keyCounter++}`}
            coordinates={pts}
            strokeColor={style.strokeColor}
            strokeWidth={style.strokeWidth}
            zIndex={style.zIndex}
            tappable={!!style.onPress}
            onPress={() => style.onPress?.(f.properties ?? {})}
          />
        );
      }
    }
  }

  return <>{elems}</>;
}

function ptToLatLng(pt: number[]): LatLng {
  // GeoJSON is [lon, lat]
  return { latitude: pt[1], longitude: pt[0] };
}

function ringsToLatLng(rings: number[][][]): {
  outer: LatLng[];
  holes: LatLng[][];
} {
  const outer = (rings[0] ?? []).map(ptToLatLng);
  const holes = rings.slice(1).map((ring) => ring.map(ptToLatLng));
  return { outer, holes };
}
