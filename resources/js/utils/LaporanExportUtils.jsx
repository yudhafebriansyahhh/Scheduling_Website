// utils/laporanExportUtils.js

export const exportToCSV = (filteredData, filterRole = "all") => {
    // Dynamic headers based on filterRole
    let headers = ["No", "Tanggal", "Event", "Lapangan", "Jam"];

    if (filterRole === "fotografer") {
        headers.push("Fotografer", "Jam Kerja");
    } else if (filterRole === "editor") {
        headers.push("Editor", "Match Editor");
    } else if (filterRole === "assist") {
        // Headers untuk assist - sesuaikan dengan data assist
        headers = ["No", "Nama", "Tanggal", "Jam Mulai", "Jam Selesai", "Status"];
    } else if (filterRole === "editorAssist") {
        headers.push("Editor Utama", "Assistant Editor", "Match Assist");
    } else {
        headers.push("Fotografer", "Editor");
    }

    if (filterRole !== "assist") {
        headers.push("Status");
    }

    const formatJam = (jam) => {
        if (!jam) return "0";
        const numJam = parseFloat(jam);
        return numJam % 1 === 0
            ? parseInt(numJam).toString()
            : jam.toString().replace(".", ",");
    };

    const csvContent = [
        headers.join(","),
        ...filteredData.map((item, index) => {
            let row = [];

            if (filterRole === "assist") {
                // Format CSV untuk assist
                row = [
                    index + 1,
                    `"${item.nama || item.assistable?.nama || '-'}"`,
                    new Date(item.tanggal).toLocaleDateString("id-ID"),
                    `${item.jamMulai?.slice(0, 5) || "-"}`,
                    `${item.jamSelesai?.slice(0, 5) || "-"}`,
                    item.status === "completed"
                        ? "Selesai"
                        : item.status === "in_progress"
                        ? "Berlangsung"
                        : item.status === "pending"
                        ? "Menunggu"
                        : item.status
                ];
            } else {
                // Format CSV untuk schedule (existing logic)
                row = [
                    index + 1,
                    new Date(item.tanggal).toLocaleDateString("id-ID"),
                    `"${item.namaEvent}"`,
                    `"${item.lapangan}"`,
                    `${item.jamMulai?.slice(0, 5) || "-"} - ${
                        item.jamSelesai?.slice(0, 5) || "-"
                    }`,
                ];

                if (filterRole === "fotografer") {
                    row.push(
                        `"${item.fotografer?.nama || "-"}"`,
                        `${formatJam(item.jamFotografer)} jam`
                    );
                } else if (filterRole === "editor") {
                    row.push(
                        `"${item.editor?.nama || "-"}"`,
                        `${formatJam(item.jamEditor)} match`
                    );
                } else if (filterRole === "editorAssist") {
                    row.push(
                        `"${item.mainEditor?.nama || item.editor?.nama || "-"}"`,
                        `"${item.assistEditor?.nama || "-"}"`,
                        `${formatJam(item.jamAssist)} match`
                    );
                } else {
                    row.push(
                        `"${item.fotografer?.nama || "-"}"`,
                        `"${item.editor?.nama || "-"}"`
                    );
                }

                // Status untuk non-assist
                const statusText =
                    item.status === "completed"
                        ? "Selesai"
                        : item.status === "in_progress"
                        ? "Berlangsung"
                        : item.status === "pending"
                        ? "Menunggu"
                        : item.status;
                row.push(statusText);
            }

            return row.join(",");
        }),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);

    // Dynamic filename based on filterRole
    const roleText =
        filterRole === "all"
            ? "semua"
            : filterRole === "fotografer"
            ? "fotografer"
            : filterRole === "editor"
            ? "editor"
            : filterRole === "assist"
            ? "assist"
            : "assist-editor";
    link.setAttribute(
        "download",
        `laporan_${roleText}_${new Date().toISOString().split("T")[0]}.csv`
    );

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};

