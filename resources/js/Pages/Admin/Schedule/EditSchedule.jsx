import React from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import { ArrowLeft } from "lucide-react";
import Sidebar from "../../../Components/Sidebar";
import CustomDateInput from "../../../Components/CustomDateInput";
import CustomTimeInput from "../../../Components/CustomTimeInput";

const EditSchedule = () => {
    const { schedule, fotografers, editors } = usePage().props;

    // Prefill data dari schedule
    const { data, setData, put, processing, errors } = useForm({
        tanggal: schedule.tanggal || "",
        jamMulai: schedule.jamMulai || "",
        jamSelesai: schedule.jamSelesai || "",
        namaEvent: schedule.namaEvent || "",
        fotografer_id: schedule.fotografer_id || "",
        editor_id: schedule.editor_id || "",
        lapangan: schedule.lapangan || "",
        catatan: schedule.catatan || "",
    });

    // Function untuk menambah 1 jam
    const addOneHour = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(':');
        const nextHour = (parseInt(hours) + 1) % 24;
        return `${nextHour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Handler untuk jam mulai - auto update jam selesai
    const handleJamMulaiChange = (time) => {
        console.log('Jam Mulai changed to:', time);
        console.log('Current Jam Selesai:', data.jamSelesai);

        // Selalu auto-set jam selesai jadi 1 jam setelahnya
        const nextHour = addOneHour(time);
        console.log('Next hour will be:', nextHour);

        setData(prevData => ({
            ...prevData,
            jamMulai: time,
            jamSelesai: nextHour
        }));
    };
        
    const handleSubmit = (e) => {
        e.preventDefault();
        put(route("schedule.update", schedule.id));
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title="Edit Schedule" />

            <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex transition-colors duration-300">
                {/* Sidebar */}
                <Sidebar
                    currentRoute="schedule"
                    onLogout={() => {
                        if (window.confirm("Apakah Anda yakin ingin logout?")) {
                            window.location.href = "/login";
                        }
                    }}
                />

                {/* Main Content */}
                <div className="flex-1 p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <button
                            onClick={handleBack}
                            className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 mb-4 transition-colors"
                        >
                            <ArrowLeft size={20} className="mr-2" />
                            Back
                        </button>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                            Edit Schedule
                        </h1>
                    </div>

                    {/* Form Container */}
                    <div className="max-w-2xl">
                        <form
                            onSubmit={handleSubmit}
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 space-y-6 transition-colors duration-300"
                        >
                            <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-6">
                                Information
                            </h2>

                            {/* Tanggal */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Tanggal
                                </label>
                                <CustomDateInput
                                    value={data.tanggal}
                                    onChange={(date) =>
                                        setData("tanggal", date)
                                    }
                                    placeholder="Pilih tanggal event"
                                    required
                                    disabled={processing}
                                />
                                {errors.tanggal && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.tanggal}
                                    </div>
                                )}
                            </div>

                            {/* Jam Mulai & Jam Selesai */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Jam Mulai
                                    </label>
                                    <CustomTimeInput
                                        value={data.jamMulai}
                                        onChange={handleJamMulaiChange}
                                        placeholder="Pilih jam mulai"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.jamMulai && (
                                        <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                            {errors.jamMulai}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Jam Selesai
                                    </label>
                                    <CustomTimeInput
                                        value={data.jamSelesai}
                                        onChange={(time) =>
                                            setData("jamSelesai", time)
                                        }
                                        placeholder="Pilih jam selesai"
                                        required
                                        disabled={processing}
                                    />
                                    {errors.jamSelesai && (
                                        <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                            {errors.jamSelesai}
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Nama Event */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Nama Event
                                </label>
                                <input
                                    type="text"
                                    value={data.namaEvent}
                                    onChange={(e) =>
                                        setData("namaEvent", e.target.value)
                                    }
                                    placeholder="Masukkan Nama Event"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.namaEvent && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.namaEvent}
                                    </div>
                                )}
                            </div>

                            {/* Fotografer */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Fotografer
                                </label>
                                <select
                                    value={data.fotografer_id}
                                    onChange={(e) =>
                                        setData("fotografer_id", e.target.value)
                                    }
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Pilih Fotografer</option>
                                    {fotografers.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.nama}
                                        </option>
                                    ))}
                                </select>
                                {errors.fotografer_id && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.fotografer_id}
                                    </div>
                                )}
                            </div>

                            {/* Lapangan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Lapangan
                                </label>
                                <input
                                    type="text"
                                    value={data.lapangan}
                                    onChange={(e) =>
                                        setData("lapangan", e.target.value)
                                    }
                                    placeholder="Masukkan Nama Lapangan"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                                {errors.lapangan && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.lapangan}
                                    </div>
                                )}
                            </div>

                            {/* Catatan */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                    Catatan
                                </label>
                                <textarea
                                    value={data.catatan}
                                    onChange={(e) =>
                                        setData("catatan", e.target.value)
                                    }
                                    placeholder="Tambahkan catatan jika ada..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    rows="3"
                                />
                                {errors.catatan && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.catatan}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processing ? "Updating..." : "Update"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </>
    );
};

export default EditSchedule;
