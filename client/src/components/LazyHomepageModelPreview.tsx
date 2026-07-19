import { lazy, Suspense, useEffect, useRef, useState } from "react";

const DeferredPreview = lazy(() =>
  import("@/components/HomepageModelPreview").then((module) => ({ default: module.HomepageModelPreview })),
);

export function LazyHomepageModelPreview() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const node = rootRef.current;
    if (!node || shouldLoad) return;
    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "420px 0px" },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={rootRef} className="mt-12 min-h-[420px]">
      {shouldLoad ? (
        <Suspense fallback={<div className="h-[420px] animate-pulse rounded-[1.5rem] border border-slate-200 bg-white/70" aria-hidden="true" />}>
          <DeferredPreview />
        </Suspense>
      ) : (
        <div className="h-[420px] rounded-[1.5rem] border border-slate-200 bg-white/55" aria-hidden="true" />
      )}
    </div>
  );
}
