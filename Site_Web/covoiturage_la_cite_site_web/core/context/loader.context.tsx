"use client";

import { createContext, useContext, useState, ReactNode } from "react";

type LoaderContextType = {
  isActive: boolean;
  setActiveLoader: (value: boolean) => void;
};

const LoaderContext = createContext<LoaderContextType | undefined>(undefined);

export function LoaderProvider({ children }: { children: ReactNode }) {
  const [isActive, setIsActive] = useState(false);

  return (
    <LoaderContext.Provider
      value={{ isActive, setActiveLoader: setIsActive }}
    >
      {children}
    </LoaderContext.Provider>
  );
}

export function useLoader() {
  const context = useContext(LoaderContext);
  if (!context) {
    throw new Error("useLoader must be used inside LoaderProvider");
  }
  return context;
}