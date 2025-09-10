'use client'
import React, { useState, useEffect, useRef } from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import Nav from './Nav'
import { usePathname, useRouter } from 'next/navigation'
import { useGetSettingQuery } from '@/redux/api/shot'
import { motion, AnimatePresence } from 'framer-motion'
import { FiMenu, FiX, FiHome, FiFilm, FiUsers, FiSettings, FiUser, FiPlusCircle, FiGlobe, FiList, FiCompass } from 'react-icons/fi'
import Link from 'next/link'
import { useSession } from 'next-auth/react'

export default function Navbar() {
  const pathName = usePathname();
  const router = useRouter();
  const { data, isFetching, isError } = useGetSettingQuery();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const user = useSession();
  console.log(user?.data?.user?.role, 'this is user re kamalla')
  // Get user role (replace this with your actual auth logic)
  const role = user?.data?.user?.role; // Change this to get from your auth context
  
  const navigateHandler = () => {
    router.push('/')
  }

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  }

  // Close menu when clicking outside or pressing ESC
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setIsMenuOpen(false);
      }
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    };
  }, []);

  const pathname = usePathname();

  return (
    <div className='bg-primary px-4 fixed z-50 border-b border-gray-700 w-full py-4 flex justify-between items-center'>
      <section className='flex items-center gap-4'>
        {/* Animated Hamburger Menu - Left side */}
        {role === 'admin' && !pathname.includes('/admin') && (
          <motion.button 
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
            className="flex flex-col justify-center mt-2 items-center w-8 h-8 cursor-pointer group"
            aria-label="Toggle admin menu"
          >
            <motion.span
              className={`bg-white h-[2px] w-6 rounded-full transition-all duration-300 ${isMenuOpen ? 'rotate-45 translate-y-[6px]' : ''}`}
              initial={false}
            />
            <motion.span
              className={`bg-white h-[2px] w-6 rounded-full my-1.5 transition-all duration-300 ${isMenuOpen ? 'opacity-0 translate-x-4' : 'opacity-100'}`}
              initial={false}
            />
            <motion.span
              className={`bg-white h-[2px] w-6 rounded-full transition-all duration-300 ${isMenuOpen ? '-rotate-45 -translate-y-[6px]' : ''}`}
              initial={false}
            />
          </motion.button>
        )}

        {isFetching ? (
          <div className="wrapper">
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="circle"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>
            <div className="shadow"></div>
          </div>
        ) : (
          <motion.div
          
          >
            <Image 
              onClick={navigateHandler} 
              alt='logo' 
              src={data?.data[0]?.logo || logo} 
              width={200} 
              height={200} 
              className='pt-2 max-h-[32px] cursor-pointer'
            />
          </motion.div>
        )}
      </section>

      {/* Main Navigation - Elevated */}
      <motion.section 
        className="relative"
        initial={{ y: -10 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <Nav />
      </motion.section>

      {/* Admin Sidebar - Pure black with elevated nav items */}
      <AnimatePresence>
  {role === 'admin' && isMenuOpen && (
    <>
      {/* Dark overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.7 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        className="fixed inset-0 bg-black z-40"
        onClick={toggleMenu}
      />
      
      {/* Sidebar */}
      <motion.div
        ref={menuRef}
        initial={{ x: '-100%' }}
        animate={{ x: 0 }}
        exit={{ x: '-100%' }}
        transition={{ 
          type: 'spring', 
          stiffness: 400,
          damping: 30,
          bounce: 0.1
        }}
        className="fixed top-0 left-0 h-full w-64 bg-gray-800 shadow-2xl z-50 p-4 flex flex-col"
      >
        {/* Close button */}
        <div className="flex justify-end">
          <motion.button 
            onClick={toggleMenu}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            className="text-white text-2xl p-2 rounded-full hover:bg-gray-700 transition-all"
          >
            <FiX />
          </motion.button>
        </div>
        
        {/* Main Menu Items - with EXACT hover effects */}
        <div className="space-y-2 mt-6">
          {[
            { icon: <FiHome />, text: 'Dashboard', href: '/admin' },
            { icon: <FiPlusCircle />, text: 'Add New Shot', href: '/admin/add-shot' },
            { icon: <FiList />, text: 'Requested Shots', href: '/admin/requested-shots' },
            { icon: <FiUsers />, text: 'All Users', href: '/admin/users' },
            { icon: <FiSettings />, text: 'Setting', href: '/admin/setting' }
          ].map((item, index) => (
            <motion.div
              key={item.text}
              initial={{ opacity: 0, y: 10 }}
              animate={{ 
                opacity: 1,
                y: 0,
                transition: { 
                  delay: 0.2 + index * 0.1,
                  type: 'spring',
                  stiffness: 300
                }
              }}
            >
              <Link
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md transition-all
                  ${router.pathname === item.href 
                    ? 'bg-gray-700 text-blue-400' 
                    : 'text-gray-300 hover:bg-gray-700 hover:text-blue-400'
                  }`}
                onClick={toggleMenu}
              >
                <span className={`text-lg transition-colors ${
                  router.pathname === item.href 
                    ? 'text-blue-400' 
                    : 'text-gray-300 group-hover:text-blue-400'
                }`}>
                  {item.icon}
                </span>
                <span className="text-sm font-medium">
                  {item.text}
                </span>
              </Link>
            </motion.div>
          ))}
        </div>

        {/* Mobile Bottom Menu with same hover effects */}
        <div className="mt-auto border-t border-gray-700 pt-3 pb-2 md:hidden">
          <div className="flex justify-around">
            {[
              { icon: <FiHome size={18} />, text: 'Home', href: '/' },
              { icon: <FiCompass size={18} />, text: 'Explore', href: '/explore' },
              { icon: <FiPlusCircle size={18} />, text: 'Create', href: '/create' },
              { icon: <FiUser size={18} />, text: 'Profile', href: '/profile' }
            ].map((item, index) => (
              <Link 
                key={index} 
                href={item.href}
                className={`flex flex-col items-center p-1 rounded-md transition-all
                  ${router.pathname === item.href 
                    ? 'text-blue-400' 
                    : 'text-gray-400 hover:text-blue-400'
                  }`}
                onClick={toggleMenu}
              >
                <span className="p-1 rounded-md hover:bg-gray-700">
                  {item.icon}
                </span>
                <span className="text-xs mt-1">{item.text}</span>
              </Link>
            ))}
          </div>
        </div>
      </motion.div>
    </>
  )}
</AnimatePresence>
    </div>
  )
}