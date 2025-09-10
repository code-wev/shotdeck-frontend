'use client'
import React, { useState } from 'react'
import coverImg from '@/assets/cover/cover.jpg'
import Image from 'next/image'
import axios from 'axios'
import { base_url } from '@/utils/utils'
import Swal from 'sweetalert2'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function SignUp() {
  const router = useRouter();
  const [loading, setLoading] = useState(false)

  const signUpHandelar = async(e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const email = e.target.email.value;
      const resp = await axios.post(`${base_url}/user/otp`,{email});
      console.log(resp)
      if(resp.status === 200){
        await Swal.fire({
          title: "Verification Code Sent!",
          text: "Please Check your email!",
          icon: "success"
        });
        setLoading(false)
        router.push(`/verification/${email}`)
      }
      setLoading(false)
    } catch (error) {
      setLoading(false)
      await Swal.fire({
        title: "Something went wrong!",
        text: error.message,
        icon: "error"
      });
    }
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Mobile First Approach */}
      <div className="md:hidden flex flex-col min-h-screen">
        {/* Mobile Header */}
        <div className="p-4 text-center">
          <h1 className="text-white font-bold text-2xl mb-2">ShotDeck</h1>
          <p className="text-gray-300 text-sm">
            The largest collection of movie images
          </p>
        </div>
        
        {/* Mobile Form */}
        <div className="flex-grow flex items-center justify-center p-4">
          <div className="bg-black bg-opacity-80 p-6 rounded-lg w-full max-w-md">
            <h2 className="text-white text-xl font-bold mb-4">Start Exploring Now</h2>
            
            <form onSubmit={signUpHandelar} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name='email'
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:bg-gray-700 focus:outline-none placeholder-gray-400 transition duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-dark transition duration-200 cursor-pointer disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Sign Up Free'}
              </button>
              
              <p className="text-sm text-gray-400 text-center">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-400 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>

      {/* Desktop Version */}
      <div className="hidden md:block relative w-full h-screen overflow-hidden">
        {/* Background Image */}
        <div className="absolute inset-0 z-0">
          <Image
            src={coverImg}
            alt="Film background"
            layout="fill"
            objectFit="cover"
            quality={100}
            className="brightness-75"
          />
        </div>
        
        {/* Content Overlay */}
        <div className="relative z-10 h-full flex flex-col justify-between">
          {/* Top Content */}
          <div className="max-w-4xl md:px-10 md:pt-20">
            <h1 className="text-white font-bold text-4xl md:text-5xl mb-4">
              The library of film, <br />
              one beautiful shot at a time
            </h1>
            <p className="font-semibold text-xl text-white mb-4">
              ShotDeck is the largest collection of fully searchable high-definition movie images in the world.
            </p>
            <p className="text-lg text-white max-w-3xl">
              Hello directors, cinematographers, designers, ad folks, film students, and visual artists! 
              You've just discovered your new secret weapon, the best collaborative professional tool 
              for bringing your vision to life - from pitch to prep to post.
            </p>
          </div>

          {/* Stats */}
          <div className="px-10 mb-10">
            <p className="text-white text-lg font-medium">
              1,847,868 shots / 8,514 titles / unlimited inspiration
            </p>
          </div>

          {/* Signup Form */}
          <div className="bg-black bg-opacity-70 p-8 mx-10 rounded-lg max-w-md mb-10">
            <h2 className="text-white text-2xl font-bold mb-6">Start Exploring Now</h2>
            
            <form onSubmit={signUpHandelar} className="space-y-4">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  id="email"
                  name='email'
                  className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:bg-gray-700 focus:outline-none placeholder-gray-400 transition duration-200"
                  placeholder="your@email.com"
                  required
                />
              </div>
              
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md hover:bg-primary-dark transition duration-200 cursor-pointer disabled:opacity-70"
              >
                {loading ? 'Loading...' : 'Sign Up Free'}
              </button>
              
              <p className="text-sm text-gray-400 text-center">
                Already have an account?{' '}
                <Link href="/sign-in" className="text-blue-400 hover:underline font-medium">
                  Log in
                </Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  )
}