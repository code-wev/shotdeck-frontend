'use client'

import { useGetTrendingShotQuery } from '@/redux/api/shot';
import Image from 'next/image';
import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import { useSession } from 'next-auth/react';
import { FaEdit, FaTrash } from 'react-icons/fa';
import Link from 'next/link';

export default function TrendingShots() {
  const { data, isFetching, isError } = useGetTrendingShotQuery();
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const user = useSession();
  const userRole= user?.data?.user?.role;

  // Helper functions for video thumbnails
  function getYouTubeThumbnail(url) {
    try {
      const yt = new URL(url);
      let videoId;

      if (yt.hostname.includes('youtu.be')) {
        videoId = yt.pathname.split('/')[1];
      } else if (yt.hostname.includes('youtube.com')) {
        videoId = yt.searchParams.get('v');
      }

      if (videoId) {
        return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      }
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
    }
    return null;
  }

  function getCloudinaryThumbnail(url) {
    try {
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex(part => part === 'upload');

        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, 'c_thumb,w_400,h_400,g_auto');
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
      }
    } catch (err) {
      console.error('Error parsing Cloudinary URL:', err);
    }
    return null;
  }
 function getVimeoEmbedUrl(url) {
  try {
    const vimeo = new URL(url);
    if (vimeo.hostname.includes('vimeo.com')) {
      const videoId = vimeo.pathname.split('/')[1];
      if (videoId) {
        return `https://player.vimeo.com/video/${videoId}?autoplay=1&title=0&byline=0&portrait=0`;
      }
    }
  } catch (err) {
    console.error('Error parsing Vimeo URL:', err);
  }
  return null;
}


  function handleTimecodeClick(timeString, videoUrl, time) {
  const timeParts = timeString.split(':');
  const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
  
  if (videoUrl.includes('youtu')) {
    // YouTube video
    const videoPlayer = document.getElementById('video-player');
    if (videoPlayer) {
      const embedUrl = getYouTubeEmbedUrl(videoUrl);
      videoPlayer.src = `${embedUrl}?start=${seconds}&autoplay=1`;
    }
  } else if (videoUrl.includes('vimeo.com')) {
    // Vimeo video
      const videoPlayer = document.getElementById('video-player');
    if (videoPlayer && videoPlayer.contentWindow) {
      videoPlayer.contentWindow.postMessage({
        method: 'setCurrentTime',
        value: seconds
      }, 'https://player.vimeo.com');
    }
  } else {
    // Cloudinary or direct video
    const timePartsForCLoudinary = time.split(':');
    const secondsForCloudinary = (+timePartsForCLoudinary[0]) * 60 + (+timePartsForCLoudinary[1]);
    const videoPlayer = document.getElementById('cloudinary-video');
    if (videoPlayer) {
      videoPlayer.currentTime = secondsForCloudinary;
      videoPlayer.play();
    }
  }
}

  const handleClick = async (id) => {
    try {
      await axios.patch(`${base_url}/shot/click/${id}`);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  function getYouTubeEmbedUrl(url) {
    try {
      const yt = new URL(url);
      if (yt.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${yt.pathname.split('/')[1]}`;
      }
      if (yt.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (isError) {
    return <h4>Something went wrong!</h4>;
  }

  return (
    <div className='px-4 md:px-8'>
      <h1 className='text-xl font-semibold mt-8'>Trending Shot</h1>

      <div className='grid w-full grid-cols-3 gap-2 md:grid-cols-4 lg:grid-cols-[repeat(auto-fit,minmax(200px,1fr))]'>
        {data?.data?.map((data, idx) => {
          // Determine the image source
          let imageSrc = data?.imageUrl;

          if (!imageSrc && data?.youtubeLink) {
            if (data.youtubeLink.includes('youtu.be') || data.youtubeLink.includes('youtube.com')) {
              imageSrc = getYouTubeThumbnail(data.youtubeLink);
            } else if (data.youtubeLink.includes('cloudinary.com')) {
              imageSrc = getCloudinaryThumbnail(data.youtubeLink);
            }
          }

          return (
            <div
              key={idx}
              className='mt-8 cursor-pointer'
              onClick={() => {
                setSelectedShot(data);
                setModalIsOpen(true);
                handleClick(data._id);
              }}
            >
              {imageSrc ? (
                <Image
                  alt={'img'}
                  src={imageSrc}
                  height={300}
                  width={300}
                  className='object-cover h-40 w-50'
                />
              ) : (
                <div className="bg-gray-800 h-40 w-full flex items-center justify-center">
                  <span className="text-gray-500">No thumbnail available</span>
                </div>
              )}
            </div>
          );
        })}
      </div>


      

      {/* Modal for showing shot details */}
      <AnimatePresence>
  {modalIsOpen && selectedShot && (
    <motion.div
      className={"fixed  inset-0   bg-black bg-opacity-80 z-[998]  mx-auto no-scrollbar flex justify-center items-center "}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setModalIsOpen(false)}
    >
      <motion.div
        className={`not-only:bg-[#1a1a1a] relative text-white rounded-2xl ${selectedShot.timecodes && selectedShot.timecodes.length > 0 ? 'xl:flex max-w-[1800px]' : 'max-w-[1600px]'} justify-between
         shadow-2xl w-[90%] 2xl:w-[60%]  scrollbar-thin-gray lg:ml-20 mt-16 overflow-y-scroll no-scrollbar max-h-[90vh] p-8 relative`}
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >



        <section className={` ${selectedShot.timecodes && selectedShot.timecodes.length > 0 ? 'xl:w-[70%]' : ''} `}>

  <button
          className="absolute top-2 bg-black px-2 rounded-full opacity-75 cursor-pointer right-2 text-white text-xl font-bold hover:text-[#526DA4]"
          onClick={() => setModalIsOpen(false)}
        >
          ×
        </button>
{selectedShot.youtubeLink ? (
  <div>


    <div className='py-2'>


{
  userRole === "admin" && <section className='flex items-center '>
  
 <FaTrash onClick={()=> handleDelete(selectedShot?._id, selectedShot?.title)} className='text-red-500 absolute top-12 cursor-pointer left-2'/>

<Link href={`/admin/edit/${selectedShot?._id}`}>
 <FaEdit  className='text-blue-500 absolute top-20 cursor-pointer left-2'/>
 
 </Link>
             <h2 className="lg:text-2xl mb-1  font-semibold">{selectedShot.title || 'Shot Title'}</h2>
</section>
}

<div className='flex items-center  flex-wrap mb-2'>

  <h4 className='font-semibold text-xs flex-wrap  whitespace-nowrap lg:text-base M'>Simulation Category:</h4>
     {  selectedShot?.simulatorTypes?.particles &&  selectedShot?.simulatorTypes?.particles?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4  ">
                      {g}
                    </span>
                  ))}


                  
                  {   selectedShot?.simulatorTypes?.rigidbodies &&  selectedShot?.simulatorTypes?.rigidbodies?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {  selectedShot?.simulatorTypes?.softBodies &&  selectedShot?.simulatorTypes?.softBodies?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.clothgroom &&  selectedShot?.simulatorTypes?.clothgroom?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {selectedShot?.simulatorTypes?.magicAbstract &&  selectedShot?.simulatorTypes?.magicAbstract?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                     {  selectedShot?.simulatorTypes?.crowd &&   selectedShot?.simulatorTypes?.crowd?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.mechanicsTech &&  selectedShot?.simulatorTypes?.mechanicsTech?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.ompositing &&  selectedShot?.simulatorTypes?.compositing?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}

</div>

             {/* tag */}

             <div className=' flex flex-wrap gap-4'>

              {
                selectedShot?.tags?.map((item, idx)=> (
                  <div className='bg-gray-800 py-2 px-4 rounded'>
                    <h1>{item}</h1>
                  </div>
                ))
              }
             </div>
    </div>
    {/* Video Player */}
    {selectedShot.youtubeLink.includes('youtu') ? (
      <iframe
        id="video-player"
        width="100%"
        height="460"
        src={getYouTubeEmbedUrl(selectedShot.youtubeLink)}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
      ></iframe>
    ) : selectedShot.youtubeLink.includes('vimeo.com') ? (
      <div className="relative pb-[56.25%] h-0 overflow-hidden">
        <iframe
          id="video-player"
          src={getVimeoEmbedUrl(selectedShot.youtubeLink)}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    ) : (
      <video id="cloudinary-video" width="100%" height="460" controls>
        <source src={selectedShot.youtubeLink} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )}

 
  </div>
) : (
  <p>No valid video link found.</p>
)}
    {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (

      
      <div className="mt-4  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {selectedShot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === selectedShot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, selectedShot.youtubeLink , tc.time)}



            >
               <img  src={tc.image} className='w-32 h-20'/>


            <div className=''>
                <p className=" font-semibold font-mono mr-3">{tc.time}</p>
              <p className="text-gray-300">{tc.label}</p>
            </div>
            </div>
          ))}
        </div>
      </div>
    )}
        {/* Rest of your existing modal content */}
        <div className="text-left   pace-y-2">
   
          {/* <p className="text-sm text-gray-300">{selectedShot.description || 'No description available.'}</p> */}

          <div className="border-t max-w-full overflow-x-scroll scrollbar-hide border-gray-400">
            <section className="lg:flex space-y-1 justify-between gap-8">
              {/* Left Side */}
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-white text-xs">
                  Focal Length:
                  {selectedShot?.focalLength?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
               <span className='whitespace-nowrap'>Lighting Conditons:</span>
                  {selectedShot?.lightingConditions?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
                 Video Type:
                  {selectedShot?.videoType?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
                 Reference Type:
                  {selectedShot?.referenceType?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
     
                      {/* <h4 className="font-semibold text-white text-xs">
                        Cinematographer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.cinematographer}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Production Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.productionDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Costume Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.costumeDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Editor:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.editor}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Colorist:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.colorist}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Actors:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.actors}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Time:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.shotTime}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Time Period:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.timePeriod}</span>
                      </h4> */}
                    </div>

                    {/* Middle */}


                    
                    <div className="space-y-2 mt-4">
                               <h4 className="font-semibold text-white text-xs">
                 Video Quality:
                  {selectedShot?.videoQuality?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                               <h4 className="font-semibold text-white text-xs">
                 Video Speed:
                  {selectedShot?.videoSpeed?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                               <h4 className="font-semibold text-nowrap  text-white text-xs">
                 Simulation Type:
                  {  selectedShot?.simulatorTypes?.particles &&  selectedShot?.simulatorTypes?.particles?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.rigidbodies &&  selectedShot?.simulatorTypes?.rigidbodies?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {  selectedShot?.simulatorTypes?.softBodies &&  selectedShot?.simulatorTypes?.softBodies?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.clothgroom &&  selectedShot?.simulatorTypes?.clothgroom?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {selectedShot?.simulatorTypes?.magicAbstract &&  selectedShot?.simulatorTypes?.magicAbstract?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                     {  selectedShot?.simulatorTypes?.crowd &&   selectedShot?.simulatorTypes?.crowd?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.mechanicsTech &&  selectedShot?.simulatorTypes?.mechanicsTech?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   selectedShot?.simulatorTypes?.ompositing &&  selectedShot?.simulatorTypes?.compositing?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>



                  <h4 className="font-semibold text-white text-xs">
                 Simulation Scale:
                  {selectedShot?.simulationSize?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                      {/* <h4 className="font-semibold text-white text-xs"> */}
                        {/* Aspect Ratio:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.aspectRatio}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Format:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.format}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Frame Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.frameSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.shotType}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.lensSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Composition:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.composition}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting:
                        {selectedShot?.lightingStyle?.map((l, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {l}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting Type:
                        {selectedShot?.lightingType?.map((l, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {l}
                          </span>
                        ))}
                      </h4> */}
                    </div>

                    {/* Right Side */}
                    <div className="space-y-2 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Style:
                        {selectedShot?.simulationStyle?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Motion Style:
                        {selectedShot?.motionStyle?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Emitter Speed:
                        {selectedShot?.emitterSpeed?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Software:
                        {selectedShot?.simulationSoftware?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      {/* <h4 className="font-semibold text-white text-xs">
                        Interior/Exterior:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.interiorExterior}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Location Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.filmingLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Set:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.set}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Story Location:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.storyLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Camera:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.camera}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.lens}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Film Stock / Resolution:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.filmStockResolution}</span>
                      </h4> */}
              </div>
            </section>
          </div>
        </div>

        </section>


{/* devider */}

<section>
  <h4 className='border-r h-full w-2 ml-2 border-gray-400'></h4>
</section>

        <section className='h-svh hidden flex-1 lg:blcok border-gray-400 w-2 px-4 border-r'>


</section>
        <section className='xl:w-[26%]'>


          
   {/* Timecodes section */}
     {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (

      
      <div className="mt-4 hidden lg:block max-h-full overflow-y-scroll scrollbar-thin-gray  lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {selectedShot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === selectedShot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, selectedShot.youtubeLink , tc.time)}



            >
              <img  src={tc.image} className='w-32 h-20'/>


            <div className=''>
                <p className=" font-semibold font-mono mr-3">{tc.time}</p>
              <p className="text-gray-300">{tc.label}</p>
            </div>
            </div>
          ))}
        </div>
      </div>
    )} 
        </section>
      
      </motion.div>


<motion.div>


     {/* Timecodes section */}
    {/* {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (
      <div className="mt-4 bg-[#2a2a2a] p-3 rounded-lg">
        <h3 className="font-semibold mb-2">Timecodes</h3>
        <div className="space-y-2">
          {selectedShot.timecodes.map((tc, idx) => (
            <div 
              key={idx} 
              className="flex items-center hover:bg-[#3a3a3a] p-2 rounded cursor-pointer transition-colors"
              onClick={() => handleTimecodeClick(tc.time, selectedShot.youtubeLink)}
            >
              <span className="text-blue-400 font-mono mr-3">{tc.time}</span>
              <span className="text-gray-300">{tc.label}</span>
            </div>
          ))}
        </div>
      </div>
    )} */}
</motion.div>

    </motion.div>
  )}
</AnimatePresence>
      {/* Hide Scrollbar */}
      <style jsx>{`
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}