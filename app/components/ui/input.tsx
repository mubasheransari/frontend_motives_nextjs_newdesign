import React from 'react';

type Props = React.InputHTMLAttributes<HTMLInputElement> & {
  label?: string;
  hint?: string;
};

export function Input({ label, hint, className = '', ...props }: Props) {
  return (
    <label className="block">
      {label ? (
        <span className="mb-2 block text-xs font-bold uppercase tracking-[0.18em] text-[var(--txt-dim)]">
          {label}
        </span>
      ) : null}
      <input
        className={`h-12 w-full rounded-2xl border border-black/10 bg-white px-4 text-sm outline-none ring-sky-500 placeholder:text-black/25 focus:ring-2 ${className}`}
        {...props}
      />
      {hint ? (
        <span className="mt-1 block text-[11px] text-[var(--txt-dim)]">
          {hint}
        </span>
      ) : null}
    </label>
  );
}
