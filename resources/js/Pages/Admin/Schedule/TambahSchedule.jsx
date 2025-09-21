import React, { useState } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import { ArrowLeft, Plus, X } from "lucide-react";
import Sidebar from "../../../Components/Sidebar";
import CustomDateInput from "../../../Components/CustomDateInput";
import CustomTimeInput from "../../../Components/CustomTimeInput";

const TambahSchedule = () => {
    const { fotografers, editors } = usePage().props;

    const { data, setData, post, processing, reset, errors } = useForm({
        tanggal: "",
        jamMulai: "",
        jamSelesai: "",
        namaEvent: "",
        fotografer_id: "",
        editor_id: "",
        lapangan: "",
        catatan: "",
        assistants: [], // Array untuk menyimpan assistant tambahan
        additional_editors: [] // Array untuk menyimpan editor tambahan
    });

    // State untuk toggle form tambahan
    const [showAssistants, setShowAssistants] = useState(false);
    const [showAdditionalEditors, setShowAdditionalEditors] = useState(false);

    // Function untuk menambah 1 jam
    const addOneHour = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(':');
        const nextHour = (parseInt(hours) + 1) % 24;
        return `${nextHour.toString().padStart(2, '0')}:${minutes}`;
    };

    // Handler untuk assistant
    const addAssistant = () => {
        setData(prevData => ({
            ...prevData,
            assistants: [...prevData.assistants, ""]
        }));
        setShowAssistants(true);
    };

    const removeAssistant = (index) => {
        setData(prevData => ({
            ...prevData,
            assistants: prevData.assistants.filter((_, i) => i !== index)
        }));
        if (data.assistants.length === 1) {
            setShowAssistants(false);
        }
    };

    const updateAssistant = (index, value) => {
        setData(prevData => ({
            ...prevData,
            assistants: prevData.assistants.map((assistant, i) =>
                i === index ? value : assistant
            )
        }));
    };

    // Handler untuk editor tambahan
    const addAdditionalEditor = () => {
        setData(prevData => ({
            ...prevData,
            additional_editors: [...prevData.additional_editors, ""]
        }));
        setShowAdditionalEditors(true);
    };

    const removeAdditionalEditor = (index) => {
        setData(prevData => ({
            ...prevData,
            additional_editors: prevData.additional_editors.filter((_, i) => i !== index)
        }));
        if (data.additional_editors.length === 1) {
            setShowAdditionalEditors(false);
        }
    };

    const updateAdditionalEditor = (index, value) => {
        setData(prevData => ({
            ...prevData,
            additional_editors: prevData.additional_editors.map((editor, i) =>
                i === index ? value : editor
            )
        }));
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
        post(route("schedule.store"), {
            onSuccess: () => reset(),
        });
    };

    const handleBack = () => {
        window.history.back();
    };

    return (
        <>
            <Head title="Tambah Schedule" />

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
                            Tambah Schedule
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

                            {/* Tombol Tambah Assist */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={addAssistant}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    Tambah Assist
                                </button>

                                <button
                                    type="button"
                                    onClick={addAdditionalEditor}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors"
                                >
                                    <Plus size={16} />
                                    Tambah Editor
                                </button>
                            </div>

                            {/* Assistant Forms */}
                            {showAssistants && data.assistants.map((assistant, index) => (
                                <div key={index} className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Assistant {index + 1}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={assistant}
                                            onChange={(e) => updateAssistant(index, e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Assistant</option>
                                            {fotografers.map((f) => (
                                                <option key={f.id} value={f.id}>
                                                    {f.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeAssistant(index)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

                            {/* Additional Editor Forms */}
                            {showAdditionalEditors && data.additional_editors.map((editor, index) => (
                                <div key={index} className="relative">
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                        Editor Tambahan {index + 1}
                                    </label>
                                    <div className="relative">
                                        <select
                                            value={editor}
                                            onChange={(e) => updateAdditionalEditor(index, e.target.value)}
                                            className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Pilih Editor</option>
                                            {editors.map((e) => (
                                                <option key={e.id} value={e.id}>
                                                    {e.nama}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={() => removeAdditionalEditor(index)}
                                            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                </div>
                            ))}

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
                                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                                >
                                    {processing ? "Saving..." : "Save"}
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
