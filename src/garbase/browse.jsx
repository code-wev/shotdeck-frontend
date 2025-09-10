'use client';
import { useGetMyShotQuery, useGetShotCountQuery, useGetShotsQuery } from '@/redux/api/shot';
import { useSecureAxios } from '@/utils/Axios';
import { base_url, filters } from '@/utils/utils';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { useSession } from 'next-auth/react';
import Image from 'next/image';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import React, { useState, useEffect, useRef, useCallback, Suspense } from 'react';
import { FaEdit, FaFlag, FaTrash } from 'react-icons/fa';
import { MdKeyboardArrowUp, MdOutlineKeyboardArrowDown } from 'react-icons/md';
import { FaThLarge } from 'react-icons/fa';
import Swal from 'sweetalert2';
import Link from 'next/link';

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


const userRole= user?.data?.user?.role;
console.log(userRole, 'Kuryem er h role')
  const ids = user?.data?.user?.id;
  const {data:myShotData, refetch } = useGetMyShotQuery(ids);
  const Userid = user?.data?.user?.id;
   const [collections, setCollections] = useState([]);
  const [showCollectionModal, setShowCollectionModal] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [selectedCollections, setSelectedCollections] = useState({});
  const [currentShotForCollections, setCurrentShotForCollections] = useState(null);
  const [collectonNames, setCollectionNames] = useState(null);
  const [currentClc, setCurrentClc] = useState(null)
    const { data:collectionsforFlag, refetch:refetchMyCollection } = useGetMyShotQuery(Userid);
    const [showSimulationType, setSimulationType] = useState(false);




    const gridClasses = {
  3: 'md:grid-cols-3',
  4: 'md:grid-cols-4',
  5: 'md:grid-cols-5',
  6: 'md:grid-cols-6',
  7: 'md:grid-cols-7',
  8: 'md:grid-cols-8',
  9: 'md:grid-cols-9',
  10: 'md:grid-cols-10'
};
    

    // console.log(collectionsforFlag?.data, 'This is my collection');
    const collectedIds = collectionsforFlag?.data?.map(item => item.shotId) || [];
    // console.log(collectedIds, 'This is collection ids')
  const [columns, setColumns] = useState(4);
    useEffect(() => {
    const updateColumns = () => {
      const width = window.innerWidth;

      if (width < 700) {
        setColumns(3); // mobile
      } else if (width >= 700 && width < 1000) {
        setColumns(4); // tablet
      } else if (width >= 1000 && width < 1400) {
        setColumns(5); // small desktop
      } else {
        setColumns(9); // large screen
      }
    };

    updateColumns(); // run on mount
    window.addEventListener('resize', updateColumns); // run on resize

    return () => window.removeEventListener('resize', updateColumns); // cleanup
  }, []);
  const [showSlider, setShowSlider] = useState(false);

  console.log(columns, 'this is kuryem er mathar kholi')

