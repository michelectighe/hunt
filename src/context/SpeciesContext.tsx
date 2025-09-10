import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  useCallback,
} from "react";
import {
  DEFAULT_SPECIES,
  getUserSpecies,
  setUserSpecies,
} from "../data/speciesStore";

type Species = (typeof DEFAULT_SPECIES)[number] | string;

type Ctx = {
  species: Species[];
  loading: boolean;
  add: (name: string) => Promise<void>;
  remove: (name: string) => Promise<void>;
  resetToDefaults: () => Promise<void>;
};

const SpeciesContext = createContext<Ctx | null>(null);

export const SpeciesProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [species, setSpecies] = useState<Species[]>([...DEFAULT_SPECIES]);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const user = await getUserSpecies();
    const merged = [
      ...DEFAULT_SPECIES,
      ...user.filter(
        (u) => !(DEFAULT_SPECIES as readonly string[]).includes(u)
      ),
    ];
    setSpecies(merged);
    setLoading(false);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const add = useCallback(
    async (name: string) => {
      const trimmed = name.trim();
      if (!trimmed) return;
      setSpecies((prev) => {
        if (prev.some((s) => s.toLowerCase() === trimmed.toLowerCase()))
          return prev;
        return [...prev, trimmed];
      });
      // persist user part (defaults are implicit)
      const userPart = species
        .filter((s) => !(DEFAULT_SPECIES as readonly string[]).includes(s))
        .concat(trimmed);
      await setUserSpecies(Array.from(new Set(userPart)));
    },
    [species]
  );

  const remove = useCallback(
    async (name: string) => {
      setSpecies((prev) =>
        prev.filter((s) => s.toLowerCase() !== name.trim().toLowerCase())
      );
      const userPart = species
        .filter((s) => !(DEFAULT_SPECIES as readonly string[]).includes(s))
        .filter((s) => s.toLowerCase() !== name.trim().toLowerCase());
      await setUserSpecies(userPart);
    },
    [species]
  );

  const resetToDefaults = useCallback(async () => {
    setSpecies([...DEFAULT_SPECIES]);
    await setUserSpecies([]); // clear user additions
  }, []);

  const value = useMemo(
    () => ({ species, loading, add, remove, resetToDefaults }),
    [species, loading, add, remove, resetToDefaults]
  );

  return (
    <SpeciesContext.Provider value={value}>{children}</SpeciesContext.Provider>
  );
};

export function useSpeciesCtx() {
  const ctx = useContext(SpeciesContext);
  if (!ctx)
    throw new Error("useSpeciesCtx must be used within SpeciesProvider");
  return ctx;
}
