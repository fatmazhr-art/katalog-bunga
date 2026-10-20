"use client";

import { useKeranjang } from "@/context/KeranjangContext";

export default function TombolKeranjangHeader() {
  const { totalItem, setIsBuka } = useKeranjang();

  return (
    <button
      type="button"
      onClick={() => setIsBuka(true)}
      className="relative flex items-center gap-2 rounded-xl border border-garis bg-latar px-3.5 py-2 text-sm font-semibold text-teks transition-colors hover:border-utama hover:text-utama"
      aria-label={`Keranjang belanja, ${totalItem} item`}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-4 w-4"
      >
        <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
        <path d="M3 6h18" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
      <span>Keranjang</span>
      {totalItem > 0 && (
        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-utama px-1.5 text-xs font-bold text-white">
          {totalItem}
        </span>
      )}
    </button>
  );
}

