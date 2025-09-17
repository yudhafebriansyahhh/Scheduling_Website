import React, { useState } from "react";
import { useForm, Link } from "@inertiajs/react";

export default function Create({ users }) {
  const { data, setData, post, processing, errors } = useForm({
    judul: "",
    deskripsi: "",
    tanggal: "",
    jam_mulai: "",
    jam_selesai: "",
    id_fotografer: "",
    id_editor: "",
  });

  const submit = (e) => {
    e.preventDefault();
    post(route("schedules.store"));
  };

  return (
    <div className="p-6">
      <h1 className="text-xl font-bold mb-4">Tambah Schedule</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block font-medium">Judul</label>
          <input
            type="text"
            value={data.judul}
            onChange={(e) => setData("judul", e.target.value)}
            className="border rounded p-2 w-full"
          />
          {errors.judul && <div className="text-red-600">{errors.judul}</div>}
        </div>

        <div>
          <label className="block font-medium">Deskripsi</label>
          <textarea
            value={data.deskripsi}
            onChange={(e) => setData("deskripsi", e.target.value)}
            className="border rounded p-2 w-full"
          />
          {errors.deskripsi && (
            <div className="text-red-600">{errors.deskripsi}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Tanggal</label>
          <input
            type="date"
            value={data.tanggal}
            onChange={(e) => setData("tanggal", e.target.value)}
            className="border rounded p-2 w-full"
          />
          {errors.tanggal && (
            <div className="text-red-600">{errors.tanggal}</div>
          )}
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="block font-medium">Jam Mulai</label>
            <input
              type="time"
              value={data.jam_mulai}
              onChange={(e) => setData("jam_mulai", e.target.value)}
              className="border rounded p-2 w-full"
            />
            {errors.jam_mulai && (
              <div className="text-red-600">{errors.jam_mulai}</div>
            )}
          </div>
          <div className="flex-1">
            <label className="block font-medium">Jam Selesai</label>
            <input
              type="time"
              value={data.jam_selesai}
              onChange={(e) => setData("jam_selesai", e.target.value)}
              className="border rounded p-2 w-full"
            />
            {errors.jam_selesai && (
              <div className="text-red-600">{errors.jam_selesai}</div>
            )}
          </div>
        </div>

        <div>
          <label className="block font-medium">Fotografer</label>
          <select
            value={data.id_fotografer}
            onChange={(e) => setData("id_fotografer", e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Pilih Fotografer --</option>
            {users
              .filter((u) => u.role === "fotografer")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          {errors.id_fotografer && (
            <div className="text-red-600">{errors.id_fotografer}</div>
          )}
        </div>

        <div>
          <label className="block font-medium">Editor</label>
          <select
            value={data.id_editor}
            onChange={(e) => setData("id_editor", e.target.value)}
            className="border rounded p-2 w-full"
          >
            <option value="">-- Pilih Editor --</option>
            {users
              .filter((u) => u.role === "editor")
              .map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
          </select>
          {errors.id_editor && (
            <div className="text-red-600">{errors.id_editor}</div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="submit"
            disabled={processing}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Simpan
          </button>
          <Link
            href={route("schedules.index")}
            className="bg-gray-300 px-4 py-2 rounded hover:bg-gray-400"
          >
            Batal
          </Link>
        </div>
      </form>
    </div>
  );
}