console.log(searchTag, 'this is local search')
const [shouldRender, setShouldRender] = useState(showSimulationType);

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





      const handleCreateAndAdd = async () => {
        if (!newCollectionName.trim()) return;
      
        try {
          // 1. Create the new collection
          const createResponse = await axiosInstance.post(`/collection/save-collection`, {
            userId: Userid,
            name: newCollectionName
          });
          
          // 2. Add the current shot to the new collection
          await axiosInstance.post(`/collection`, {
            collectionName: newCollectionName,
            data: currentShotForCollections,
            shotId: currentShotForCollections._id,
            userId: Userid
          });
      
          // 3. Refresh data and UI
          getCollection(); // Refresh collection list
          refetchMyCollection(); // Refresh shot-collection relationships
          setNewCollectionName(''); // Clear input
          
          Swal.fire({
            title: 'Success',
            text: 'Collection created and shot added',
            icon: 'success',
            background: '#171717',
            color: '#ffffff'
          });
        } catch (error) {
          console.error('Error:', error);
          Swal.fire({
            title: 'Error',
            text: error.response?.data?.message || 'Failed to create collection',
            icon: 'error',
            background: '#171717',
            color: '#ffffff'
          });
        }
      };
      
      const handleAddToCollection = async (collectionName) => {
        try {
          await axiosInstance.post(`/collection`, {
            collectionName,
            data: currentShotForCollections,
            shotId: currentShotForCollections._id,
            userId: Userid
          });
          
          refetchMyCollection();
          Swal.fire({
            title: 'Added',
            text: 'Shot added to collection',
            icon: 'success',
            background: '#171717',
            color: '#ffffff'
          });
        } catch (error) {
          console.error('Error adding to collection:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to add to collection',
            icon: 'error',
            background: '#171717',
            color: '#ffffff'
          });
        }
      };
      
      const handleRemoveFromCollection = async (collectionItemId) => {
        try {
          await axiosInstance.delete(`/shot/collection/${collectionItemId}`);
          refetchMyCollection();
          Swal.fire({
            title: 'Removed',
            text: 'Shot removed from collection',
            icon: 'success',
            background: '#171717',
            color: '#ffffff'
          });
        } catch (error) {
          console.error('Error removing from collection:', error);
          Swal.fire({
            title: 'Error',
            text: 'Failed to remove from collection',
            icon: 'error',
            background: '#171717',
            color: '#ffffff'
          });
        }
      };

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
               background: '#171717',
            color: '#ffffff',
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
               background: '#171717',
            color: '#ffffff',
        });
        getCollection();
      } catch (error) {
        console.error('Error creating collection:', error);
        Swal.fire({
          title: 'Error',
          text: 'Failed to create collection',
          icon: 'error',
               background: '#171717',
            color: '#ffffff',
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

const result = filters.filter(item => item.id === 21);
console.log(result, 'kuryem amdarchost er hugar bish')
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
             background: '#171717',
            color: '#ffffff',
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
    { label: 'Release Date (Newest to Oldest)', value: 'recentlyAdded' },
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
      console.log('accah clicked to holo')
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

  
  const handleDelete = async (shotId, shotTitle) => {
    try {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: `You are about to delete "${shotTitle}". This action cannot be undone!`,
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it!',
        cancelButtonText: 'Cancel',
        reverseButtons: true,
        background: '#171717',
        color: '#ffffff'
      });

      if (result.isConfirmed) {
        Swal.fire({
          title: 'Deleting...',
          allowOutsideClick: false,
          didOpen: () => {
            Swal.showLoading();
          },
          background: '#171717',
          color: '#ffffff'
        });

        await axiosInstance.delete(`/shot/delete/${shotId}`);
        
        Swal.fire({
          title: 'Deleted!',
          text: 'The shot has been deleted.',
          icon: 'success',
          timer: 1500,
          showConfirmButton: false,
          background: '#171717',
          color: '#ffffff'
        });
        
     RelaodEvreything() 
     window.location.reload()
      }
    } catch (error) {
      Swal.fire({
        title: 'Error!',
        text: 'Failed to delete shot',
        icon: 'error',
        background: '#171717',
        color: '#ffffff'
      });
      console.error('Delete error:', error);
    }
  };
  

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

const handleDropdownClick = (idOrIds) => {
  const ids = Array.isArray(idOrIds) ? idOrIds : [idOrIds];

  ids.forEach((id) => {
    dropDownHandler(id);
  });

  
  setSimulationType(!showSimulationType)


};

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





  
  function getCloudinaryThumbnail(url, timecode) {
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
  query.sortBy = 'recentlyAdded'
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

  const { data, isLoading, error, isFetching, refetch:RelaodEvreything } = useGetShotsQuery(buildQuery(currentPage), {
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
  
  setSelectedFilters(prev => {
    const currentValues = prev[groupName] || [];
    let newValues;
    
    if (isChecked) {
      // Add the value if checked
      newValues = [...new Set([...currentValues, value])]; // Ensure no duplicates
    } else {
      // Remove the value if unchecked
      newValues = currentValues.filter(v => v !== value);
    }
    
    // Create new state
    const newState = {
      ...prev,
      [groupName]: newValues
    };
    
    // Remove group if empty
    if (newValues.length === 0) {
      delete newState[groupName];
    }
    
    return newState;
  });
};
  const route = useRouter()

 const clearAllFilters = () => {
  setSelectedFilters({});
  setLocalSearch('');
  setSubmittedSearch('');
  setSearchTag([]); // Clear the search tags
  setSortBy('mostPopular');
  route.push('/browse')
};

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const handleSearchKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // Prevent default form submission behavior
      const searchValue = localSearch.trim();
      
      if (searchValue) {
        setSubmittedSearch(searchValue);
        // Update searchTag to include the new search term
        setSearchTag((prevTags) => {
          // Avoid duplicates by checking if the term already exists
          if (!prevTags.includes(searchValue)) {
            return [...prevTags, searchValue];
          }
          return prevTags;
        });
        setLocalSearch(''); // Clear the input field
      }
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
    <div className=''>

               <div className="flex flex-wrap gap-2 pt-28 md:ml-96 ml-4 mt-4">
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
      <div className="flex ">
        {/* Sort Dropdown */}
        <div className="absolute top-[90.5px] md:top-24 z-30 right-12 md:right-8">



 <article className='flex gap-4 '>
        <div>
           <button
            onClick={() => setShowSortDropdown(!showSortDropdown)}
            className="text-white bg-[#333333] px-4 py-2 cursor-pointer rounded-md text-sm focus:outline-none hover:bg-[#444444]"
          >
            Sort by: {sortOptions.find((opt) => opt.value === sortBy)?.label}
          </button>
          <div
            className={`absolute right-0 mt-2 w-64 bg-[#171717] border border-gray-600 rounded-md shadow-lg transform transition-all duration-200 ease-in-out ${
              showSortDropdown ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0'
            } origin-top z-30`}
          >
            {sortOptions.map((option, idx) => (
              <button
                key={idx}
                onClick={() => handleSortSelect(option.value)}
                className="block w-full text-left px-4 cursor-pointer py-2 text-sm text-white hover:bg-[#333333] capitalize"
              >
                {option.label}
              </button>
            ))}
          </div>
       </div>
       
                       <div className="relative flex items-center gap-2 text-white">
      {/* Sort Button */}


   <div className="relative  inline-block text-white">
      {/* Grid Button */}
      <button
        onClick={() => setShowSlider(!showSlider)}
        className="p-2 bg-gray-800 cursor-pointer rounded hover:bg-gray-700"
      >
        <FaThLarge size={16} />
      </button>

      {/* Slider Popup */}
      {showSlider && (
        <div className="absolute  top-12 right-0 bg-[#3a4a5c] text-white px-4 py-3 rounded-lg w-56 shadow-md z-50 font-sans">
          <div className="text-center font-semibold text-sm mb-2">
            Number of Columns
          </div>

          <div className="relative">
            {/* Arrows */}
            <div className="absolute left-0 top-1/2 -translate-y-1/2 text-white text-xs">▲</div>
            <div className="absolute right-0 top-1/2 -translate-y-1/2 text-white text-xs">▲</div>

            {/* Slider */}
   <input
  type="range"
  min="3"
  max="10"
  step="1"
  value={columns}
  onChange={(e) => setColumns(Number(e.target.value))}
  className="w-full appearance-none bg-transparent triangle-slider"
/>


            {/* Tick Marks */}
            <div className="flex justify-between text-xs mt-1 px-1 opacity-70">
              {Array.from({ length: 8 }, (_, i) => (
                <span key={i} className="-mt-2">|</span>
              ))}
            </div>
          </div>

          {/* Min - Max - Value */}
          <div className="flex justify-between text-xs mt-1 font-semibold">
            <span>3</span>
            <span className="text-lg">{columns}</span>
            <span>10</span>
          </div>
        </div>
      )}
    </div>













    </div>
 </article>



        </div>
{/* grid opoiton */}
        

        {/* Filter Sidebar */}
        <section
          className={`fixed top-[73px] min-h-screen mt-2 w-64 transform transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          } md:translate-x-0 md:w-64`}
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
            {/* <div className="flex justify-between">
              <p>FILTER RESULTS</p>
              <button onClick={clearAllFilters} className="text-primary cursor-pointer">
                Clear all
              </button>
            </div> */}


          </div>




   <section className='bg-[#1A1A1A] mr-4 border  border-gray-700 rounded-xl  w-64 md:w-70  mt-4 px-4 '>




        <div className="   mt-8 max-h-[calc(100vh-150px)] overflow-y-auto  no-scrollbar">


            <h1 className='text-center text-xs'>Simulation Specification</h1>
                    <p className=" px-1 capitalize p-1 text-white font-semibold  ">Simulation Type</p>




                    {/* kuryem er sepecial dibba */}

{/* bujhlam na */}
                    {/*  */}
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
              ? ' overflow-y-scroll scrollbar-hide mt-6 p-2 rounded' 
              : ' overflow-y-scroll scrollbar-hide mt-6 p-4 rounded'
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
    {(!selectedFilters?.rigidbodies  && 'Rigid Bodies')}
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
                showSimulationType ? ' bg-gray-800' : ' bg-gray-700'
              } border-gray-600 text-white flex items-center justify-center`}
            >
              {!showSimulationType ? "..." : ''}
            </span>
          </div>
        </div>

       { showSimulationType  && <span 
              onClick={() => handleDropdownClick([22, 23, 24, 25, 255, 256, 26, 27, 28])}
              className={`px-8 z-50 absolute bottom-0 right-20  mt-2 rounded-full border transition-all duration-300 transform ${
                showSimulationType ? ' bg-gray-800' : ' bg-gray-700'
              } border-gray-600 text-white flex items-center justify-center`}
            >
              {showSimulationType && <MdKeyboardArrowUp className="text-2xl" /> }
            </span>}
      </div>
    )
  ))}
  
  <div className={`transition-all duration-500 ease-in-out overflow-hidden ${
    !showSimulationType 
      ? 'max-h-0 opacity-0' 
      : 'max-h-[2400px] opacity-100'
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


















{/* bulsheet */}
<div className='mb-[10px]'>
  {filters.filter(item => item.id !== 21).slice(9, filters.length).map((filterGroup, idx) => (
    !filterGroup?.item ? (
      <div key={idx} className="mb-2 mt-3 flex items-center justify-center gap-2 shadow-sm">
        <p className="text-gray-300 text-xs text-center">{filterGroup?.title}</p>
      </div>
    ) : (
      <section key={idx}>
        <div className="pb-2 text-sm py-1 relative cursor-pointer">
          {/* Title */}
          {![22, 23, 24, 25, 255, 256, 26, 27, 28].includes(filterGroup.id) && (
            <p onClick={() => dropDownHandler(filterGroup?.id)} className="px-1 capitalize p-1 text-white font-semibold">{filterGroup?.title}</p>
          )}

          {/* Three dots toggle */}
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

          {/* Main container with smooth animation */}
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
                  : '1rem' // h-4 equivalent (1rem = 16px, h-4 = 1rem)
            }}
            transition={{ duration: 0.3, ease: "easeInOut" }}
          >
            {/* Selected filters */}
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

            {/* Full list */}
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
                      className={`  ${selectedFilters[filterGroup.name]?.includes(item) ? 'hidden' : ''} flex gap-2 space-y-4 px-2 items-start`}
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
                        className={`  capitalize text-white text-sm select-none cursor-pointer`}
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

        {/* Spacer for layout */}
        
     
        <section className="md:min-w-[250px]"></section>



        {/* Main Content */}
<section 

 className={`grid md:ml-16 grid-cols-1 sm:grid-cols-2 mt-16 w-full gap-4 md:grid-cols-${columns}`}
  style={{ 
    gridTemplateColumns: `, minmax(0, 1fr))`
  }}
>
  <div className="flex justify-end absolute top-20 right-0 lg:hidden p-4 space-x-4">
    <button onClick={toggleSidebar} className="text-white focus:outline-none md:hidden">
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>
  </div>

  <AnimatePresence>



  {Array.from(
  new Map(shots?.map(shot => [shot._id, shot]) // Create Map to deduplicate by _id
).values()).map((data, idx, dedupedShots) => {
  let imageSrc;

  if (data.imageUrlThubnail) {
    imageSrc = data.imageUrlThubnail[0];
  }

  if (data.imageUrl) {
    imageSrc = data?.imageUrl;
  }

  if (!imageSrc && data?.youtubeLink) {
    if (data.youtubeLink.includes('cloudinary.com')) {
      imageSrc = getCloudinaryThumbnail(data.youtubeLink, data.thumbnailTimecode);
    } else if (data.youtubeLink.includes('youtu')) {
      imageSrc = getYouTubeThumbnail(data.youtubeLink, data?.thumbnailTimecode);
    } else if (data.youtubeLink.includes('vimeo.com')) {
      imageSrc = getVimeoThumbnail(data.youtubeLink);
    }
  }

  const isLastElement = idx === dedupedShots.length - 1;
  const isInCollection = collectedIds.includes(data._id);

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
      <div className="relative aspect-video">
        {imageSrc ? (
          <Image
            alt={data?.title || "Video thumbnail"}
            src={imageSrc}
            layout="fill"
            objectFit="cover"
            className="rounded-md"
          />
        ) : (
          <div className="bg-gray-800 h-full w-full flex items-center justify-center rounded-md">
            <span className="text-gray-500 text-sm">No thumbnail available</span>
          </div>
        )}

        {/* Collection Flag - Clickable in both cases */}
        <button 
          className={`absolute top-2 right-2 z-10 ${
            isInCollection 
              ? 'text-blue-500' 
              : 'opacity-0 group-hover:opacity-100 text-gray-300 hover:text-blue-400'
          } transition-opacity duration-200`}
          onClick={(e) => {
            e.stopPropagation();
            setCurrentShotForCollections(data);
            setShowCollectionModal(true);
          }}
          aria-label={isInCollection ? "Modify collection" : "Add to collection"}
        >
          <FaFlag size={16} />
        </button>

        <div className="absolute inset-0 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-60 transition-opacity duration-500">
          <div className="text-white text-xs truncate">{data?.title}</div>
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
        <div className="flex justify-center my-8 max-w-[1820px] mx-auto">
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




<AnimatePresence>
  {showCollectionModal && currentShotForCollections && (
    <motion.div
      className="fixed inset-0  flex justify-center items-center z-[1000]"
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
              {collectonNames.map(collection => {
                // Find the collection item if it exists
                const collectionItem = myShotData?.data?.find(
                  item => item.shotId === currentShotForCollections._id && 
                         item.collectionName === collection.name
                );
                
                const isShotInCollection = !!collectionItem;
                
                return (
                  <div key={collection._id} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 flex-1">
                      <input
                        type="checkbox"
                        checked={isShotInCollection || currentClc === collection.name}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setCurrentClc(collection.name);
                          } else {
                            setCurrentClc('');
                          }
                        }}
                      />
                      <span>{collection.name}</span>
                    </label>
                    
                    {isShotInCollection && (
                      <button
                        onClick={async (e) => {
                          e.stopPropagation();
                          try {
                            await axiosInstance.delete(`/shot/collection/${collectionItem._id}`);
                            Swal.fire({
                              title: 'Removed!',
                              text: 'Shot removed from collection.',
                              icon: 'success',
                              background: '#171717',
                              color: '#ffffff'
                            });
                            refetchMyCollection();
                          } catch (error) {
                            console.error('Error removing from collection:', error);
                            Swal.fire({
                              title: 'Error!',
                              text: 'Failed to remove from collection.',
                              icon: 'error',
                              background: '#171717',
                              color: '#ffffff'
                            });
                          }
                        }}
                        className="text-red-500 hover:text-red-400 ml-2"
                      >
                        ×
                      </button>
                    )}

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
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No collections yet</p>
          )}



        </div>

        <AnimatePresence>
  {showCollectionModal && currentShotForCollections && (
    <motion.div
      className="fixed inset-0 flex justify-center items-center z-[1000]"
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
              {collectonNames.map(collection => {
                const collectionItem = myShotData?.data?.find(
                  item => item.shotId === currentShotForCollections._id && 
                         item.collectionName === collection.name
                );
                
                const isShotInCollection = !!collectionItem;
                
                return (
                  <div key={collection._id} className="flex items-center justify-between">
                    <label className="flex items-center space-x-2 flex-1">
                      <input
                        type="checkbox"
                        checked={isShotInCollection}
                        readOnly // Make it read-only since we handle clicks via the label
                        className="cursor-pointer"
                      />
                      <span 
                        className="cursor-pointer"
                        onClick={() => {
                          if (!isShotInCollection) {
                            handleAddToCollection(collection.name);
                          }
                        }}
                      >
                        {collection.name}
                      </span>
                    </label>
                    
                    {isShotInCollection && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleRemoveFromCollection(collectionItem._id);
                        }}
                        className="text-red-500 hover:text-red-400 ml-2"
                      >
                        ×
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <p className="text-gray-400">No collections yet</p>
          )}
        </div>

        <div className="mb-4">
          <h4 className="font-medium mb-2">Create new collection:</h4>
          <div className="flex space-x-2">
            <input
              type="text"
              value={newCollectionName}
              onChange={(e) => setNewCollectionName(e.target.value)}
              placeholder="Collection name"
              className="flex-1 bg-[#333] text-white px-3 py-2 rounded"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleCreateAndAdd();
                }
              }}
            />
            <button
              onClick={handleCreateAndAdd}
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
            Close
          </button>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>

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



