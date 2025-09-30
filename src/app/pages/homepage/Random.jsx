'use client';
import { useGetShotsQuery } from '@/redux/api/shot';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow, Keyboard } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/effect-coverflow';
import { base_url, filters } from '@/utils/utils';
import { MdKeyboardArrowUp } from 'react-icons/md';
import Hls from 'hls.js';

function Random() {
  const searchParams = useSearchParams();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [localSearch, setLocalSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('random');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [allShots, setAllShots] = useState([]);
  const [playingVideoId, setPlayingVideoId] = useState(null);
  const [availableShots, setAvailableShots] = useState([]);
  const [displayedShotIds, setDisplayedShotIds] = useState(new Set());
  const swiperRef = useRef(null);
  const videoRefs = useRef({});
  const [showSimulationType, setSimulationType] = useState(false);
  const  userRole = 'userRole'

  useEffect(() => {
    const handlePlay = (event) => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video.element && video.element !== event.target && !video.element.paused) {
          video.element.pause();
          video.isPlaying = false;
        }
      });

      console.log(shot?.simulatorTypes?.length , 'simulation type')
      
      const playingId = Object.keys(videoRefs.current).find(
        (id) => videoRefs.current[id].element === event.target
      );
      if (playingId) {
        setPlayingVideoId(playingId);
        videoRefs.current[playingId].isPlaying = true;
      }
    };

    Object.values(videoRefs.current).forEach((video) => {
      if (video.element) {
        video.element.addEventListener('play', handlePlay);
      }
    });

    return () => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video.element) {
          video.element.removeEventListener('play', handlePlay);
        }
      });
    };
  }, [allShots]);

  const { data, isLoading, error } = useGetShotsQuery({
    ...Object.fromEntries(
      Object.entries(selectedFilters).filter(([_, values]) => values.length > 0)
    ),
    ...(submittedSearch && submittedSearch.trim() !== '' && { search: submittedSearch }),
    ...(sortBy && { sortBy }),
    limit: 1000,
  });

  const VideoPlayer = ({ shot }) => {
    const videoRef = useRef(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [isHLS, setIsHLS] = useState(false);
    const hlsRef = useRef(null);
    const [isUserInteracting, setIsUserInteracting] = useState(false);

    useEffect(() => {
      videoRefs.current[shot._id] = {
        element: videoRef.current,
        isPlaying: false,
      };

      const url = getDirectVideoUrl(shot.youtubeLink);
      setIsHLS(url.includes('.m3u8'));

      const handlePlay = () => {
        setIsPlaying(true);
        setPlayingVideoId(shot._id);
      };

      const handlePause = () => {
        setIsPlaying(false);
        if (playingVideoId === shot._id) {
          setPlayingVideoId(null);
        }
      };

      const videoElement = videoRef.current;
      if (videoElement) {
        videoElement.addEventListener('play', handlePlay);
        videoElement.addEventListener('pause', handlePause);
      }

      return () => {
        if (videoElement) {
          videoElement.removeEventListener('play', handlePlay);
          videoElement.removeEventListener('pause', handlePause);
        }
        delete videoRefs.current[shot._id];
        
        if (hlsRef.current) {
          hlsRef.current.destroy();
        }
      };
    }, [shot._id, shot.youtubeLink]);

    const handlePlayClick = (e) => {
      e.stopPropagation();
      setIsUserInteracting(true);
      
      const videoElement = videoRef.current;
      if (!videoElement) return;

      if (videoElement.tagName === 'VIDEO') {
        if (videoElement.paused) {
          videoElement.play().catch(err => {
            console.log('Attempting muted playback');
            videoElement.muted = true;
            videoElement.play();
          });
        } else {
          videoElement.pause();
        }
      } else if (videoElement.tagName === 'IFRAME') {
        if (shot.youtubeLink.includes('youtu')) {
          const videoId = getYouTubeVideoId(shot.youtubeLink);
          if (videoId) {
            videoElement.src = `https://www.youtube.com/embed/${videoId}?autoplay=1`;
          }
        } else if (shot.youtubeLink.includes('vimeo.com')) {
          const videoId = shot.youtubeLink.split('vimeo.com/')[1].split('/')[0];
          videoElement.src = `https://player.vimeo.com/video/${videoId}?autoplay=1`;
        }
      }
    };

    const getVideoSource = () => {
      if (shot.youtubeLink.includes('youtu')) {
        return (
          <div className="video-container w-full h-full relative">
            <iframe
              ref={videoRef}
              width="100%"
              height="100%"
              src={getYouTubeEmbedUrl(shot.youtubeLink)}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            />
          </div>
        );
      } else if (shot.youtubeLink.includes('vimeo.com')) {
        return (
          <div className="relative pb-[56.25%] h-0 overflow-hidden video-container">
            <iframe
              ref={videoRef}
              src={`${getVimeoEmbedUrl(shot.youtubeLink)}`}
              className="absolute top-0 left-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
            />
          </div>
        );
      } else {
        const videoUrl = getDirectVideoUrl(shot.youtubeLink);
        return (
          <video
            ref={videoRef}
            width="100%"
            height="100%"
            controls
            playsInline
            preload="auto"
            className="w-full h-full object-contain bg-black"
            poster={shot.imageUrl || getVideoThumbnail(shot.youtubeLink, shot.thumbnailTimecode?.[0] || '0:00')}
          >
            {!isHLS && <source src={videoUrl || 'https://youtu.be/CfLzHC5cjF4?si=t4o2SNPG9pNlADnW'} type="video/mp4" />}
            Your browser does not support the video tag.
          </video>
        );
      }
    };

    return (
      <div className="relative w-full h-full">
        {getVideoSource()}
        {!isPlaying && (
          <div
            className="absolute right-4 bottom-4 flex items-center justify-center cursor-pointer z-10"
            onClick={handlePlayClick}
          >
            {/* <div className="w-12 h-12 bg-black bg-opacity-60 rounded-full flex items-center justify-center hover:bg-opacity-80 transition-all">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M6.3 2.841A1.5 1.5 0 004 4.11v11.78a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
              </svg>
            </div> */}
          </div>
        )}
      </div>
    );
  };

  const convertTimecodeToSeconds = (timecode) => {
    const parts = timecode.split(':').reverse();
    return parts.reduce((total, part, index) => {
      return total + (parseInt(part) || 0) * Math.pow(60, index);
    }, 0);
  };

function getVideoThumbnail(url, timecode = '0:00') {
  try {
    const seconds = convertTimecodeToSeconds(timecode);

    // fallback URL
    const fallbackUrl = 'https://youtu.be/CfLzHC5cjF4?si=t4o2SNPG9pNlADnW';

    let videoUrl;

    try {
      videoUrl = new URL(url || fallbackUrl);
    } catch {
      console.warn('Invalid URL provided, using fallback');
      videoUrl = new URL(fallbackUrl);
    }

    // if (isCloudinaryUrl(videoUrl)) {
    //   return getCloudinaryThumbnailWithTime(url, seconds);
    // }

    // if (isYouTubeUrl(videoUrl)) {
    //   return getYouTubeThumbnail(url);
    // }

    // if (isVimeoUrl(videoUrl)) {
    //   return getVimeoThumbnail(url);
    // }

    return null;
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    return null;
  }
}


  const getYouTubeThumbnail = (url) => {
    try {
      const yt = new URL(url);
      let videoId;
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        videoId = yt.pathname.split('/')[2];
      } else if (yt.hostname.includes('youtu.be')) {
        videoId = yt.pathname.split('/')[1];
      } else if (yt.hostname.includes('youtube.com')) {
        videoId = yt.searchParams.get('v');
      }
      return videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : null;
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
      return null;
    }
  };

  const getVimeoThumbnail = (url) => {
    try {
      const vimeoUrl = new URL(url);
      const videoId = vimeoUrl.pathname.split('/').pop();
      return videoId ? `https://vumbnail.com/${videoId}.jpg` : null;
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
      return null;
    }
  };

  const getCloudinaryThumbnail = (url, timecode = '0:00') => {
    try {
      const seconds = convertTimecodeToSeconds(timecode);
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');
        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, `c_thumb,w_400,h_400,g_auto,so_${seconds}`);
          const fileNameParts = pathParts[pathParts.length - 1].split('.');
          if (fileNameParts.length > 1) {
            fileNameParts[fileNameParts.length - 1] = 'jpg';
            pathParts[pathParts.length - 1] = fileNameParts.join('.');
          }
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
      }
    } catch (err) {
      console.error('Error parsing Cloudinary URL:', err);
    }
    return null;
  };

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

  const getYouTubeVideoId = (url) => {
    try {
      const yt = new URL(url);
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        return yt.pathname.split('/')[2];
      } else if (yt.hostname.includes('youtu.be')) {
        return yt.pathname.split('/')[1];
      } else if (yt.hostname.includes('youtube.com')) {
        return yt.searchParams.get('v');
      }
    } catch (err) {
      console.error('Error parsing YouTube URL:', err);
    }
    return null;
  };

  const handleDropdownClick = (idOrIds) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    ids.forEach((id) => {
      dropDownHandler(id);
    });
    setSimulationType(!showSimulationType);
  };

  const getRandomShots = () => {
    if (!availableShots || availableShots.length === 0) return [];
    
    let available = availableShots.filter(shot => !displayedShotIds.has(shot._id));
    
    if (available.length < 3) {
      available = availableShots;
      setDisplayedShotIds(new Set());
    }
    
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  useEffect(() => {
    if (data?.data) {
      setAvailableShots(data.data);
    }
  }, [data]);

  useEffect(() => {
    if (availableShots.length > 0) {
      const newShots = getRandomShots();
      setAllShots(newShots);
      
      const newDisplayedIds = new Set(displayedShotIds);
      newShots.forEach(shot => newDisplayedIds.add(shot._id));
      setDisplayedShotIds(newDisplayedIds);
    }
  }, [availableShots, selectedFilters, submittedSearch, sortBy]);

  const handleReachEnd = () => {
    const newShots = getRandomShots();
    if (newShots.length > 0) {
      setAllShots(prev => [...prev, ...newShots]);
      
      const newDisplayedIds = new Set(displayedShotIds);
      newShots.forEach(shot => newDisplayedIds.add(shot._id));
      setDisplayedShotIds(newDisplayedIds);
    }
  };

  useEffect(() => {
    if (!searchParams) return;
    const params = new URLSearchParams(searchParams);
    const initialFilters = {};
    const filterKeys = new Set(filters.map((f) => f.name));

    params.forEach((value, key) => {
      if (key === 'search') {
        setLocalSearch(value);
        setSubmittedSearch(value);
      } else if (key === 'sortBy') {
        setSortBy(value);
      } else if (filterKeys.has(key)) {
        if (!initialFilters[key]) {
          initialFilters[key] = [];
        }
        initialFilters[key].push(value);
      }
    });

    setSelectedFilters(initialFilters);
    setDisplayedShotIds(new Set());
  }, [searchParams]);

  const filterHandler = (e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      return {
        ...prev,
        [groupName]: isChecked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value),
      };
    });
    setDisplayedShotIds(new Set());
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
    setLocalSearch('');
    setSubmittedSearch('');
    setSortBy('random');
    setDisplayedShotIds(new Set());
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      setSubmittedSearch(localSearch);
      setDisplayedShotIds(new Set());
    }
  };

  const dropDownHandler = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
    setDisplayedShotIds(new Set());
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleClick = async (id) => {
    try {
      await axios.patch(`${base_url}/shot/click/${id}`);
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  const getDirectVideoUrl = (url) => {
    try {
      if (url.includes('bunny.net') || url.includes('b-cdn.net')) {
        if (url.includes('/stream/')) {
          return `${url}/playlist.m3u8`;
        }
        return `${url}.mp4`;
      }
      
      if (url.includes('cloudinary.com') && url.includes('/video/')) {
        const cloudinaryUrl = new URL(url);
        const pathParts = cloudinaryUrl.pathname.split('/');
        const fileName = pathParts[pathParts.length - 1];
        
        if (!fileName.match(/\.(mp4|webm|mov)$/i)) {
          pathParts[pathParts.length - 1] = fileName.split('.')[0] + '.mp4';
          return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
        }
        return url;
      }
      
      return url;
    } catch (err) {
      console.error('Error parsing direct video URL:', err);
      return url;
    }
  };

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  const getVimeoEmbedUrl = (url) => {
    try {
      const vimeo = new URL(url);
      if (vimeo.hostname.includes('vimeo.com')) {
        const videoId = vimeo.pathname.split('/').filter(segment => segment)[0];
        if (videoId) {
          return `https://player.vimeo.com/video/${videoId}`;
        }
      }
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
    }
    return null;
  };

   function getYouTubeEmbedUrl(url) {
    try {
      const yt = new URL(url);
      if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
        const videoId = yt.pathname.split('/')[2];
        return `https://www.youtube.com/embed/${videoId}`;
      } else if (yt.hostname.includes('youtu.be')) {
        return `https://www.youtube.com/embed/${yt.pathname.split('/')[1]}`;
      } else if (yt.hostname.includes('youtube.com')) {
        return `https://www.youtube.com/embed/${yt.searchParams.get('v')}`;
      }
    } catch (err) {
      return null;
    }
    return null;
  }

  if (isLoading && allShots.length === 0) {
    return (
      <div className="flex justify-center items-center h-screen bg-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-black text-white">
        Error loading shots. Please try again later.
      </div>
    );
  }

  return (
    <div className="pt-8 max-h-screen overfh min-h-screen ">
      <div className="flex">
        <div className="absolute top-[90.5px] md:top-24 z-30 right-12 md:right-12">
          <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="text-white bg-[#333333] px-4 py-2 rounded-md text-sm focus:outline-none hover:bg-[#444444]"
          >
            Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </button>
          <div
            className={`absolute right-0 mt-2 w-64 bg-[#171717] border border-gray-600 rounded-md shadow-lg transform transition-all duration-200 ease-in-out ${
              showSortDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            } origin-top z-30`}
          >
            {sortOptions.map((option) => (
              <button
                key={option.value}
                onClick={() => handleSortSelect(option.value)}
                className="block w-full text-left px-4 py-2 text-sm text-white hover:bg-[#333333] capitalize"
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <section
          className={`fixed top-[73px] min-h-screen mt-2 w-64 transform transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? 'translate-x-0 ' : '-translate-x-full md:-ml-28 lg:ml-auto'
          } lg:translate-x-0 lg:w-64`}
        >
          <div className="flex flex-col ml-4 gap-4">
            <div className="flex">
              <input
                type="text"
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Search shots..."
                className="w-full px-3 py-2 text-sm text-white bg-[#333333] border border-none rounded focus:outline-none"
              />
            </div>
          </div>

          <section className='bg-[#1A1A1A]   mr-4 border border-gray-700 rounded-xl w-64 md:w-70 mt-4 px-4'>
            <div className="mt-8 max-h-[calc(100vh-150px)] overflow-y-auto no-scrollbar">
              <h1 className='text-center text-xs'>Simulation Specification</h1>
              <p className="px-1 capitalize p-1 text-white font-semibold">Simulation Type</p>

              <div className='bg-[#364153] relative p-2 border border-gray-500 rounded'>
                {filters.filter(item => item.id === 21).map((filterGroup, idx) => (
                  !filterGroup?.item ? (
                    <div key={idx} className="mb-2 flex items-center justify-center gap-2 shadow-sm">
                      <p className="text-gray-300 text-xs text-center">{filterGroup?.title}</p>
                    </div>
                  ) : (
                    <div key={idx} className="text-sm py-1 cursor-pointer">
                      <div
                        className={`overflow-hidden transition-all border border-gray-600 duration-500 ease-in-out mt-2 rounded ${
                          openDropdowns[filterGroup.id] 
                            ? 'overflow-y-scroll scrollbar-hide mt-6 p-2 rounded' 
                            : 'overflow-y-scroll scrollbar-hide mt-6 p-4 rounded'
                        } ${
                          selectedFilters && Object.entries(selectedFilters)
                            .filter(([key]) => [
                              "rigidbodies",
                              "softBodies",
                              "clothgroom", 
                              "magicAbstract",
                              "particles",
                              "LiquidsFluids",
                              "crowd",
                              "mechanicsTech",
                              "compositing"
                            ].includes(key))
                            ? 'bg-[#526DA4] border-6 border-white rounded-xl'
                            : 'bg-[#1A2A3A] border border-[#2D3C4A]'
                        }`}
                      >
                        {!showSimulationType && (
                          <p className='font-semibold'>
                            {(!selectedFilters?.rigidbodies && 'Rigid Bodies')}
                          </p>
                        )}

                        {selectedFilters && Object.entries(selectedFilters)
                          .filter(([key]) => [
                            "rigidbodies",
                            "softBodies",
                            "clothgroom", 
                            "magicAbstract",
                            "particles",
                            "LiquidsFluids",
                            "crowd",
                            "mechanicsTech",
                            "compositing"
                          ].includes(key))
                          .map(([key, values]) => (
                            values && values.length > 0 && (
                              <div key={key} className="p-2">
                                <div className="font-semibold mb-1 border-b pb-2 border-b-[1px] border-gray-700 capitalize">{key}</div>
                                <div className="flex flex-wrap gap-2">
                                  {[...new Set(values)].map((value, valueIdx) => (
                                    <label 
                                      key={`${key}-${value}`} 
                                      className="flex items-center gap-1 px-2 py-1 rounded cursor-pointer"
                                    >
                                      {[
                                        'rigidbodies',
                                        'softBodies',
                                        'clothgroom',
                                        'magicAbstract',
                                        'particles',
                                        'LiquidsFluids',
                                        'crowd',
                                        'mechanicsTech',
                                        'compositing'
                                      ].includes(value) ? ' ' :  
                                        <input
                                          type="checkbox"
                                          checked={true}
                                          onChange={(e) => {
                                            const fakeEvent = {
                                              target: {
                                                checked: false
                                              }
                                            };
                                            filterHandler(fakeEvent, key, value);
                                          }}
                                          className="accent-blue-500 cursor-pointer"
                                        />
                                      }
                                      {[
                                        'rigidbodies',
                                        'softBodies',
                                        'clothgroom',
                                        'magicAbstract',
                                        'particles',
                                        'LiquidsFluids',
                                        'crowd',
                                        'mechanicsTech',
                                        'compositing'
                                      ].includes(value) ? '' : value}
                                    </label>
                                  ))}
                                </div>
                              </div>
                            )
                          ))
                        }

                        <div className='flex absolute left-[72px] bottom-0 z-50 justify-center'>
                          <span 
                            onClick={() => handleDropdownClick([22, 23, 24, 25, 255, 256, 26, 27, 28])}
                            className={`px-8 mt-2 rounded-full border transition-all duration-300 transform ${
                              showSimulationType ? 'bg-gray-800' : 'bg-gray-700'
                            } border-gray-600 text-white flex items-center justify-center`}
                          >
                            {!showSimulationType ? "..." : ''}
                          </span>
                        </div>
                      </div>

                      {showSimulationType && <span 
                        onClick={() => handleDropdownClick([22, 23, 24, 25, 255, 256, 26, 27, 28])}
                        className={`px-8 z-50 absolute bottom-0 right-20 mt-2 rounded-full border transition-all duration-300 transform ${
                          showSimulationType ? 'bg-gray-800' : 'bg-gray-700'
                        } border-gray-600 text-white flex items-center justify-center`}
                      >
                        {showSimulationType && <MdKeyboardArrowUp className="text-2xl" /> }
                      </span>}
                    </div>
                  )
                ))}
                
                <div className={`transition-all duration-500 ease-in-out  ${
                  !showSimulationType 
                    ? 'max-h-0 opacity-0' 
                    : ' opacity-100'
                }`}>
                  {filters.filter(item => item.id !== 21).slice(0, 9).map((filterGroup, idx) => (
                    !filterGroup?.item ? (
                      <div key={idx} className="mb-2 mt-3 flex items-center justify-center gap-2 shadow-sm">
                        <p className="text-gray-300 text-xs text-center">{filterGroup?.title}</p>
                      </div>
                    ) : (
                      <div key={idx} className="text-sm py-1 cursor-pointer">
                        {![22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                          <div 
                            className={`px-1 p-1 cursor-pointer rounded ${
                              selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                                ? 'bg-red-5 text-white'
                                : 'text-white'
                            }`}
                            onClick={(e) => {
                              const fakeEvent = {
                                target: {
                                  checked: !selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                                }
                              };
                              filterHandler(fakeEvent, filterGroup.name, filterGroup.name);
                            }}
                          >
                            <p className="capitalize font-semibold">{filterGroup?.title}</p>
                          </div>
                        )}

                        {![22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                          <div className={`rounded-full w-full h-4 ${
                            filterGroup.item.some(item => 
                              selectedFilters[filterGroup.name]?.includes(item)
                            ) || selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                              ? 'bg-gray-200'
                              : 'bg-gray-800'
                          }`}>
                            <div className='flex items-center justify-center'>
                              <span
                                onClick={() => dropDownHandler(filterGroup?.id)}
                                className={`px-8 mt-2 rounded-full border transition-all duration-300 ${
                                  filterGroup.item.some(item => 
                                    selectedFilters[filterGroup.name]?.includes(item)
                                  ) || selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                                    ? 'bg-gray-300 border-gray-400'
                                    : 'bg-gray-700 border-gray-600 text-white'
                                }`}
                              >
                                ...
                              </span>
                            </div>
                          </div>
                        )}

                        <div
                          className={`overflow-hidden transition-all duration-500 ease-in-out ${
                            openDropdowns[filterGroup.id] 
                              ? 'max-h-[500px] p-2' 
                              : 'max-h-0'
                          } ${
                            filterGroup.item.some(item => 
                              selectedFilters[filterGroup.name]?.includes(item)
                            ) || selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                              ? `${!showSimulationType ? 'hidden' : 'bg-[#526DA4] border-6 rounded-xl border-white'}` 
                              : [22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) 
                                ? 'bg-[#1A2A3A]' 
                                : 'bg-gray-700'
                          } ${
                            openDropdowns[filterGroup.id] ? 'border border-gray-700' : ''
                          }`}
                        >
                          {[22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                            <div 
                              className={`px-1 p-1 border-b border-gray-500 cursor-pointer ${
                                selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                                  ? 'text-white'
                                  : 'text-white'
                              }`}
                              onClick={(e) => {
                                const fakeEvent = {
                                  target: {
                                    checked: !selectedFilters[filterGroup.name]?.includes(filterGroup.name)
                                  }
                                };
                                filterHandler(fakeEvent, filterGroup.name, filterGroup.name);
                              }}
                            >
                              <p className="capitalize font-semibold">{filterGroup?.title}s</p>
                            </div>
                          )}
                          
                          <div className='mt-4'>
                            {filterGroup?.item?.map((item, index) => {
                              const checked = selectedFilters[filterGroup.name]?.includes(item) ?? false;
                              return (
                                <div 
                                  key={index}
                                  className={`flex gap-2 px-2 cursor-pointer space-y-3 p-1 rounded ${
                                    checked ? 'text-white' : 'text-white'
                                  }`}
                                  onClick={(e) => {
                                    const fakeEvent = {
                                      target: {
                                        checked: !checked
                                      }
                                    };
                                    filterHandler(fakeEvent, filterGroup.name, item);
                                  }}
                                >
                                  <input
                                    type="checkbox"
                                    checked={checked}
                                    onChange={(e) => filterHandler(e, filterGroup.name, item)}
                                    className="mt-1"
                                  />
                                  <p className="capitalize">
                                    {item === 'extra-small' ? 'Extra Small ....... (<10cm)' : 
                                     item === 'small' ? 'Small ...... (10 cm - 1m )' : 
                                     item === 'structural' ? 'Structural ...(10m - 1km' : 
                                     item === 'massive' ? 'Massive.......(>1km)' : 
                                     item === 'human' ? 'Human .......(1m - 10m)' : item}
                                  </p>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )
                  ))}
                </div>
              </div>

              <div className='mb-[10px]'>
                {filters.filter(item => item.id !== 21).slice(9, filters.length).map((filterGroup, idx) => (
                  !filterGroup?.item ? (
                    <div key={idx} className="mb-2 mt-3 flex items-center justify-center gap-2 shadow-sm">
                      <p className="text-gray-300 text-xs text-center">{filterGroup?.title}</p>
                    </div>
                  ) : (
                    <section key={idx}>
                      <div className="pb-2 text-sm py-1 relative cursor-pointer">
                        {![22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                          <p onClick={() => dropDownHandler(filterGroup?.id)} className="px-1 capitalize p-1 text-white font-semibold">{filterGroup?.title}</p>
                        )}

                        {![22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                          <div className="flex items-center justify-center">
                            <motion.span
                              onClick={() => dropDownHandler(filterGroup?.id)}
                              className="px-8 mt-2 absolute -bottom-2 rounded-full bg-gray-700 border border-gray-600 flex items-center justify-center"
                            >
                              <motion.span
                                animate={{ opacity: openDropdowns[filterGroup.id] ? 0 : 1 }}
                                transition={{ duration: 0.1 }}
                              >
                                ...
                              </motion.span>
                              <motion.span
                                className="absolute"
                                animate={{ opacity: openDropdowns[filterGroup.id] ? 1 : 0 }}
                                transition={{ duration: 0.1 }}
                              >
                                <MdKeyboardArrowUp className="text-xl" />
                              </motion.span>
                            </motion.span>
                          </div>
                        )}

                        <motion.div
                          className={`bg-[#1A2A3A] border border-[#2D3C4A] rounded-lg overflow-hidden ${
                            selectedFilters[filterGroup.name]?.length > 0 ? 'mt-6' : 'mt-2'
                          }`}
                          initial={false}
                          animate={{
                            height: openDropdowns[filterGroup.id] 
                              ? 'auto' 
                              : selectedFilters[filterGroup.name]?.length > 0 
                                ? 'auto' 
                                : '1rem'
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                        >
                          <motion.div
                            className="p-2"
                            initial={false}
                            animate={{
                              opacity: selectedFilters[filterGroup.name]?.length > 0 ? 1 : 0,
                              height: selectedFilters[filterGroup.name]?.length > 0 ? 'auto' : 0,
                              y: selectedFilters[filterGroup.name]?.length > 0 ? 0 : -10
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {selectedFilters[filterGroup.name]?.length > 0 && (
                              <div className="gap-1 mt-1">
                                {selectedFilters[filterGroup.name].map((selectedItem, idx) => (
                                  <motion.div
                                    key={idx}
                                    className="flex gap-2 cursor-pointer"
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const fakeEvent = {
                                        target: { checked: false }
                                      };
                                      filterHandler(fakeEvent, filterGroup.name, selectedItem);
                                    }}
                                  >
                                    <input
                                      type="checkbox"
                                      checked
                                      readOnly
                                      className="mt-1"
                                    />
                                    <p className="capitalize text-[14px] mt-1 text-white">
                                      {selectedItem === 'extra-small' ? 'Extra Small (<10cm)' :
                                       selectedItem === 'small' ? 'Small (10cm-1m)' :
                                       selectedItem === 'structural' ? 'Structural (10m-1km)' :
                                       selectedItem === 'massive' ? 'Massive (>1km)' :
                                       selectedItem === 'human' ? 'Human (1m-10m)' : selectedItem}
                                    </p>
                                  </motion.div>
                                ))}
                              </div>
                            )}
                          </motion.div>

                          <motion.div
                            className="p-2 pt-0"
                            initial={false}
                            animate={{
                              height: openDropdowns[filterGroup.id] ? 'auto' : 0,
                              opacity: openDropdowns[filterGroup.id] ? 1 : 0
                            }}
                            transition={{ duration: 0.2 }}
                          >
                            {[22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
                              <p className="px-1 capitalize p-1 text-white font-semibold border-b border-gray-500">
                                {filterGroup?.title}
                              </p>
                            )}
                            
                            <div className="mt-4">
                              {filterGroup?.item?.map((item, index) => {
                                const key = filterGroup.name;
                                const checked = selectedFilters[key]?.includes(item) ?? false;
                                const inputId = `${filterGroup.name}-${index}`;
                                
                                return (
                                  <div
                                    key={index}
                                    className={`${selectedFilters[filterGroup.name]?.includes(item) ? 'hidden' : ''} flex gap-2 space-y-4 px-2 items-start`}
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <input
                                      id={inputId}
                                      type="checkbox"
                                      checked={checked}
                                      onChange={(e) => filterHandler(e, key, item)}
                                      className="mt-1 accent-[#526DA4]"
                                    />
                                    <label
                                      htmlFor={inputId}
                                      className={`capitalize text-white text-sm select-none cursor-pointer`}
                                    >
                                      {item === 'extra-small' ? 'Extra Small (<10cm)' :
                                       item === 'small' ? 'Small (10cm-1m)' :
                                       item === 'structural' ? 'Structural (10m-1km)' :
                                       item === 'massive' ? 'Massive (>1km)' :
                                       item === 'human' ? 'Human (1m-10m)' : item }
                                    </label>
                                  </div>
                                );
                              })}
                            </div>
                          </motion.div>
                        </motion.div>
                      </div>

                      <div className='border-b mt-4 border-white'></div>
                    </section>
                  )
                ))}
              </div>
            </div>
          </section>
        </section>

        <section className="lg:hidden border overflow-hidden 2xl:min-w-[250px]"></section>

        <div className="max-w-[90%] mx-auto px-4 py-8">
          <h1 className="text-3xl md:text-4xl font-bold text-white mb-6 text-center drop-shadow-md">
            Random Shots
          </h1>

          <div className="flex justify-end absolute top-20 md:top-22 md:-right-2 right-0 p-4 space-x-4 lg:hidden">
            <button onClick={toggleSidebar} className="text-white focus:outline-none">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>

          <div className="mb-6 -md mx-auto"></div>

          <div className="relative max-w-full overflow-hidden lg:ml-44 mx-auto flex justify-center mb-8 h-[80vh]">
            <Swiper
               modules={[Navigation, EffectCoverflow, Keyboard]}
    effect="coverflow"
    coverflowEffect={{
      rotate: 30,
      stretch: 0,
      depth: 100,
      modifier: 1,
      slideShadows: true,
    }}
    spaceBetween={30}
    slidesPerView={1}
    centeredSlides={true}
    navigation
    keyboard={{
      enabled: true,
      onlyInViewport: true,
    }}
    className="h-full w-full"
    breakpoints={{
      640: { 
        slidesPerView: 1,
        keyboard: {
          enabled: true
        }
      },
      768: { 
        slidesPerView: 1,
        keyboard: {
          enabled: true
        }
      },
      1024: { 
        slidesPerView: 1.1,
        keyboard: {
          enabled: true
        }
      },
      1800: { 
        slidesPerView: 1.1,
        keyboard: {
          enabled: true
        }
      }
    }}
    onSwiper={(swiper) => (swiperRef.current = swiper)}
    onReachEnd={handleReachEnd}
            >
              <AnimatePresence>
                {allShots.map((shot) => {
                  let imageSrc = shot?.imageUrl;
                  if (!imageSrc && shot?.youtubeLink) {
                    if (shot.youtubeLink.includes('cloudinary.com')) {
                      imageSrc = getCloudinaryThumbnail(shot.youtubeLink, shot.thumbnailTimecode?.[0] || '0:00');
                    } else if (shot.youtubeLink.includes('youtu')) {
                      imageSrc = getYouTubeThumbnail(shot.youtubeLink);
                    } else if (shot.youtubeLink.includes('vimeo.com')) {
                      imageSrc = getVimeoThumbnail(shot.youtubeLink);
                    }
                  }

                  return (


      <SwiperSlide key={shot._id}>
  <motion.div
    initial={{ opacity: 0, scale: 0.9 }}
    animate={{ opacity: 1, scale: 1 }}
    exit={{ opacity: 0, scale: 0.9 }}
    transition={{ duration: 0.3 }}
    className="relative h-full w-full overflow-y-scroll scrollbar-thin-gray  rounded-xl p-8  shadow-lg bg-[#1a1a1a] flex flex-col border border-gray-700"
  >
    {/* Video container */}

   <div className='flex'>
         <section className={` ${shot.timecodes && shot.timecodes.length > 0 ? 'xl:w-[70%]' : 'xl:w-[70%]'} `}>


{shot.youtubeLink ? (
  <div>


    <div className='py-2 '>




<div className='flex items-center  flex-wrap mb-2'>

  <h4 className='font-semibold text-xs flex-wrap  whitespace-nowrap lg:text-base M'>Simulation Category:</h4>
     {  shot?.simulatorTypes?.particles &&  shot?.simulatorTypes?.particles?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4  ">
                      {g}
                    </span>
                  ))}


                  
                  {   shot?.simulatorTypes?.rigidbodies &&  shot?.simulatorTypes?.rigidbodies?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {  shot?.simulatorTypes?.softBodies &&  shot?.simulatorTypes?.softBodies?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.clothgroom &&  shot?.simulatorTypes?.clothgroom?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {shot?.simulatorTypes?.magicAbstract &&  shot?.simulatorTypes?.magicAbstract?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                     {  shot?.simulatorTypes?.crowd &&   shot?.simulatorTypes?.crowd?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.mechanicsTech &&  shot?.simulatorTypes?.mechanicsTech?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.ompositing &&  shot?.simulatorTypes?.compositing?.map((g, idx) => (
                    <span key={idx} className=" l text-gray-200 underline text-xs lg:text-base font-normal ml-4 ">
                      {g}
                    </span>
                  ))}

</div>

             {/* tag */}
{/* 
             <div className=' flex flex-wrap gap-4'>

              {
                shot?.tags?.map((item, idx)=> (
                  <div key={idx + 1} className='bg-gray-800 py-2 px-4 rounded'>
                    <h1>{item}</h1>
                  </div>
                ))
              }
             </div> */}
    </div>
    {/* Video Player */}
    {shot.youtubeLink.includes('youtu') ? (
      <iframe
        id="video-player"
        width="100%"
        height="460"
        src={getYouTubeEmbedUrl(shot.youtubeLink)}
        frameBorder="0"
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
        allowFullScreen
        className='min-h-[60vh]'
      ></iframe>
    ) : shot.youtubeLink.includes('vimeo.com') ? (
      <div className="relative pb-[56.25%] h-0 overflow-hidden">
        <iframe
          id="video-player"
          src={getVimeoEmbedUrl(shot.youtubeLink)}
          className="absolute top-0 left-0 w-full h-full"
          frameBorder="0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        ></iframe>
      </div>
    ) : (
      <video id="cloudinary-video" width="100%" height="460" controls>
        <source src={shot.youtubeLink} type="video/mp4" />
        Your browser does not support the video tag.
      </video>
    )}

 
  </div>
) : (
  <section className='flex items-center '>
  
 <FaTrash onClick={()=> handleDelete(shot?._id, shot?.title)} className='text-red-500 absolute top-12 cursor-pointer left-2'/>

<Link href={`/admin/edit/${shot?._id}`}>
 <FaEdit  className='text-blue-500 absolute top-20 cursor-pointer left-2'/>
 
 </Link>
             <h2 className="lg:text-2xl mb-1  font-semibold">{shot.title || 'Shot Title'}</h2>
</section>

)}

  {/* <div className="mt-4 text-left  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink , tc.time)}



            >
               <img  src={tc.image} className='w-32 h-20'/>


            <div className=''>
                <p className=" font-semibold font-mono mr-3">{tc.time}</p>
              <p className="text-gray-300">{tc.label}</p>
            </div>
            </div>
          ))}
        </div>
      </div> */}
    {shot.timecodes && shot.timecodes.length > 0 ? (

      
      <div className="mt-4 text-left  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink , tc.time)}



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
    )   : <div className='mt-4  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg'>
      
      
      <h4>No Intrest point added</h4>
      
      
      </div>}
        {/* Rest of your existing modal content */}
        <div className="text-left   pace-y-2">
          
   
          {/* <p className="text-sm text-gray-300">{shot.description || 'No description available.'}</p> */}

          <div className="border-t max-w-full overflow-x-scroll scrollbar-hide border-gray-400">
            <section className="lg:flex space-y-1 justify-between gap-8">
              {/* Left Side */}
              <div className="space-y-2 mt-4">
                <h4 className="font-semibold text-white text-xs">
                  Focal Length:
                  {shot?.focalLength?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
               <span className='whitespace-nowrap'>Lighting Conditons:</span>
                  {shot?.lightingConditions?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
                 Video Type:
                  {shot?.videoType?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                <h4 className="font-semibold text-white text-xs">
                 Reference Type:
                  {shot?.referenceType?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
     
                      {/* <h4 className="font-semibold text-white text-xs">
                        Cinematographer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.cinematographer}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Production Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.productionDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Costume Designer:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.costumeDesigner}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Editor:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.editor}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Colorist:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.colorist}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Actors:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.actors}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Time:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.shotTime}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Time Period:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.timePeriod}</span>
                      </h4> */}
                    </div>

                    {/* Middle */}


                    
                    <div className="space-y-2 mt-4">
                               <h4 className="font-semibold text-white text-xs">
                 Video Quality:
                  {shot?.videoQuality?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                               <h4 className="font-semibold text-white text-xs">
                 Video Speed:
                  {shot?.videoSpeed?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                               <h4 className="font-semibold text-nowrap  text-white text-xs">
                 Simulation Type:
                  {  shot?.simulatorTypes?.particles &&  shot?.simulatorTypes?.particles?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.rigidbodies &&  shot?.simulatorTypes?.rigidbodies?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {  shot?.simulatorTypes?.softBodies &&  shot?.simulatorTypes?.softBodies?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.clothgroom &&  shot?.simulatorTypes?.clothgroom?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {shot?.simulatorTypes?.magicAbstract &&  shot?.simulatorTypes?.magicAbstract?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                     {  shot?.simulatorTypes?.crowd &&   shot?.simulatorTypes?.crowd?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.mechanicsTech &&  shot?.simulatorTypes?.mechanicsTech?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                  {   shot?.simulatorTypes?.ompositing &&  shot?.simulatorTypes?.compositing?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>



                  <h4 className="font-semibold text-white text-xs">
                 Simulation Scale:
                  {shot?.simulationSize?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
                      {/* <h4 className="font-semibold text-white text-xs"> */}
                        {/* Aspect Ratio:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.aspectRatio}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Format:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.format}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Frame Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.frameSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Shot Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.shotType}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens Size:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.lensSize}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Composition:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.composition}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting:
                        {shot?.lightingStyle?.map((l, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {l}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lighting Type:
                        {shot?.lightingType?.map((l, idx) => (
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
                        {shot?.simulationStyle?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Motion Style:
                        {shot?.motionStyle?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Emitter Speed:
                        {shot?.emitterSpeed?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Software:
                        {shot?.simulationSoftware?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      {/* <h4 className="font-semibold text-white text-xs">
                        Interior/Exterior:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.interiorExterior}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Location Type:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.filmingLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Set:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.set}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Story Location:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.storyLocation}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Camera:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.camera}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Lens:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.lens}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Film Stock / Resolution:
                        <span className="text-xs font-normal ml-4 text-[#999]">{shot?.filmStockResolution}</span>
                      </h4> */}
              </div>
            </section>
          </div>
        </div>

        </section>

   <section>



         {shot.timecodes && shot.timecodes.length > 0 ? (

      
      <div className="mt-4 text-left  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink , tc.time)}



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
    )   : <div className='mt-4  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg'>
      
      
      <h4>No Intrest point added</h4>
      
      
      </div>}

        <div className="mt-4 lg:mt-0 lg:w-96 lg:ml-4">
    <div className="hidden lg:block h-full overflow-y-scroll scrollbar-thin-gray lg:p-3 rounded-lg">
      <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>
      
      {shot.timecodes && shot.timecodes.length > 0 ? (
        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3 items-center hover:bg-[#3a3a3a] p-2 pb-2 cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b border-gray-600'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink, tc.time)}
            >
              <img src={tc.image} alt={tc.label} className='w-32 h-20 object-cover rounded-lg'/>
              <div className=''>
                <p className="font-semibold font-mono mr-3">{tc.time}</p>
                <p className="text-gray-300">{tc.label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2a2a2a] lg:p-6  p-4 rounded-3xl">
          <p className="text-gray-400 italic">No interest points available for this shot</p>
        </div>
      )}
    </div>
  </div>
     </section>
   </div>
  </motion.div>
</SwiperSlide>
                  );
                })}
              </AnimatePresence>
            </Swiper>
          </div>

          {allShots.length === 0 && !isLoading && (
            <div className="text-center my-8 text-white">
              <p>No shots found matching your criteria.</p>
              <button
                onClick={clearAllFilters}
                className="mt-4 px-4 py-2 bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Clear Filters
              </button>
            </div>
          )}
        </div>
      </div>

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

export default function RandomWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center bg-black">Loading...</div>}>
      <Random />
    </Suspense>
  );
  
}