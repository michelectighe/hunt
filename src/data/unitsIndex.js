// src/data/unitsIndex.js
// Map region code -> bundled GeoJSON (FeatureCollection)
export const UNITS_BY_REGION = {
  r01: require("../../assets/geo/units/units1.json"),
  r02: require("../../assets/geo/units/units2.json"),
  r03: require("../../assets/geo/units/units3.json"),
  r04: require("../../assets/geo/units/units4.json"),
  r05: require("../../assets/geo/units/units5.json"),
  r06: require("../../assets/geo/units/units6.json"),
  r07a: require("../../assets/geo/units/units7a.json"),
  r07b: require("../../assets/geo/units/units7b.json"),
  r08: require("../../assets/geo/units/units8.json"),
  // add more if you have them
};

// helper: normalize any regionId → "r0NN"
export function toRegionCode(regionId) {
  let num = String(regionId).replace(/^r0*/, "");
  if (!/^\d+$/.test(num)) num = String(regionId);
  const padded = num.padStart(2, "0");
  return `r0${padded}`;
}
