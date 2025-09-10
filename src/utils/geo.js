// Lightweight bbox + point-in-polygon helpers
export function bboxFromGeometry(geom) {
  if (!geom) return null;
  let minX = Infinity,
    minY = Infinity,
    maxX = -Infinity,
    maxY = -Infinity;
  const scan = (coords) => {
    if (typeof coords[0] === "number") {
      const [x, y] = coords;
      if (x < minX) minX = x;
      if (y < minY) minY = y;
      if (x > maxX) maxX = x;
      if (y > maxY) maxY = y;
      return;
    }
    for (const c of coords) scan(c);
  };
  scan(geom.coordinates);
  if (minX === Infinity) return null;
  return [minX, minY, maxX, maxY];
}

const pointInRing = ([x, y], ring) => {
  let inside = false;
  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const xi = ring[i][0],
      yi = ring[i][1];
    const xj = ring[j][0],
      yj = ring[j][1];
    const intersect =
      yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
};
const pointInPolygon = (pt, poly) => {
  if (!poly.length) return false;
  if (!pointInRing(pt, poly[0])) return false; // outside shell
  for (let i = 1; i < poly.length; i++)
    if (pointInRing(pt, poly[i])) return false; // in hole
  return true;
};

export const findRegionByPoint = (lng, lat, regionsFC) => {
  const fc = regionsFC;
  if (!fc?.features?.length) return null;
  const pt = [lng, lat];
  for (const f of fc.features) {
    const g = f.geometry;
    if (!g) continue;
    if (g.type === "Polygon") {
      if (pointInPolygon(pt, g.coordinates)) return f;
    } else if (g.type === "MultiPolygon") {
      for (const poly of g.coordinates) if (pointInPolygon(pt, poly)) return f;
    }
  }
  return null;
};
