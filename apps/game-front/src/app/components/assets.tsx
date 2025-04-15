"use client";

import { QueryType } from "@/lib/basehub";
import { createContext, useContext, useRef } from "react";

const AssetContext = createContext<QueryType | null>(null);

export function useAssets() {
  const assets = useContext(AssetContext);
  const assetsRef = useRef(assets);
  if (!assets)
    throw new Error("useAssets must be used within an AssetsProvider");

  // avoid re-renders if this changes
  return assetsRef.current!;
}

interface AssetsProviderProps {
  children: React.ReactNode;
  assets: QueryType;
}

export const AssetsProvider = ({ children, assets }: AssetsProviderProps) => (
  <AssetContext.Provider value={assets}>{children}</AssetContext.Provider>
);
