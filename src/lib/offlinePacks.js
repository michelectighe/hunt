// lib/offlinePacks.js
import * as FileSystem from "expo-file-system";
import { unzip } from "react-native-zip-archive";

const DOC = FileSystem.documentDirectory; // file:///.../Documents/

export const packInstallPath = (packId) => `${DOC}tiles/${packId}`;
export const fileTemplate = (packId, ext) =>
  `${DOC}tiles/${packId}/{z}/{x}/{y}.${ext}`;

export async function exists(uri) {
  try {
    const info = await FileSystem.getInfoAsync(uri);
    return !!info.exists;
  } catch {
    return false;
  }
}

export async function ensureTilesRoot() {
  await FileSystem.makeDirectoryAsync(`${DOC}tiles`, { intermediates: true });
}

// Basic: download a zip and unzip it into Documents (expects zip contains `tiles/<packId>/...`)
export async function downloadZipAndUnzip({ url, zipName }) {
  await ensureTilesRoot();

  const zipPath = `${DOC}${zipName}.zip`;
  const dl = FileSystem.createDownloadResumable(url, zipPath);

  // 1) download
  await dl.downloadAsync();

  // 2) unzip to Documents root
  const unzipSrc = zipPath.replace("file://", "");
  const destDir = DOC.replace("file://", "");
  await unzip(unzipSrc, destDir);

  // 3) cleanup zip
  await FileSystem.deleteAsync(zipPath, { idempotent: true });

  return true;
}

// Same as above but with progress callback (0..1)
export async function downloadZipAndUnzipWithProgress({
  url,
  zipName,
  onProgress,
}) {
  await ensureTilesRoot();

  const zipPath = `${DOC}${zipName}.zip`;
  const dl = FileSystem.createDownloadResumable(url, zipPath, {}, (evt) => {
    if (evt.totalBytesExpectedToWrite > 0 && typeof onProgress === "function") {
      onProgress(evt.totalBytesWritten / evt.totalBytesExpectedToWrite);
    }
  });

  await dl.downloadAsync();

  const unzipSrc = zipPath.replace("file://", "");
  const destDir = DOC.replace("file://", "");
  await unzip(unzipSrc, destDir);

  await FileSystem.deleteAsync(zipPath, { idempotent: true });

  return true;
}

// Convenience install/remove helpers for a single "packId"
export async function installPack({ url, packId, onProgress }) {
  // We assume the zip contains: tiles/<packId>/z/x/y.pbf (or png/webp/etc)
  const zipName = packId; // file name while downloading
  if (onProgress) {
    await downloadZipAndUnzipWithProgress({ url, zipName, onProgress });
  } else {
    await downloadZipAndUnzip({ url, zipName });
  }
  return true;
}

export async function removePack(packId) {
  try {
    await FileSystem.deleteAsync(packInstallPath(packId), { idempotent: true });
    return true;
  } catch (e) {
    return false;
  }
}

// Utility to scan multiple packIds => installed map { [packId]: boolean }
export async function scanInstalled(packIds) {
  const out = {};
  for (const id of packIds) {
    out[id] = await exists(packInstallPath(id));
  }
  return out;
}

// -------- URL helpers you can adapt to your server naming --------

// Example builder: `${base}/${packId}.zip` where packId = `${regionId}_${layerKey}`
export function buildPackId(regionId, layerKey) {
  return `r0${regionId}_${layerKey}`;
}

export function buildLayerZipUrl(base, regionId, layerKey) {
  // ex: base = "http://10.0.0.17:8000"
  // zip: http://10.0.0.17:8000/r03_units.zip
  const packId = buildPackId(regionId, layerKey);
  return `${base}/${packId}.zip`;
}
