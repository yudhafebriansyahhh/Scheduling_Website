import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';
import {
  Home,
  Camera,
  Edit,
  FileText,
  LogOut,
  Sun,
  Moon
} from 'lucide-react';

const Sidebar = ({ currentRoute = 'dashboard' }) => {
  const [darkMode, setDarkMode] = useState(false);

  // Ambil preferensi dari localStorage saat load
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      setDarkMode(true);
    }
  }, []);

  // Simpan preferensi ke localStorage
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  const menuItems = [
    {
      key: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      route: 'dashboard',
      href: '/admin'
    },
    {
      key: 'fotografer',
      label: 'Fotografer',
      icon: Camera,
      route: 'fotografer',
      href: '/fotografer'
    },
    {
      key: 'editor',
      label: 'Editor',
      icon: Edit,
      route: 'editor',
      href: '/editor'
    },
    {
      key: 'laporan',
      label: 'Laporan',
      icon: FileText,
      route: 'schedule',
      href: '/schedule'
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      console.log('Logout clicked');
      // router.post('/logout');
    }
  };

  return (
    <div className="w-64 bg-white dark:bg-gray-900 shadow-lg h-screen sticky top-0 transition-colors duration-300 overflow-y-auto">
      {/* Header */}
      <div className="p-6 border-b dark:border-gray-700 flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">Dashboard Admin</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">Selamat Datang</p>
        </div>

        {/* Toggle Switch */}
        <button
          onClick={() => setDarkMode(!darkMode)}
          className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-700 transition"
        >
          {darkMode ? <Sun size={18} className="text-yellow-400" /> : <Moon size={18} className="text-gray-700" />}
        </button>
      </div>

      {/* Menu */}
      <nav className="mt-6 flex-1">
        <div className="px-6">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <Link
                key={item.key}
                href={item.href}
                className={`
                  flex items-center p-3 mb-2 rounded-lg transition-colors duration-200
                  ${isActive
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  }
                `}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        {/* Logout */}
        <div className="px-6 mt-8 pt-8 border-t dark:border-gray-700">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors duration-200"
          >
            <LogOut size={20} className="mr-3" />
            Logout
          </button>
        </div>
      </nav>
    </div>
  );
};

export default Sidebar;
