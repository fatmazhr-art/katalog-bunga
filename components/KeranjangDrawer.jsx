"use client";

import { useKeranjang } from "@/context/KeranjangContext";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function KeranjangDrawer() {
  const {
    items,
    totalItem,
    totalHarga,
    isBuka,
    setIsBuka,
    ubahJumlah,
    hapusItem,
    kosongkanKeranjang,
  } = useKeranjang();

  if (!isBuka) return null;

  // Format pesan WhatsApp untuk semua item di keranjang
  const buatPesanWhatsApp = () => {
    if (items.length === 0) return "";

    const daftar = items
      .map((item, idx) => {
        const subtotal = item.harga * item.jumlah;
        const ketVarian = item.varian ? ` (${item.varian})` : "";
        return `${idx + 1}. ${item.nama}${ketVarian} x ${item.jumlah} = ${formatRupiah(subtotal)}`;
      })
      .join("\n");

    const pesan = `Halo ${toko.nama}, saya ingin memesan beberapa produk berikut:\n\n${daftar}\n\n*Total pesanan: ${formatRupiah(totalHarga)}* (${totalItem} item)\n\nMohon konfirmasi ketersediaan dan ongkirnya ya. Terima kasih!`;

    return `https://wa.me/${toko.nomorWhatsApp}?text=${encodeURIComponent(pesan)}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity"
        onClick={() => setIsBuka(false)}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div className="relative flex h-full w-full max-w-md flex-col bg-latar shadow-2xl">
        {/* Header Drawer */}
        <div className="flex items-center justify-between border-b border-garis px-5 py-4">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-teks">Keranjang Belanja</h2>
            {totalItem > 0 && (
              <span className="rounded-full bg-utama px-2.5 py-0.5 text-xs font-bold text-white">
                {totalItem}
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={() => setIsBuka(false)}
            className="rounded-lg p-1.5 text-teks-lembut hover:bg-permukaan hover:text-teks"
            aria-label="Tutup keranjang"
          >
            ✕
          </button>
        </div>

        {/* Daftar Item */}
        <div className="flex-1 overflow-y-auto p-5">
          {items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-permukaan text-2xl text-teks-lembut">
                🛒
              </div>
              <p className="mt-4 font-semibold text-teks">Keranjang masih kosong</p>
              <p className="mt-1 text-sm text-teks-lembut">
                Pilih produk favoritmu dan tambahkan ke sini.
              </p>
              <button
                type="button"
                onClick={() => setIsBuka(false)}
                className="mt-5 rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
              >
                Mulai Belanja
              </button>
            </div>
          ) : (
            <div className="flex flex-col divide-y divide-garis">
              {items.map((item) => (
                <div key={`${item.id}-${item.varian}`} className="flex gap-4 py-4">
                  {item.foto_url && (
                    <img
                      src={item.foto_url}
                      alt={item.nama}
                      className="h-16 w-16 flex-shrink-0 rounded-xl border border-garis bg-permukaan object-cover"
                    />
                  )}
                  <div className="flex flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="text-sm font-bold text-teks">{item.nama}</h3>
                        {item.varian && (
                          <p className="text-xs text-teks-lembut">Varian: {item.varian}</p>
                        )}
                        <p className="mt-1 text-xs text-teks-lembut">
                          {formatRupiah(item.harga)}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => hapusItem(item.id, item.varian)}
                        className="text-xs text-teks-lembut hover:text-bahaya"
                        title="Hapus produk"
                      >
                        Hapus
                      </button>
                    </div>

                    <div className="mt-3 flex items-center justify-between">
                      {/* Kontrol Jumlah */}
                      <div className="flex items-center rounded-lg border border-garis bg-latar">
                        <button
                          type="button"
                          onClick={() => ubahJumlah(item.id, item.varian, item.jumlah - 1)}
                          className="flex h-7 w-7 items-center justify-center text-sm font-bold text-teks-lembut hover:text-utama"
                        >
                          −
                        </button>
                        <span className="w-8 text-center text-xs font-semibold text-teks">
                          {item.jumlah}
                        </span>
                        <button
                          type="button"
                          onClick={() => ubahJumlah(item.id, item.varian, item.jumlah + 1)}
                          className="flex h-7 w-7 items-center justify-center text-sm font-bold text-teks-lembut hover:text-utama"
                        >
                          +
                        </button>
                      </div>
                      <span className="text-sm font-bold text-teks">
                        {formatRupiah(item.harga * item.jumlah)}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Drawer */}
        {items.length > 0 && (
          <div className="border-t border-garis bg-permukaan/50 p-5">
            <div className="mb-4 flex items-center justify-between">
              <span className="text-sm text-teks-lembut">Total Tagihan ({totalItem} item)</span>
              <span className="text-lg font-extrabold text-teks">{formatRupiah(totalHarga)}</span>
            </div>

            <a
              href={buatPesanWhatsApp()}
              target="_blank"
              rel="noopener noreferrer"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-utama py-3.5 font-bold text-white shadow-sm transition-colors hover:bg-utama-gelap"
            >
              <span>Pesan Semua via WhatsApp</span>
            </a>

            <button
              type="button"
              onClick={kosongkanKeranjang}
              className="mt-3 w-full text-center text-xs text-teks-lembut hover:text-bahaya"
            >
              Kosongkan keranjang
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

