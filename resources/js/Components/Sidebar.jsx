import React from 'react';
import { Link } from '@inertiajs/react';
import {
  Home,
  Camera,
  Edit,
  FileText,
  LogOut
} from 'lucide-react';

const Sidebar = ({ currentRoute = 'dashboard' }) => {
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
      route: 'laporan',
      href: '/laporan'
    }
  ];

  const handleLogout = () => {
    if (window.confirm('Apakah Anda yakin ingin logout?')) {
      // Implement logout logic here
      // router.post('/logout');
      console.log('Logout clicked');
    }
  };

  return (
    <div className="w-64 bg-white shadow-lg min-h-screen">
      <div className="p-6 border-b">
        <h2 className="text-xl font-bold text-gray-800">Dashboard Admin</h2>
        <p className="text-sm text-gray-500">Selamat Datang</p>
      </div>

      <nav className="mt-6">
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
                    : 'text-gray-600 hover:bg-gray-100'
                  }
                `}
              >
                <Icon size={20} className="mr-3" />
                {item.label}
              </Link>
            );
          })}
        </div>

        <div className="px-6 mt-8 pt-8 border-t">
          <button
            onClick={handleLogout}
            className="w-full flex items-center p-3 text-red-500 hover:bg-red-50 rounded-lg transition-colors duration-200"
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
