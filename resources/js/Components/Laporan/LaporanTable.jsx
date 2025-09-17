import React from 'react';

const LaporanTable = ({ data, formatDate, handleShowDetail }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm overflow-hidden">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tanggal</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Jam Mulai</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Jam Selesai</th>

            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Tim</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Fotografer</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Editor</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Lapangan</th>
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Total Jam</th>            
            <th className="px-6 py-3 text-left text-sm font-medium text-gray-500">Status</th>
            <th className="px-6 py-3"></th>
          </tr>
        </thead>
        <tbody>
          {data.map((item) => (
            <tr key={item.id} className="border-t">
              <td className="px-6 py-4">{formatDate(item.tanggal)}</td>
                            <td className="px-6 py-4">{item.jamMulai}</td>
<td className="px-6 py-4">{item.jamSelesai}</td>
              <td className="px-6 py-4">{item.namaTim}</td>
              <td className="px-6 py-4">{item.fotografer}</td>
              <td className="px-6 py-4">{item.editor}</td>
              <td className="px-6 py-4">{item.lapangan}</td>
              <td className="px-6 py-4">{item.jamFotografer}</td>

              <td className="px-6 py-4">
                <span
                  className={`px-2 py-1 rounded-full text-xs ${
                    item.status === 'completed'
                      ? 'bg-green-100 text-green-800'
                      : item.status === 'pending'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-blue-100 text-blue-800'
                  }`}
                >
                  {item.status}
                </span>
              </td>
              <td className="px-6 py-4 text-right">
                <button
                  onClick={() => handleShowDetail(item)}
                  className="text-blue-500 hover:underline"
                >
                  Detail
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default LaporanTable;
