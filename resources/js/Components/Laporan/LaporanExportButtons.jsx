import React from 'react';
import { Download, FileText, Plus } from 'lucide-react';

const LaporanExportButtons = ({
  onExportCSV,
  onExportPDF,
  onAddSchedule
}) => {
  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-6">
      <button
        onClick={onExportCSV}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Export CSV</span>
      </button>

      <button
        onClick={onExportPDF}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
      >
        <FileText className="h-4 w-4" />
        <span className="hidden sm:inline">Export PDF</span>
      </button>

      <button
        onClick={onAddSchedule}
        className="flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
      >
        <Plus className="h-4 w-4" />
        <span className="hidden sm:inline">Tambah Data Schedule</span>
      </button>
    </div>
  );
};

export default LaporanExportButtons;
