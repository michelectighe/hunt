// 1) Build a tiny index of Unit bounding boxes
import Flatbush from 'flatbush';        // or rbush
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';

// unitsIndex: [{id, minX, minY, maxX, maxY}]  // from your precompute step
const index = new Flatbush(unitsIndex.length);
for (const u of unitsIndex) index.add(u.minX, u.minY, u.maxX, u.maxY);
index.finish();

async function findUnitForPoint(lon, lat) {
  const candidates = index.search(lon, lat, lon, lat); // bbox hit test
  // Load each candidate unit’s actual polygon and do precise PIP
  for (const i of candidates) {
    const unitMeta = unitsIndex[i];
    const unitPoly = await loadUnitPolygon(unitMeta.id); // small GeoJSON
    if (booleanPointInPolygon([lon, lat], unitPoly)) {
      return unitMeta.id;
    }
  }
  return null;
}

async function findParcelInUnit(lon, lat, unitId) {
  // Lazy-load parcels just for this unit
  const parcels = await loadUnitParcels(unitId); // GeoJSON FeatureCollection
  // Optional: build a small Flatbush for parcel bboxes here for speed
  for (const f of parcels.features) {
    if (booleanPointInPolygon([lon, lat], f)) return f; // precise
  }
  return null;
}
