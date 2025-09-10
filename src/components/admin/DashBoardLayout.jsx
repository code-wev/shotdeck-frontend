'use client';
import React, { useState, useEffect } from 'react';
import { FaBars, FaTimes, FaTachometerAlt, FaGlobe, FaPlus, FaPhotoVideo, FaUsers } from 'react-icons/fa';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { MdVideoCameraBack } from 'react-icons/md';
import { useSession } from 'next-auth/react';
import { IoSettingsSharp } from 'react-icons/io5';
import { FiFilm, FiHome, FiPlusSquare, FiSettings } from 'react-icons/fi';

export default function DashBoardLayout({ children }) {
  const [collapsed, setCollapsed] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { data, status } = useSession();
  console.log(data, status, 'Hi I am Status')
  const router = useRouter();
  const sidebarMbl = useState(false)

  // Check if current path includes "add-shot"
  const isAddShotPage = pathname.includes('add-shot');

  // Move all hooks to the top, before any conditional returns
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    handleResize(); // Set initial value
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close sidebar when clicking outside on mobile
  useEffect(() => {
    if (!isMobile || collapsed) return;

    const handleClickOutside = (e) => {
      const sidebar = document.querySelector('.sidebar');
      if (sidebar && !sidebar.contains(e.target)) {
        setCollapsed(true);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isMobile, collapsed]);

  // Now we can do the admin check after all hooks
  if(status === 'loading'){
    return <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  }

  if (data?.user?.role !== 'admin') {
    return (
      <div className="mt-28 p-4 max-w-7xl mx-auto bg-yellow-100 text-yellow-800 border border-yellow-300 rounded">
        <h4 className="text-lg font-semibold">Access Denied</h4>
        <p>You do not have permission to view this page.</p>
      </div>
    );
  }

  const mobileMenuItems = [
    { 
      name: "Dashboard", 
      icon: <FiHome />, 
      href: "/admin/",
      active: pathname === '/admin'
    },
    { 
      name: "Add Shot", 
      icon: <FiPlusSquare />,
      href: "/admin/add-shot",
      active: pathname === '/admin/add-shot'
    },
    { 
      name: "All Videos", 
      icon: <FiFilm />,
      href: "/admin/all-shot",
      active: pathname === '/admin/all-shot'
    },
    { 
      name: "Settings", 
      icon: <FiSettings />,
      href: "/admin/setting",
      active: pathname === '/admin/setting'
    }
  ];

  const sidebarMenuItems = [
    { 
      name: "Dashboard", 
      icon: <FaTachometerAlt />, 
      href: "/admin/",
      active: pathname === '/admin'
    },
    { 
      name: "Website", 
      icon: <FaGlobe />,
      href: "/",
      active: false // This is external link
    },
    { 
      name: "Add New Shot", 
      icon: <FaPlus />,
      href: "/admin/add-shot",
      active: pathname === '/admin/add-shot'
    },
    { 
      name: "Requested Shots", 
      icon: <MdVideoCameraBack />,
      href: "/admin/requested-shots",
      active: pathname === '/admin/requested-shots'
    },
    { 
      name: "All Users", 
      icon: <FaUsers />,
      href: "/admin/users",
      active: pathname === '/admin/users'
    },
    // { 
    //   name: "All Shot", 
    //   icon: <FaPhotoVideo />,
    //   href: "/admin/all-shot",
    //   active: pathname === '/admin/all-shot'
    // },
    { 
      name: "Setting", 
      icon: <IoSettingsSharp />,
      href: "/admin/setting",
      active: pathname === '/admin/setting'
    }
  ];

  const toggleSidebar = () => {
    setCollapsed(!collapsed);
  };

  return (
    <div className="relative">
      {/* Mobile menu button - absolute positioned top right */}
      {isAddShotPage && (
        <button
          className="text-white fixed top-4 right-4 z-50 p-2 rounded-md bg-gray-800 bg-opacity-80"
          onClick={toggleSidebar}
        >
          {collapsed ? <FaBars size={20} /> : <FaTimes size={20} />}
        </button>
      )}

      <div className="flex h-screen">
        {/* Sidebar - conditionally render based on isAddShotPage */}
        {!isAddShotPage ? (
          <div
            className={`sidebar bg-gray-800 text-white p-4 flex flex-col 
              transition-all duration-300 ease-in-out
              ${collapsed ? '-translate-x-full lg:translate-x-0' : 'translate-x-0'}
              fixed lg:relative z-40 w-64 h-full`}
          >
            <div className="space-y-4 mt-16">
              {sidebarMenuItems.map((item, index) => (
                <Link 
                  key={index}
                  href={item.href} 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${item.active ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                  onClick={() => isMobile && setCollapsed(true)}
                >
                  {item.icon} <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        ) : (
          <div
            className={`sidebar bg-gray-800 text-white p-4 flex flex-col 
              transition-all duration-300 ease-in-out
              ${collapsed ? '-translate-x-full' : 'translate-x-0'}
              fixed z-40 w-64 h-full`}
          >
            <div className="space-y-4 mt-16">
              {mobileMenuItems.map((item, index) => (
                <Link 
                  key={index}
                  href={item.href} 
                  className={`flex items-center gap-2 p-2 rounded hover:bg-gray-800 transition-colors ${item.active ? 'bg-gray-800 text-blue-400' : 'hover:text-blue-400'}`}
                  onClick={() => setCollapsed(true)}
                >
                  {item.icon} <span>{item.name}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Mobile Bottom Menu - only show on mobile and not on add-shot page */}
        {!isAddShotPage && (
          <div className="fixed bottom-0 z-50 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around md:hidden py-3">
            {mobileMenuItems.map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className={`flex flex-col items-center p-2 ${item.active ? 'text-blue-400' : 'text-gray-400'}`}
              >
                <span className="text-xl">{item.icon}</span>
                <span className="text-xs mt-1">{item.name}</span>
              </Link>
            ))}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 bg-gray-900 p-2 md:p-4 overflow-auto transition-all duration-300">
          <div className={`${isAddShotPage ? 'pt-12' : 'pt-12 md:pt-0'} pb-16 md:pb-0`}>
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}