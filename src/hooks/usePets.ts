import { useEffect, useState, useMemo } from "react";
import { fetchAllPets } from "../services/petService";
import type { Pet } from "../types";

export interface PetFilters {
  search: string;
  species: string;
  size: string;
}

interface UsePetsResult {
  pets: Pet[];
  loading: boolean;
  error: string | null;
  filters: PetFilters;
  setFilters: React.Dispatch<React.SetStateAction<PetFilters>>;
  refetch: () => void;
}

const DEFAULT_FILTERS: PetFilters = {
  search: "",
  species: "",
  size: "",
};

export function usePets(): UsePetsResult {
  const [allPets, setAllPets] = useState<Pet[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<PetFilters>(DEFAULT_FILTERS);
  // A counter we increment to trigger a re-fetch without reloading the page
  const [fetchCount, setFetchCount] = useState(0);

  useEffect(() => {
    let cancelled = false;

    async function loadPets() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchAllPets();
        if (!cancelled) setAllPets(data);
      } catch (err) {
        if (!cancelled) {
          setError("Failed to load pets. Please try again.");
        }

        // debug print
        console.log(err);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadPets();

    // Cleanup: if the component unmounts before fetch completes, ignore the result
    return () => {
      cancelled = true;
    };
  }, [fetchCount]);

  // useMemo ensures we only recompute filtered pets when allPets or filters change
  const pets = useMemo(() => {
    return allPets.filter((pet) => {
      const searchTerm = filters.search.toLowerCase();

      const matchesSearch =
        !searchTerm ||
        pet.name.toLowerCase().includes(searchTerm) ||
        pet.breed.toLowerCase().includes(searchTerm) ||
        pet.species.toLowerCase().includes(searchTerm);

      const matchesSpecies =
        !filters.species || pet.species.toLowerCase() === filters.species.toLowerCase();

      const matchesSize = !filters.size || pet.size === filters.size;

      return matchesSearch && matchesSpecies && matchesSize;
    });
  }, [allPets, filters]);

  function refetch() {
    setFetchCount((prev) => prev + 1);
  }

  return { pets, loading, error, filters, setFilters, refetch };
}
