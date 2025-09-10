'use client'
import React, { useEffect, useState } from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FiFilm, FiCamera, FiUsers } from 'react-icons/fi'
import { FaPlay } from 'react-icons/fa'
import Aos from 'aos'
import 'aos/dist/aos.css'

export default function About() {
  const [activeVideo, setActiveVideo] = useState(null)
  
  useEffect(() => {
    Aos.init({ duration: 1000 })
  }, [])

  // Cinematography tutorial videos from YouTube
//   https://youtu.be/r2nD_knsNrc?si=8VIrMpkCnK3ZAKtH
  const tutorials = [
    {
      id: 'lighting',
      title: "Lighting Techniques",
      desc: "Learn professional lighting setups from classic films",
      youtubeId: "EfwpyMk8U4M?si", // Roger Deakins Lighting Techniques
      thumbnail: "https://img.youtube.com/vi/r2nD_knsNrc/maxresdefault.jpg"
    },
  

    {
      id: 'movement',
      title: "Camera Movement",
      desc: "Master tracking shots and stabilizer techniques",
      youtubeId: "EfwpyMk8U4M", // Camera Movement Masterclass
      thumbnail: "https://img.youtube.com/vi/EfwpyMk8U4M/maxresdefault.jpg"
    },
    {
      id: 'color',
      title: "Color Grading",
      desc: "Achieve cinematic looks in post-production",
      youtubeId: "pAh83khT1no", // Color Grading Tutorial
      thumbnail: "https://img.youtube.com/vi/pAh83khT1no/maxresdefault.jpg"
    }
  ]

//  https://youtu.be/IiyBo-qLDeM?si=0ypudqqDvXOzeYQs
  const featuredVideo = {
    youtubeId: "0suVZjz3_Uw", // Cinematography Techniques by StudioBinder
    thumbnail: "https://img.youtube.com/vi/0suVZjz3_Uw/maxresdefault.jpg",
    title: "Cinematography Masterclass",
    desc: "Essential techniques every filmmaker should know"
  }

  const openVideo = (videoId) => {
    setActiveVideo(videoId)
  }

  const closeVideo = () => {
    setActiveVideo(null)
  }

  return (
    <section className=" py-20 px-4 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/film-grain.png')]"></div>
      </div>
      
      <div className=" relative z-10">
        {/* Header */}
        <div className="text-center mb-16" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">About ShotDeck</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-3xl mx-auto">
            The ultimate visual research platform for filmmakers and cinephiles
          </p>
        </div>

        {/* Main Content */}
        <div className="grid md:grid-cols-2 gap-12 items-center mb-20">
          {/* Left Column - Features */}
          <div className="space-y-8">
            <motion.div 
              className="flex items-start gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700"
              whileHover={{ y: -5 }}
              data-aos="fade-right"
            >
              <div className="bg-blue-500 bg-opacity-20 p-3 rounded-full flex-shrink-0">
                <FiFilm className="text-blue-400 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Cinematic Reference Library</h3>
                <p className="text-gray-400">
                  Access over 1.8 million meticulously curated shots from 8,500+ films. 
                  Study lighting, composition, and camera movement from cinema history.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700"
              whileHover={{ y: -5 }}
              data-aos="fade-right"
              data-aos-delay="100"
            >
              <div className="bg-purple-500 bg-opacity-20 p-3 rounded-full flex-shrink-0">
                <FiCamera className="text-purple-400 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Technical Breakdowns</h3>
                <p className="text-gray-400">
                  Detailed technical information including cameras, lenses, lighting setups, 
                  and aspect ratios used in iconic film scenes.
                </p>
              </div>
            </motion.div>

            <motion.div 
              className="flex items-start gap-4 p-4 bg-gray-800 bg-opacity-50 rounded-xl border border-gray-700"
              whileHover={{ y: -5 }}
              data-aos="fade-right"
              data-aos-delay="200"
            >
              <div className="bg-green-500 bg-opacity-20 p-3 rounded-full flex-shrink-0">
                <FiUsers className="text-green-400 text-xl" />
              </div>
              <div>
                <h3 className="text-xl font-semibold text-white mb-2">Filmmaker Community</h3>
                <p className="text-gray-400">
                  Connect with directors, cinematographers, and film students worldwide. 
                  Share shot decks and collaborate on projects.
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column - Featured Video */}
          <div 
            className="relative aspect-video rounded-xl overflow-hidden border-2 border-gray-700 shadow-2xl"
            data-aos="fade-left"
          >
            {activeVideo === 'featured' ? (
              <div className="w-full h-full">
                <iframe
                  width="100%"
                  height="100%"
                  src={`https://www.youtube.com/embed/${featuredVideo.youtubeId}?autoplay=1`}
                  frameBorder="0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                  className="w-full h-full"
                ></iframe>
              </div>
            ) : (
              <>
                <Image
                  src={featuredVideo.thumbnail}
                  alt={featuredVideo.title}
                  fill
                  className="object-cover"
                  priority
                />
                <div 
                  className="absolute inset-0 bg-black/30 flex items-center justify-center cursor-pointer"
                  onClick={() => openVideo('featured')}
                >
                  <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 transition-all">
                    <FaPlay className="text-xl" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-black to-transparent">
                  <h3 className="text-white text-xl font-semibold">{featuredVideo.title}</h3>
                  <p className="text-gray-300 text-sm mt-1">{featuredVideo.desc}</p>
                </div>
              </>
            )}
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mt-12">
          {[
            { number: "1.8M+", label: "Cinematic Shots", icon: "🎬" },
            { number: "8.5K+", label: "Films Cataloged", icon: "🎥" },
            { number: "200+", label: "Cinema", icon: "📷" },
            { number: "50K+", label: "Active Users", icon: "👥" }
          ].map((stat, index) => (
            <motion.div 
              key={index}
              className="bg-gray-800 bg-opacity-50 p-6 rounded-xl text-center border border-gray-700"
              whileHover={{ scale: 1.05 }}
              data-aos="fade-up"
              data-aos-delay={index * 100}
            >
              <div className="text-3xl mb-2">{stat.icon}</div>
              <h3 className="text-3xl font-bold text-blue-400 mb-2">{stat.number}</h3>
              <p className="text-gray-400">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Tutorial Section */}
        <div className="mt-20" data-aos="fade-up">
          <h3 className="text-2xl font-bold text-white mb-8 text-center">Cinematography Tutorials</h3>
          <div className="grid md:grid-cols-3 gap-6">
            {tutorials.map((video, index) => (
              <motion.div
                key={video.id}
                className="bg-gray-800 rounded-lg overflow-hidden border border-gray-700"
                whileHover={{ y: -5 }}
              >
                {activeVideo === video.id ? (
                  <div className="aspect-video">
                    <iframe
                      width="100%"
                      height="100%"
                      src={`https://www.youtube.com/embed/${video.youtubeId}?autoplay=1`}
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                      className="w-full h-full"
                    ></iframe>
                  </div>
                ) : (
                  <>
                    <div className="relative aspect-video bg-gray-700">
                      <Image
                        src={video.thumbnail}
                        alt={video.title}
                        fill
                        className="object-cover"
                      />
                      <div 
                        className="absolute inset-0 flex items-center justify-center cursor-pointer"
                        onClick={() => openVideo(video.id)}
                      >
                        <button className="bg-blue-600 hover:bg-blue-700 text-white rounded-full p-3 transition-all">
                          <FaPlay />
                        </button>
                      </div>
                    </div>
                    <div className="p-4">
                      <h4 className="text-white font-medium">{video.title}</h4>
                      <p className="text-gray-400 text-sm mt-1">{video.desc}</p>
                    </div>
                  </>
                )}
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Video Modal for mobile */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-90 flex items-center justify-center p-4 md:hidden">
          <button 
            className="absolute top-4 right-4 text-white text-2xl z-10"
            onClick={closeVideo}
          >
            &times;
          </button>
          <div className="w-full aspect-video">
            <iframe
              width="100%"
              height="100%"
              src={`https://www.youtube.com/embed/${
                activeVideo === 'featured' 
                  ? featuredVideo.youtubeId 
                  : tutorials.find(v => v.id === activeVideo)?.youtubeId
              }?autoplay=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          </div>
        </div>
      )}
    </section>
  )
}
// <iframe width="1296" height="729" src="https://www.youtube.com/embed/r2nD_knsNrc" title="Ultimate Guide to Cinematic Lighting — Types of Light &amp; Gear Explained [Shot List Ep. 12]" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen></iframe>