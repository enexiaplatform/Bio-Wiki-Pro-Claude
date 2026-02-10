import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
  isPro: boolean;
  togglePro: () => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  // Initialize from localStorage or default to false
  const [isPro, setIsPro] = useState(() => {
    const saved = localStorage.getItem("bioWikiPro_isPro");
    return saved === "true";
  });

  useEffect(() => {
    localStorage.setItem("bioWikiPro_isPro", String(isPro));
  }, [isPro]);

  const togglePro = () => setIsPro(prev => !prev);

  return (
    <UserContext.Provider value={{ isPro, togglePro }}>
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
