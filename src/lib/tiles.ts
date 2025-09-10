export function lon2tile(lon: number, z: number) {
  return Math.floor(((lon + 180) / 360) * Math.pow(2, z));
}
export function lat2tile(lat: number, z: number) {
  const rad = (lat * Math.PI) / 180;
  return Math.floor(
    ((1 - Math.log(Math.tan(rad) + 1 / Math.cos(rad)) / Math.PI) / 2) *
      Math.pow(2, z)
  );
}
