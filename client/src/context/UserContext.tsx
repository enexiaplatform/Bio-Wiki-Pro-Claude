import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import type { User } from "@shared/models/auth";

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();

  return (
    <UserContext.Provider
      value={{
        user: user,
        isLoading,
        isAuthenticated,
        isPro: user?.isPro ?? false,
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
