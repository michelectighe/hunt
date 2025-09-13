// src/utils/geojson.js

function isValidGeometry(geom) {
  if (!geom || typeof geom !== "object") return false;
  const { type, coordinates } = geom;
  if (!coordinates) return false;
  const hasEnough = (arr) => Array.isArray(arr) && arr.length >= 4;
  // Minimal checks for MapLibre
  if (type === "Polygon") {
    return (
      Array.isArray(coordinates) &&
      coordinates.length > 0 &&
      hasEnough(coordinates[0])
    );
  }
  if (type === "MultiPolygon") {
    return (
      Array.isArray(coordinates) &&
      coordinates.length > 0 &&
      Array.isArray(coordinates[0]) &&
      coordinates[0].length > 0 &&
      hasEnough(coordinates[0][0])
    );
  }
  if (
    type === "LineString" ||
    type === "MultiLineString" ||
    type === "Point" ||
    type === "MultiPoint"
  ) {
    return Array.isArray(coordinates);
  }
  return false;
}

export function sanitizeFeatureCollection(maybeFc, regionCode = "r??") {
  try {
    if (
      !maybeFc ||
      maybeFc.type !== "FeatureCollection" ||
      !Array.isArray(maybeFc.features)
    ) {
      console.warn(
        `[units] ${regionCode}: not a FeatureCollection with features[]`
      );
      return { type: "FeatureCollection", features: [] };
    }

    // Strip non-RFC7946 members MapLibre dislikes
    const { features } = maybeFc; // drop name/crs silently

    const out = [];
    for (let i = 0; i < features.length; i++) {
      const f = features[i];
      if (!f || f.type !== "Feature") continue;
      if (!isValidGeometry(f.geometry)) {
        console.warn(
          `[units] ${regionCode}: skipped invalid geometry at index ${i}`
        );
        continue;
      }
      const id = f.id != null ? f.id : `${regionCode}:${i}`;
      out.push({ ...f, id });
    }
    return { type: "FeatureCollection", features: out };
  } catch (e) {
    console.warn(`[units] ${regionCode}: sanitize error`, e);
    return { type: "FeatureCollection", features: [] };
  }
}

export function mergeFeatureCollectionsSafe(taggedFcs) {
  const features = [];
  for (const { fc, regionCode } of taggedFcs) {
    const clean = sanitizeFeatureCollection(fc, regionCode);
    features.push(...clean.features);
  }
  return { type: "FeatureCollection", features };
}
