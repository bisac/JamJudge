import { useCallback, useEffect, useRef, useState } from "react";

interface UseDebouncedSaveOptions {
  delayMs?: number;
  onError?: (error: unknown) => void;
  onSuccess?: () => void;
}

interface UseDebouncedSaveResult<T> {
  pendingValues: T | null;
  isSaving: boolean;
  setValues: (values: T) => void;
  flush: () => Promise<void>;
}

export const useDebouncedSave = <T>(
  saveFn: (values: T) => Promise<void>,
  options: UseDebouncedSaveOptions = {},
): UseDebouncedSaveResult<T> => {
  const { delayMs = 1000, onError, onSuccess } = options;
  const [pendingValues, setPendingValues] = useState<T | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const timer = useRef<number | null>(null);
  const latestSave = useRef(saveFn);

  useEffect(() => {
    latestSave.current = saveFn;
  }, [saveFn]);

  const clearTimer = () => {
    if (timer.current) {
      window.clearTimeout(timer.current);
      timer.current = null;
    }
  };

  const flush = useCallback(async () => {
    if (pendingValues == null) return;
    clearTimer();
    setIsSaving(true);
    try {
      await latestSave.current(pendingValues);
      onSuccess?.();
    } catch (err) {
      onError?.(err);
      throw err;
    } finally {
      setIsSaving(false);
    }
  }, [pendingValues, onError, onSuccess]);

  const setValues = useCallback(
    (values: T) => {
      setPendingValues(values);
      clearTimer();
      timer.current = window.setTimeout(() => {
        void (async () => {
          setIsSaving(true);
          try {
            await latestSave.current(values);
            onSuccess?.();
            setPendingValues(null);
          } catch (err) {
            onError?.(err);
          } finally {
            setIsSaving(false);
          }
        })();
      }, delayMs);
    },
    [delayMs, onError, onSuccess],
  );

  useEffect(() => {
    return () => clearTimer();
  }, []);

  return { pendingValues, isSaving, setValues, flush };
};
