"use client";

import { useState, type InputHTMLAttributes } from "react";
import { Input } from "@/components/ui/Input";

type PasswordFieldProps = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label: string;
};

export function PasswordField({ label, className = "", ...props }: PasswordFieldProps) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="flex flex-col gap-1.5 font-body text-[12px] font-semibold text-[#405143]">
      <span>{label}</span>
      <span className="relative block">
        <Input {...props} type={visible ? "text" : "password"} className={`pr-[68px] ${className}`} />
        <button
          type="button"
          onClick={() => setVisible((value) => !value)}
          className="absolute inset-y-0 right-0 px-3 font-body text-[11px] font-semibold text-moss underline underline-offset-4"
          aria-label={`${visible ? "Hide" : "Show"} ${label.toLowerCase()}`}
        >
          {visible ? "Hide" : "Show"}
        </button>
      </span>
    </label>
  );
}
