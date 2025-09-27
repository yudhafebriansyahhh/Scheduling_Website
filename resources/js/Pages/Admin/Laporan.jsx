import React, { useState, useMemo } from "react";
import { Head, router, usePage } from "@inertiajs/react";
import { ArrowLeft, Copy, CheckCircle } from "lucide-react";

// Import components
import Sidebar from "../../Components/Sidebar";
import LaporanSummaryCards from "../../Components/Laporan/LaporanSummaryCards";
import LaporanFilters from "../../Components/Laporan/LaporanFilters";
import LaporanExportButtons from "../../Components/Laporan/LaporanExportButtons";
import LaporanTable from "../../Components/Laporan/LaporanTable";

// Import utilities
import { exportToCSV, exportToPDF } from "../../utils/laporanExportUtils";

// Custom hook untuk filtering dan summary
const useFilteredData = (
    data,
    assistData,
    editorAssistData,
    searchTerm,
    filterStatus,
    filterRole,
    filterDateFrom,
    filterDateTo
) => {
    // Konversi ke menit
    const timeToMinutes = (timeValue) => {
        if (!timeValue) return 0;

        // Kalau number (misalnya 9.5)
        if (typeof timeValue === "number") {
            const hours = Math.floor(timeValue);
            const minutes = Math.round((timeValue - hours) * 60);
            return hours * 60 + minutes;
        }

        // Kalau string angka desimal
        if (!isNaN(timeValue)) {
            const num = parseFloat(timeValue);
            const hours = Math.floor(num);
            const minutes = Math.round((num - hours) * 60);
            return hours * 60 + minutes;
        }

        // Kalau format HH:MM(:SS)
        const timeStr = timeValue.toString().trim();
        const parts = timeStr.split(":");
        if (parts.length >= 2) {
            const hours = parseInt(parts[0], 10) || 0;
            const minutes = parseInt(parts[1], 10) || 0;
            const seconds = parts.length > 2 ? parseInt(parts[2], 10) || 0 : 0;
            return hours * 60 + minutes + Math.round(seconds / 60);
        }

        return 0;
    };

    // Konversi menit → jam desimal
    const minutesToDecimal = (totalMinutes) => {
        const value = totalMinutes / 60;
        return value % 1 === 0 ? value.toFixed(0) : value.toFixed(1);
    };

    // Helper untuk parse tanggal dari berbagai format
    const parseDate = (dateValue) => {
        if (!dateValue) return null;

        try {
            const date = new Date(dateValue);
            // Reset ke awal hari untuk perbandingan yang akurat
            date.setHours(0, 0, 0, 0);
            return date;
        } catch (error) {
            return null;
        }
    };

    const filteredData = useMemo(() => {
        let sourceData = data;

        // PERBAIKAN: Fix logic untuk filterRole editor
        if (filterRole === "assist") {
            sourceData = assistData || [];
        } else if (filterRole === "editorAssist") {
            sourceData = editorAssistData || [];
        } else if (filterRole === "editor") {
            // PERBAIKAN: Untuk editor filter, gunakan data yang memiliki editor utama atau assistant editor
            // Bukan dari editorAssistData, tapi dari data utama yang memiliki editor
            sourceData = data.filter(item => item.editor || (item.editor_assists && item.editor_assists.length > 0));
        }

        return sourceData.filter((item) => {
            // Dynamic search based on filterRole
            let matchSearch = false;

            // Basic search (selalu ada)
            const basicSearch =
                item.namaEvent
                    ?.toLowerCase()
                    .includes(searchTerm.toLowerCase()) ||
                item.lapangan?.toLowerCase().includes(searchTerm.toLowerCase());

            // Role-specific search
            if (filterRole === "all") {
                matchSearch =
                    basicSearch ||
                    item.fotografer?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase()) ||
                    item.editor?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
            } else if (filterRole === "fotografer") {
                matchSearch =
                    basicSearch ||
                    item.fotografer?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
            } else if (filterRole === "editor") {
                // PERBAIKAN: Untuk editor filter, cari berdasarkan editor utama
                matchSearch =
                    basicSearch ||
                    item.editor?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
            } else if (filterRole === "assist") {
                matchSearch =
                    basicSearch ||
                    item.assistFotografer?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
            } else if (filterRole === "editorAssist") {
                matchSearch =
                    basicSearch ||
                    item.assistEditor?.nama
                        ?.toLowerCase()
                        .includes(searchTerm.toLowerCase());
            } else {
                matchSearch = basicSearch;
            }

            // Status filter
            const matchStatus =
                filterStatus === "all" || item.status === filterStatus;

            // Date filter
            let matchDate = true;
            if (filterDateFrom || filterDateTo) {
                const itemDate = parseDate(item.tanggal);
                const fromDate = parseDate(filterDateFrom);
                const toDate = parseDate(filterDateTo);

                if (itemDate) {
                    if (fromDate && itemDate < fromDate) matchDate = false;
                    if (toDate && itemDate > toDate) matchDate = false;
                } else {
                    // Jika tidak bisa parse tanggal item, exclude dari hasil
                    matchDate = false;
                }
            }

            return matchSearch && matchStatus && matchDate;
        });
    }, [
        data,
        assistData,
        editorAssistData,
        searchTerm,
        filterStatus,
        filterRole,
        filterDateFrom,
        filterDateTo,
    ]);

    const summary = useMemo(() => {
        let totalMinutesFotografer = 0;
        let totalMinutesEditor = 0;
        let totalMinutesAssist = 0;

        if (filterRole === "assist" || filterRole === "editorAssist") {
            // Untuk assist dan editor assist, hitung total jam assist
            totalMinutesAssist = filteredData.reduce((sum, item) => {
                return sum + timeToMinutes(item.jamAssist || 0);
            }, 0);
        } else if (filterRole === "editor") {
            // PERBAIKAN: Untuk editor, hitung jam editor utama (totalMinutesEditor)
            totalMinutesEditor = filteredData.reduce((sum, item) => {
                return sum + timeToMinutes(item.jamEditor || 0);
            }, 0);
        // Jangan set totalMinutesAssist di sini
        } else {
            // Untuk role lain, hitung seperti biasa
            totalMinutesFotografer = filteredData.reduce((sum, item) => {
                return sum + timeToMinutes(item.jamFotografer);
            }, 0);

            totalMinutesEditor = filteredData.reduce((sum, item) => {
                return sum + timeToMinutes(item.jamEditor);
            }, 0);
        }

        return {
            totalJobs: filteredData.length,
            completedJobs: filteredData.filter(
                (item) => item.status === "completed"
            ).length,
            totalJamFotografer: minutesToDecimal(totalMinutesFotografer),
            totalJamEditor: minutesToDecimal(totalMinutesEditor),
            totalJamAssist: minutesToDecimal(totalMinutesAssist),
            totalMinutesFotografer,
            totalMinutesEditor,
            totalMinutesAssist,
            filterRole,
        };
    }, [filteredData, filterRole]);

    return { filteredData, summary };
};

