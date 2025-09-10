// data/speciesStore.ts
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY = "userSpecies";
export const DEFAULT_SPECIES = ["moose", "deer", "elk", "bear", "other"] as const;

export async function getUserSpecies(): Promise<string[]> {
  const raw = await AsyncStorage.getItem(KEY);
  if (!raw) return [];
  try {
    const arr = JSON.parse(raw);
    return Array.isArray(arr) ? arr : [];
  } catch {
    return [];
  }
}

export async function setUserSpecies(list: string[]): Promise<void> {
  const cleaned = Array.from(new Set(list.map(s => s.trim()).filter(Boolean)));
  await AsyncStorage.setItem(KEY, JSON.stringify(cleaned));
}

export async function addUserSpecies(name: string): Promise<string[]> {
  const current = await getUserSpecies();
  const next = Array.from(new Set([...current, name.trim()])).filter(Boolean);
  await setUserSpecies(next);
  return next;
}

export async function removeUserSpecies(name: string): Promise<string[]> {
  const current = await getUserSpecies();
  const next = current.filter(s => s.toLowerCase() !== name.trim().toLowerCase());
  await setUserSpecies(next);
  return next;
}
