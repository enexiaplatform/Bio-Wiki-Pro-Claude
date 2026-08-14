import { useCallback, useEffect, useState } from "react";

import { buildResourceContextHref, parseResourceSelection, type ResourceSelection } from "@/data/resourceSelection";

function currentSelection() {
  return typeof window === "undefined" ? {} : parseResourceSelection(window.location.search);
}

export function useResourceSelection() {
  const [selection, setSelectionState] = useState<ResourceSelection>(currentSelection);

  useEffect(() => {
    const sync = () => setSelectionState(currentSelection());
    window.addEventListener("popstate", sync);
    return () => window.removeEventListener("popstate", sync);
  }, []);

  const setSelection = useCallback((next: ResourceSelection, options?: { replace?: boolean; source?: string }) => {
    const href = buildResourceContextHref(`${window.location.pathname}${window.location.search}`, next, options?.source);
    if (options?.replace) window.history.replaceState({}, "", href);
    else window.history.pushState({}, "", href);
    window.dispatchEvent(new PopStateEvent("popstate"));
  }, []);

  const hrefWithSelection = useCallback((path: string, source?: string) => buildResourceContextHref(path, selection, source), [selection]);

  return {
    selection,
    setSelection,
    clearSelection: () => setSelection({}),
    hrefWithSelection,
  };
}
