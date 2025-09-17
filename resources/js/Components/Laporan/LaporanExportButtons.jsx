import React from 'react';
import { Download, FileText, Calendar } from 'lucide-react';

const LaporanExportButtons = ({
  onExportCSV,
  onExportPDF,
  onAddSchedule
}) => {
  return (
    <div className="flex gap-2">
      <button
        onClick={onExportCSV}
        className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
      >
        <Download size={16} className="mr-2" />
        Export CSV
      </button>
      <button
        onClick={onExportPDF}
        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
      >
        <FileText size={16} className="mr-2" />
        Export PDF
      </button>
      <button
        onClick={onAddSchedule}
        className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors text-sm"
      >
        <Calendar size={16} className="mr-2" />
        Tambah Data Schedule
      </button>
    </div>
  );
};

export default LaporanExportButtons;
