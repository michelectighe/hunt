// utils/ownership.js
export async function ownershipAt(
  mapRef,
  lon,
  lat,
  {
    fnFillLayerId = "fn-fill",
    privateFillLayerId = "private-fill",
    paddingPx = 1, // keep this tiny
  } = {}
) {
  if (!mapRef?.current) return "CROWN";
return "CROWN";
  const pt = await mapRef.current.getPointInView([lon, lat]);

  const normalize = (res) => {
    if (!res) return [];
    if (Array.isArray(res)) return res;
    if (Array.isArray(res.features)) return res.features;
    return [];
  };

  // try point query first (cheapest)
  if (typeof mapRef.current.queryRenderedFeaturesAtPoint === "function") {
    // const fnHits = normalize(
    //   await mapRef.current.queryRenderedFeaturesAtPoint(pt, null, [
    //     fnFillLayerId,
    //   ])
    // );
    // if (fnHits.length) return "FN";

    const privHits = normalize(
      await mapRef.current.queryRenderedFeaturesAtPoint(pt, null, [
        privateFillLayerId,
      ])
    );
    if (privHits.length) return "PRIVATE";
  }

  // rectangle as a tiny fallback
  // if (typeof mapRef.current.queryRenderedFeaturesInRect === "function") {
  //   const bbox = [
  //     pt.y - paddingPx,
  //     pt.x + paddingPx,
  //     pt.y + paddingPx,
  //     pt.x - paddingPx,
  //   ]; // [top,right,bottom,left]
  //   const fnHits = normalize(
  //     await mapRef.current.queryRenderedFeaturesInRect(bbox, null, [
  //       fnFillLayerId,
  //     ])
  //   );
  //   if (fnHits.length) return "FN";

  //   const privHits = normalize(
  //     await mapRef.current.queryRenderedFeaturesInRect(bbox, null, [
  //       privateFillLayerId,
  //     ])
  //   );
  //   if (privHits.length) return "PRIVATE";
  // }

  return "CROWN";
}
