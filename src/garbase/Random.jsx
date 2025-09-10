'use client';
import { useGetShotsQuery } from '@/redux/api/shot';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, Suspense, useCallback } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, EffectCoverflow } from 'swiper/modules';
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
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const swiperRef = useRef(null);
  const videoRefs = useRef({});
  const [showSimulationType, setSimulationType] = useState(false);

  // Memoized VideoPlayer component to prevent unnecessary re-renders
  const VideoPlayer = React.useCallback(({ shot }) => {
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
            {!isHLS && <source src={videoUrl} type="video/mp4" />}
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
            {/* Play button icon removed for brevity */}
          </div>
        )}
      </div>
    );
  }, []);

  // Memoized filter handler to prevent unnecessary re-renders
  const filterHandler = useCallback((e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      const newFilters = {
        ...prev,
        [groupName]: isChecked
          ? [...currentValues, value]
          : currentValues.filter((v) => v !== value),
      };
      return newFilters;
    });
  }, []);

  // Memoized dropdown handler
  const dropDownHandler = useCallback((id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  }, []);

  // Memoized simulation type handler
  const handleSimulationTypeClick = useCallback((idOrIds) => {
    const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];
    ids.forEach((id) => {
      dropDownHandler(id);
    });
    setSimulationType(!showSimulationType);
  }, [dropDownHandler, showSimulationType]);

  // Memoized getRandomShots function
  const getRandomShots = useCallback(() => {
    if (!availableShots || availableShots.length === 0) return [];
    
    let available = availableShots.filter(shot => !displayedShotIds.has(shot._id));
    
    if (available.length < 3) {
      available = availableShots;
      setDisplayedShotIds(new Set());
    }
    
    const shuffled = [...available].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  }, [availableShots, displayedShotIds]);

  // Handle data updates more efficiently
  useEffect(() => {
    if (data?.data) {
      setAvailableShots(data.data);
    }
  }, [data]);

  // Handle loading new shots without clearing existing ones immediately
  useEffect(() => {
    if (availableShots.length > 0) {
      const newShots = getRandomShots();
      if (newShots.length > 0) {
        setAllShots(prev => [...prev, ...newShots]);
        const newDisplayedIds = new Set(displayedShotIds);
        newShots.forEach(shot => newDisplayedIds.add(shot._id));
        setDisplayedShotIds(newDisplayedIds);
      }
    }
  }, [availableShots, getRandomShots]);

  // Improved handleReachEnd with loading state
  const handleReachEnd = useCallback(() => {
    setIsLoadingMore(true);
    const newShots = getRandomShots();
    if (newShots.length > 0) {
      setAllShots(prev => [...prev, ...newShots]);
      const newDisplayedIds = new Set(displayedShotIds);
      newShots.forEach(shot => newDisplayedIds.add(shot._id));
      setDisplayedShotIds(newDisplayedIds);
    }
    setIsLoadingMore(false);
  }, [getRandomShots, displayedShotIds]);

  // Initialize with search params
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
  }, [searchParams]);

  // Handle video play/pause events
  useEffect(() => {
    const handlePlay = (event) => {
      Object.values(videoRefs.current).forEach((video) => {
        if (video.element && video.element !== event.target && !video.element.paused) {
          video.element.pause();
          video.isPlaying = false;
        }
      });

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

  // Rest of your utility functions (getDirectVideoUrl, getYouTubeVideoId, etc.) remain the same
  // ...

  return (
    <div className="pt-28 min-h-screen">
      {/* Your existing JSX structure remains the same */}
      {/* ... */}
      
      <Swiper
        modules={[Navigation, EffectCoverflow]}
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
        className="h-full w-full"
        breakpoints={{
          640: { slidesPerView: 1 },
          768: { slidesPerView: 1 },
          1024: { slidesPerView: 2 },
          1800: { slidesPerView: 2 }
        }}
        onSwiper={(swiper) => (swiperRef.current = swiper)}
        onReachEnd={handleReachEnd}
      >
        <AnimatePresence>
          {allShots.map((shot) => (
            <SwiperSlide key={shot._id}>
              {/* Your existing slide content */}
              {/* ... */}
            </SwiperSlide>
          ))}
        </AnimatePresence>
      </Swiper>

      {/* Loading indicator */}
      {isLoadingMore && (
        <div className="flex justify-center my-4">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
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