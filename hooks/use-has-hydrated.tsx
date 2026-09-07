"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

export function useHasHydrated() {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
