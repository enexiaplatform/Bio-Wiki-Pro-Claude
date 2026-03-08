import { createContext, useContext, ReactNode } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import type { User } from "@shared/schema";

interface UserContextType {
  user: User | null | undefined;
  isLoading: boolean;
  isAuthenticated: boolean;
  isPro: boolean;
  togglePro: () => void;
  isTogglingPro: boolean;
  logout: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const { user, isLoading, isAuthenticated, logout } = useAuth();
  const queryClient = useQueryClient();

  const toggleProMutation = useMutation({
    mutationFn: async () => {
      const res = await apiRequest("POST", "/api/users/toggle-pro");
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/auth/user"] });
    },
  });

  return (
    <UserContext.Provider
      value={{
        user: user,
        isLoading,
        isAuthenticated,
        isPro: user?.isPro ?? false,
        togglePro: () => toggleProMutation.mutate(),
        isTogglingPro: toggleProMutation.isPending,
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
