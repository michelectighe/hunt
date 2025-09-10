// parse a single token like "51.87", "51.87N", "-119.10", "119.10W"
export function parseCoordToken(s: string, kind: "lat" | "lon"): number | null {
  if (!s) return null;
  const cleaned = s.trim().replace(/[°]/g, "");
  const m = cleaned.match(/^([+-]?\d+(?:\.\d+)?)([NnSsEeWw])?$/);
  if (!m) return null;

  let v = parseFloat(m[1]);
  const card = m[2]?.toUpperCase();

  if (kind === "lat") {
    if (card === "S") v = -Math.abs(v);
    if (card === "N") v = Math.abs(v);
    if (v < -90 || v > 90) return null;
  } else {
    if (card === "W") v = -Math.abs(v);
    if (card === "E") v = Math.abs(v);
    if (v < -180 || v > 180) return null;
  }
  return v;
}
