import Link from "next/link";
import KartuProduk from "@/components/KartuProduk";
import { toko } from "@/lib/toko";
import { createServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function HalamanKatalog({ searchParams }) {
  const params = (await searchParams) || {};
  const cari = params.q ? String(params.q).trim() : "";
  const kategoriTerpilih = params.kategori ? String(params.kategori).trim() : "";

  let daftarProduk = [];
  let semuaKategori = [];
  let errorPesan = null;

  try {
    const supabase = createServerClient();

    // Ambil daftar kategori unik
    const { data: katData } = await supabase
      .from("produk")
      .select("kategori");
    if (katData) {
      semuaKategori = Array.from(
        new Set(katData.map((item) => item.kategori).filter(Boolean))
      ).sort();
    }

    // Query produk sesuai pencarian dan filter kategori
    let query = supabase.from("produk").select("*");

    if (kategoriTerpilih) {
      query = query.eq("kategori", kategoriTerpilih);
    }

    if (cari) {
      query = query.ilike("nama", `%${cari}%`);
    }

    const { data, error } = await query.order("id", { ascending: true });

    if (error) {
      errorPesan = error.message;
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    errorPesan = err.message;
  }

  const adaFilterAktif = Boolean(cari || kategoriTerpilih);

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-6">
        <div className="flex flex-col gap-4">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>

          {/* Form Pencarian */}
          <form method="GET" action="/" className="flex flex-col gap-2.5 sm:flex-row">
            {kategoriTerpilih && (
              <input type="hidden" name="kategori" value={kategoriTerpilih} />
            )}
            <input
              type="text"
              name="q"
              defaultValue={cari}
              placeholder="Cari nama produk..."
              className="w-full rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none sm:max-w-md"
            />
            <div className="flex gap-2">
              <button
                type="submit"
                className="rounded-xl bg-utama px-5 py-2.5 text-sm font-semibold text-white hover:bg-utama-gelap"
              >
                Cari
              </button>
              {adaFilterAktif && (
                <Link
                  href="/"
                  className="inline-flex items-center rounded-xl border border-garis bg-latar px-4 py-2.5 text-sm font-semibold text-teks hover:border-utama hover:text-utama"
                >
                  Reset
                </Link>
              )}
            </div>
          </form>

          {/* Filter Kategori */}
          {semuaKategori.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              <Link
                href={cari ? `/?q=${encodeURIComponent(cari)}` : "/"}
                className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                  !kategoriTerpilih
                    ? "bg-utama text-white"
                    : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                }`}
              >
                Semua
              </Link>
              {semuaKategori.map((kat) => {
                const isActive = kategoriTerpilih === kat;
                const href = isActive
                  ? cari ? `/?q=${encodeURIComponent(cari)}` : "/"
                  : `/?kategori=${encodeURIComponent(kat)}${
                      cari ? `&q=${encodeURIComponent(cari)}` : ""
                    }`;

                return (
                  <Link
                    key={kat}
                    href={href}
                    className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
                      isActive
                        ? "bg-utama text-white"
                        : "border border-garis bg-latar text-teks hover:border-utama hover:text-utama"
                    }`}
                  >
                    {kat}
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {errorPesan ? (
          <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
            <p className="font-semibold">Gagal memuat produk</p>
            <p className="mt-1 text-sm">{errorPesan}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          adaFilterAktif ? (
            <div className="rounded-2xl border border-garis bg-permukaan py-12 text-center">
              <p className="font-semibold text-teks">Tidak ada produk yang cocok</p>
              <p className="mt-1 text-sm text-teks-lembut">
                Coba kata kunci lain atau pilih kategori yang berbeda.
              </p>
              <Link
                href="/"
                className="mt-4 inline-flex items-center rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
              >
                Lihat semua produk
              </Link>
            </div>
          ) : (
            <p className="py-8 text-center text-teks-lembut">Belum ada produk</p>
          )
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
