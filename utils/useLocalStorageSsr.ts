import { useEffect, useRef, useState } from "react";
import { useEffectOnce } from "react-use";

/** Different from react-use/useLocalStorage() in that the first render uses the default value so
 * we don't get any client/server mismatch errors.
 */
export default function useLocalStorageSsr<T>(key: string, initialValue: T) {
  const hasMounted = useRef(false);
  const [storedValue, setStoredValue] = useState<T>(initialValue);

  useEffectOnce(() => {
    const item = window.localStorage.getItem(key);
    if (item) {
      setStoredValue(JSON.parse(item));
    }
  });

  useEffect(() => {
    if (hasMounted.current) {
      window.localStorage.setItem(key, JSON.stringify(storedValue));
    } else {
      hasMounted.current = true;
    }
  }, [storedValue]);

  const loaded = hasMounted.current;

  return [storedValue, setStoredValue, loaded] as const;
}
