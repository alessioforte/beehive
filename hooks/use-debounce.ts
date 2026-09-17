import { useCallback, useEffect, useRef } from "react";

const useDebounce = <TArgs extends unknown[]>(
  callback: (...args: TArgs) => void,
  delay: number,
) => {
  const callbackRef = useRef(callback);
  const timeoutRef = useRef<number | undefined>(undefined);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const cancel = useCallback(() => {
    if (timeoutRef.current !== undefined) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }
  }, []);

  const debounce = useCallback(
    (...args: TArgs) => {
      cancel();
      timeoutRef.current = window.setTimeout(() => {
        callbackRef.current(...args);
        timeoutRef.current = undefined;
      }, delay);
    },
    [cancel, delay],
  );

  useEffect(() => {
    return cancel;
  }, [cancel]);

  return { debounce, cancel };
};

export default useDebounce;
