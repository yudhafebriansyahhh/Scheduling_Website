import React from 'react';
import { Users, CheckCircle, Camera, Edit3, Calendar } from 'lucide-react';

const LaporanSummaryCards = ({ summary }) => {
  const {
    totalJobs,
    completedJobs,
    totalJamFotografer,
    totalJamEditor,
    totalSesi,
    filterRole
  } = summary;

  // Format jam untuk display
  const formatJam = (jam) => {
    const numJam = parseFloat(jam);
    return numJam % 1 === 0 ? parseInt(numJam).toString() : jam.toString().replace('.', ',');
  };

  // Cards berdasarkan role yang dipilih
  const getCards = () => {
    if (filterRole === 'assist') {
      // Untuk role assist, hanya tampilkan jumlah sesi
      return [
        {
          title: "Total Sesi",
          value: totalSesi || 0,
          icon: Calendar,
          color: "bg-indigo-500",
          cardClass: "bg-indigo-50 dark:bg-indigo-900/20 border-indigo-200 dark:border-indigo-800"
        }
      ];
    }

    const baseCards = [
      {
        title: "Total Jobs",
        value: totalJobs,
        icon: Users,
        color: "bg-blue-500",
        cardClass: "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800"
      },
      {
        title: "Jobs Selesai",
        value: completedJobs,
        icon: CheckCircle,
        color: "bg-green-500",
        cardClass: "bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800"
      }
    ];

    if (filterRole === 'fotografer') {
      return [
        ...baseCards,
        {
          title: "Total Jam Fotografer",
          value: `${formatJam(totalJamFotografer)} jam`,
          icon: Camera,
          color: "bg-purple-500",
          cardClass: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        }
      ];
    } else if (filterRole === 'editor') {
      return [
        ...baseCards,
        {
          title: "Total Match Editor",
          value: `${formatJam(totalJamEditor)} match`,
          icon: Edit3,
          color: "bg-orange-500",
          cardClass: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        }
      ];
    } else {
      // Role 'all' - tampilkan semua
      return [
        ...baseCards,
        {
          title: "Total Jam Fotografer",
          value: `${formatJam(totalJamFotografer)} jam`,
          icon: Camera,
          color: "bg-purple-500",
          cardClass: "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800"
        },
        {
          title: "Total Match Editor",
          value: `${formatJam(totalJamEditor)} match`,
          icon: Edit3,
          color: "bg-orange-500",
          cardClass: "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800"
        }
      ];
    }
  };

  const cards = getCards();

  return (
    <div className={`grid gap-6 mb-8 ${
      cards.length === 1 ? 'grid-cols-1 md:grid-cols-1 max-w-sm' :
      cards.length === 3 ? 'grid-cols-1 md:grid-cols-3' : 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4'
    }`}>
      {cards.map((card, index) => {
        const IconComponent = card.icon;
        return (
          <div
            key={index}
            className={`p-6 rounded-xl border transition-colors duration-300 ${card.cardClass}`}
          >
            <div className="flex items-center">
              <div className={`p-3 rounded-lg ${card.color} mr-4`}>
                <IconComponent className="h-6 w-6 text-white" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {card.value}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default LaporanSummaryCards;
