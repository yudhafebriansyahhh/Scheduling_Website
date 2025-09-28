import React, { useState } from "react";
import { Plus, Edit, Trash2, Search, Filter, Eye, FileText } from "lucide-react";
import { router } from "@inertiajs/react";

const ScheduleTable = ({
    schedules = [],
    onAdd,
    onEdit,
    onDelete,
    onFilter,
}) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState("all");
    const [sortField, setSortField] = useState("tanggal");
    const [sortDirection, setSortDirection] = useState("asc");
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(10);

    const data = schedules || [];

    // Helper function to format date
    const formatDate = (dateString) => {
        if (!dateString) return "-";
        try {
            const date = new Date(dateString);
            return new Intl.DateTimeFormat("id-ID", {
                year: "numeric",
                month: "short",
                day: "numeric",
            }).format(date);
        } catch (error) {
            return dateString;
        }
    };

    // Helper function to format time
    const formatTime = (timeString) => {
        if (!timeString) return "-";
        const parts = timeString.split(":");
        if (parts.length >= 2) {
            return `${parts[0]}:${parts[1]}`;
        }
        return timeString;
    };

    // Filter and search logic
    const filteredData = data.filter((item) => {
        // Search filter
        let matchesSearch = true;
        if (searchTerm) {
            const searchValue = searchTerm.toLowerCase();
            const searchableFields = [
                item.namaEvent || "",
                item.fotografer?.nama || item.fotografer || "",
                item.editor?.nama || item.editor || "",
                // Perbaikan untuk lapangan - bisa dari relasi atau string langsung
                item.lapangan?.nama || item.lapangan || "",
                item.status || "",
                formatDate(item.tanggal),
            ];

            matchesSearch = searchableFields.some((field) =>
                field.toString().toLowerCase().includes(searchValue)
            );
        }

        // Status filter
        let matchesStatus = true;
        if (statusFilter !== "all") {
            matchesStatus = item.status === statusFilter;
        }

        return matchesSearch && matchesStatus;
    });

    // Sort logic
    const sortedData = [...filteredData].sort((a, b) => {
        let aValue = "";
        let bValue = "";

        switch (sortField) {
            case "tanggal":
                aValue = a.tanggal || "";
                bValue = b.tanggal || "";
                break;
            case "jamMulai":
                aValue = a.jamMulai || "";
                bValue = b.jamMulai || "";
                break;
            case "namaEvent":
                aValue = a.namaEvent || "";
                bValue = b.namaEvent || "";
                break;
            case "fotografer":
                aValue = a.fotografer?.nama || a.fotografer || "";
                bValue = b.fotografer?.nama || b.fotografer || "";
                break;
            case "editor":
                aValue = a.editor?.nama || a.editor || "";
                bValue = b.editor?.nama || b.editor || "";
                break;
            case "lapangan":
                // Perbaikan untuk sorting lapangan
                aValue = a.lapangan?.nama || a.lapangan || "";
                bValue = b.lapangan?.nama || b.lapangan || "";
                break;
            case "status":
                aValue = a.status || "";
                bValue = b.status || "";
                break;
            default:
                aValue = a[sortField] || "";
                bValue = b[sortField] || "";
        }

        if (sortDirection === "asc") {
            return aValue.localeCompare(bValue);
        } else {
            return bValue.localeCompare(aValue);
        }
    });

    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === "asc" ? "desc" : "asc");
        } else {
            setSortField(field);
            setSortDirection("asc");
        }
    };

    const handleAdd = () => {
        try {
            router.visit("/schedule/create");
        } catch (error) {
            console.error("Navigation error:", error);
            alert("Fitur tambah jadwal akan segera tersedia!");
        }
    };

    const handleEdit = (schedule) => {
        router.visit(`/schedule/${schedule.id}/edit`);
    };

    const handleDelete = (schedule) => {
        if (confirm("Yakin hapus schedule ini?")) {
            router.delete(`/schedule/${schedule.id}`);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            in_progress: {
                class: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-300",
                text: "Berlangsung",
            },
            pending: {
                class: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-300",
                text: "Menunggu",
            },
            completed: {
                class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                text: "Selesai",
            },
            cancelled: {
                class: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-300",
                text: "Dibatalkan",
            },
            active: {
                class: "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-300",
                text: "Aktif",
            },
        };

        const config = statusConfig[status] || {
            class: "bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300",
            text: status || "Unknown",
        };

        return (
            <span
                className={`px-2 py-1 rounded-full text-xs font-medium ${config.class}`}
            >
                {config.text}
            </span>
        );
    };

    // Get unique statuses for filter options
    const uniqueStatuses = [
        ...new Set(data.map((item) => item.status).filter(Boolean)),
    ];

    // Pagination logic
    const totalItems = sortedData.length;
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginatedData = sortedData.slice(startIndex, endIndex);

    // Reset pagination when filters or items per page change
    React.useEffect(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, itemsPerPage]);

    const handlePageChange = (page) => {
        setCurrentPage(page);
    };

    const renderPagination = () => {
        if (totalPages <= 1) return null;

        const pages = [];
        const maxVisiblePages = 5;
        let startPage = Math.max(
            1,
            currentPage - Math.floor(maxVisiblePages / 2)
        );
        let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

        if (endPage - startPage + 1 < maxVisiblePages) {
            startPage = Math.max(1, endPage - maxVisiblePages + 1);
        }

        // Previous button
        pages.push(
            <button
                key="prev"
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-l-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Sebelumnya
            </button>
        );

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            pages.push(
                <button
                    key={i}
                    onClick={() => handlePageChange(i)}
                    className={`px-3 py-2 text-sm font-medium border-t border-b border-r border-gray-300 dark:border-gray-600 ${
                        currentPage === i
                            ? "bg-blue-50 text-blue-600 border-blue-500 dark:bg-blue-900/20 dark:text-blue-300"
                            : "bg-white text-gray-500 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
                    }`}
                >
                    {i}
                </button>
            );
        }

        // Next button
        pages.push(
            <button
                key="next"
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-2 text-sm font-medium text-gray-500 bg-white border border-gray-300 rounded-r-md hover:bg-gray-50 dark:bg-gray-800 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
                Selanjutnya
            </button>
        );

        return (
            <div className="flex items-center justify-center mt-6">
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    {pages}
                </nav>
            </div>
        );
    };

    return (
        <div className="bg-white dark:bg-gray-900 shadow rounded-lg p-4 sm:p-6 transition-colors duration-300">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-6 gap-4">
                <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                    Daftar Jadwal
                </h2>

                <div className="flex flex-col lg:flex-row items-start lg:items-center gap-3 w-full lg:w-auto">
                    {/* Search */}
                    <div className="relative">
                        <Search
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        />
                                                <input
                            type="text"
                            placeholder="Cari jadwal..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full sm:w-64 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400"
                        />
                    </div>

                    {/* Status Filter */}
                    <div className="relative">
                        <Filter
                            size={16}
                            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 dark:text-gray-500"
                        />
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                            className="pl-10 pr-8 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 appearance-none bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                        >
                            <option value="all">Semua Status</option>
                            {uniqueStatuses.map((status) => (
                                <option key={status} value={status}>
                                    {status === "in_progress"
                                        ? "Berlangsung"
                                        : status === "pending"
                                        ? "Menunggu"
                                        : status === "completed"
                                        ? "Selesai"
                                        : status === "cancelled"
                                        ? "Dibatalkan"
                                        : status === "active"
                                        ? "Aktif"
                                        : status}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Items per page selector */}
                    <div className="flex items-center space-x-2 whitespace-nowrap">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            Tampilkan:
                        </span>
                        <select
                            value={itemsPerPage}
                            onChange={(e) =>
                                setItemsPerPage(Number(e.target.value))
                            }
                            className="px-3 py-2 pr-8 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm min-w-[70px] appearance-none"
                        >
                            <option value={10}>10</option>
                            <option value={25}>25</option>
                            <option value={50}>50</option>
                            <option value={100}>100</option>
                        </select>
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                            per halaman
                        </span>
                    </div>

                    {/* Add Button */}
                    <button
                        onClick={handleAdd}
                        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center text-sm transition-colors whitespace-nowrap flex-shrink-0"
                    >
                        <Plus size={16} className="mr-2" />
                        Tambah
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto bg-white dark:bg-gray-900 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
                <table className="w-full min-w-full">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                        <tr>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 w-16">
                                No
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("tanggal")}
                            >
                                <div className="flex items-center">
                                    Tanggal
                                    {sortField === "tanggal" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("jamMulai")}
                            >
                                <div className="flex items-center">
                                    Jam
                                    {sortField === "jamMulai" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("namaEvent")}
                            >
                                <div className="flex items-center">
                                    Event
                                    {sortField === "namaEvent" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("fotografer")}
                            >
                                <div className="flex items-center">
                                    Fotografer
                                    {sortField === "fotografer" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("editor")}
                            >
                                <div className="flex items-center">
                                    Editor
                                    {sortField === "editor" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th
                                className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                onClick={() => handleSort("lapangan")}
                            >
                                <div className="flex items-center">
                                    Lapangan
                                    {sortField === "lapangan" && (
                                        <span className="ml-1 text-blue-500">
                                            {sortDirection === "asc"
                                                ? "↑"
                                                : "↓"}
                                        </span>
                                    )}
                                </div>
                            </th>
                            <th className="text-left py-4 px-4 font-semibold text-gray-700 dark:text-gray-300">
                                Status
                            </th>
                            <th className="text-center py-4 px-4 font-semibold text-gray-700 dark:text-gray-300 w-32">
                                Aksi
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white dark:bg-gray-900">
                        {paginatedData.length === 0 ? (
                            <tr>
                                <td
                                    colSpan="9"
                                    className="text-center py-8 text-gray-500 dark:text-gray-400"
                                >
                                    {searchTerm || statusFilter !== "all"
                                        ? "Tidak ada jadwal yang ditemukan"
                                        : "Tidak ada jadwal."}
                                </td>
                            </tr>
                        ) : (
                            paginatedData.map((schedule, index) => (
                                <tr
                                    key={schedule.id}
                                    className="border-t border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                                >
                                    <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                                        {startIndex + index + 1}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                                        {formatDate(schedule.tanggal)}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200 font-medium">
                                        {schedule.jamMulai &&
                                        schedule.jamSelesai
                                            ? `${formatTime(
                                                  schedule.jamMulai
                                              )} - ${formatTime(
                                                  schedule.jamSelesai
                                              )}`
                                            : formatTime(schedule.jamMulai) ||
                                              formatTime(schedule.waktu) ||
                                              "-"}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                                        {schedule.namaEvent || "-"}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                                        {schedule.fotografer?.nama ||
                                            schedule.fotografer ||
                                            "-"}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                                        {schedule.editor?.nama ||
                                            schedule.editor ||
                                            "-"}
                                    </td>
                                    <td className="py-4 px-4 text-gray-800 dark:text-gray-200">
                                        {/* Perbaikan untuk menampilkan lapangan dari relasi atau string langsung */}
                                        {schedule.lapangan?.nama || schedule.lapangan || "-"}
                                    </td>
                                    <td className="py-4 px-4">
                                        {getStatusBadge(schedule.status)}
                                    </td>
                                    <td className="py-4 px-4">
                                        <div className="flex items-center justify-center space-x-2">
                                            <button
                                                onClick={() => handleEdit(schedule)}
                                                className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/20 rounded-full transition-colors"
                                                title="Edit"
                                            >
                                                <Edit size={16} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(schedule)}
                                                className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/20 rounded-full transition-colors"
                                                title="Hapus"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination and Page Info */}
            {totalItems > 0 && (
                <div className="mt-6">
                    {/* Pagination */}
                    {renderPagination()}

                    {/* Page Info */}
                    <div className="flex flex-col sm:flex-row items-center justify-between mt-4 text-sm text-gray-600 dark:text-gray-400 gap-2">
                        <div>
                            Menampilkan {startIndex + 1}-
                            {Math.min(endIndex, totalItems)} dari {totalItems}{" "}
                            jadwal
                            {data.length !== totalItems &&
                                ` (difilter dari ${data.length} total)`}
                        </div>
                        <div className="flex items-center space-x-2">
                            {(searchTerm || statusFilter !== "all") && (
                                <button
                                    onClick={() => {
                                        setSearchTerm("");
                                        setStatusFilter("all");
                                    }}
                                    className="px-3 py-1 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-md transition-colors"
                                >
                                    Reset filter
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ScheduleTable;
