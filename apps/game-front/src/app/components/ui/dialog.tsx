import React from "react";
import { X } from "lucide-react";

interface DialogProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}

export function Dialog({ open, onClose, children, title }: DialogProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative bg-zinc-900 rounded-lg p-6 shadow-lg max-w-md w-full border border-zinc-800">
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
