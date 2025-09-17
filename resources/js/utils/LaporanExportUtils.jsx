// utils/laporanExportUtils.js

export const exportToCSV = (filteredData) => {
  const headers = ['No', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Nama Tim', 'Fotografer', 'Editor', 'Lapangan', 'Status', 'Total Jam', 'Jam Fotografer', 'Jam Editor', 'Catatan'];

  const csvContent = [
    headers.join(','),
    ...filteredData.map((item, index) => [
      index + 1,
      item.tanggal,
      item.jamMulai,
      item.jamSelesai,
      `"${item.namaTim}"`,
      `"${item.fotografer}"`,
      `"${item.editor}"`,
      `"${item.lapangan}"`,
      item.status,
      item.totalJam,
      item.jamFotografer,
      item.jamEditor,
      `"${item.catatan}"`
    ].join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `laporan_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (filteredData, summary) => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Laporan Pekerjaan</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; color: #333; }
        .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #ddd; padding-bottom: 20px; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin: 20px 0; }
        .summary-card { border: 1px solid #ddd; padding: 15px; border-radius: 8px; text-align: center; }
        .summary-number { font-size: 24px; font-weight: bold; color: #4f46e5; }
        .summary-label { font-size: 12px; color: #666; margin-top: 5px; }
        table { width: 100%; border-collapse: collapse; margin-top: 20px; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 12px; }
        th { background-color: #f8f9fa; font-weight: bold; }
        tr:nth-child(even) { background-color: #f9f9f9; }
        .status-completed { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; }
        .status-progress { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Pekerjaan</h1>
        <p>Periode: ${new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
    </div>

    <div class="summary">
        <div class="summary-card">
            <div class="summary-number">${summary.totalJobs}</div>
            <div class="summary-label">Total Pekerjaan</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.completedJobs}</div>
            <div class="summary-label">Selesai</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.totalJamFotografer}h</div>
            <div class="summary-label">Jam Fotografer</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.totalJamEditor}h</div>
            <div class="summary-label">Jam Editor</div>
        </div>
        <div class="summary-card">
            <div class="summary-number">${summary.rataRataJamPerJob}h</div>
            <div class="summary-label">Rata-rata Jam/Job</div>
        </div>
    </div>

    <table>
        <thead>
            <tr>
                <th>No</th>
                <th>Tanggal</th>
                <th>Jam</th>
                <th>Tim</th>
                <th>Fotografer</th>
                <th>Editor</th>
                <th>Lapangan</th>
                <th>Status</th>
                <th>Jam Fotografer</th>
                <th>Jam Editor</th>
                <th>Total Jam</th>
            </tr>
        </thead>
        <tbody>
            ${filteredData.map((item, index) => `
                <tr>
                    <td>${index + 1}</td>
                    <td>${formatDate(item.tanggal)}</td>
                    <td>${item.jamMulai} - ${item.jamSelesai}</td>
                    <td>${item.namaTim}</td>
                    <td>${item.fotografer}</td>
                    <td>${item.editor}</td>
                    <td>${item.lapangan}</td>
                    <td>
                        <span class="status-${item.status === 'completed' ? 'completed' : 'progress'}">
                            ${item.status === 'completed' ? 'Selesai' : item.status === 'in_progress' ? 'Proses' : 'Pending'}
                        </span>
                    </td>
                    <td>${item.jamFotografer}h</td>
                    <td>${item.jamEditor}h</td>
                    <td>${item.totalJam}h</td>
                </tr>
            `).join('')}
        </tbody>
    </table>

    <div class="footer">
        <p>Total Jam Fotografer: ${summary.totalJamFotografer} jam | Total Jam Editor: ${summary.totalJamEditor} jam</p>
        <p>Laporan dihasilkan pada: ${new Date().toLocaleString('id-ID')}</p>
    </div>
</body>
</html>
  `;

  const printWindow = window.open('', '_blank');
  printWindow.document.write(printContent);
  printWindow.document.close();

  setTimeout(() => {
    printWindow.print();
    printWindow.close();
  }, 250);
};
