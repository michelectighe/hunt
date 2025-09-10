// // utils/ownership.ts
// import * as turf from "@turf/turf";

// // ⚠️ Point to the region file you’re using
// //const raw = require("../../assets/ownership_region3.json");

// export type Own = "crown" | "private" | "unknown";

// // Normalize features to polygonal only
// const FEATURES: GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon>[] =
//   (() => {
//     const arr =
//       raw?.type === "FeatureCollection"
//         ? raw.features
//         : Array.isArray(raw)
//         ? raw
//         : raw?.type
//         ? [raw]
//         : [];
//     return arr.filter((f: any) => {
//       const g = f?.geometry;
//       return (
//         g &&
//         (g.type === "Polygon" || g.type === "MultiPolygon") &&
//         Array.isArray(g.coordinates) &&
//         g.coordinates.length > 0
//       );
//     });
//   })();

// // Compute a coarse extent to tell if a point is even in this region file
// const REGION_BBOX = turf.bbox({
//   type: "FeatureCollection",
//   features: FEATURES,
// });

// function inExtent(lat: number, lon: number) {
//   const [minX, minY, maxX, maxY] = REGION_BBOX;
//   return lon >= minX && lon <= maxX && lat >= minY && lat <= maxY;
// }

// // Detect whether the file has any 'private' features (if you later load both)
// const HAS_PRIVATE = FEATURES.some((f) =>
//   String(f.properties?.own ?? f.properties?.OwnerType ?? "")
//     .toLowerCase()
//     .includes("private")
// );

// export function ownershipAt(lat: number, lon: number): Own {
//   const pt = turf.point([lon, lat]);

//   // If we’re clearly outside the region file’s extent, don’t guess
//   if (!inExtent(lat, lon)) {
//     console.log("outside region");
//     return "unknown";
//   }

//   for (const f of FEATURES) {
//     try {
//       if (turf.booleanPointInPolygon(pt, f as any)) {
//         const ownRaw = (
//           f.properties?.own ??
//           f.properties?.OwnerType ??
//           ""
//         ).toLowerCase();

//         if (ownRaw.includes("private")) return "private";
//         console.log("here");
//         console.log("raw", ownRaw.value);
//         if (
//           ownRaw.includes("crown") ||
//           ownRaw.includes("provincial") ||
//           ownRaw.includes("unclassified") ||
//           ownRaw.includes("untitled") ||
//           ownRaw.includes("reserve") ||
//           ownRaw.includes("unsurveyed")
//         ) {
//           return "crown"; // treat all these as huntable/public
//         }
//         console.log("raw", ownRaw.value);
//         return "unknown";
//       }
//     } catch {
//       // skip invalid feature
//     }
//   }

//   // No polygon hit:
//   // If the dataset is crown-only (no private features present), then
//   // being outside any polygon means PRIVATE (within the region).
//   if (!HAS_PRIVATE) return "private";

//   // Otherwise, we loaded mixed ownership but still didn’t match — unknown.
//   return "unknown";
// }
