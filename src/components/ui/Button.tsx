import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "ghost" | "outline";

const base =
  "font-mono text-[11.5px] tracking-[0.06em] uppercase rounded px-[18px] py-[11px] transition-opacity disabled:opacity-40 disabled:cursor-not-allowed";

const variants: Record<Variant, string> = {
  primary: "bg-forest text-mist border-none hover:opacity-90",
  ghost: "bg-transparent text-moss border-none p-0 hover:opacity-80",
  outline: "bg-transparent text-[#4A4738] border border-[#C9C3AC] hover:border-forest",
};

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

export function Button({ variant = "primary", className = "", ...props }: ButtonProps) {
  return <button className={`${base} ${variants[variant]} ${className}`} {...props} />;
}
