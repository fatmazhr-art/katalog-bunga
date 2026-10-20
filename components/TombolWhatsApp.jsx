"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";
import { useKeranjang } from "@/context/KeranjangContext";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);
  const [varian, setVarian] = useState("");
  const [pesanSukses, setPesanSukses] = useState(false);
  const { tambahItem, setIsBuka } = useKeranjang();

  if (!produk) return null;

  const totalHarga = produk.harga * jumlah;
  const detailVarian = varian.trim() ? ` (Varian: ${varian.trim()})` : "";
  const pesan = `Halo, saya ingin memesan ${produk.nama}${detailVarian} sebanyak ${jumlah} dengan total harga ${formatRupiah(totalHarga)}.`;
  const urlWhatsApp = `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;

  const handleTambahKeranjang = () => {
    tambahItem(produk, jumlah, varian);
    setPesanSukses(true);
    setTimeout(() => {
      setPesanSukses(false);
    }, 3000);
  };

  return (
    <div className="flex flex-col gap-4 pt-2">
      {/* Pilih Jumlah */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="input-jumlah" className="text-sm font-semibold text-teks">
          Jumlah pesanan
        </label>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center rounded-lg border border-garis bg-latar">
            <button
              type="button"
              onClick={() => setJumlah((prev) => Math.max(1, prev - 1))}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks-lembut hover:text-utama disabled:cursor-not-allowed disabled:opacity-40"
              disabled={jumlah <= 1}
              aria-label="Kurangi jumlah"
            >
              −
            </button>
            <input
              id="input-jumlah"
              type="number"
              min="1"
              value={jumlah}
              onChange={(e) => {
                const val = parseInt(e.target.value, 10);
                setJumlah(isNaN(val) || val < 1 ? 1 : val);
              }}
              className="h-10 w-16 text-center text-sm font-semibold focus:outline-none"
            />
            <button
              type="button"
              onClick={() => setJumlah((prev) => prev + 1)}
              className="flex h-10 w-10 items-center justify-center text-lg font-bold text-teks-lembut hover:text-utama"
              aria-label="Tambah jumlah"
            >
              +
            </button>
          </div>
          <p className="text-sm text-teks-lembut">
            Total: <span className="font-bold text-teks">{formatRupiah(totalHarga)}</span>
          </p>
        </div>
      </div>

      {/* Pilih Varian / Catatan */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="input-varian" className="text-sm font-semibold text-teks">
          Varian / Catatan <span className="font-normal text-teks-lembut">(opsional)</span>
        </label>
        <input
          id="input-varian"
          type="text"
          value={varian}
          onChange={(e) => setVarian(e.target.value)}
          placeholder="Contoh: ukuran, warna, atau rasa"
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      {/* Pesan Sukses Ditambahkan */}
      {pesanSukses && (
        <div className="flex items-center justify-between rounded-xl border border-utama/30 bg-utama/10 px-4 py-2.5 text-sm font-semibold text-utama">
          <span>✓ Berhasil ditambahkan ke keranjang!</span>
          <button
            type="button"
            onClick={() => setIsBuka(true)}
            className="underline underline-offset-2 hover:text-utama-gelap"
          >
            Lihat Keranjang
          </button>
        </div>
      )}

      {/* Tombol Aksi */}
      <div className="flex flex-col gap-2.5 sm:flex-row">
        <button
          type="button"
          onClick={handleTambahKeranjang}
          className="inline-flex w-full items-center justify-center rounded-lg border-2 border-utama bg-latar px-5 py-3 font-semibold text-utama transition-colors hover:bg-permukaan sm:w-auto"
        >
          + Tambah ke keranjang
        </button>
        <a
          href={urlWhatsApp}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white transition-colors hover:bg-utama-gelap sm:w-auto"
        >
          Pesan via WhatsApp
        </a>
      </div>
    </div>
  );
}
