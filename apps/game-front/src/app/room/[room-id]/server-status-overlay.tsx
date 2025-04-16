import { useServerStatus } from "@/app/components/other-players";
import { User } from "lucide-react";

export function ServerStatusOverlay() {
  const { playerIds } = useServerStatus();

  return (
    <div className="fixed flex top-4 gap-2 left-4 z-10 bg-zinc-800/80 hover:bg-zinc-700/90 text-zinc-200 shadow-md h-10 p-2 items-center justify-center rounded-md border border-zinc-700/50 backdrop-blur-sm">
      <User size={15} strokeWidth={1.5} />
      <span className="text-md">{playerIds.length + 1}</span>
    </div>
  );
}
