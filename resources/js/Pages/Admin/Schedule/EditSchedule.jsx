import React, { useState } from "react";
import { Head, usePage, useForm } from "@inertiajs/react";
import { ArrowLeft, Plus, X } from "lucide-react";
import Sidebar from "../../../Components/Sidebar";
import CustomDateInput from "../../../Components/CustomDateInput";
import CustomTimeInput from "../../../Components/CustomTimeInput";

const EditSchedule = () => {
    const { schedule, fotografers, editors } = usePage().props;

    // Helper untuk format jam dari DB (HH:mm:ss -> HH:mm)
    const formatTime = (time) => {
        if (!time) return "";
        return time.length === 8 ? time.slice(0, 5) : time;
    };

    // Prefill data dari schedule
    const { data, setData, put, processing, errors } = useForm({
        tanggal: schedule.tanggal || "",
        jamMulai: formatTime(schedule.jamMulai) || "",
        jamSelesai: formatTime(schedule.jamSelesai) || "",
        namaEvent: schedule.namaEvent || "",
        fotografer_id: schedule.fotografer_id || "",
        editor_id: schedule.editor_id || "",
        jamEditor: schedule.jamEditor || "",
        lapangan: schedule.lapangan || "",
        catatan: schedule.catatan || "",
        assistants: schedule.assistants
            ? schedule.assistants.map((assist) => ({
                  fotografer_id: assist.fotografer_id,
                  jamAssist: formatTime(assist.jamAssist),
              }))
            : [],
    });

    const [showAssistants, setShowAssistants] = useState(
        schedule.assistants && schedule.assistants.length > 0
    );
    const [showEditor, setShowEditor] = useState(!!schedule.editor_id);
    const [isNewSchedule, setIsNewSchedule] = useState(false); // Track if this is a new schedule being created

    const addOneHour = (timeString) => {
        if (!timeString) return "";
        const [hours, minutes] = timeString.split(":");
        const nextHour = (parseInt(hours) + 1) % 24;
        return `${nextHour.toString().padStart(2, "0")}:${minutes}`;
    };

    // Assistants
    const addAssistant = () => {
        setData((prevData) => ({
            ...prevData,
            assistants: [
                ...prevData.assistants,
                { fotografer_id: "", jamAssist: "" },
            ],
        }));
        setShowAssistants(true);
    };

    const removeAssistant = (index) => {
        setData((prevData) => ({
            ...prevData,
            assistants: prevData.assistants.filter((_, i) => i !== index),
        }));
        if (data.assistants.length === 1) {
            setShowAssistants(false);
        }
    };

    const updateAssistant = (index, field, value) => {
        setData((prevData) => ({
            ...prevData,
            assistants: prevData.assistants.map((assistant, i) =>
                i === index ? { ...assistant, [field]: value } : assistant
            ),
        }));
    };

    // Editor
    const addEditor = () => setShowEditor(true);
    const removeEditor = () => {
        setData((prevData) => ({ ...prevData, editor_id: "", jamEditor: "" }));
        setShowEditor(false);
    };

    // Jam mulai - FIXED: Only auto-set jamSelesai if it's empty or this is a new input
    const handleJamMulaiChange = (time) => {
        setData((prevData) => {
            // Only auto-set jamSelesai if it's currently empty or if user is creating new schedule
            const shouldAutoSetEndTime = !prevData.jamSelesai || isNewSchedule;

            return {
                ...prevData,
                jamMulai: time,
                // Only update jamSelesai if it's empty or this is a new schedule
                jamSelesai: shouldAutoSetEndTime ? addOneHour(time) : prevData.jamSelesai,
            };
        });
    };

    // Handle jamSelesai change independently
    const handleJamSelesaiChange = (time) => {
        setData("jamSelesai", time);
    };

    // Handle tanggal change without affecting times
    const handleTanggalChange = (date) => {
        setData("tanggal", date);
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
                                    onChange={handleTanggalChange}
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

                            {/* Jam - FIXED: Independent controls */}
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
                                        onChange={handleJamSelesaiChange}
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
                                    onChange={(e) => setData("namaEvent", e.target.value)}
                                    placeholder="Masukkan Nama Event"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
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
                                    onChange={(e) => setData("fotografer_id", e.target.value)}
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
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

                            {/* Tombol tambah assist & editor */}
                            <div className="flex gap-4">
                                <button
                                    type="button"
                                    onClick={addAssistant}
                                    className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-300"
                                >
                                    <Plus size={16} />
                                    Tambah Assist
                                </button>
                                {!showEditor && (
                                    <button
                                        type="button"
                                        onClick={addEditor}
                                        className="flex items-center gap-2 px-4 py-2 text-sm bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg transition-colors duration-300"
                                    >
                                        <Plus size={16} />
                                        Tambah Editor
                                    </button>
                                )}
                            </div>

                            {/* Editor Form */}
                            {showEditor && (
                                <div className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-300">
                                    <div className="flex items-center justify-between mb-4">
                                        <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                            Editor
                                        </h4>
                                        <button
                                            type="button"
                                            onClick={removeEditor}
                                            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                        >
                                            <X size={18} />
                                        </button>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Pilih Editor
                                            </label>
                                            <select
                                                value={data.editor_id}
                                                onChange={(e) => setData("editor_id", e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                                            >
                                                <option value="">Pilih Editor</option>
                                                {editors.map((e) => (
                                                    <option key={e.id} value={e.id}>
                                                        {e.nama}
                                                    </option>
                                                ))}
                                            </select>
                                            {errors.editor_id && (
                                                <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                                    {errors.editor_id}
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                Jam Editor
                                            </label>
                                            <input
                                                type="number"
                                                step="0.5"
                                                min="0"
                                                value={data.jamEditor}
                                                onChange={(e) => setData("jamEditor", e.target.value)}
                                                placeholder="0.0"
                                                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                                            />
                                            {errors.jamEditor && (
                                                <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                                    {errors.jamEditor}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assistant Forms */}
                            {showAssistants &&
                                data.assistants.map((assistant, index) => (
                                    <div
                                        key={index}
                                        className="border border-gray-200 dark:border-gray-600 rounded-lg p-4 bg-gray-50 dark:bg-gray-800 transition-colors duration-300"
                                    >
                                        <div className="flex items-center justify-between mb-4">
                                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                                Assistant {index + 1}
                                            </h4>
                                            <button
                                                type="button"
                                                onClick={() => removeAssistant(index)}
                                                className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 transition-colors"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Pilih Assistant
                                                </label>
                                                <select
                                                    value={assistant.fotografer_id || ""}
                                                    onChange={(e) =>
                                                        updateAssistant(
                                                            index,
                                                            "fotografer_id",
                                                            e.target.value
                                                        )
                                                    }
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                                                >
                                                    <option value="">Pilih Assistant</option>
                                                    {fotografers.map((f) => (
                                                        <option key={f.id} value={f.id}>
                                                            {f.nama}
                                                        </option>
                                                    ))}
                                                </select>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                                                    Jam Assist
                                                </label>
                                                <input
                                                    type="number"
                                                    step="0.5"
                                                    min="0"
                                                    value={assistant.jamAssist || ""}
                                                    onChange={(e) =>
                                                        updateAssistant(
                                                            index,
                                                            "jamAssist",
                                                            e.target.value
                                                        )
                                                    }
                                                    placeholder="0.0"
                                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                                                />
                                            </div>
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
                                    onChange={(e) => setData("lapangan", e.target.value)}
                                    placeholder="Masukkan Nama Lapangan"
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
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
                                    onChange={(e) => setData("catatan", e.target.value)}
                                    placeholder="Tambahkan catatan jika ada..."
                                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-300"
                                    rows="3"
                                />
                                {errors.catatan && (
                                    <div className="text-red-500 dark:text-red-400 text-sm mt-1">
                                        {errors.catatan}
                                    </div>
                                )}
                            </div>

                            {/* Submit Button */}
                            <div className="flex justify-end pt-4 border-t border-gray-200 dark:border-gray-600">
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-8 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors duration-300 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
                                >
                                    {processing ? "Updating..." : "Update Schedule"}
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
