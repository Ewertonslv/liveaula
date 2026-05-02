'use client';

import { useRouter, usePathname } from 'next/navigation';
import { useState } from 'react';

interface Props {
  from?: string;
  to?: string;
}

export default function DateFilter({ from = '', to = '' }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const [fromVal, setFromVal] = useState(from);
  const [toVal, setToVal] = useState(to);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams();
    if (fromVal) params.set('from', fromVal);
    if (toVal) params.set('to', toVal);
    router.push(`${pathname}?${params.toString()}`);
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-wrap gap-3 items-end">
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 font-medium">De</label>
        <input
          type="date"
          value={fromVal}
          onChange={(e) => setFromVal(e.target.value)}
          className="border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B74]/40"
        />
      </div>
      <div className="flex flex-col gap-1">
        <label className="text-xs text-slate-500 font-medium">Até</label>
        <input
          type="date"
          value={toVal}
          onChange={(e) => setToVal(e.target.value)}
          className="border border-slate-200 rounded-md px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1A6B74]/40"
        />
      </div>
      <button
        type="submit"
        className="px-4 py-1.5 bg-[#1A6B74] text-white text-sm rounded-md hover:bg-[#155f67] transition-colors"
      >
        Filtrar
      </button>
    </form>
  );
}
