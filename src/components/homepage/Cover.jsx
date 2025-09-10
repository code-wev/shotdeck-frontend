'use client'
import React, { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import coverImg from '@/assets/cover/cover.png';
import line from '@/assets/cover/line.gif';
import Image from 'next/image';
import Search from './Search';
import Aos from 'aos';
import 'aos/dist/aos.css';
import { useGetSettingQuery } from '@/redux/api/shot';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

export default function Cover() {
  const { data, isFetching } = useGetSettingQuery();
  const coverPhotos = data?.data[0]?.coverphoto || [];
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

  // Init AOS animations
  useEffect(() => {
    Aos.init();
  }, []);

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
      className="w-full bg-cover bg-center bg-no-repeat bg-fixed min-h-screen"
      style={{
        backgroundImage: `url(${ coverImg.src})`,
        backgroundPosition: '50% 0%',
      }}
    >
   <h1
  data-aos="fade-up"
  data-aos-duration="1500"
  className="text-white encode-sans mt-6 text-center pt-12 2xl:pt-28 text-[22px] text-3xl 2xl:text-6xl font-bold px-4 md:px-10"
  style={{ textShadow: '0 4px 6px rgba(0,0,0,0.5)' }} // text-only drop shadow
>
  {data?.data[0]?.coverHeading || "THE INDUSTRY'S BEST RESEARCH TOOL"}
</h1>
{/* 
      <div data-aos="fade-up" data-aos-duration="1500" className="flex justify-center">
        <Image alt="lineGif" src={line} className="py-3" />
      </div> */}

   <p
  data-aos="fade-up"
  data-aos-duration="1500"
  className="text-white birthstone text-4xl text-center mt-3"
  style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }} // black, 100% opacity
>
  {data?.data[0]?.coverDescription || 'Find the perfect shots, create decks, share them with your crew'}
</p>





{/* kuryem er special dibba */}


<div className='mt-32'>

<h4 className='text-white birthstone text-4xl text-center mt-3'    style={{ textShadow: '0 4px 6px rgba(0,0,0,1)' }} >References / Tutorial / Breakdown</h4>


<button
  className="encode py-2 px-12 mt-4 text-3xl rounded mx-auto flex justify-center text-white bg-[#30CAFE]"
  style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }} // black with 50% opacity
>
  Browse
</button>

<div className='text-center text-4xl mt-4'>
  
<h4 className='birthstone'>For FREE and for everyone !!!</h4>









<div className='flex flex-wrap justify-between pb-16 items-end gap-4 mx-auto px-4 2xl:pt-28 pt-8 lg:px-16 '>
  {cardData.map((data, idx) => (
    <div
      key={idx}
      className='p-6 rounded flex flex-col justify-between bg-[rgba(0,0,0,0.37)]  w-full xl:w-[30%]' // fixed height & responsive width
    >
      <div>
        <h4 className='text-3xl text-left encode-sans'>{data.title}</h4>
        <p className='encode text-sm w-[70%] ml-4 text-left mt-2'>{data?.subtitle}</p>
      </div>

      <div className='flex justify-end '>
        <button
          className="encode py-2 px-12 text-xl rounded text-white bg-[#30CAFE]"
          style={{ boxShadow: '0 4px 6px rgba(0,0,0,0.5)' }} // 50% black shadow
        >
          {data.button}
        </button>
      </div>
    </div>
  ))}
</div>



</div>

</div>
     

     
    </div>
  );
}


const cardData = [
  {
    title:'Create an account',
    subtitle:"Even though the site is completely free, creating an account lets you build playlists and save your favorite videos so you can easily find them later.",
    button:"Sign Up",
    link:"/sign-up"
  },
  {
    title:'Help FX - References',
    subtitle:"This website is here for the FX community, free for everyone — but it does cost time and money to keep it running.If it has helped you, consider supporting it by donating through the link below.Your support helps keep it alive.",
    button:"donation",
    link:"/sign-up",
    endText: "Thank you!"
  },
  {
    title:"A community project for everyone",
    subtitle:"This project exists thanks to the FX community — and you can be part of it!By adding your own video references, you help create a richer, more valuable resource that artists, students, and enthusiasts around the world can learn from.Every contribution makes a difference and inspires others.",
    button:"Add",
    link:'/add-shots'

  }



]