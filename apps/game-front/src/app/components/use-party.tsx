import { createContext, useContext } from "react";
import type { PartySocket } from "partysocket";

interface PartyContextType {
  socket: PartySocket;
}

const PartyContext = createContext<PartyContextType | null>(null);

export function PartyProvider({
  children,
  socket,
}: {
  children: React.ReactNode;
  socket: PartySocket;
}) {
  return (
    <PartyContext.Provider value={{ socket }}>{children}</PartyContext.Provider>
  );
}

export function useParty() {
  const context = useContext(PartyContext);
  if (!context) throw new Error("useParty must be used within a PartyProvider");
  return context.socket;
}
