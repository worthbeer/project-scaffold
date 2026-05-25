import { useState, useCallback } from "react";
import type { AsyncState } from "@t/index";

export function useAsync<T>() {
  const [state, setState] = useState<AsyncState<T>>({ status: "idle" });

  const run = useCallback(async (promise: Promise<T>) => {
    setState({ status: "loading" });
    try {
      const data = await promise;
      setState({ status: "success", data });
      return data;
    } catch (err) {
      const error = err instanceof Error ? err.message : "Unknown error";
      setState({ status: "error", error });
      throw err;
    }
  }, []);

  const reset = useCallback(() => setState({ status: "idle" }), []);
  return { state, run, reset };
}
