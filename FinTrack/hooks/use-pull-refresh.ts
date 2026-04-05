import { useCallback, useState } from 'react';

/** Drives `RefreshControl`: runs `refresh`, then clears the spinner. */
export function usePullRefresh(refresh: () => void | Promise<void>) {
  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    try {
      await refresh();
    } finally {
      setRefreshing(false);
    }
  }, [refresh]);
  return { refreshing, onRefresh };
}
