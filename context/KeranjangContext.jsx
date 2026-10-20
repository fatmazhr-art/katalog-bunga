"use client";

import { createContext, useContext, useState, useEffect } from "react";

const KeranjangContext = createContext();

const STORAGE_KEY = "katalog_keranjang";

export function KeranjangProvider({ children }) {
  const [items, setItems] = useState([]);
  const [isBuka, setIsBuka] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  // Ambil data keranjang dari localStorage saat client mount
  useEffect(() => {
    setIsMounted(true);
    try {
      const dataLokal = localStorage.getItem(STORAGE_KEY);
      if (dataLokal) {
        setItems(JSON.parse(dataLokal));
      }
    } catch (e) {
      console.error("Gagal memuat keranjang dari localStorage", e);
    }
  }, []);

  // Simpan perubahan keranjang ke localStorage
  useEffect(() => {
    if (isMounted) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
      } catch (e) {
        console.error("Gagal menyimpan keranjang ke localStorage", e);
      }
    }
  }, [items, isMounted]);

  const tambahItem = (produk, jumlah = 1, varian = "") => {
    const qty = Math.max(1, parseInt(jumlah, 10) || 1);
    const varTrim = (varian || "").trim();

    setItems((prevItems) => {
      // Cari apakah item dengan id dan varian yang sama sudah ada
      const index = prevItems.findIndex(
        (item) => item.id === produk.id && (item.varian || "") === varTrim
      );

      if (index > -1) {
        const updated = [...prevItems];
        updated[index] = {
          ...updated[index],
          jumlah: updated[index].jumlah + qty,
        };
        return updated;
      }

      return [
        ...prevItems,
        {
          id: produk.id,
          nama: produk.nama,
          harga: produk.harga,
          foto_url: produk.foto_url,
          kategori: produk.kategori,
          jumlah: qty,
          varian: varTrim,
        },
      ];
    });
  };

  const ubahJumlah = (id, varian, jumlahBaru) => {
    const qty = parseInt(jumlahBaru, 10);
    const varTrim = (varian || "").trim();

    if (isNaN(qty) || qty <= 0) {
      hapusItem(id, varian);
      return;
    }

    setItems((prevItems) =>
      prevItems.map((item) =>
        item.id === id && (item.varian || "") === varTrim
          ? { ...item, jumlah: qty }
          : item
      )
    );
  };

  const hapusItem = (id, varian) => {
    const varTrim = (varian || "").trim();
    setItems((prevItems) =>
      prevItems.filter(
        (item) => !(item.id === id && (item.varian || "") === varTrim)
      )
    );
  };

  const kosongkanKeranjang = () => {
    setItems([]);
  };

  const totalItem = items.reduce((acc, curr) => acc + curr.jumlah, 0);
  const totalHarga = items.reduce(
    (acc, curr) => acc + curr.harga * curr.jumlah,
    0
  );

  return (
    <KeranjangContext.Provider
      value={{
        items,
        totalItem: isMounted ? totalItem : 0,
        totalHarga: isMounted ? totalHarga : 0,
        isBuka,
        setIsBuka,
        tambahItem,
        ubahJumlah,
        hapusItem,
        kosongkanKeranjang,
      }}
    >
      {children}
    </KeranjangContext.Provider>
  );
}

export function useKeranjang() {
  const context = useContext(KeranjangContext);
  if (!context) {
    throw new Error("useKeranjang harus digunakan di dalam KeranjangProvider");
  }
  return context;
}

