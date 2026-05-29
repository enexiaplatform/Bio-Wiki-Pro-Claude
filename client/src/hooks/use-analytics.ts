import { useEffect } from "react";
import { useLocation } from "wouter";

declare global {
  interface Window {
    posthog?: {
      init: (key: string, options?: object) => void;
      capture: (event: string, properties?: Record<string, unknown>) => void;
      identify: (id: string, properties?: Record<string, unknown>) => void;
      reset: () => void;
    };
  }
}

const POSTHOG_KEY = import.meta.env.VITE_POSTHOG_KEY as string | undefined;

let initialized = false;

function initPostHog() {
  if (initialized || !POSTHOG_KEY || typeof window === "undefined") return;
  if (window.posthog) {
    window.posthog.init(POSTHOG_KEY, {
      api_host: "https://app.posthog.com",
      capture_pageview: false, // we track manually
      autocapture: false,
      persistence: "localStorage+cookie",
    });
    initialized = true;
  }
}

export function capture(event: string, properties?: Record<string, unknown>) {
  // PostHog stub methods only exist after init() runs. When VITE_POSTHOG_KEY
  // is unset, init() is skipped and these stay undefined — so guard the call
  // itself, not just the object, to avoid crashing the whole app.
  if (typeof window !== "undefined" && typeof window.posthog?.capture === "function") {
    window.posthog.capture(event, properties);
  }
}

export function identify(userId: string, traits?: Record<string, unknown>) {
  if (typeof window !== "undefined" && typeof window.posthog?.identify === "function") {
    window.posthog.identify(userId, traits);
  }
}

// Hook: auto page_view on route change
export function usePageTracking() {
  const [location] = useLocation();

  useEffect(() => {
    initPostHog();
  }, []);

  useEffect(() => {
    capture("page_view", { path: location });
  }, [location]);
}

// Convenience event helpers
export const analytics = {
  leadCaptured: (source: string) =>
    capture("lead_captured", { source }),

  checkoutStarted: (productType: string, priceUsd: number) =>
    capture("checkout_started", { product_type: productType, price_usd: priceUsd }),

  purchaseCompleted: (productType: string, amountCents: number) =>
    capture("purchase_completed", { product_type: productType, amount_cents: amountCents }),

  proModalOpened: (trigger: string) =>
    capture("pro_modal_opened", { trigger }),

  lessonOpened: (lessonId: string, lessonTitle: string) =>
    capture("lesson_opened", { lesson_id: lessonId, lesson_title: lessonTitle }),

  searchPerformed: (query: string, section: string, resultsCount: number) =>
    capture("search_performed", { query, section, results_count: resultsCount }),

  workflowClicked: (workflowName: string) =>
    capture("workflow_clicked", { workflow_name: workflowName }),
};
