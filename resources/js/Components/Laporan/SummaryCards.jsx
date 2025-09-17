import React from 'react';

const SummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm text-gray-500">Total Pekerjaan</h3>
        <p className="text-2xl font-bold">{summary.totalJobs}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm text-gray-500">Selesai</h3>
        <p className="text-2xl font-bold">{summary.completedJobs}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm text-gray-500">Jam Fotografer</h3>
        <p className="text-2xl font-bold">{summary.totalJamFotografer}</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm p-6">
        <h3 className="text-sm text-gray-500">Jam Editor</h3>
        <p className="text-2xl font-bold">{summary.totalJamEditor}</p>
      </div>
    </div>
  );
};

export default SummaryCards;
