'use client';
import { useGetMyShotQuery, useGetShotCountQuery, useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';
import { base_url, filters } from '@/utils/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { FaFlag } from 'react-icons/fa';
import Swal from 'sweetalert2';

function Browse() {

  
  const searchParams = useSearchParams();
  const [openDropdowns, setOpenDropdowns] = useState({});
  const [selectedFilters, setSelectedFilters] = useState({});
  const [localSearch, setLocalSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [sortBy, setSortBy] = useState('mostPopular');
  const [showSortDropdown, setShowSortDropdown] = useState(false);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [shots, setShots] = useState([]); // Store all loaded shots
  const user = useSession();
  const axiosInstance = useSecureAxios();
  const [collectionName, setCollectionName] = useState('');
  const observer = useRef(null);
  const loadingRef = useRef(false);

  const params = useParams();
  console.log(params.search, 'this is params ay hai are')
const [searchTag, setSearchTag] = useState(
  Array.isArray(params.search) 
    ? params.search 
    : params.search 
      ? [params.search] 
      : []
);

console.log(searchTag, 'this is search tag')

  const ids = user?.data?.user?.id;
  const { refetch } = useGetMyShotQuery(ids);
  const Userid = user?.data?.user?.id;
   const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState({});
  const [currentShotForCollections, setCurrentShotForCollections] = useState(null);
  const [collectonNames, setCollectionNames] = useState(null);
  const [currentClc, setCurrentClc] = useState(null)
    const { data:collectionsforFlag, refetch:refetchMyCollection } = useGetMyShotQuery(Userid);

    // console.log(collectionsforFlag?.data, 'This is my collection');
    const collectedIds = collectionsforFlag?.data?.map(item => item.shotId) || [];
    // console.log(collectedIds, 'This is collection ids')

console.log(searchTag, 'this is local search')

    // const fetchCollections = useCallback(async () => {
    //   try {
    //     const response = await axiosInstance.get(`/shot/collection/user/${Userid}`);
    //     setCollections(response.data);
    //   } catch (error) {
    //     console.error('Error fetching collections:', error);
    //   }
    // }, [Userid, axiosInstance]);


      useEffect(() => {
        if (Userid) {
          // fetchCollections();
          getCollection()
        }
      }, [Userid]);



      // save collciton
      const saveCollection = async()=>{
        console.log(currentShotForCollections, 'Save collection preview');
        const data =await axiosInstance.post(`/collection`, {
          collectionName:currentClc,
          data:currentShotForCollections,
          shotId:currentShotForCollections._id,
          userId:Userid
        });

        if(data.status === 201){

          refetchMyCollection()
            Swal.fire({
           title: 'Success',
          text: 'Shot added on your collection',
          icon: 'success',
        })
        }

        console.log(data, 'This i sdata')
       if(!currentClc){
        Swal.fire({
           title: 'Error',
          text: 'Please select a collection',
          icon: 'error',
        })
       }
      }

  //       const isShotInCollections = (shotId) => {
  //   return collections.some(collection => 
  //     collection.shots.some(shot => shot._id === shotId))
  // };

   const getCollectionsForShot = (shotId) => {
    return collections.filter(collection => 
      collection.shots.some(shot => shot._id === shotId))
  };

    const createCollection = async () => {
      if (!newCollectionName.trim()) return;
      
      try {
        const response = await axiosInstance.post(`/collection/save-collection`, {
          userId: Userid,
          name: newCollectionName
        });
        
        setCollections([...collections, response.data]);
        setNewCollectionName('');
        Swal.fire({
          title: 'Success',
          text: 'Collection created successfully',
          icon: 'success',
        });
        getCollection();
      } catch (error) {
        console.error('Error creating collection:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create collection',
          icon: 'error',
        });
      }
    };
  
    // Add/remove shot from collections
    // const updateShotCollections = async () => {
    //   if (!currentShotForCollections) return;
  
    //   try {
    //     const collectionsToAdd = Object.entries(selectedCollections)
    //       .filter(([_, isSelected]) => isSelected)
    //       .map(([collectionId]) => collectionId);
  
    //     const response = await axiosInstance.put(`/shot/collection/update`, {
    //       userId: Userid,
    //       shotId: currentShotForCollections._id,
    //       collections: collectionsToAdd
    //     });
  
    //     console.log('Collection update response:', {
    //       collectionName: collections.find(c => c._id === collectionsToAdd[0])?.name || 'Multiple collections',
    //       shotData: currentShotForCollections
    //     });
  
    //     // fetchCollections();
    //     setShowCollectionModal(false);
    //     Swal.fire({
    //       title: 'Success',
    //       text: 'Collections updated successfully',
    //       icon: 'success',
    //     });
    //   } catch (error) {
    //     console.error('Error updating collections:', error);
    //     Swal.fire({
    //       title: 'Error',
    //       text: 'Failed to update collections',
    //       icon: 'error',
    //     });
    //   }
    // };
  
    // Open collection management modal


    console.log(searchTag, 'this is all search tag')
    const openCollectionModal = (shot, e) => {
      e.stopPropagation();
      setCurrentShotForCollections(shot);
      
      // Initialize selected collections state
      const initialSelected = {};
      collections.forEach(collection => {
        initialSelected[collection._id] = collection.shots.some(s => s._id === shot._id);
      });
      setSelectedCollections(initialSelected);
      
      setShowCollectionModal(true);
    };
  const handleClick = async (id) => {
    try {
      const data = await axios.patch(`${base_url}/shot/click/${id}`);
      console.log(data, 'click handle');
    } catch (error) {
      console.error('Error handling click:', error);
    }
  };

  
  

  const addCollection = async (id, data) => {
    const response = await axiosInstance.post(`/shot/collection/`, {
      userId: Userid,
      shotId: id,
      data,
      collectionName
    });
    console.log(response, 'post ho plz');
    if (response.status === 201) {
      Swal.fire({
        title: 'Success',
        text: 'Shot added To Your Collection',
        icon: 'success',
      });
      refetch();
    }
  };
 
  console.log(collectonNames, 'I Am Your Colectron')

  const getCollection = async()=>{

    const data = await axiosInstance.get(`/collection/${Userid}`);
    console.log(data?.data?.data, 'ami holam collection');
    setCollectionNames(data?.data?.data)
  }

  useEffect(()=>{

    getCollection()
  }, [Userid])

  const sortOptions = [
    { label: 'Most Popular', value: 'mostPopular' },
    { label: 'Release Date (Newest to Oldest)', value: 'releaseDateDesc' },
    { label: 'Release Date (Oldest to Newest)', value: 'releaseDateAsc' },
    { label: 'Recently Added', value: 'recentlyAdded' },
    { label: 'Random', value: 'random' },
    { label: 'Alphabetically by Title', value: 'alphabetical' },
  ];

  // Parse URL parameters on component mount
useEffect(() => {
  if (!searchParams) return;
  const params = new URLSearchParams(searchParams);
  const initialFilters = {};
  const filterKeys = new Set(filters.map((f) => f.name));

  params.forEach((value, key) => {
    if (key === 'search') {
      setLocalSearch(value);
      // Only add to searchTag if not already present
      setSearchTag((prevTags) =>
        prevTags.includes(value) ? prevTags : [...prevTags, value]
      );
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
  setCurrentPage(1);
  setShots(data?.data || []);
  setHasMore(true);
}, [searchParams]);

  

  

function getVideoThumbnail(url, timecode = '0:00') {
  try {
    const seconds = convertTimecodeToSeconds(timecode);
    const videoUrl = new URL(url);

    // 1. Cloudinary - supports exact timecodes
    if (isCloudinaryUrl(videoUrl)) {
      return getCloudinaryThumbnailWithTime(url, seconds);
    }
    
    // 2. YouTube - no reliable timecode support
    if (isYouTubeUrl(videoUrl)) {
      return getYouTubeThumbnail(url); // Returns highest quality available
    }
    
    // 3. Vimeo - requires API for timecodes
    if (isVimeoUrl(videoUrl)) {
      return getVimeoThumbnail(url); // Returns default thumbnail
    }
    
    return null;
  } catch (err) {
    console.error('Error generating thumbnail:', err);
    return null;
  }
}

// Helper functions
function convertTimecodeToSeconds(timecode) {
  const parts = timecode.split(':').reverse();
  return parts.reduce((total, part, index) => {
    return total + (parseInt(part) || 0) * Math.pow(60, index);
  }, 0);
}

function isCloudinaryUrl(url) {
  return url.hostname.includes('cloudinary.com') && url.pathname.includes('/video/');
}

function isYouTubeUrl(url) {
  return url.hostname.includes('youtube.') || url.hostname.includes('youtu.be');
}

function isVimeoUrl(url) {
  return url.hostname.includes('vimeo.com');
}

// Cloudinary implementation with timecode support
function getCloudinaryThumbnailWithTime(url, seconds) {
  const cloudinaryUrl = new URL(url);
  const pathParts = cloudinaryUrl.pathname.split('/');
  const uploadIndex = pathParts.findIndex(part => part === 'upload');

  if (uploadIndex !== -1) {
    pathParts.splice(uploadIndex + 1, 0, `c_thumb,w_400,h_400,g_auto,so_${seconds}`);
    const fileNameParts = pathParts[pathParts.length - 1].split('.');
    if (fileNameParts.length > 1) {
      fileNameParts[fileNameParts.length - 1] = 'jpg';
      pathParts[pathParts.length - 1] = fileNameParts.join('.');
    }
    return `${cloudinaryUrl.origin}${pathParts.join('/')}`;
  }
  return null;
}

// YouTube implementation (no timecode support)
// async function getYouTubeThumbnail(url, timestamp = '00:00:10') {
//   try {
//     const yt = new URL(url);
//     let videoId;

//     if (yt.hostname.includes('youtu.be')) {
//       videoId = yt.pathname.slice(1);
//     } else {
//       videoId = yt.searchParams.get('v');
//     }

//     if (!videoId) return null;

//     // Try backend API for frame at specific timestamp
//     try {
//       const res = await fetch(`/api/frame?url=${encodeURIComponent(url)}&timestamp=${timestamp}`);
//       if (res.ok) {
//         const blob = await res.blob();
//         const objectUrl = URL.createObjectURL(blob);
//         return objectUrl;
//       } else {
//         console.warn("Backend API failed, status:", res.status);
//       }
//     } catch (err) {
//       console.warn("Error calling backend API:", err);
//     }

//     // Fallback to standard YouTube thumbnails
//     const qualities = ['maxresdefault', 'hqdefault', 'mqdefault', 'default'];
//     for (const quality of qualities) {
//       const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/${quality}.jpg`;
//       // Optionally: You can ping the URL with HEAD to check if it exists
//       return thumbnailUrl; // Just return the first one that likely exists
//     }
//   } catch (err) {
//     console.error('Error parsing YouTube URL:', err);
//   }

//   return null;
// }


// Vimeo implementation (no timecode support without API)
function getVimeoThumbnail(url) {
  try {
    const vimeoUrl = new URL(url);
    const videoId = vimeoUrl.pathname.split('/').pop();
    
    if (videoId) {
      // Using vumbnail.com as a fallback
      return `https://vumbnail.com/${videoId}.jpg`;
    }
  } catch (err) {
    console.error('Error parsing Vimeo URL:', err);
  }
  return null;
}


// Usage examples:
// getVideoThumbnail('https://cloudinary.com/demo/video/upload/sample.mp4', '3:20');
// getVideoThumbnail('https://youtu.be/dQw4w9WgXcQ', '1:23');
// getVideoThumbnail('https://vimeo.com/123456789', '0:45');

function getYouTubeThumbnail(url, timecodeInSeconds) {
  // YouTube thumbnails URL doesn't support timecode thumbnails
  // So ignore timecode parameter
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

    if (videoId) {
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    }
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
  }
  return null;
}

//  async function getYouTubeThumbnail(url, timestamp = '00:00:10') {
//   try {

    
//     const yt = new URL(url);
//     let videoId;

//     if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
//       videoId = yt.pathname.split('/')[2]; // YouTube Shorts
//     } else if (yt.hostname.includes('youtu.be')) {
//       videoId = yt.pathname.split('/')[1]; // Shortened URL
//     } else if (yt.hostname.includes('youtube.com')) {
//       videoId = yt.searchParams.get('v'); // Standard YouTube
//     }

//     if (!videoId) return null;

//     // Try to get custom frame from backend
//     try {
//       const apiUrl = `/api/frame?url=${encodeURIComponent(url)}&timestamp=${timestamp}`;
//       const res = await fetch(apiUrl);

//       if (res.ok) {
//         const blob = await res.blob();
//         const objectUrl = URL.createObjectURL(blob);
//         return objectUrl;
//       } else {
//         console.warn('API fallback: failed to get frame, status:', res.status);
//       }
//     } catch (err) {
//       console.warn('API fallback: exception while fetching frame:', err);
//     }

//     // Fallback to default YouTube thumbnail
//     return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
//   } catch (err) {
//     console.error('Error parsing YouTube URL:', err);
//     return null;
//   }
// }



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



function getVimeoThumbnail(url) {
  try {
    const vimeoUrl = new URL(url);
    
    if (vimeoUrl.hostname.includes('vimeo.com')) {
      const videoId = vimeoUrl.pathname.split('/')[1];
      
      if (videoId) {
        // Option 1: Using Vimeo's thumbnail API (requires API key)
        // return `https://i.vimeocdn.com/video/${videoId}_640x360.jpg`;
        
        // Option 2: Using a free proxy service (no API key needed)
        return `https://vumbnail.com/${videoId}.jpg`;
        
        // Option 3: Multiple size options
        // return {
        //   small: `https://i.vimeocdn.com/video/${videoId}_295x166.jpg`,
        //   medium: `https://i.vimeocdn.com/video/${videoId}_640x360.jpg`,
        //   large: `https://i.vimeocdn.com/video/${videoId}_1280x720.jpg`
        // };
      }
    }
  } catch (err) {
    console.error('Error parsing Vimeo URL:', err);
  }
  return null;
}



  
  function getCloudinaryThumbnail(url) {
    try {
      const cloudinaryUrl = new URL(url);
      if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
        const pathParts = cloudinaryUrl.pathname.split('/');
        const uploadIndex = pathParts.findIndex((part) => part === 'upload');

        if (uploadIndex !== -1) {
          pathParts.splice(uploadIndex + 1, 0, 'c_thumb,w_400,h_400,g_auto,so_10');
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
  }






function handleTimecodeClick(timeString, videoUrl) {
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
    const videoPlayer = document.getElementById('cloudinary-video');
    if (videoPlayer) {
      videoPlayer.currentTime = seconds;
      videoPlayer.play();
    }
  }
}


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

  // Build query object from state
const buildQuery = useCallback((page = 1) => {
  const query = {};
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }
  // Use searchTag array if you want to support multiple search terms
  if (searchTag.length > 0) {
    query.search = searchTag; // Send array of search terms to backend
  } else if (submittedSearch && submittedSearch.trim() !== '') {
    query.search = submittedSearch; // Fallback to single search term
  }
  if (sortBy) {
    query.sortBy = sortBy;
  }
  query.page = page;
  query.limit = 20;

  return query;
}, [selectedFilters, searchTag, submittedSearch, sortBy]);


  console.log(selectedFilters, 'This is selected')

  const { data, isLoading, error, isFetching } = useGetShotsQuery(buildQuery(currentPage), {
  });

  const { data: count } = useGetShotCountQuery(buildQuery(1));
  const counts = count?.count;

  // Handle new data and update shots state
  useEffect(() => {
    if (data?.data) {
      if (currentPage === 1) {
        setShots(data?.data);
      } else {
        setShots(prev => [...prev, ...data.data]);
      }
      // Check if we've loaded all available shots
      if (data?.data?.length === 0 || (counts && shots?.length + data?.data?.length >= counts)) {
        setHasMore(false);
      }
      loadingRef.current = false;
    }
  }, [data, currentPage, counts]);

  // Reset when filters change
  useEffect(() => {
    setCurrentPage(1);
    setShots(data?.data);
    setHasMore(true);
    loadingRef.current = false;
  }, [selectedFilters, submittedSearch, sortBy]);

  // Intersection Observer callback
  const lastShotElementRef = useCallback(
    (node) => {
      if (isLoading || isFetching || !hasMore) {
        if (observer.current) observer.current.disconnect();
        return;
      }

      if (observer.current) observer.current.disconnect();
      
      observer.current = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && !loadingRef.current) {
            loadingRef.current = true;
            setCurrentPage((prev) => prev + 1);
          }
        },
        { threshold: 0.1, rootMargin: '200px' }
      );

      if (node) observer.current.observe(node);
    },
    [isLoading, isFetching, hasMore]
  );

  const dropDownHandler = (id) => {
    setOpenDropdowns((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filterHandler = (e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      if (isChecked) {
        return {
          ...prev,
          [groupName]: [...currentValues, value],
        };
      } else {
        return {
          ...prev,
          [groupName]: currentValues.filter((v) => v !== value),
        };
      }
    });
  };

 const clearAllFilters = () => {
  setSelectedFilters({});
  setLocalSearch('');
  setSubmittedSearch('');
  setSearchTag([]); // Clear the search tags
  setSortBy('mostPopular');
  window.location.reload()
};

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleSearchKeyDown = (e) => {
  if (e.key === 'Enter') {
    setSubmittedSearch(localSearch);
    // Update searchTag to include the new search term
    setSearchTag((prevTags) => {
      // Avoid duplicates by checking if the term already exists
      if (localSearch && !prevTags.includes(localSearch)) {
        return [...prevTags, localSearch];
      }
      return prevTags;
    });
  }
};
  const handleSortSelect = (value) => {
    setSortBy(value);
    setShowSortDropdown(false);
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Error loading shots. Please try again later.
      </div>
    );
  }

  return (
    <div>

               <div className="flex flex-wrap gap-2 mt-28 ml-96">
  {searchTag.map((tag, idx) => (
    <div
      key={idx}
      className="bg-gray-600 text-white px-2 py-1 rounded flex items-center"
    >
      {tag}
      <button
        onClick={() => {
          setSearchTag((prev) => prev.filter((t) => t !== tag));
          if (tag === submittedSearch) {
            setSubmittedSearch('');
            setLocalSearch('');
          }
        }}
        className="ml-2 text-xs"
      >
        ×
      </button>
    </div>
  ))}
</div>
      <div className="flex">
        {/* Sort Dropdown */}
        <div className="absolute top-[90.5px] md:top-24 z-30 right-12 md:right-8">
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

        

        {/* Filter Sidebar */}
        <section
          className={`bg-[#0a0a0a] fixed top-[73px] min-h-screen p-4 w-64 transform transition-transform duration-300 ease-in-out z-50 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:w-64`}
        >
          <div className="flex flex-col gap-4">
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
            <div className="flex justify-between">
              <p>FILTER RESULTS</p>
              <button onClick={clearAllFilters} className="text-primary cursor-pointer">
                Clear all
              </button>
            </div>
          </div>

          <div className="mt-8 max-h-[calc(100vh-150px)] overflow-y-auto no-scrollbar">
            {filters.map((filterGroup, idx) => (
              <div
                key={idx}
                onClick={() => dropDownHandler(filterGroup?.id)}
                className="border-b border-gray-600 text-sm py-1 cursor-pointer"
              >
                <p className="px-1 capitalize p-1 hover:bg-[#171717]">{filterGroup?.title}</p>
                <div
                  className={`overflow-hidden transition-all duration-500 ease-in-out mt-2 ${
                    openDropdowns[filterGroup.id] ? 'max-h-[500px]' : 'max-h-0'
                  }`}
                >
                  {filterGroup?.item.map((item, index) => {
                    const key = filterGroup.name;
                    const checked = selectedFilters[key]?.includes(item) ?? false;
                    return (
                      <label key={index} className="flex gap-2 px-2 cursor-pointer space-y-3">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => filterHandler(e, key, item)}
                          className="mt-1"
                        />
                        <p className="capitalize">{item}</p>
                      </label>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Spacer for layout */}
        
     
        <section className="md:min-w-[250px]"></section>



        {/* Main Content */}
<section className="grid mt-16 w-full grid-cols-1 sm:grid-cols-2 md:grid-cols-[repeat(auto-fit,minmax(250px,1fr))] gap-4">
  <div className="flex justify-end absolute top-20 right-0 lg:hidden p-4 space-x-4">
    <button onClick={toggleSidebar} className="text-white focus:outline-none md:hidden">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  <AnimatePresence>
    {shots?.map((data, idx) => {
         let imageSrc;


if(data.imageUrlThubnail){
  imageSrc = data.imageUrlThubnail[0]
}

if(data.imageUrl){
         imageSrc = data?.imageUrl;
}

      // if (data.imageUrlThubnail) {
      //   imageSrc = getVideoThumbnail(data?.youtubeLink, data?.thumbnailTimecode[0]);
      // }

      if (!imageSrc && data?.youtubeLink) {
        if (data.youtubeLink.includes('cloudinary.com')) {
          imageSrc = getCloudinaryThumbnail(data.youtubeLink);
        } else if (data.youtubeLink.includes('youtu')) {
          imageSrc = getYouTubeThumbnail(data.youtubeLink, data?.thumbnailTimecode);
        } else if (data.youtubeLink.includes('vimeo.com')) {
          imageSrc = getVimeoThumbnail(data.youtubeLink);
        }
      }

      const isLastElement = idx === shots.length - 1;

      return (
        <motion.div
          key={`${data._id}-${idx}`}
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          transition={{ duration: 0.3, delay: idx * 0.05 }}
          ref={isLastElement ? lastShotElementRef : null}
          onClick={() => {
            setSelectedShot(data);
            setModalIsOpen(true);
            handleClick(data._id);
          }}
          className="p-2 cursor-pointer relative group"
        >
          <div className="relative aspect-video"> {/* Set aspect ratio to 16:9 */}

            
            {imageSrc ? (
              <Image
                alt={data?.title || "Video thumbnail"}
                src={imageSrc}
                layout="fill" // Use fill to make the image cover the container
                objectFit="cover" // Maintain aspect ratio
                className="rounded-md"
              />
            ) : (
              <div className="bg-gray-800 h-full w-full flex items-center justify-center rounded-md">
                <span className="text-gray-500 text-sm">No thumbnail available</span>
              </div>
            )}

            <div className="absolute inset-0 bg-black flex flex-col justify-between p-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
              <div className="text-white text-xs truncate">{data?.title}</div>



{
  collectedIds.includes(data._id) && <h1 className='absolute top-2 right-2'>  <FaFlag/>  </h1>
}
           <button
                className="cursor-pointer text-xs px-2 py-1 rounded self-start hover:underline transition-colors"
                onClick={(e) => openCollectionModal(data, e)}
              >
                {collectonNames ? 'Add to Collection' : 'Add to Collection'}
              </button>
            </div>
          </div>
        </motion.div>
      );
    })}
  </AnimatePresence>
</section>
      </div>

      {/* Loading Indicator */}
      {(isLoading || isFetching) && hasMore && (
        <div className="flex justify-center my-8">
          <motion.div
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          />
        </div>
      )}

      {/* No More Data Message */}
      {!hasMore && shots.length > 0 && (
        <div className="text-center my-8 text-white">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No more shots to load.
          </motion.p>
        </div>
      )}

      {/* No Results Message */}
      {!isLoading && !isFetching && shots?.length === 0 && (
        <div className="text-center my-8 text-white">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            No shots found matching your criteria.
          </motion.p>
        </div>
      )}

      {/* Modal */}
    <AnimatePresence>
  {modalIsOpen && selectedShot && (
    <motion.div
      className="fixed inset-0 no-scrollbar flex justify-center items-center z-[999]"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={() => setModalIsOpen(false)}
    >
      <motion.div
        className="bg-[#1a1a1a] text-white rounded-xl shadow-2xl w-[90%] lg:w-[60%] lg:ml-20 mt-16 overflow-y-scroll no-scrollbar max-h-[90vh] p-4 relative"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.8, opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-2 cursor-pointer right-2 text-white text-xl font-bold hover:text-red-500"
          onClick={() => setModalIsOpen(false)}
        >
          ×
        </button>
{selectedShot.youtubeLink ? (
  <div>
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

    {/* Timecodes section */}
    {selectedShot.timecodes && selectedShot.timecodes.length > 0 && (
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
    )}
  </div>
) : (
  <p>No valid video link found.</p>
)}

        {/* Rest of your existing modal content */}
        <div className="text-left space-y-2">
          <h2 className="text-xl font-semibold">{selectedShot.title || 'Shot Title'}</h2>
          <p className="text-sm text-gray-300">{selectedShot.description || 'No description available.'}</p>

          <div className="border-t border-gray-400">
            <section className="lg:flex justify-between gap-8">
              {/* Left Side */}
              <div className="space-y-1 mt-4">
                <h4 className="font-semibold text-white text-xs">
                  Genre:
                  {selectedShot?.genre?.map((g, idx) => (
                    <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                      {g}
                    </span>
                  ))}
                </h4>
      <h4 className="font-semibold text-white text-xs">
                        Director:
                        <span className="text-xs font-normal ml-4 text-[#999]">{selectedShot?.director}</span>
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
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
                      </h4>
                    </div>

                    {/* Middle */}
                    <div className="space-y-1 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Color:
                        {selectedShot?.color?.map((g, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {g}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
                        Aspect Ratio:
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
                      </h4>
                    </div>

                    {/* Right Side */}
                    <div className="space-y-1 mt-4">
                      <h4 className="font-semibold text-white text-xs">
                        Time of Day:
                        {selectedShot?.timeOfDay?.map((t, idx) => (
                          <span key={idx} className="text-xs font-normal ml-4 text-[#999]">
                            {t}
                          </span>
                        ))}
                      </h4>
                      <h4 className="font-semibold text-white text-xs">
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
                      </h4>
              </div>
            </section>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>




  <AnimatePresence>
    {showCollectionModal && currentShotForCollections && (
      <motion.div
        className="fixed inset-0  bg-opacity-50 flex justify-center items-center z-[1000]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowCollectionModal(false)}
      >
        <motion.div
          className="bg-[#1a1a1a] rounded-lg p-6 w-full max-w-md"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          exit={{ scale: 0.9 }}
          onClick={(e) => e.stopPropagation()}
        >
          <h3 className="text-xl font-semibold mb-4">Manage Collections</h3>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Add to existing collections:</h4>
            {collectonNames.length > 0 ? (
          <div className="space-y-2 max-h-60 overflow-y-auto">
  {collectonNames.map(collection => (
    <label key={collection._id} className="flex items-center space-x-2">
      <input
        type="checkbox"
        checked={currentClc === collection.name}
        onChange={(e) => {
          if (e.target.checked) {
            setCurrentClc(collection.name);
          } else {
            setCurrentClc(''); // uncheck if clicked again
          }
        }}
      />
      <span>{collection.name}</span>
    </label>
  ))}
</div>

            ) : (
              <p className="text-gray-400">No collections yet</p>
            )}
          </div>
          
          <div className="mb-4">
            <h4 className="font-medium mb-2">Or create new collection:</h4>
            <div className="flex space-x-2">
              <input
                type="text"
                value={newCollectionName}
                onChange={(e) => setNewCollectionName(e.target.value)}
                placeholder="Collection name"
                className="flex-1 bg-[#333] text-white px-3 py-2 rounded"
              />
              <button
                onClick={createCollection}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Create
              </button>
            </div>
          </div>
          
          <div className="flex justify-end space-x-2 mt-4">
            <button
              onClick={() => setShowCollectionModal(false)}
              className="px-4 py-2 rounded border border-gray-600 hover:bg-gray-700"
            >
              Cancel
            </button>
            <button
            onClick={saveCollection}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save
            </button>
          </div>
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

export default function BrowseWithSuspense() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <Browse />
    </Suspense>
  );
}