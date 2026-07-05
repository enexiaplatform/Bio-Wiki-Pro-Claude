import { lazy, Suspense, useEffect, useState } from "react";

const CommandPalette = lazy(() =>
  import("./CommandPalette").then((module) => ({ default: module.CommandPalette })),
);

/** Lightweight global search trigger; loads the full palette only on demand. */
export function LazyCommandPalette() {
  const [loaded, setLoaded] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const openPalette = () => {
      setLoaded(true);
      setOpen(true);
    };
    const togglePalette = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setLoaded(true);
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", togglePalette);
    window.addEventListener("lsa:open-search", openPalette);
    return () => {
      document.removeEventListener("keydown", togglePalette);
      window.removeEventListener("lsa:open-search", openPalette);
    };
  }, []);

  if (!loaded) return null;

  return (
    <Suspense fallback={null}>
      <CommandPalette open={open} onOpenChange={setOpen} />
    </Suspense>
  );
}
