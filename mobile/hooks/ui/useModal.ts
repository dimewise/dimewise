import { useState, useCallback } from 'react';

interface ModalState<T> {
  isVisible: boolean;
  data: T | null;
}

interface UseModalReturn<T> {
  isVisible: boolean;
  data: T | null;
  open: (data?: T) => void;
  close: () => void;
  toggle: () => void;
}

export function useModal<T = undefined>(): UseModalReturn<T> {
  const [state, setState] = useState<ModalState<T>>({
    isVisible: false,
    data: null,
  });

  const open = useCallback((data?: T) => {
    setState({ isVisible: true, data: data ?? null });
  }, []);

  const close = useCallback(() => {
    setState({ isVisible: false, data: null });
  }, []);

  const toggle = useCallback(() => {
    setState((prev) => ({
      ...prev,
      isVisible: !prev.isVisible,
    }));
  }, []);

  return {
    isVisible: state.isVisible,
    data: state.data,
    open,
    close,
    toggle,
  };
}
