import React from 'react';
import { FileText } from 'lucide-react';

const LaporanSummaryCards = ({ summary }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Pekerjaan</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.totalJobs}</p>
          </div>
          <div className="h-12 w-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Selesai</p>
            <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{summary.completedJobs}</p>
          </div>
          <div className="h-12 w-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
            <FileText className="h-6 w-6 text-green-600 dark:text-green-400" />
          </div>
        </div>
      </div>

      {(summary.filterRole === 'all' || summary.filterRole === 'fotografer') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jam Fotografer</p>
              <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">{summary.totalJamFotografer}h</p>
            </div>
            <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
        </div>
      )}

      {(summary.filterRole === 'all' || summary.filterRole === 'editor') && (
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Jam Editor</p>
              <p className="text-2xl font-bold text-orange-600 dark:text-orange-400">{summary.totalJamEditor}h</p>
            </div>
            <div className="h-12 w-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center">
              <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LaporanSummaryCards;
