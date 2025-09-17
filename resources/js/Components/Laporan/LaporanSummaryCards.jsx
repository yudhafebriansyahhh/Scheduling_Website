import React from 'react';

const LaporanSummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="text-2xl font-bold text-gray-600">{summary.totalJobs}</div>
        <div className="text-sm text-gray-600">Total Pekerjaan</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="text-2xl font-bold text-gray-600">{summary.completedJobs}</div>
        <div className="text-sm text-gray-600">Selesai</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="text-2xl font-bold text-gray-600">{summary.totalJamFotografer}</div>
        <div className="text-sm text-gray-600">Jam Fotografer</div>
      </div>
      <div className="bg-white rounded-lg p-4 shadow-sm border">
        <div className="text-2xl font-bold text-gray-600">{summary.totalJamEditor}</div>
        <div className="text-sm text-gray-600">Jam Editor</div>
      </div>
    </div>
  );
};

export default LaporanSummaryCards;