const Laporan = ({ stats }) => {
    // Ambil props dari Laravel (ScheduleController)
    const { schedules, assistSchedules, editorAssistSchedules } = usePage().props;

    // State management
    const [searchTerm, setSearchTerm] = useState("");
    const [filterStatus, setFilterStatus] = useState("all");
    const [filterRole, setFilterRole] = useState("all");
    const [filterDateFrom, setFilterDateFrom] = useState("");
    const [filterDateTo, setFilterDateTo] = useState("");
    const [selectedDetail, setSelectedDetail] = useState(null);
    const [showDetailModal, setShowDetailModal] = useState(false);
    const [copiedLink, setCopiedLink] = useState(null);

    // Pagination states
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const { filteredData, summary } = useFilteredData(
        schedules,
        assistSchedules,
        editorAssistSchedules,
        searchTerm,
        filterStatus,
        filterRole,
        filterDateFrom,
        filterDateTo
    );

    // Reset pagination when filters change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [
        searchTerm,
        filterStatus,
        filterRole,
        filterDateFrom,
        filterDateTo,
        itemsPerPage,
    ]);

    // Event handlers
    const handleBack = () => {
        window.history.back();
    };

    const handleExportCSV = () => {
        console.log("Export CSV with filterRole:", filterRole);
        exportToCSV(filteredData, filterRole);
    };

    const handleExportPDF = () => {
        console.log("Export PDF with filterRole:", filterRole);
        exportToPDF(filteredData, summary, filterRole);
    };

    const handleShowDetail = (item) => {
        setSelectedDetail(item);
        setShowDetailModal(true);
    };

    const handleAddSchedule = () => {
        router.visit("/schedule/create");
    };

    const handleLogout = () => {
        if (window.confirm("Apakah Anda yakin ingin logout?")) {
            router.post(
                "/logout",
                {},
                {
                    onSuccess: () => {
                        console.log("Logout successful");
                    },
                    onError: (errors) => {
                        console.error("Logout failed:", errors);
                        alert("Gagal logout, silahkan coba lagi");
                    },
                }
            );
        }
    };

    // Function to copy link to clipboard
    const copyToClipboard = async (text, linkType) => {
        if (!text) return;

        try {
            await navigator.clipboard.writeText(text);
            setCopiedLink(linkType);
            setTimeout(() => setCopiedLink(null), 2000);
        } catch (err) {
            console.error('Failed to copy: ', err);
            // Fallback untuk browser lama
            const textArea = document.createElement('textarea');
            textArea.value = text;
            document.body.appendChild(textArea);
            textArea.focus();
            textArea.select();
            try {
                document.execCommand('copy');
                setCopiedLink(linkType);
                setTimeout(() => setCopiedLink(null), 2000);
            } catch (fallbackErr) {
                console.error('Fallback copy failed: ', fallbackErr);
            }
            document.body.removeChild(textArea);
        }
    };

    // Get total count for filter info
    const getTotalCount = () => {
        if (filterRole === "assist") {
            return assistSchedules?.length || 0;
        } else if (filterRole === "editorAssist") {
            return editorAssistSchedules?.length || 0;
        } else if (filterRole === "editor") {
            // PERBAIKAN: Total count untuk editor filter
            return schedules.filter(item => item.editor || (item.editor_assists && item.editor_assists.length > 0)).length;
        }
        return schedules.length;
    };

    return (
        <>
            <Head title="Laporan" />
            <div className="flex min-h-screen bg-gray-50 dark:bg-gray-950 transition-colors duration-300">
                {/* Sidebar */}
                <Sidebar currentRoute="schedule" onLogout={handleLogout} />

                {/* Main Content */}
                <div className="flex-1 p-4 lg:p-8">
                    {/* Header */}
                    <div className="mb-8">
                        <div className="flex items-center mb-6">
                            <button
                                onClick={handleBack}
                                className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-gray-100 transition-colors mr-4"
                            >
                                <ArrowLeft size={20} className="mr-2" />
                                Back
                            </button>
                            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
                                Laporan
                            </h1>
                        </div>

                        {/* Summary Cards */}
                        <LaporanSummaryCards summary={summary} />

                        {/* Export Buttons */}
                        <LaporanExportButtons
                            onExportCSV={handleExportCSV}
                            onExportPDF={handleExportPDF}
                            onAddSchedule={handleAddSchedule}
                        />

                        {/* Filters with Pagination */}
                        <LaporanFilters
                            searchTerm={searchTerm}
                            setSearchTerm={setSearchTerm}
                            filterStatus={filterStatus}
                            setFilterStatus={setFilterStatus}
                            filterRole={filterRole}
                            setFilterRole={setFilterRole}
                            filterDateFrom={filterDateFrom}
                            setFilterDateFrom={setFilterDateFrom}
                            filterDateTo={filterDateTo}
                            setFilterDateTo={setFilterDateTo}
                            itemsPerPage={itemsPerPage}
                            setItemsPerPage={setItemsPerPage}
                            filteredCount={filteredData.length}
                            totalCount={getTotalCount()}
                        />
                    </div>

                    {/* Table */}
                    <LaporanTable
                        filteredData={filteredData}
                        onShowDetail={handleShowDetail}
                        filterRole={filterRole}
                        currentPage={currentPage}
                        itemsPerPage={itemsPerPage}
                        onPageChange={setCurrentPage}
                    />
                </div>
            </div>

            {/* Detail Modal */}
            {showDetailModal && selectedDetail && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white dark:bg-gray-800 rounded-xl p-6 max-w-md w-full mx-4 transition-colors duration-300 max-h-[90vh] flex flex-col">
                        <h3 className="text-xl font-semibold mb-6 text-gray-900 dark:text-gray-100">
                            Detail Laporan
                        </h3>

                        {/* Scrollable Content */}
                        <div
                            className="flex-1 overflow-y-auto pr-2"
                            style={{
                                scrollbarWidth: 'thin',
                                scrollbarColor: '#3b82f6 rgba(0, 0, 0, 0.1)'
                            }}
                            onLoad={(e) => {
                                const style = document.createElement('style');
                                style.textContent = `
                                    .custom-modal-scroll::-webkit-scrollbar {
                                        width: 6px;
                                    }
                                    .custom-modal-scroll::-webkit-scrollbar-track {
                                        background: rgba(0, 0, 0, 0.1);
                                        border-radius: 3px;
                                    }
                                    .custom-modal-scroll::-webkit-scrollbar-thumb {
                                        background: #3b82f6;
                                        border-radius: 3px;
                                    }
                                    .custom-modal-scroll::-webkit-scrollbar-thumb:hover {
                                        background: #2563eb;
                                    }
                                `;
                                if (!document.head.querySelector('[data-custom-modal-scroll]')) {
                                    style.setAttribute('data-custom-modal-scroll', 'true');
                                    document.head.appendChild(style);
                                }
                                e.target.classList.add('custom-modal-scroll');
                            }}
                        >
                            <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
                            {/* Tim & Tanggal - One Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Nama Event:
                                    </p>
                                    <p>{selectedDetail.namaEvent}</p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Tanggal:
                                    </p>
                                    <p>
                                        {new Date(
                                            selectedDetail.tanggal
                                        ).toLocaleDateString("id-ID")}
                                    </p>
                                </div>
                            </div>

                            {/* Jam Mulai & Selesai - One Row */}
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Jam Mulai:
                                    </p>
                                    <p>
                                        {selectedDetail.jamMulai?.slice(0, 5)}
                                    </p>
                                </div>
                                <div>
                                    <p className="font-medium text-gray-900 dark:text-gray-100">
                                        Jam Selesai:
                                    </p>
                                    <p>
                                        {selectedDetail.jamSelesai?.slice(0, 5)}
                                    </p>
                                </div>
                            </div>

                            {/* Fotografer & Jam - One Row (tidak tampil untuk role assist atau editorAssist atau editor) */}
                            {!["assist", "editorAssist", "editor"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "fotografer") && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Fotografer:
                                            </p>
                                            <p>
                                                {selectedDetail.fotografer
                                                    ?.nama || "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Jam Fotografer:
                                            </p>
                                            <p>
                                                {(() => {
                                                    const jam =
                                                        selectedDetail.jamFotografer ??
                                                        0;
                                                    return parseFloat(jam) %
                                                        1 ===
                                                        0
                                                        ? parseInt(jam)
                                                        : jam
                                                              .toString()
                                                              .replace(
                                                                  ".",
                                                                  ","
                                                              );
                                                })()}{" "}
                                                jam
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* PERBAIKAN: Editor info - untuk role editor */}
                            {filterRole === "editor" && (
                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Editor:
                                            </p>
                                            <p>
                                                {selectedDetail.editor?.nama || '-'}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Match Editor:
                                            </p>
                                            <p>
                                                {(() => {
                                                    const jam =
                                                        selectedDetail.jamEditor ?? 0;
                                                    return parseFloat(jam) %
                                                        1 ===
                                                        0
                                                        ? parseInt(jam)
                                                        : jam
                                                              .toString()
                                                              .replace(
                                                                  ".",
                                                                  ","
                                                              );
                                                })()} match
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Assistant info - untuk role assist */}
                            {filterRole === "assist" &&
                                selectedDetail.assistFotografer && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Fotografer Utama:
                                                </p>
                                                <p>
                                                    {selectedDetail
                                                        .mainFotografer?.nama ||
                                                        selectedDetail
                                                            .fotografer?.nama}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Assistant (Fotografer):
                                                </p>
                                                <p>
                                                    {
                                                        selectedDetail
                                                            .assistFotografer
                                                            .nama
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Jam Assist:
                                                </p>
                                                <p>
                                                    {(() => {
                                                        const jam =
                                                            selectedDetail.jamAssist ??
                                                            0;
                                                        return parseFloat(jam) %
                                                            1 ===
                                                            0
                                                            ? parseInt(jam)
                                                            : jam
                                                                  .toString()
                                                                  .replace(
                                                                      ".",
                                                                      ","
                                                                  );
                                                    })()}{" "}
                                                    sesi
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Role:
                                                </p>
                                                <p className="text-blue-600 dark:text-blue-400 font-medium">
                                                    Assistant Fotografer
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Editor Assist info - untuk role editorAssist */}
                            {filterRole === "editorAssist" &&
                                selectedDetail.assistEditor && (
                                    <div className="space-y-4">
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Editor Utama:
                                                </p>
                                                <p>
                                                    {selectedDetail.mainEditor
                                                        ?.nama ||
                                                        selectedDetail.editor
                                                            ?.nama}
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Assistant (Editor):
                                                </p>
                                                <p>
                                                    {
                                                        selectedDetail
                                                            .assistEditor.nama
                                                    }
                                                </p>
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Jam Assist:
                                                </p>
                                                <p>
                                                    {(() => {
                                                        const jam =
                                                            selectedDetail.jamAssist ??
                                                            0;
                                                        return parseFloat(jam) %
                                                            1 ===
                                                            0
                                                            ? parseInt(jam)
                                                            : jam
                                                                  .toString()
                                                                  .replace(
                                                                      ".",
                                                                      ","
                                                                  );
                                                    })()}{" "}
                                                    match
                                                </p>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                                    Role:
                                                </p>
                                                <p className="text-purple-600 dark:text-purple-400 font-medium">
                                                    Assistant Editor
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                            {/* Assistants - Simple List (untuk role all atau fotografer, bukan assist) */}
                            {!["assist", "editorAssist", "editor"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "fotografer") &&
                                selectedDetail.assists &&
                                selectedDetail.assists.length > 0 && (
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            Assistant Fotografer:
                                        </p>
                                        {selectedDetail.assists?.map(
                                            (assist, index) => (
                                                <p key={index} className="ml-2">
                                                    •{" "}
                                                    {assist.fotografer?.nama ||
                                                        "-"}{" "}
                                                    (
                                                    {(() => {
                                                        const jam =
                                                            assist.jamAssist ??
                                                            0;
                                                        return parseFloat(jam) %
                                                            1 ===
                                                            0
                                                            ? parseInt(jam)
                                                            : jam
                                                                  .toString()
                                                                  .replace(
                                                                      ".",
                                                                      ","
                                                                  );
                                                    })()}{" "}
                                                    sesi)
                                                </p>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* Editor & Jam - One Row (tidak tampil untuk role assist atau editorAssist atau editor) */}
                            {!["assist", "editorAssist", "editor"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "editor") && (
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Editor:
                                            </p>
                                            <p>
                                                {selectedDetail.editor?.nama ||
                                                    "-"}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900 dark:text-gray-100">
                                                Match Editor:
                                            </p>
                                            <p>
                                                {selectedDetail.jamEditor !=
                                                null
                                                    ? (() => {
                                                          const jam =
                                                              selectedDetail.jamEditor;
                                                          return parseFloat(
                                                              jam
                                                          ) %
                                                              1 ===
                                                              0
                                                              ? parseInt(jam)
                                                              : jam
                                                                    .toString()
                                                                    .replace(
                                                                        ".",
                                                                        ","
                                                                    );
                                                      })() + " match"
                                                    : "-"}
                                            </p>
                                        </div>
                                    </div>
                                )}

                            {/* Editor Assist list - untuk role all atau editor */}
                            {!["assist", "editorAssist", "editor"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "editor") &&
                                selectedDetail.editor_assists &&
                                selectedDetail.editor_assists.length > 0 && (
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100">
                                            Assistant Editor:
                                        </p>
                                        {selectedDetail.editor_assists.map(
                                            (assist, index) => (
                                                <p key={index} className="ml-2">
                                                    •{" "}
                                                    {assist.editor?.nama || "-"}{" "}
                                                    (
                                                    {(() => {
                                                        const jam =
                                                            assist.jamAssist ??
                                                            0;
                                                        return parseFloat(jam) %
                                                            1 ===
                                                            0
                                                            ? parseInt(jam)
                                                            : jam
                                                                  .toString()
                                                                  .replace(
                                                                      ".",
                                                                      ","
                                                                  );
                                                    })()}{" "}
                                                    match)
                                                </p>
                                            )
                                        )}
                                    </div>
                                )}

                            {/* Other Info */}
                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Lapangan:
                                </p>
                                <p>{selectedDetail.lapangan}</p>
                            </div>

                            <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                    Catatan:
                                </p>
                                <p>
                                    {selectedDetail.catatan ||
                                        "Tidak ada catatan"}
                                </p>
                            </div>

                            {/* Drive Links with Copy Button - tidak tampil untuk role assist atau editorAssist */}
                            {!["assist", "editorAssist"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "fotografer" ||
                                    filterRole === "editor") && (
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            Link Drive Fotografer:
                                        </p>
                                        {selectedDetail.linkGdriveFotografer ? (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={selectedDetail.linkGdriveFotografer}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex-1 break-all"
                                                >
                                                    Buka Link
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(selectedDetail.linkGdriveFotografer, 'fotografer')}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                                                    title="Copy link"
                                                >
                                                    {copiedLink === 'fotografer' ? (
                                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                    {copiedLink === 'fotografer' ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                Tidak ada link
                                            </p>
                                        )}
                                    </div>
                                )}

                            {!["assist", "editorAssist"].includes(filterRole) &&
                                (filterRole === "all" ||
                                    filterRole === "editor") && (
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-gray-100 mb-2">
                                            Link Drive Editor:
                                        </p>
                                        {selectedDetail.linkGdriveEditor ? (
                                            <div className="flex items-center gap-2">
                                                <a
                                                    href={selectedDetail.linkGdriveEditor}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="text-blue-500 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline flex-1 break-all"
                                                >
                                                    Buka Link
                                                </a>
                                                <button
                                                    onClick={() => copyToClipboard(selectedDetail.linkGdriveEditor, 'editor')}
                                                    className="flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded transition-colors"
                                                    title="Copy link"
                                                >
                                                    {copiedLink === 'editor' ? (
                                                        <CheckCircle className="h-3 w-3 text-green-600" />
                                                    ) : (
                                                        <Copy className="h-3 w-3" />
                                                    )}
                                                    {copiedLink === 'editor' ? 'Copied!' : 'Copy'}
                                                </button>
                                            </div>
                                        ) : (
                                            <p className="text-gray-500">
                                                Tidak ada link
                                            </p>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Fixed Footer */}
                        <div className="flex justify-end mt-6 pt-4 border-t border-gray-200 dark:border-gray-600">
                            <button
                                onClick={() => setShowDetailModal(false)}
                                className="px-6 py-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default Laporan;
