import { useEffect, useState } from "react";

export function useStableValue<T>(value: T, debounceTime: number) {
  const [output, setOutput] = useState(value);
  useEffect(() => {
    const timeout = setTimeout(() => setOutput(value), debounceTime);
    return () => clearTimeout(timeout);
  }, [value, debounceTime]);
  return output;
}
