import { useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const GSI_SRC = "https://accounts.google.com/gsi/client";

declare global {
  interface Window {
    google?: any;
  }
}

function loadGsi(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.google?.accounts?.id) return resolve();
    const existing = document.querySelector(`script[src="${GSI_SRC}"]`) as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => resolve());
      existing.addEventListener("error", () => reject(new Error("gsi load failed")));
      return;
    }
    const s = document.createElement("script");
    s.src = GSI_SRC;
    s.async = true;
    s.defer = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("gsi load failed"));
    document.head.appendChild(s);
  });
}

/**
 * "Continue with Google" button (Google Identity Services). Renders only when
 * VITE_GOOGLE_CLIENT_ID is configured; otherwise nothing (the email/password
 * form remains the path). Verifies the ID token server-side at /api/auth/google.
 */
export function GoogleSignInButton({ redirectTo = "/academy" }: { redirectTo?: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  useEffect(() => {
    if (!CLIENT_ID || !ref.current) return;
    let cancelled = false;

    loadGsi()
      .then(() => {
        if (cancelled || !ref.current || !window.google?.accounts?.id) return;
        window.google.accounts.id.initialize({
          client_id: CLIENT_ID,
          callback: async (resp: { credential?: string }) => {
            if (!resp?.credential) return;
            try {
              const response = await apiRequest("POST", "/api/auth/google", { credential: resp.credential });
              const account = await response.json() as { isAdmin?: boolean };
              await queryClient.invalidateQueries({ queryKey: ["/api/auth/me"] });
              setLocation(account.isAdmin && redirectTo === "/welcome" ? "/admin" : redirectTo);
            } catch (e: any) {
              toast({
                title: "Google sign-in failed",
                description: e?.message || "Please try again.",
                variant: "destructive",
              });
            }
          },
        });
        ref.current.innerHTML = "";
        window.google.accounts.id.renderButton(ref.current, {
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          width: 320,
        });
      })
      .catch(() => {
        /* Google script blocked/offline — silently keep the email/password form */
      });

    return () => {
      cancelled = true;
    };
  }, [redirectTo, queryClient, setLocation, toast]);

  if (!CLIENT_ID) return null;

  return (
    <div className="w-full">
      <div className="flex items-center gap-3 my-2">
        <span className="h-px flex-1 bg-white/10" />
        <span className="text-xs text-muted-foreground">or</span>
        <span className="h-px flex-1 bg-white/10" />
      </div>
      <div className="flex justify-center" ref={ref} />
    </div>
  );
}
