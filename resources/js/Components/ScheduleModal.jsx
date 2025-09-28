import React from "react";
import { router } from '@inertiajs/react';
import {
    X,
    Calendar,
    Clock,
    MapPin,
    Users,
    FileText,
    User,
    Edit3,
    Camera,
    AlertCircle,
} from "lucide-react";

export default function ScheduleModal({ schedule, onClose }) {
    if (!schedule) return null;

    const formatDate = (dateString) => {
        if (!dateString) return "--";
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    const formatTime = (time) => {
        if (!time) return "--:--";
        return time.split(":").slice(0, 2).join(":");
    };

    const getStatusColor = (status) => {
        const statusColors = {
            in_progress: "bg-green-100 text-green-800 border-green-200",
            pending: "bg-yellow-100 text-yellow-800 border-yellow-200",
            completed: "bg-blue-100 text-blue-800 border-blue-200",
            cancelled: "bg-red-100 text-red-800 border-red-200",
        };
        return (
            statusColors[status] || "bg-gray-100 text-gray-800 border-gray-200"
        );
    };

    const getStatusText = (status) => {
        const statusTexts = {
            in_progress: "Sedang Berjalan",
            pending: "Menunggu",
            completed: "Selesai",
            cancelled: "Dibatalkan",
        };
        return statusTexts[status] || "Unknown";
    };

    const calculateDuration = () => {
        if (!schedule.jamMulai || !schedule.jamSelesai) return 0;

        const start = new Date(`2000-01-01 ${schedule.jamMulai}`);
        const end = new Date(`2000-01-01 ${schedule.jamSelesai}`);

        if (end <= start) {
            end.setDate(end.getDate() + 1);
        }

        const duration = (end - start) / (1000 * 60 * 60);
        return Math.round(duration * 10) / 10; // Round to 1 decimal place
    };

    const handleEdit = () => {
        if (schedule.id) {
            router.visit(`/schedule/${schedule.id}/edit`);
        } else {
            console.error('Schedule ID is missing');
        }
    };

    // Helper function untuk mendapatkan nama lapangan
    const getLapanganName = (lapangan) => {
        // Jika lapangan adalah object dengan property nama
        if (lapangan && typeof lapangan === 'object' && lapangan.nama) {
            return lapangan.nama;
        }
        // Jika lapangan adalah string langsung
        if (typeof lapangan === 'string') {
            return lapangan;
        }
        // Jika tidak ada atau null
        return 'Tidak ada lapangan';
    };

    return (
        <>
            {/* Overlay */}
            <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                {/* Modal */}
                <div className="bg-white dark:bg-gray-900 rounded-lg shadow-xl max-w-lg w-full max-h-[85vh] overflow-y-auto">
                    {/* Header */}
                    <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
                        <div className="flex items-center">
                            <Calendar className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2" />
                            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                Detail Jadwal
                            </h2>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-1.5 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-4 space-y-4">
                        {/* Status Badge */}
                        <div className="flex justify-center">
                            <span
                                className={`px-3 py-1.5 rounded-full text-xs font-medium border ${getStatusColor(
                                    schedule.status
                                )}`}
                            >
                                {getStatusText(schedule.status)}
                            </span>
                        </div>

                        {/* Main Info - Single Column */}
                        <div className="space-y-3">
                            {/* Tanggal */}
                            <div className="flex items-start space-x-3">
                                <Calendar className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Tanggal
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {formatDate(schedule.tanggal)}
                                    </p>
                                </div>
                            </div>

                            {/* Waktu */}
                            <div className="flex items-start space-x-3">
                                <Clock className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Waktu
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {formatTime(schedule.jamMulai)} -{" "}
                                        {formatTime(schedule.jamSelesai)}
                                    </p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        Durasi: {calculateDuration()} jam
                                    </p>
                                </div>
                            </div>

                            {/* Nama Event */}
                            <div className="flex items-start space-x-3">
                                <FileText className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                <div className="min-w-0 flex-1">
                                    <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Nama Event
                                    </p>
                                    <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                        {schedule.namaEvent ||
                                            "Tidak ada nama event"}
                                    </p>
                                </div>
                            </div>

                            {/* Lapangan - Perbaikan untuk menangani struktur data baru */}
                            {(schedule.lapangan || schedule.location) && (
                                <div className="flex items-start space-x-3">
                                    <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Lapangan
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                            {getLapanganName(schedule.lapangan) ||
                                             getLapanganName(schedule.location) ||
                                             "Tidak ada lapangan"}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Fotografer */}
                            {schedule.fotografer && schedule.fotografer !== '-' && (
                                <div className="flex items-start space-x-3">
                                    <Camera className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Fotografer
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                            {typeof schedule.fotografer === 'object' && schedule.fotografer?.nama
                                                ? schedule.fotografer.nama
                                                : schedule.fotografer}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Editor */}
                            {schedule.editor && schedule.editor !== '-' && (
                                <div className="flex items-start space-x-3">
                                    <Edit3 className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                            Editor
                                        </p>
                                        <p className="text-sm text-gray-900 dark:text-gray-100 font-medium">
                                            {typeof schedule.editor === 'object' && schedule.editor?.nama
                                                ? schedule.editor.nama
                                                : schedule.editor}
                                        </p>
                                    </div>
                                </div>
                            )}

                        </div>

                        {/* Catatan */}
                        {schedule.catatan && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="flex items-start space-x-3">
                                    <AlertCircle className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-1 flex-shrink-0" />
                                    <div className="min-w-0 flex-1">
                                        <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">
                                            Catatan
                                        </p>
                                        <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-3">
                                            <p className="text-sm text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                                                {schedule.catatan}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Additional Info if exists */}
                        {(schedule.jamFotografer || schedule.jamEditor) && (
                            <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                                <div className="grid grid-cols-3 gap-2 text-center">
                                    {schedule.jamFotografer && (
                                        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Jam Fotografer
                                            </p>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400">
                                                {schedule.jamFotografer}h
                                            </p>
                                        </div>
                                    )}

                                    {schedule.jamEditor && (
                                        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-2">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                Jam Editor
                                            </p>
                                            <p className="text-sm font-bold text-green-600 dark:text-green-400">
                                                {schedule.jamEditor}h
                                            </p>
                                        </div>
                                    )}

                                    <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-2">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            Durasi Total
                                        </p>
                                        <p className="text-sm font-bold text-purple-600 dark:text-purple-400">
                                            {calculateDuration()}h
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end items-center p-4 border-t border-gray-200 dark:border-gray-700 space-x-2">
                        <button
                            onClick={onClose}
                            className="px-3 py-1.5 text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                        >
                            Tutup
                        </button>
                        {schedule.id && (
                            <button
                                onClick={handleEdit}
                                className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                            >
                                Edit
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
