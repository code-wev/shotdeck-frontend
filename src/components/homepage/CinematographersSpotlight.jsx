'use client'
import React from 'react'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { FaImdb, FaAward } from 'react-icons/fa'

const cinematographers = [
  {
    id: 1,
    name: "Roger Deakins",
    image: "/deakins.jpg",
    awards: 2,
    notableFilms: ["1917", "Blade Runner 2049", "No Country for Old Men"],
    signatureStyle: "Naturalistic lighting, masterful long takes"
  },
  {
    id: 2,
    name: "Rachel Morrison",
    image: "/morrison.jpg",
    awards: 1,
    notableFilms: ["Black Panther", "Mudbound", "Dope"],
    signatureStyle: "Rich textures, vibrant color palettes"
  },
  {
    id: 3,
    name: "Hoyte van Hoytema",
    image: "/hoytema.jpg",
    awards: 0,
    notableFilms: ["Oppenheimer", "Interstellar", "Dunkirk"],
    signatureStyle: "Large format immersion, practical light sources"
  }
]

export default function CinematographersSpotlight() {
  return (
    <section className="bg-gray-900 py-20 px-4 md:px-8 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-10 bg-[url('/film-grain.png')]"></div>
      
      <div className="max-w-7xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Masters of Light
          </h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Study the work of history's most influential cinematographers
          </p>
        </div>

        {/* Cinematographer Cards */}
        <div className="grid md:grid-cols-3 gap-8">
          {cinematographers.map((dp, index) => (
            <motion.div
              key={dp.id}
              className="group relative aspect-[4/5] overflow-hidden rounded-xl border border-gray-700"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              viewport={{ once: true }}
            >
              {/* Background Image */}
              <Image
                src={dp.image}
                alt={dp.name}
                fill
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90"></div>
              
              {/* Content */}
              <div className="absolute bottom-0 left-0 right-0 p-6 space-y-3">
                <div className="flex justify-between items-start">
                  <h3 className="text-2xl font-bold text-white">{dp.name}</h3>
                  <div className="flex items-center gap-1 text-yellow-400">
                    <FaAward />
                    <span>{dp.awards} Oscar{dp.awards !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                
                <p className="text-blue-300 italic">{dp.signatureStyle}</p>
                
                <div className="flex flex-wrap gap-2 mt-2">
                  {dp.notableFilms.map(film => (
                    <span key={film} className="text-xs bg-gray-800 text-gray-300 px-2 py-1 rounded">
                      {film}
                    </span>
                  ))}
                </div>
                
                <button className="mt-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-full flex items-center gap-2 text-sm">
                  <FaImdb /> Explore Shots
                </button>
              </div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        <div className="text-center mt-16">
          <button className="border border-blue-500 text-blue-400 hover:bg-blue-900 hover:bg-opacity-30 px-8 py-3 rounded-full font-medium transition-all">
            View All Cinematographers →
          </button>
        </div>
      </div>
    </section>
  )
}