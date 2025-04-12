import React from "react";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: React.ReactNode;
  containerClassName?: string;
}

export function Dialog({
  open,
  onClose,
  children,
  title,
  containerClassName,
}: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div
        className={cn(
          "relative bg-zinc-900 rounded-lg p-6 shadow-lg max-w-md w-full border border-zinc-800",
          containerClassName
        )}
      >
        {title && (
          <div className="mb-4 text-lg font-medium text-zinc-200">{title}</div>
        )}
        <button
          className="absolute top-2 right-2 p-1.5 rounded-full hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200"
          onClick={onClose}
        >
          <X size={18} />
        </button>
        {children}
      </div>
    </div>
  );
}
