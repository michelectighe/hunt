export const pickProp = (obj, keys) => {
  for (const k of keys) if (obj && obj[k] != null) return obj[k];
  return undefined;
};
export const toStr = (v) => (v == null ? null : v.toString?.() ?? String(v));

export const getSynopsisFor = (unitId, all) =>
  unitId ? (all ?? {})[unitId] ?? null : null;
