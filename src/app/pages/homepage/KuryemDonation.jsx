'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import coverImg from '@/assets/cover/cover.png';
import tipeeLogo from '@/assets/tipee.png'

import 'aos/dist/aos.css';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { BsPaypal } from 'react-icons/bs';
import image1 from '@/assets/donation/image 3.png'
import image2 from '@/assets/donation/image 4.png'
import image3 from '@/assets/donation/image 5.png'
import image4 from '@/assets/donation/image 6.png'
import image5 from '@/assets/donation/image 7.png'
import image6 from '@/assets/donation/image 8.png'
import Image from 'next/image';
import { useGetSettingQuery } from '@/redux/api/shot';

gsap.registerPlugin(ScrollTrigger);

export default function KuryemDonation() {
  const { data, isFetching } = useGetSettingQuery();
  const coverPhotos = data?.data[0]?.donation || [];
  const sponsorPhotos = data?.data[0]?.sponser || [];
  const [selectedCoverPhoto, setSelectedCoverPhoto] = useState(null);
  const pathname = usePathname();

  const bgRef = useRef(null); // Ref for background div

  // Set random cover photo
  useEffect(() => {
    if (coverPhotos.length > 0) {
      const randomIndex = Math.floor(Math.random() * coverPhotos.length);
      setSelectedCoverPhoto(coverPhotos[randomIndex]);
    } else {
      setSelectedCoverPhoto(coverImg.src);
    }
  }, [coverPhotos, pathname]);

  // GSAP scroll background animation
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      if (bgRef.current) {
        gsap.to(bgRef.current, {
          backgroundPosition: "50% 100%",
          ease: "none",
          scrollTrigger: {
            trigger: bgRef.current,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
      }
    }, bgRef);

    return () => ctx.revert();
  }, []);

  // Loader
  if (isFetching) {
    return (
      <div className="loader mx-auto py-16 mt-28">
        <div className="box" />
        <div className="box" />
        <div className="box" />
        <div className="box" />
      </div>
    );
  }

  return (
    <div
      ref={bgRef}
      className="w-full bg-cover bg-center lg:px-8 bg-no-repeat bg-fixed min-h-screen lg:max-h-screen"
      style={{
        backgroundImage: `url(${selectedCoverPhoto})`,
        backgroundPosition: '50% 0%',
      }}
    >
      <section className='lg:flex space-y-4 justify-between gap-8 pt-28'>
        {/* CONTRIBUTORS SECTION */}
        <div className='bg-[rgba(0,0,0,0.65)] px-8 pt-2 lg:w-[24%] min-h- pb-36 rounded'>
          <h1
            className="text-white birthstone mt-6 text-center text-[22px] md:text-4xl px-4 md:px-10"
            style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
          >
            CONTRIBUTORS
          </h1>

          <h4 className='text-white birthstone text-center mt-8 text-lg' style={{ textShadow: '0 4px 6px rgba(0,0,0,2)' }}>
            None for the moment, be the first to help the project !!!
          </h4>

          <div className='birthstone'>
            <h4 style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }} className='text-3xl mt-4'>GOLD:</h4>
            <div className='flex justify-between text-[#00A1FF]' style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
              <li className='underline'>John DOE (Tech Art)</li>
              <li className='underline'>John DOE (Cop's)</li>
            </div>
          </div>

          <div className='birthstone mt-8'>
            <h4 style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }} className='text-3xl'>Silver:</h4>
            <div className='flex justify-between' style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
              <li>John DOE (Tech Art)</li>
              <li>John DOE (Pyro)</li>
            </div>

            <li className='text-center'>John DOEDOEDOEDOEDOE (Crowd and Groom)</li>

            <div className='flex justify-between' style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
              <li>John DOE (Compositing)</li>
              <li>John DOE (Fluids / Vellum)</li>
            </div>
          </div>

          <div className='birthstone mt-6'>
            <h4 style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }} className='text-3xl'>Bronze:</h4>
            <div className='flex justify-between' style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}>
              <div className='grid grid-cols-3 ml-8 gap-6'>
                {[1,2,3,4,5,6,7,8,9,10].map((data, idx) => (
                  <li key={idx}>
                    John Doe
                  </li>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* MAIN DONATION SECTION */}
        <div className='bg-[rgba(0,0,0,0.65)] px-8 pt-2 flex-1 pb-36 rounded'>
          <h1
            className="text-white encode-sans mt-6 text-center text-[22px] md:text-6xl font-bold px-4 md:px-10"
            style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
          >
            {data?.data[0]?.coverHeading || "THE INDUSTRY'S BEST RESEARCH TOOL"}
          </h1>

          <h4 className='text-white birthstone text-4xl text-center mt-3' style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }}>
            Let's build something together
          </h4>

          <div className='lg:flex justify-between'>
            <div className='mt-8'>
              <h4 className='birthstone text-lg'>One-time, monthly or yearly</h4>
              <button
                className="encode py-2 px-12 text-xl flex gap-4 items-center mt-2 rounded text-white bg-[#30CAFE]"
                style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
              >
                <span>Donate With</span>
                <BsPaypal />
              </button>
            </div>

            <div className='mt-8'>
              <h4 className='birthstone text-lg'>One-time, monthly or yearly</h4>
              <button
                className="encode py-2 px-8 text-xl flex gap-4 items-center mt-2 rounded text-white bg-[#30CAFE]"
                style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
              >
                <span>Donate With</span>
              <Image alt='logo' src={tipeeLogo} className='w-12'/>
              </button>
            </div>
          </div>

          <div>
            <div className='text-center py-4'>
              <h4 className='birthstone text-4xl'>For monthly donation : </h4>
              <h6 className='birthstone text-xl'>(each rank include previous ranks gifts)</h6>
            </div>

            <div className='birthstone text-center text-2xl'>
              <li>Bronze &gt; 1€ : Name on website</li>
              <li>Silver &gt; 5€ : Specialities next to your name on website</li>
              <li>Gold &gt; 10€ : Linkedin or Portfolio link on website</li>
            </div>

            <p className='encode-only mt-6 text-center'>
              This website is here for the FX community, free for everyone — but it does cost time and money to keep it running.
              If it has helped you, consider supporting it by donating.
              Your support helps keep it alive.
            </p>

            <p className='pt-16 encode-only text-center'>For companies, contact us at contact.fxreferences@gmail.com</p>
          </div>
        </div>

        {/* COMPANIES SUPPORTING SECTION */}
        <div className='lg:w-[25%] bg-[rgba(0,0,0,0.65)] lg:px-8 pt-2 pb-36 rounded'>
          <h1
            className="text-white birthstone mt-6 text-center text-[22px] md:text-4xl px-4 md:px-10"
            style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }}
          >
            COMPANIES SUPPORTING
          </h1>

          {sponsorPhotos.length === 0 ? (
            <h4 className='text-white birthstone text-xl text-center mt-12' style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }}>
              None for the moment, be the first to help the project !!!
            </h4>
          ) : (
            <div className="mt-8">
              <div className="grid grid-cols-2 gap-4">
                {sponsorPhotos.map((sponsor, index) => (
                  <div key={index} className="flex justify-center items-center">
                    <img 
                      src={sponsor} 
                      alt={`Sponsor ${index + 1}`} 
                      className="w-24 h-24 object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Fallback images if no sponsors from API */}
          {sponsorPhotos.length === 0 && (
            <section className="mt-6">
              <div className='flex gap-4 overflow-hidden justify-between'>
                <Image src={image1} className='w-24 h-24' alt="Sponsor 1" />
                <Image src={image2} className='w-24 h-24' alt="Sponsor 2" />
                <Image src={image4} className='w-24 h-24' alt="Sponsor 3" />
              </div>

              <div className='flex mt-6 justify-between'>
                <Image src={image3} className='w-44 h-24' alt="Sponsor 4" />
                <Image src={image5} className='w-24 h-24' alt="Sponsor 5" />
              </div>

              <div className='flex justify-center mt-6'>
                <Image src={image6} className='w-24 h-24' alt="Sponsor 6" />
              </div>
            </section>
          )}
        </div>
      </section>
    </div>
  );
}