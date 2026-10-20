"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createSessionClient } from "@/lib/supabase/session";

export async function login(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const email = data.get("email");
  const password = data.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (err) {
    return { error: err.message };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (
      error.message.includes("Invalid login credentials") ||
      error.message.includes("invalid_grant")
    ) {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Periksa kembali email dan password." };
  }

  redirect("/admin");
}

export async function logout() {
  try {
    const supabase = await createSessionClient();
    await supabase.auth.signOut();
  } catch {
    // Abaikan error saat proses keluar jika ada
  }

  redirect("/admin/login");
}

export async function gantiPassword(prevState, formData) {
  const data = formData instanceof FormData ? formData : prevState;
  const passwordBaru = data.get("password_baru");
  const konfirmasiPassword = data.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Semua kolom password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password harus sama." };
  }

  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (err) {
    return { error: err.message };
  }

  // Periksa login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Anda harus login terlebih dahulu untuk mengganti password." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: true, message: "Password berhasil diganti." };
}

export async function tambahProduk(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;

  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (err) {
    throw new Error(err.message);
  }

  // 1. Periksa login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  // 2. Ambil data form
  const nama = formData.get("nama");
  const hargaRaw = formData.get("harga");
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori");
  const foto_url = formData.get("foto_url");
  const deskripsi = formData.get("deskripsi");

  if (!nama || isNaN(harga)) {
    throw new Error("Nama dan harga produk wajib diisi.");
  }

  // 3. Simpan ke database
  const { error } = await supabase.from("produk").insert({
    nama: String(nama).trim(),
    harga,
    kategori: kategori ? String(kategori).trim() : null,
    foto_url: foto_url ? String(foto_url).trim() : null,
    deskripsi: deskripsi ? String(deskripsi).trim() : null,
  });

  if (error) {
    throw new Error(`Gagal menyimpan produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath("/");
  redirect("/admin");
}

export async function ubahProduk(idOrFormData, maybeFormData) {
  let id;
  let formData;

  if (maybeFormData instanceof FormData) {
    id = idOrFormData;
    formData = maybeFormData;
  } else {
    formData = idOrFormData;
    id = formData.get("id");
  }

  let supabase;
  try {
    supabase = await createSessionClient();
  } catch (err) {
    throw new Error(err.message);
  }

  // 1. Periksa login di server
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    throw new Error("Akses ditolak: Anda harus login sebagai admin.");
  }

  // 2. Ambil data form
  const nama = formData.get("nama");
  const hargaRaw = formData.get("harga");
  const harga = parseInt(hargaRaw, 10);
  const kategori = formData.get("kategori");
  const foto_url = formData.get("foto_url");
  const deskripsi = formData.get("deskripsi");

  if (!id || !nama || isNaN(harga)) {
    throw new Error("ID, nama, dan harga produk wajib diisi.");
  }

  // 3. Simpan perubahan ke database
  const { error } = await supabase
    .from("produk")
    .update({
      nama: String(nama).trim(),
      harga,
      kategori: kategori ? String(kategori).trim() : null,
      foto_url: foto_url ? String(foto_url).trim() : null,
      deskripsi: deskripsi ? String(deskripsi).trim() : null,
    })
    .eq("id", id);

  if (error) {
    throw new Error(`Gagal mengubah produk: ${error.message}`);
  }

  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  revalidatePath("/");
  redirect("/admin");
}


