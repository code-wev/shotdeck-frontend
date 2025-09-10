'use client'
import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { FiChevronDown, FiChevronUp } from 'react-icons/fi'
import Aos from 'aos'
import 'aos/dist/aos.css'

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null)

  useEffect(() => {
    Aos.init({ duration: 800 })
  }, [])

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index)
  }

  const faqs = [
    {
      question: "How do I search for specific shots?",
      answer: "Use our advanced search filters to find shots by film, director, cinematographer, camera, lens, lighting style, aspect ratio, or visual keywords. You can also search by color palette or composition style."
    },
    {
      question: "Can I create and save my own shot collections?",
      answer: "Yes! Registered users can create unlimited shot decks, organize them into projects, and share with collaborators. This is perfect for pre-production planning and mood boards."
    },
    {
      question: "What technical details are included for each shot?",
      answer: "Each shot includes camera and lens information (when available), lighting setup, aspect ratio, film stock/digital format, and often behind-the-scenes production notes from cinematographers."
    },
    {
      question: "How often is the database updated?",
      answer: "We add 5,000-10,000 new shots weekly from both classic and contemporary films. Our team of film researchers works continuously to expand and verify our database."
    },
    {
      question: "Can I download high-resolution images?",
      answer: "Premium members can download high-res frames for reference and study. All images are properly licensed for educational and pre-production use."
    },
    {
      question: "Do you offer cinematography courses?",
      answer: "Yes! We partner with ASC cinematographers to offer exclusive masterclasses. Check our Tutorials section for both free and premium educational content."
    }
  ]

  return (
    <section className=" py-20 px-4 md:px-8 lg:px-12 relative overflow-hidden">
      {/* Background texture */}
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[url('/film-grain.png')]"></div>
      </div>

      <div className="max-w-4xl mx-auto relative z-10">
        {/* Header */}
        <div className="text-center mb-12" data-aos="fade-up">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">FAQs</h2>
          <div className="w-24 h-1 bg-blue-500 mx-auto mb-6"></div>
          <p className="text-xl text-gray-300">
            Answers to common questions about ShotDeck
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4" data-aos="fade-up">
          {faqs.map((faq, index) => (
            <motion.div 
              key={index}
              className="border border-gray-700 rounded-xl overflow-hidden bg-gray-800 bg-opacity-50"
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <button
                className={`w-full flex justify-between items-center p-6 text-left ${activeIndex === index ? 'bg-gray-750' : ''}`}
                onClick={() => toggleFAQ(index)}
              >
                <h3 className="text-lg md:text-xl font-medium text-white">
                  {faq.question}
                </h3>
                {activeIndex === index ? (
                  <FiChevronUp className="text-blue-400 text-xl" />
                ) : (
                  <FiChevronDown className="text-gray-400 text-xl" />
                )}
              </button>
              
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: activeIndex === index ? 'auto' : 0,
                  opacity: activeIndex === index ? 1 : 0
                }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="px-6 pb-6 text-gray-400">
                  {faq.answer}
                  {index === 3 && ( // Special case for database question
                    <div className="mt-4 flex items-center gap-2 text-sm">
                      <span className="bg-blue-900 text-blue-300 px-2 py-1 rounded">
                        New This Week
                      </span>
                      <span>The Batman (2022) • Dune (2021) • The Power of the Dog (2021)</span>
                    </div>
                  )}
                  {index === 5 && ( // Special case for courses question
                    <button className="mt-4 text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1">
                      View upcoming masterclasses <FiChevronDown className="text-xs" />
                    </button>
                  )}
                </div>
              </motion.div>
            </motion.div>
          ))}
        </div>

        {/* CTA */}
        {/* <div className="text-center mt-16" data-aos="fade-up">
          <h3 className="text-xl text-white mb-4">Still have questions?</h3>
          <p className="text-gray-400 mb-6 max-w-2xl mx-auto">
            Our film research team is available to help with specific shot inquiries or technical questions.
          </p>
          <div className="flex flex-col sm:flex-row justify-center gap-4">
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-full font-medium transition-all">
              Contact Support
            </button>
            <button className="border border-gray-600 hover:border-gray-500 text-white px-6 py-3 rounded-full font-medium transition-all">
              Join Our Discord
            </button>
          </div>
        </div> */}
      </div>
    </section>
  )
}