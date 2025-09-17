import React from 'react';
import { Head, usePage, useForm } from '@inertiajs/react';
import { ArrowLeft } from 'lucide-react';
import Sidebar from '../../../Components/Sidebar';

const TambahSchedule = () => {
  const { fotografers, editors } = usePage().props;

  const { data, setData, post, processing, reset, errors } = useForm({
    tanggal: '',
    jamMulai: '',
    jamSelesai: '',
    namaEvent: '',
    fotografer_id: '',
    editor_id: '',
    lapangan: '',
    catatan: '',
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    post(route('schedule.store'), {
      onSuccess: () => reset(),
    });
  };

  const handleBack = () => {
    window.history.back();
  };

  return (
    <>
      <Head title="Tambah Schedule" />

      <div className="min-h-screen bg-gray-50 flex">
        {/* Sidebar */}
        <Sidebar
          currentRoute="fotografer"
          onLogout={() => {
            if (window.confirm('Apakah Anda yakin ingin logout?')) {
              window.location.href = '/login';
            }
          }}
        />

        {/* Main Content */}
        <div className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={handleBack}
              className="flex items-center text-gray-600 hover:text-gray-800 mb-4 transition-colors"
            >
              <ArrowLeft size={20} className="mr-2" />
              Back
            </button>
            <h1 className="text-2xl font-bold text-gray-800">Tambah Schedule</h1>
          </div>

          {/* Form Container */}
          <div className="max-w-2xl">
            <form
              onSubmit={handleSubmit}
              className="bg-white rounded-lg shadow-sm border p-8 space-y-6"
            >
              <h2 className="text-lg font-semibold text-gray-800 mb-6">Information</h2>

              {/* Tanggal */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tanggal
                </label>
                <input
                  type="date"
                  value={data.tanggal}
                  onChange={(e) => setData('tanggal', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
                {errors.tanggal && <div className="text-red-500 text-sm">{errors.tanggal}</div>}
              </div>

              {/* Jam Mulai & Jam Selesai */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Mulai
                  </label>
                  <input
                    type="time"
                    value={data.jamMulai}
                    onChange={(e) => setData('jamMulai', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                  {errors.jamMulai && <div className="text-red-500 text-sm">{errors.jamMulai}</div>}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Jam Selesai
                  </label>
                  <input
                    type="time"
                    value={data.jamSelesai}
                    onChange={(e) => setData('jamSelesai', e.target.value)}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                    required
                  />
                  {errors.jamSelesai && <div className="text-red-500 text-sm">{errors.jamSelesai}</div>}
                </div>
              </div>

              {/* Nama Event */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nama Event
                </label>
                <input
                  type="text"
                  value={data.namaEvent}
                  onChange={(e) => setData('namaEvent', e.target.value)}
                  placeholder="Masukkan Nama Event"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
                {errors.namaEvent && <div className="text-red-500 text-sm">{errors.namaEvent}</div>}
              </div>

              {/* Fotografer */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fotografer
                </label>
                <select
                  value={data.fotografer_id}
                  onChange={(e) => setData('fotografer_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  required
                >
                  <option value="">Pilih Fotografer</option>
                  {fotografers.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.nama}
                    </option>
                  ))}
                </select>
                {errors.fotografer_id && <div className="text-red-500 text-sm">{errors.fotografer_id}</div>}
              </div>

              {/* Editor */}
              {/* <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Editor
                </label>
                <select
                  value={data.editor_id}
                  onChange={(e) => setData('editor_id', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-white"
                  required
                >
                  <option value="">Pilih Editor</option>
                  {editors.map((e) => (
                    <option key={e.id} value={e.id}>
                      {e.nama}
                    </option>
                  ))}
                </select>
                {errors.editor_id && <div className="text-red-500 text-sm">{errors.editor_id}</div>}
              </div> */}

              {/* Lapangan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Lapangan
                </label>
                <input
                  type="text"
                  value={data.lapangan}
                  onChange={(e) => setData('lapangan', e.target.value)}
                  placeholder="Masukkan Nama Lapangan"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  required
                />
                {errors.lapangan && <div className="text-red-500 text-sm">{errors.lapangan}</div>}
              </div>

              {/* Catatan */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Catatan
                </label>
                <textarea
                  value={data.catatan}
                  onChange={(e) => setData('catatan', e.target.value)}
                  placeholder="Tambahkan catatan jika ada..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg"
                  rows="3"
                />
                {errors.catatan && <div className="text-red-500 text-sm">{errors.catatan}</div>}
              </div>

              {/* Submit Button */}
              <div className="flex justify-end pt-4">
                <button
                  type="submit"
                  disabled={processing}
                  className="px-8 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition disabled:opacity-50"
                >
                  {processing ? 'Saving...' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default TambahSchedule;
