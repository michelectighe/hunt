import * as FileSystem from "expo-file-system";
import { unzip } from "react-native-zip-archive";

export async function installPack(pack: { id: string; url: string }) {
  const DOC = FileSystem.documentDirectory!;
  const zipPath = `${DOC}${pack.id}.zip`;
  const destDir = `${DOC}tiles/${pack.id}`;

  await FileSystem.makeDirectoryAsync(`${DOC}tiles`, { intermediates: true });

  const dl = FileSystem.createDownloadResumable(pack.url, zipPath);
  await dl.downloadAsync();

  await unzip(zipPath.replace("file://",""), destDir.replace("file://",""));
  await FileSystem.deleteAsync(zipPath, { idempotent: true });

  // Optionally read and verify manifest.json here
}
