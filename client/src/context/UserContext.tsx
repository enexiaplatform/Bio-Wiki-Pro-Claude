import { createContext, useContext, useEffect, useRef, ReactNode } from "react";
import { useAuth, type AuthUser } from "@/hooks/use-auth";
import { identify } from "@/hooks/use-analytics";

interface UserContextType {
  user: AuthUser | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  isAdmin: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  // Identify the user to analytics once per id, from any entry path
  // (register / login / Google / returning session). Lets PostHog tie the
  // whole funnel — page views, checkout, purchase — to a single person.
  const identifiedId = useRef<string | null>(null);
  useEffect(() => {
    if (user?.id && identifiedId.current !== user.id) {
      identifiedId.current = user.id;
      identify(user.id, {
        email: user.email,
        is_pro: user.isPro ?? false,
        subscription_status: user.subscriptionStatus ?? undefined,
      });
    }
  }, [user?.id, user?.email, user?.isPro, user?.subscriptionStatus]);

  return (
    <UserContext.Provider
      value={{
        user: user,
        isLoading,
        isAuthenticated,
        isPro: user?.isPro ?? false,
        isAdmin: user?.isAdmin ?? false,
        logout,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error("useUser must be used within a UserProvider");
  }
  return context;
}
