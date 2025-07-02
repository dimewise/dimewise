import { useEffect, useState, useCallback } from 'react';

interface UseAsyncDataOptions {
  immediate?: boolean; // Whether to load data immediately
  deps?: React.DependencyList; // Dependencies to trigger reload
}

interface UseAsyncDataResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setData: React.Dispatch<React.SetStateAction<T | null>>;
}

/**
 * Custom hook for handling async data loading with error handling and retry logic
 * Follows React Native best practices for data fetching
 */
export function useAsyncData<T>(
  asyncFunction: () => T | Promise<T>,
  options: UseAsyncDataOptions = {}
): UseAsyncDataResult<T> {
  const { immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await Promise.resolve(asyncFunction());
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useAsyncData error:', err);
    } finally {
      setLoading(false);
    }
  }, [asyncFunction]);

  // Initial load and dependency-based reloads
  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}

/**
 * Hook specifically for user-based data loading
 * Automatically handles user dependency and provides proper loading states
 */
export function useUserData<T>(
  asyncFunction: (userId: string) => T | Promise<T>,
  userId: string | null | undefined,
  deps: React.DependencyList = []
): UseAsyncDataResult<T> {
  return useAsyncData(
    () => {
      if (!userId) {
        throw new Error('User ID is required');
      }
      return asyncFunction(userId);
    },
    {
      immediate: !!userId,
      deps: [userId, ...deps]
    }
  );
}

/**
 * Hook for multiple data sources that should be loaded together
 * Useful for pages that need multiple repository calls
 */
export function useMultipleAsyncData<T extends Record<string, any>>(
  asyncFunctions: { [K in keyof T]: () => T[K] | Promise<T[K]> },
  options: UseAsyncDataOptions = {}
): UseAsyncDataResult<T> {
  const { immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = Object.keys(asyncFunctions) as (keyof T)[];
      const promises = keys.map(key => Promise.resolve(asyncFunctions[key]()));
      const results = await Promise.all(promises);

      const combinedData = keys.reduce((acc, key, index) => {
        acc[key] = results[index];
        return acc;
      }, {} as T);

      setData(combinedData);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useMultipleAsyncData error:', err);
    } finally {
      setLoading(false);
    }
  }, [asyncFunctions]);

  useEffect(() => {
    if (immediate) {
      fetchData();
    }
  }, [immediate, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData
  };
}

export default useAsyncData; 