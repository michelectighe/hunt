
// ─────────────────────────────────────────────────────────────────────────────
// File: src/hooks/useMapSelection.js
// ─────────────────────────────────────────────────────────────────────────────
import { useEffect, useMemo, useState } from "react";
import { bboxFromGeometry, findRegionByPoint } from "../utils/geo";
import { pickProp, toStr, getSynopsisFor } from "../utils/misc";
import { UNIT_ID_FIELD, REGION_ID_FIELDS, REGION_NAME_FIELDS, NO_MATCH } from "../utils/fields";

/**
 * Centralizes selection + filters + camera fitting + search
 * @param {object} params
 * @param {any} params.regionsFC GeoJSON FeatureCollection for regions
 * @param {any} params.unitsFC GeoJSON FeatureCollection for units
 * @param {any} params.synopsisByUnit mapping from unitId -> synopsis
 * @param {React.RefObject} params.cameraRef Camera ref to call fitBounds
 */
export default function useMapSelection({ regionsFC, unitsFC, synopsisByUnit, cameraRef }) {
  const [selected, setSelected] = useState(null);
  const [showRegions, setShowRegions] = useState(true);
  const [showUnitLabels, setShowUnitLabels] = useState(true);

  // filters for style layers
  const unitFilter = useMemo(
    () => [
      "==",
      ["to-string", ["get", UNIT_ID_FIELD]],
      selected?.type === "unit" && selected.id ? selected.id : NO_MATCH,
    ],
    [selected]
  );

  const regionFilter = useMemo(() => {
    const id = selected?.type === "region" && selected.id ? selected.id : NO_MATCH;
    return [
      "any",
      ...REGION_ID_FIELDS.map((f) => ["==", ["to-string", ["get", f]], id])
    ];
  }, [selected]);

  // Fit to selected geometry
  useEffect(() => {
    if (!selected?.geometry || !cameraRef?.current) return;
    const b = bboxFromGeometry(selected.geometry);
    if (!b) return;
    const [minX, minY, maxX, maxY] = b;
    cameraRef.current.fitBounds([maxX, maxY], [minX, minY], 32, 500);
  }, [selected?.geometry, cameraRef]);

  // Precompute full-BC bbox
  const bcBBox = useMemo(() => {
    const fc = regionsFC;
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    for (const f of fc.features ?? []) {
      const b = bboxFromGeometry(f.geometry);
      if (!b) continue;
      const [x0, y0, x1, y1] = b;
      if (x0 < minX) minX = x0;
      if (y0 < minY) minY = y0;
      if (x1 > maxX) maxX = x1;
      if (y1 > maxY) maxY = y1;
    }
    if (minX === Infinity) return null;
    return [minX, minY, maxX, maxY];
  }, [regionsFC]);

  const zoomToBC = () => {
    if (!bcBBox || !cameraRef?.current) return;
    const [minX, minY, maxX, maxY] = bcBBox;
    cameraRef.current.fitBounds([maxX, maxY], [minX, minY], 32, 500);
  };

  // Handlers
  const handleUnitPress = (e) => {
    const f = e?.features?.[0];
    if (!f) return;
    const unitId = toStr(f.properties?.[UNIT_ID_FIELD] ?? f.id);
    const syn = (unitId && (synopsisByUnit ?? {})[unitId]) || null;
    setSelected({ type: "unit", id: unitId, synopsis: syn, geometry: f.geometry });
  };

  const handleMapLongPress = (evt) => {
    const coords = evt?.geometry?.coordinates;
    if (!coords) return;
    const hit = findRegionByPoint(coords[0], coords[1], regionsFC);
    if (!hit) return;
    const props = hit.properties ?? {};
    const regionId = toStr(pickProp(props, REGION_ID_FIELDS) ?? hit.id);
    const regionName = toStr(pickProp(props, REGION_NAME_FIELDS) ?? null);
    setSelected({ type: "region", id: regionId, name: regionName, geometry: hit.geometry });
  };

  const goToUnit = (queryText) => {
    const q = (queryText || "").trim().toLowerCase();
    if (!q) return;
    const fc = unitsFC;
    const found = (fc.features ?? []).find((f) => {
      const id = toStr(f.properties?.[UNIT_ID_FIELD] ?? f.id)?.toLowerCase();
      return id === q || id?.startsWith(q);
    });
    if (!found) return;
    const unitId = toStr(found.properties?.[UNIT_ID_FIELD] ?? found.id);
    setSelected({ type: "unit", id: unitId, geometry: found.geometry, synopsis: (synopsisByUnit ?? {})[unitId || ""] || null });
  };

  return {
    selected,
    setSelected,
    showRegions,
    setShowRegions,
    showUnitLabels,
    setShowUnitLabels,
    unitFilter,
    regionFilter,
    zoomToBC,
    handleUnitPress,
    handleMapLongPress,
    goToUnit,
  };
}
