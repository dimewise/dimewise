import { useState, useCallback } from 'react';
import { colors } from '@/theme/colors';

interface UseRefreshControlOptions {
  onRefresh: () => Promise<void>;
}

export function useRefreshControl({ onRefresh }: UseRefreshControlOptions) {
  const [refreshing, setRefreshing] = useState(false);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  }, [onRefresh]);

  return {
    refreshing,
    onRefresh: handleRefresh,
    tintColor: colors.primary.DEFAULT,
    colors: [colors.primary.DEFAULT], // Android
  };
}
