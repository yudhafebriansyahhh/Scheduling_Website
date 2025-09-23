// utils/laporanExportUtils.js

export const exportToCSV = (filteredData, filterRole = 'all') => {
  // Dynamic headers based on filterRole
  let headers = ['No', 'Tanggal', 'Jam Mulai', 'Jam Selesai', 'Nama Tim'];

  if (filterRole === 'all' || filterRole === 'fotografer') {
    headers.push('Fotografer');
  }

  if (filterRole === 'all' || filterRole === 'editor') {
    headers.push('Editor');
  }

  headers.push('Lapangan', 'Status');

  if (filterRole === 'all' || filterRole === 'fotografer') {
    headers.push('Jam Fotografer');
  }

  if (filterRole === 'all' || filterRole === 'editor') {
    headers.push('Jam Editor');
  }

  headers.push('Catatan');

  const csvContent = [
    headers.join(','),
    ...filteredData.map((item, index) => {
      let row = [
        index + 1,
        item.tanggal,
        item.jamMulai || '-',
        item.jamSelesai || '-',
        `"${item.namaEvent}"`
      ];

      if (filterRole === 'all' || filterRole === 'fotografer') {
        row.push(`"${item.fotografer?.nama || '-'}"`);
      }

      if (filterRole === 'all' || filterRole === 'editor') {
        row.push(`"${item.editor?.nama || '-'}"`);
      }

      row.push(
        `"${item.lapangan}"`,
        item.status
      );

      if (filterRole === 'all' || filterRole === 'fotografer') {
        row.push(item.jamFotografer || '0');
      }

      if (filterRole === 'all' || filterRole === 'editor') {
        row.push(item.jamEditor || '0');
      }

      row.push(`"${item.catatan || '-'}"`);

      return row.join(',');
    })
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);

  // Dynamic filename based on filterRole
  const roleText = filterRole === 'all' ? 'semua' : filterRole === 'fotografer' ? 'fotografer' : 'editor';
  link.setAttribute('download', `laporan_${roleText}_${new Date().toISOString().split('T')[0]}.csv`);

  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const exportToPDF = (filteredData, summary, filterRole = 'all') => {
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  // Dynamic role title
  const roleTitle = filterRole === 'all' ? 'Semua Role' :
                   filterRole === 'fotografer' ? 'Fotografer' : 'Editor';

  // Dynamic summary cards based on filterRole
  const getSummaryCards = () => {
    let cards = `
      <div class="summary-card">
        <div class="summary-number">${summary.totalJobs}</div>
        <div class="summary-label">Total Pekerjaan</div>
      </div>
      <div class="summary-card">
        <div class="summary-number">${summary.completedJobs}</div>
        <div class="summary-label">Selesai</div>
      </div>
    `;

    if (filterRole === 'all' || filterRole === 'fotografer') {
      cards += `
        <div class="summary-card">
          <div class="summary-number">${summary.totalJamFotografer}h</div>
          <div class="summary-label">Total Jam Fotografer</div>
        </div>
      `;
    }

    if (filterRole === 'all' || filterRole === 'editor') {
      cards += `
        <div class="summary-card">
          <div class="summary-number">${summary.totalJamEditor}h</div>
          <div class="summary-label">Total Jam Editor</div>
        </div>
      `;
    }

    return cards;
  };

  // Dynamic table headers based on filterRole
  const getTableHeaders = () => {
    let headers = '<th>No</th><th>Tanggal</th><th>Jam Mulai</th><th>Jam Selesai</th><th>Nama Event</th>';

    if (filterRole === 'all' || filterRole === 'fotografer') {
      headers += '<th>Fotografer</th>';
    }

    if (filterRole === 'all' || filterRole === 'editor') {
      headers += '<th>Editor</th>';
    }

    headers += '<th>Lapangan</th><th>Status</th>';

    if (filterRole === 'all' || filterRole === 'fotografer') {
      headers += '<th>Jam Fotografer</th>';
    }

    if (filterRole === 'all' || filterRole === 'editor') {
      headers += '<th>Jam Editor</th>';
    }

    return headers;
  };

  // Dynamic table rows based on filterRole
  const getTableRows = () => {
    return filteredData.map((item, index) => {
      let row = `
        <td>${index + 1}</td>
        <td>${formatDate(item.tanggal)}</td>
        <td>${item.jamMulai || '-'}</td>
        <td>${item.jamSelesai || '-'}</td>
        <td>${item.namaEvent}</td>
      `;

      if (filterRole === 'all' || filterRole === 'fotografer') {
        row += `<td>${item.fotografer?.nama || '-'}</td>`;
      }

      if (filterRole === 'all' || filterRole === 'editor') {
        row += `<td>${item.editor?.nama || '-'}</td>`;
      }

      row += `
        <td>${item.lapangan}</td>
        <td>
          <span class="status-${item.status === 'completed' ? 'completed' : 'progress'}">
            ${item.status === 'completed' ? 'Selesai' : item.status === 'in_progress' ? 'Proses' : 'Pending'}
          </span>
        </td>
      `;

      if (filterRole === 'all' || filterRole === 'fotografer') {
        row += `<td>${item.jamFotografer || '0'}h</td>`;
      }

      if (filterRole === 'all' || filterRole === 'editor') {
        row += `<td>${item.jamEditor || '0'}h</td>`;
      }

      return `<tr>${row}</tr>`;
    }).join('');
  };

  // Dynamic footer based on filterRole
  const getFooter = () => {
    let footerText = '';

    if (filterRole === 'all') {
      footerText = `Total Jam Fotografer: ${summary.totalJamFotografer} jam | Total Jam Editor: ${summary.totalJamEditor} jam`;
    } else if (filterRole === 'fotografer') {
      footerText = `Total Jam Fotografer: ${summary.totalJamFotografer} jam`;
    } else if (filterRole === 'editor') {
      footerText = `Total Jam Editor: ${summary.totalJamEditor} jam`;
    }

    return footerText;
  };

  const printContent = `
<!DOCTYPE html>
<html>
<head>
    <title>Laporan Pekerjaan - ${roleTitle}</title>
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
        .status-completed { background-color: #d1fae5; color: #065f46; padding: 4px 8px; border-radius: 12px; font-size: 10px; }
        .status-progress { background-color: #fef3c7; color: #92400e; padding: 4px 8px; border-radius: 12px; font-size: 10px; }
        .footer { margin-top: 30px; text-align: center; font-size: 12px; color: #666; }
        .role-badge {
          display: inline-block;
          background-color: #4f46e5;
          color: white;
          padding: 4px 12px;
          border-radius: 20px;
          font-size: 12px;
          margin-left: 10px;
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>Laporan Pekerjaan</h1>
        <span class="role-badge">${roleTitle}</span>
        <p>Periode: ${new Date().toLocaleDateString('id-ID', {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        })}</p>
    </div>

    <div class="summary">
        ${getSummaryCards()}
    </div>

    <table>
        <thead>
            <tr>
                ${getTableHeaders()}
            </tr>
        </thead>
        <tbody>
            ${getTableRows()}
        </tbody>
    </table>

    <div class="footer">
        <p>${getFooter()}</p>
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
