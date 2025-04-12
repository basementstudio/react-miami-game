import React from "react";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: (string | undefined | null | boolean)[]) {
  return twMerge(clsx(inputs));
}

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

export function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonProps) {
  const baseStyle =
    "inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none disabled:opacity-50";

  const variants = {
    default: "bg-zinc-800 text-zinc-100 hover:bg-zinc-700",
    outline:
      "border border-zinc-700 bg-transparent hover:bg-zinc-800 text-zinc-300",
    ghost: "bg-transparent hover:bg-zinc-800 text-zinc-300",
    link: "text-zinc-300 underline-offset-4 hover:underline bg-transparent",
  };

  const sizes = {
    default: "h-9 px-4 py-2 text-sm",
    sm: "h-8 px-3 py-1 text-xs",
    lg: "h-10 px-8 py-2 text-base",
    icon: "h-9 w-9 p-0",
  };

  return (
    <button
      className={cn(baseStyle, variants[variant], sizes[size], className)}
      {...props}
    />
  );
}
