import React from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import timeGridPlugin from "@fullcalendar/timegrid";
import listPlugin from "@fullcalendar/list";

export default function Calendar({ events, onEventClick }) {
  return (
    <div className="bg-white dark:bg-gray-900 p-6 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 transition-colors duration-300">
      <h2 className="text-xl font-bold text-gray-700 dark:text-gray-100 mb-4 flex items-center">
        📅 Kalender Jadwal
      </h2>

      <FullCalendar
        plugins={[dayGridPlugin, timeGridPlugin, listPlugin, interactionPlugin]}
        initialView="dayGridMonth"
        headerToolbar={{
          left: "prev,next today",
          center: "title",
          right: "dayGridMonth,timeGridWeek,timeGridDay,listWeek",
        }}
        buttonText={{
          today: "Hari Ini",
          month: "Bulan",
          week: "Minggu",
          day: "Hari",
          list: "Daftar",
        }}
        events={events.map((event) => ({
          ...event,
          backgroundColor: "#3b82f6", // default biru
          borderColor: "#2563eb",
          textColor: "white",
        }))}
        eventClick={(info) => {
          info.jsEvent.preventDefault();
          if (onEventClick) {
            onEventClick(info.event.id);
          }
        }}
        height="600px"
        eventClassNames="rounded-md shadow cursor-pointer hover:opacity-90 transition"
        dayMaxEvents={3} // jika event banyak, tampil "more"
        /** Warna teks hari (Sen, Sel, dst) */
        dayHeaderClassNames={() =>
          "text-gray-700 dark:text-white font-medium"
        }
        /** Warna teks tanggal (angka di kotak) */
        dayCellClassNames={() => "text-gray-800 dark:text-white"}
        /** Warna label jam di timeGrid */
        slotLabelClassNames={() => "text-gray-700 dark:text-white"}
      />
    </div>
  );
}
