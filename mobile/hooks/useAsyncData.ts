import { useCallback, useEffect, useRef, useState } from 'react';

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
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const { immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the latest asyncFunction to avoid infinite loops
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const result = await Promise.resolve(asyncFunctionRef.current());
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useAsyncData error:', err);
    } finally {
      setLoading(false);
    }
  }, []); // Remove asyncFunction from dependencies

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
    setData,
  };
}

/**
 * Hook specifically for user-based data loading
 * Automatically handles user dependency and provides proper loading states
 */
export function useUserData<T>(
  asyncFunction: (userId: string) => T | Promise<T>,
  userId: string | null | undefined,
  deps: React.DependencyList = [],
): UseAsyncDataResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!userId);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the latest asyncFunction to avoid infinite loops
  const asyncFunctionRef = useRef(asyncFunction);
  asyncFunctionRef.current = asyncFunction;

  const fetchData = useCallback(async () => {
    if (!userId) {
      setError('User ID is required');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const result = await Promise.resolve(asyncFunctionRef.current(userId));
      setData(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unknown error occurred';
      setError(errorMessage);
      console.error('useUserData error:', err);
    } finally {
      setLoading(false);
    }
  }, [userId]); // Only userId dependency

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId, fetchData, ...deps]);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    setData,
  };
}

/**
 * Hook for multiple data sources that should be loaded together
 * Useful for pages that need multiple repository calls
 */
export function useMultipleAsyncData<T extends Record<string, unknown>>(
  asyncFunctions: { [K in keyof T]: () => T[K] | Promise<T[K]> },
  options: UseAsyncDataOptions = {},
): UseAsyncDataResult<T> {
  const { immediate = true, deps = [] } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<string | null>(null);

  // Use ref to store the latest asyncFunctions to avoid infinite loops
  const asyncFunctionsRef = useRef(asyncFunctions);
  asyncFunctionsRef.current = asyncFunctions;

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const keys = Object.keys(asyncFunctionsRef.current) as (keyof T)[];
      const promises = keys.map((key) => Promise.resolve(asyncFunctionsRef.current[key]()));
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
  }, []); // Remove asyncFunctions from dependencies

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
    setData,
  };
}

export default useAsyncData;
