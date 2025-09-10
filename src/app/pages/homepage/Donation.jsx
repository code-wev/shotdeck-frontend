'use client'
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FaHeart, FaEnvelope, FaWhatsapp } from 'react-icons/fa';
import { GiFilmProjector } from 'react-icons/gi';
import { useGetSettingQuery } from '@/redux/api/shot';


const Donation = () => {
  const [name, setName] = useState('');
  const [message, setMessage] = useState('');
  const [email, setEmail]  = useState('')
  const [isSending, setIsSending] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const {data} = useGetSettingQuery();
  console.log(data, "This is data magoma")

const handleSubmit = async (e) => {
  e.preventDefault();
  setIsSending(true);

  try {
    const response = await fetch('/api/send-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, message, email }),
    });

    const data = await response.json();
    if (!data.success) throw new Error('Failed to send email');
    
    setIsSent(true);
  } catch (error) {
    console.error('Error:', error);
    alert('Failed to send email. Please try again later.');
  } finally {
    setIsSending(false);
  }
};
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="min-h-screen bg-gradient-to-br from-gray-900 to-purple-900 text-white p-4 sm:p-6"
    >
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ y: -50 }}
          animate={{ y: 0 }}
          className="text-center mb-8 sm:mb-12"
        >
          <GiFilmProjector className="text-4xl sm:text-5xl mt-28 mx-auto text-yellow-400 mb-3 sm:mb-4" />
          <h1 className="text-3xl sm:text-4xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-yellow-400 to-red-500">
            Support Fx References.
          </h1>
          <p className="text-lg sm:text-xl text-gray-300">
            Help us build the ultimate film reference platform
          </p>
        </motion.div>

        {/* Information Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="bg-gray-800 bg-opacity-50 rounded-xl p-5 sm:p-6 mb-6 sm:mb-8 border-l-4 border-yellow-400"
        >
          <h2 className="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 text-yellow-300">About Fx References.</h2>
          <p className="mb-3 sm:mb-4">
            Fx References. is a professional film reference platform created by filmmakers, for filmmakers. 
            We're building the most comprehensive visual database for cinematic inspiration.
          </p>
          <p className="mb-3 sm:mb-4">
            Your contributions help maintain our platform, develop new features, and keep this 
            valuable resource accessible to creators worldwide.
          </p>
          <div className="bg-black bg-opacity-40 p-3 sm:p-4 rounded-lg">
            <h3 className="font-bold mb-2 flex items-center gap-2">
              <FaHeart className="text-red-400" /> How to Contribute
            </h3>
            <p className="mb-2">
              To make a donation or tip, please contact us directly via email:
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <a 
                href="mailto:rakib.fbinternational@gmail.com" 
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <FaEnvelope /> Email Us
              </a>
              <a 
                href="https://wa.me/1234567890" 
                className="flex items-center gap-2 bg-green-600 hover:bg-green-700 px-3 py-1.5 sm:px-4 sm:py-2 rounded-lg transition-colors text-sm sm:text-base"
              >
                <FaWhatsapp /> WhatsApp
              </a>
            </div>
          </div>
        </motion.div>

        {/* Donation Card */}
        <motion.div 
          className="bg-gray-800 bg-opacity-70 rounded-xl overflow-hidden border border-yellow-400 border-opacity-30"
        >
          <div className="p-6 sm:p-8">
            <div className="flex flex-col lg:flex-row gap-6 sm:gap-8">
              {/* Left Side */}
              <motion.div 
                initial={{ x: -50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="lg:w-1/2 flex flex-col justify-center"
              >
                <div className="relative h-56 sm:h-64 bg-black rounded-lg overflow-hidden border border-gray-700 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <GiFilmProjector className="text-7xl sm:text-9xl text-yellow-500 opacity-20" />
                  </div>
                  <motion.div 
                    animate={{ 
                      scale: [1, 1.05, 1],
                    }}
                    transition={{ 
                      repeat: Infinity, 
                      duration: 6,
                      ease: "easeInOut" 
                    }}
                    className="relative z-10 text-center"
                  >
                    <FaHeart className="text-5xl sm:text-6xl text-red-500 mx-auto mb-3 sm:mb-4" />
                    <h3 className="text-xl sm:text-2xl font-semibold">Your Support Matters</h3>
                  </motion.div>
                </div>
                
                <div className="mt-5 sm:mt-6">
                  <h3 className="text-md sm:text-lg font-semibold mb-2 sm:mb-3">Other Ways to Support</h3>
                  <div className="grid grid-cols-2 gap-2 sm:gap-3">
                    <a
                      href="mailto:rakib.fbinternational@gmail.com"
                      className="bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <FaEnvelope className="text-blue-400" /> Email
                    </a>
                    <a
                      href="https://wa.me/1234567890"
                      className="bg-gray-700 hover:bg-gray-600 p-2 sm:p-3 rounded-lg flex items-center justify-center gap-1 sm:gap-2 text-sm sm:text-base"
                    >
                      <FaWhatsapp className="text-green-400" /> WhatsApp
                    </a>
                  </div>
                </div>
              </motion.div>

              {/* Right Side - Contact Form */}
              <motion.div 
                initial={{ x: 50, opacity: 0 }}
                animate={{ x: 0, opacity: 1 }}
                transition={{ delay: 0.4 }}
                className="lg:w-1/2"
              >
                <h2 className="text-xl sm:text-2xl font-bold mb-4 sm:mb-6 flex items-center gap-2">
                  <FaHeart className="text-yellow-400" /> Get in Touch
                </h2>
                
                <form onSubmit={handleSubmit}>
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-gray-300 mb-1 sm:mb-2">Your Name</label>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your Name"
                      required
                    />
                  </div>

                  <div className="mb-4 sm:mb-6">
                    <label className="block text-gray-300 mb-1 sm:mb-2">Message (Optional)</label>
                    <textarea
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 h-16 sm:h-20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Tell us how we can improve Fx References."
                    />
                  </div>
                  <div className="mb-4 sm:mb-6">
                    <label className="block text-gray-300 mb-1 sm:mb-2">Email</label>
                    <input
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full bg-gray-700 rounded-lg px-3 sm:px-4 py-1.5 sm:py-2 h-16 sm:h-20 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                      placeholder="Your Email"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSending}
                    className="w-full py-2 sm:py-3 rounded-lg font-bold flex items-center justify-center gap-2 transition-all bg-gradient-to-r from-yellow-500 to-orange-500 text-black hover:opacity-90 disabled:opacity-50"
                  >
                    {isSending ? (
                      'Sending...'
                    ) : isSent ? (
                      'Sent Successfully!'
                    ) : (
                      <>
                        <FaEnvelope className="animate-pulse" /> 
                        Contact Us to Donate
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            </div>
          </div>
        </motion.div>

        {/* Contact Section */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="mt-8 sm:mt-12 bg-gray-800 bg-opacity-50 rounded-xl p-5 sm:p-6"
        >
          <h3 className="text-lg sm:text-xl font-semibold mb-3 sm:mb-4 text-yellow-300">Need Help or Want to Donate?</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div>
              <h4 className="font-medium mb-1 sm:mb-2 flex items-center gap-2">
                <FaEnvelope className="text-blue-400" /> Email Us
              </h4>
              <p className="text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">For questions or donations:</p>
              <a href="mailto:rakib.fbinternational@gmail.com" className="text-yellow-400 hover:underline text-sm sm:text-base">
                info@example.gmail.com
              </a>
            </div>
            <div>
              <h4 className="font-medium mb-1 sm:mb-2 flex items-center gap-2">
                <FaWhatsapp className="text-green-400" /> WhatsApp
              </h4>
              <p className="text-gray-300 mb-1 sm:mb-2 text-sm sm:text-base">Chat with our support team:</p>
              <a href="https://wa.me/1234567890" className="text-yellow-400 hover:underline text-sm sm:text-base">
                +1 (234) 567-890
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default Donation;
