'use client'
import { useGetOverviewQuery, useGetShotsQuery, useGetTrendingShotQuery } from '@/redux/api/shot'
import Link from 'next/link';
import React from 'react'
import { FiCamera, FiClock, FiUsers, FiPlusSquare, FiHome, FiFilm, FiSettings } from 'react-icons/fi'

export default function Dashboard() {
  const { data: shotdata, isLoading: trendingLoading, isError: trendingError } = useGetTrendingShotQuery();
  const { data, isLoading, isError } = useGetOverviewQuery();

  // Mock data - replace with your actual data
  const stats = {
    totalShots: 1243,
    pendingShots: 42,
    totalUsers: 187
  }



  if(isLoading || trendingLoading){
    return <p>Loading...</p>
  }

  if(isError || trendingError){
    return <p>Something went wrong!</p>
  }

  const overview = data?.overView;
  const trendingShots = shotdata?.data || [];

  // Format trending shots for display
  const formattedTrendingShots = trendingShots.map(shot => ({
    id: shot._id,
    title: shot.title,
    views: `${shot.click} views`,
    thumbnail: shot.imageUrl,
    uploaded: new Date(shot.updatedAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }));

  return (
    <div className="flex bg-gray-900 mt-8 scrollbar-hide ">
      {/* Main Content */}
      <div className="flex-1  md:p-6">
        <h1 className="text-3xl font-bold text-white mb-8">Dashboard Overview</h1>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {/* Total Shots Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-blue-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Total Shots</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview?.totalShot}</p>
              </div>
              <div className="p-3 rounded-full bg-blue-500/20 text-blue-400">
                <FiCamera className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              {overview?.totalShotToday < 1 ? 
                <p className="text-sm text-gray-400">Today No video added Right now</p> : 
                <p className="text-sm text-gray-400">+{overview?.totalShotToday - 1} New video add Today</p>
              }
            </div>
          </div>

          {/* Pending Shots Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-yellow-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Pending Shots</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview?.pendingShot}</p>
              </div>
              <div className="p-3 rounded-full bg-yellow-500/20 text-yellow-400">
                <FiClock className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              {overview?.totalPendingShotToday < 1 ? 
                <p className="text-sm text-gray-400">No Pending Video Available today</p> : 
                <p className="text-sm text-gray-400">+{overview?.totalPendingShotToday - 1} new this week</p>
              }
            </div>
          </div>

          {/* Total Users Card */}
          <div className="bg-gray-800 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow duration-300 border-l-4 border-green-500">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="text-gray-400 font-medium">Total Users</h3>
                <p className="text-3xl font-bold text-white mt-2">{overview.totalUsers}</p>
              </div>
              <div className="p-3 rounded-full bg-green-500/20 text-green-400">
                <FiUsers className="text-2xl" />
              </div>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-700">
              {overview?.totalUserToday < 1 ? 
                <p className="text-sm text-gray-400">No User Register today</p> : 
                <p className="text-sm text-gray-400">+{overview?.totalUserToday} new this week</p>
              }
            </div>
          </div>
        </div>

        {/* Trending Videos Section */}
        <div className="bg-gray-800 rounded-xl p-6 shadow-lg">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-white">Trending Videos</h2>
            <Link href="/browse" className="text-blue-400 cursor-pointer hover:text-blue-300 text-sm">View All</Link>
          </div>
          
          {trendingShots.length === 0 ? (
            <p className="text-gray-400 text-center py-8">No trending videos available</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {formattedTrendingShots.map(video => (
                <div key={video.id} className="bg-gray-700 rounded-lg overflow-hidden hover:shadow-lg transition-shadow duration-300">
                  <div className="relative pb-[56.25%]"> {/* 16:9 aspect ratio */}
                    <img 
                      src={video.thumbnail} 
                      alt={video.title}
                      className="absolute h-full w-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent"></div>
                    <span className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                      {video.views}
                    </span>
                  </div>
                  <div className="p-4">
                    <h3 className="text-white font-medium mb-1 truncate">{video.title}</h3>
                    <p className="text-gray-400 text-sm">Added: {video.uploaded}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Mobile Bottom Navigation */}
  
      </div>
    </div>
  )
}