// tiles.ts
import * as FileSystem from "expo-file-system";

export const fileTemplate = (packId, ext) =>
  `${FileSystem.documentDirectory}tiles/${packId}/{z}/{x}/{y}.${ext}`;