export const exportToPDF = (
    filteredData,
    summary,
    filterRole = "all",
    userTitleImageURL
) => {
    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("id-ID", {
            day: "numeric",
            month: "short",
            year: "numeric",
        });
    };

    const formatJam = (jam) => {
        if (!jam) return "0";
        const numJam = parseFloat(jam);
        return numJam % 1 === 0
            ? parseInt(numJam).toString()
            : jam.toString().replace(".", ",");
    };

    const roleTitle =
        filterRole === "all"
            ? "Semua Role"
            : filterRole === "fotografer"
            ? "Fotografer"
            : filterRole === "editor"
            ? "Editor"
            : filterRole === "assist"
            ? "Assist"
            : "Assistant Editor";

    // Table headers
    const getTableHeaders = () => {
        if (filterRole === "assist") {
            return "<th>No</th><th>Nama</th><th>Tanggal</th><th>Jam Mulai</th><th>Jam Selesai</th><th>Status</th>";
        }

        let headers =
            "<th>No</th><th>Nama Event</th><th>Tanggal</th><th>Lapangan</th><th>Waktu</th>";
        if (filterRole === "fotografer") headers += "<th>Fotografer</th>";
        else if (filterRole === "editor") headers += "<th>Editor</th>";
        else if (filterRole === "editorAssist")
            headers += "<th>Editor Utama</th><th>Assistant Editor</th>";
        else headers += "<th>Fotografer</th><th>Editor</th>";

        headers += "<th>Status</th>";
        return headers;
    };

    // Table rows
    const getTableRows = () => {
        return filteredData
            .map((item, index) => {
                let row = "";

                if (filterRole === "assist") {
                    // Format tabel untuk assist
                    const statusText =
                        item.status === "completed"
                            ? "Selesai"
                            : item.status === "in_progress"
                            ? "Berlangsung"
                            : item.status === "pending"
                            ? "Menunggu"
                            : item.status;

                    row = `
                        <td>${index + 1}</td>
                        <td>${item.nama || item.assistable?.nama || "-"}</td>
                        <td>${formatDate(item.tanggal)}</td>
                        <td>${item.jamMulai?.slice(0, 5) || "-"}</td>
                        <td>${item.jamSelesai?.slice(0, 5) || "-"}</td>
                        <td>${statusText}</td>
                    `;
                } else {
                    // Format tabel untuk schedule (existing logic)
                    row = `
                        <td>${index + 1}</td>
                        <td>${item.namaEvent || "-"}</td>
                        <td>${formatDate(item.tanggal)}</td>
                        <td>${item.lapangan || "-"}</td>
                        <td>${item.jamMulai?.slice(0, 5) || "-"} - ${
                            item.jamSelesai?.slice(0, 5) || "-"
                        }</td>
                    `;

                    if (filterRole === "fotografer") {
                        row += `<td><div>${
                            item.fotografer?.nama || "-"
                        }</div><div style="font-size:9px;">${formatJam(
                            item.jamFotografer
                        )} jam</div></td>`;
                    } else if (filterRole === "editor") {
                        row += `<td>${
                            item.editor?.nama
                                ? `<div>${
                                      item.editor.nama
                                  }</div><div style="font-size:9px;">${formatJam(
                                      item.jamEditor
                                  )} match</div>`
                                : "-"
                        }</td>`;
                    } else if (filterRole === "editorAssist") {
                        row += `<td>${
                            item.mainEditor?.nama || item.editor?.nama || "-"
                        }</td>
                        <td>${
                            item.assistEditor?.nama
                                ? `<div>${
                                      item.assistEditor.nama
                                  }</div><div style="font-size:9px;">${formatJam(
                                      item.jamAssist
                                  )} match</div>`
                                : "-"
                        }</td>`;
                    } else {
                        row += `<td><div>${
                            item.fotografer?.nama || "-"
                        }</div><div style="font-size:9px;">${formatJam(
                            item.jamFotografer
                        )} jam</div></td>
                        <td>${
                            item.editor?.nama
                                ? `<div>${
                                      item.editor.nama
                                  }</div><div style="font-size:9px;">${formatJam(
                                      item.jamEditor
                                  )} match</div>`
                                : "-"
                        }</td>`;
                    }

                    // Status untuk non-assist
                    const statusText =
                        item.status === "completed"
                            ? "Selesai"
                            : item.status === "in_progress"
                            ? "Berlangsung"
                            : item.status === "pending"
                            ? "Menunggu"
                            : item.status;

                    row += `<td>${statusText}</td>`;
                }

                return `<tr>${row}</tr>`;
            })
            .join("");
    };

    const getFooter = () => {
        if (filterRole === "assist") {
            return `Total Sesi Assist: ${summary.totalSesi || filteredData.length} sesi`;
        }

        if (filterRole === "all")
            return `Total Jam Fotografer: ${formatJam(
                summary.totalJamFotografer
            )} jam | Total Match Editor: ${formatJam(
                summary.totalJamEditor
            )} match`;
        if (filterRole === "fotografer")
            return `Total Jam Fotografer: ${formatJam(
                summary.totalJamFotografer
            )} jam`;
        if (filterRole === "editor")
            return `Total Match Editor: ${formatJam(summary.totalJamEditor)} match`;
        if (filterRole === "editorAssist")
            return `Total Match Assistant Editor: ${formatJam(
                summary.totalJamAssist
            )} match`;

        return "";
    };

    const periode = new Date().toLocaleDateString("id-ID", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    // PDF Content
    const printContent = `
<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<title>Laporan Pekerjaan - ${roleTitle}</title>
<style>
  body { font-family: Arial,sans-serif; margin: 30px; color:#333; font-size:10px; }
  * {
    -webkit-print-color-adjust: exact !important;
    print-color-adjust: exact !important;
  }

  /* Header */
  .header { display:flex; align-items:center; background-color:#1e3a8a !important; padding:12px; border-radius:6px; color:#fff; margin-bottom:10px; }
  .header-logo { width:60px; flex-shrink:0; }
  .header-logo img { width:100%; height:auto; object-fit:contain; }
  .header-title { flex:1; margin-left:12px; }
  .header-title img { height:28px; object-fit:contain; margin-bottom:4px; }
  .header-title p { margin:2px 0; font-size:10px; }

  /* Table */
  table { width:100%; border-collapse:collapse; margin-top:15px; font-size:9px; }
  th, td { border:1px solid #ddd; padding:5px 6px; vertical-align:top; }
  th { background:#e5e7eb !important; font-weight:bold; color:#1e293b; }
  tr:nth-child(even) { background:#f9fafb !important; }

  /* Footer */
  .footer { margin-top:20px; font-size:9px; text-align:center; color:#555; border-top:1px solid #ddd; padding-top:8px; }
</style>
</head>
<body>

<div class="header">
  <div class="header-logo">
    <img src="/logo.png" alt="Logo" />
  </div>
  <div class="header-title">
    <img src="/actsnap.png" alt="Nama Perusahaan" />
    <p>Laporan Pekerjaan - ${roleTitle}</p>
    <p>Periode: ${periode}</p>
  </div>
</div>

<hr style="border:0; border-top:1px solid #ddd; margin:10px 0;" />

<table>
  <thead>
    <tr>${getTableHeaders()}</tr>
  </thead>
  <tbody>
    ${getTableRows()}
  </tbody>
</table>

<div class="footer">
  <p><strong>${getFooter()}</strong></p>
  <p>Laporan dihasilkan otomatis oleh Sistem Manajemen Jadwal</p>
  <p>Dibuat pada: ${new Date().toLocaleString("id-ID")}</p>
</div>

</body>
</html>
`;

    const printWindow = window.open("", "_blank");
    printWindow.document.write(printContent);
    printWindow.document.close();

    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 250);
};
