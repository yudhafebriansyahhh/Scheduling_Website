import React from "react";
import { Calendar, User, Users } from "lucide-react";

export default function StatsCards({ stats }) {
  const cards = [
    {
      title: "Jadwal Bulan Ini",
      value: stats.jadwal_bulan_ini,
      icon: <Calendar className="w-6 h-6 text-blue-500" />,
    },
    {
      title: "Total Fotografer",
      value: stats.total_fotografer,
      icon: <User className="w-6 h-6 text-purple-500" />,
    },
    {
      title: "Total Editor",
      value: stats.total_editor,
      icon: <Users className="w-6 h-6 text-green-500" />,
    },
  ];

  return (
    <>
      {cards.map((c, i) => (
        <div
          key={i}
          className="flex items-center gap-4 bg-white dark:bg-gray-800 shadow rounded-lg p-4 transition-colors"
        >
          <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
            {c.icon}
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-800 dark:text-white">
              {c.value}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-300">
              {c.title}
            </p>
          </div>
        </div>
      ))}
    </>
  );
}
