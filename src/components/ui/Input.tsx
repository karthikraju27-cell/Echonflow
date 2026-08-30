import type { InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from "react";

const fieldClass =
  "font-body text-sm px-3 py-2.5 border border-[#C9C3AC] rounded bg-[#FBF9F1] text-ink w-full outline-none focus:border-moss";

export function Input(props: InputHTMLAttributes<HTMLInputElement>) {
  return <input {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}

export function Textarea(props: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea {...props} className={`${fieldClass} resize-y ${props.className ?? ""}`} />;
}

export function Select(props: SelectHTMLAttributes<HTMLSelectElement>) {
  return <select {...props} className={`${fieldClass} ${props.className ?? ""}`} />;
}
