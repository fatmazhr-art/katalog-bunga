import NavAdmin from "@/components/NavAdmin";
import TabelProduk from "@/components/TabelProduk";
import Tombol from "@/components/Tombol";
import { createServerClient } from "@/lib/supabase/server";
import { createSessionClient } from "@/lib/supabase/session";

export const dynamic = "force-dynamic";

export default async function HalamanAdmin() {
  let daftarProduk = [];
  let errorPesan = null;

  try {
    let supabase;
    try {
      supabase = await createSessionClient();
    } catch {
      supabase = createServerClient();
    }

    const { data, error } = await supabase
      .from("produk")
      .select("*")
      .order("id", { ascending: true });

    if (error) {
      const adminClient = createServerClient();
      const { data: fallbackData, error: fallbackError } = await adminClient
        .from("produk")
        .select("*")
        .order("id", { ascending: true });

      if (fallbackError) {
        errorPesan = fallbackError.message;
      } else {
        daftarProduk = fallbackData || [];
      }
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    errorPesan = err.message;
  }

  return (
    <div className="flex flex-col gap-6 py-8">
      <NavAdmin />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-2xl font-extrabold">Produk</h1>
        {/* US-08 (bonus): tambah produk */}
        <Tombol href="/admin/produk/baru">Tambah produk</Tombol>
      </div>

      {errorPesan ? (
        <div className="rounded-xl border border-garis bg-permukaan p-4 text-bahaya">
          <p className="font-semibold">Gagal memuat produk</p>
          <p className="mt-1 text-sm">{errorPesan}</p>
        </div>
      ) : (
        <TabelProduk daftarProduk={daftarProduk} />
      )}
    </div>
  );
}
