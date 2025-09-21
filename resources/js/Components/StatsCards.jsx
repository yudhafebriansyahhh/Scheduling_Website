import React from 'react';
import { Calendar, Users, Edit } from 'lucide-react';

const StatsCards = ({ stats }) => {
  // Map stats to match new structure
  const cardStats = [
    {
      title: 'Jadwal Bulan Ini',
      value: stats?.jadwal_bulan_ini || stats?.jadwalBulanIni || '0',
      icon: Calendar,
      color: 'bg-blue-100 text-blue-600',
      trend: '+12%',
      isPositive: true
    },
    {
      title: 'Total Fotografer',
      value: stats?.total_fotografer || stats?.totalFotografer || '0',
      icon: Users,
      color: 'bg-purple-100 text-purple-600',
      trend: null,
      isPositive: null
    },
    {
      title: 'Total Editor',
      value: stats?.total_editor || stats?.totalEditor || '0',
      icon: Edit,
      color: 'bg-green-100 text-green-600',
      trend: null,
      isPositive: null
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      {cardStats.map((stat, index) => {
        const Icon = stat.icon;

        return (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow duration-200 cursor-pointer group"
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className={`p-3 rounded-lg ${stat.color} group-hover:scale-110 transition-transform duration-200`}>
                  <Icon size={24} />
                </div>
                <div className="ml-4">
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
                  <p className="text-gray-600 dark:text-gray-300 text-sm">{stat.title}</p>
                </div>
              </div>

            </div>

            {/* Progress bar for visual enhancement */}
            <div className="mt-4">
              <div className="w-full bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all duration-500 ${
                    index === 0 ? 'bg-blue-500' :
                    index === 1 ? 'bg-purple-500' : 'bg-green-500'
                  }`}
                  style={{
                    width: `${Math.min(
                      Math.max(parseInt(stat.value) * 2, 10),
                      100
                    )}%`
                  }}
                ></div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default StatsCards;
