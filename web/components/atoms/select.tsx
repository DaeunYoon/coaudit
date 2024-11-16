'use client';

import { Chain } from '@/lib/chains';

export interface SelectOption {
  label: string;
  value: Chain;
}

export default function Select({
  title,
  onClick,
  value,
  className,
  loading,
  options,
}: {
  title: string;
  onClick: (v: string) => any;
  value: string;
  className?: string;
  loading?: boolean;
  options: SelectOption[];
}) {
  return (
    <label className="form-control w-full max-w-xs">
      <select
        className="select select-bordered text-white bg-slate-700"
        onChange={(e) => onClick(e.target.value)}
        disabled={loading}
      >
        {options.map((option, i) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}
