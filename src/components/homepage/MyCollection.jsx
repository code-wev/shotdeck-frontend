'use client'

import Image from 'next/image';
import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import { useGetMyShotQuery, useGetMyShotSingleQuery } from '@/redux/api/shot';
import { useSession } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import { FaTrash, FaPlus, FaEdit } from 'react-icons/fa';
import { useSecureAxios } from '@/utils/Axios';
import Link from 'next/link';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Swal from 'sweetalert2';
import { MdDeleteForever } from 'react-icons/md';

export default function MyCollection() {
  const user = useSession();
  const id = user?.data?.user?.id;
  const { data, isFetching, isError, refetch } = useGetMyShotQuery(id);
  
  const collectionNameAll = useGetMyShotSingleQuery(id);
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [selectedShot, setSelectedShot] = useState(null);
  const [isDetails, setIsDetails] = useState(false);
  const [selectedCollection, setSelectedCollection] = useState('All');
  const pathname = usePathname();
  const axiosInstance = useSecureAxios();
  const [showCreateCollection, setShowCreateCollection] = useState(false);
  const [newCollectionName, setNewCollectionName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const userRole= user?.data?.user?.role;

  useEffect(() => {
    AOS.init({ duration: 1000, once: true });
    if (pathname.includes('my-collection')) {
      setIsDetails(true);
    }
  }, [pathname]);

  const allCollectionNames = collectionNameAll?.data?.data || [];

  // Group shots by collectionName
  const collections = data?.data?.reduce((acc, item) => {
    const collectionName = item.collectionName || 'Uncategorized';
    if (!acc[collectionName]) {
      acc[collectionName] = [];
    }
    acc[collectionName].push(item);
    return acc;
  }, {});

  // Create an array of all unique collection names from both sources
  const allUniqueCollectionNames = [
    'All',
    ...new Set([
      ...Object.keys(collections || {}),
      ...allCollectionNames.map(c => c.name)
    ])
  ].sort((a, b) => {
    if (a === 'Uncategorized') return 1;
    if (b === 'Uncategorized') return -1;
    return a.localeCompare(b);
  });

  // Filter shots based on selected collection
// Filter shots based on selected collection and search query

const filteredData = (isDetails
  ? selectedCollection === 'All'
    ? data?.data || []
    : collections?.[selectedCollection] || []
  : (selectedCollection === 'All' ? data?.data || [] : collections?.[selectedCollection] || [])?.slice(0, 10));

  
  const finalData = filteredData?.filter(item => {
    if (!searchQuery.trim()) return true;
    
    const shotData = item?.data || {};
    const searchLower = searchQuery.toLowerCase();
    
    // Check title
    if (shotData.title?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    // Check tags (if they exist)
   if(shotData.tags?.some(tag => 
    typeof tag === 'string' && tag.toLowerCase().includes(searchLower)) ){return true}
    
    // Check collection name
    if (item.collectionName?.toLowerCase().includes(searchLower)) {
      return true;
    }
    
    return false;
  })

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

  function getVimeoThumbnail(url) {
    try {
      const vimeoUrl = new URL(url);
      const videoId = vimeoUrl.pathname.split('/').pop();
      if (videoId) {
        return `https://vumbnail.com/${videoId}.jpg`;
      }
    } catch (err) {
      console.error('Error parsing Vimeo URL:', err);
    }
    return null;
  }



  const handleDelete = async (id) => {
    try {
      Swal.fire({
        title: 'Are you sure?',
        text: "You won't be able to revert this!",
        icon: 'warning',
        showCancelButton: true,
              background: '#171717',
                 confirmButtonColor: '#d33',
          cancelButtonColor: '#3085d6',
          color: '#ffffff',
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Yes, delete it!'
      }).then(async (result) => {
        if (result.isConfirmed) {
          const resp = await axiosInstance.delete(`/shot/collection/${id}`);
         await Swal.fire({
              title: 'Deleted!',
              text: 'Your shot has been deleted.',
              icon: 'success',
              background: '#171717',
              color: '#ffffff',
              confirmButtonColor: '#d33',
            });
          refetch();
        }
      });
    } catch (error) {
      console.error('Error deleting shot:', error);
       Swal.fire({
         title: 'Error!',
         text: 'Failed to delete the shot.',
         icon: 'error',
         background: '#171717',
         color: '#ffffff',
         confirmButtonColor: '#d33',
       });
    }
  };







  
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

  function handleTimecodeClick(timeString, videoUrl) {
    const timeParts = timeString.split(':');
    const seconds = (+timeParts[0]) * 60 + (+timeParts[1]);
    
    if (videoUrl.includes('youtu')) {
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer) {
        const embedUrl = getYouTubeEmbedUrl(videoUrl);
        videoPlayer.src = `${embedUrl}?start=${seconds}&autoplay=1`;
      }
    } else if (videoUrl.includes('vimeo.com')) {
      const videoPlayer = document.getElementById('video-player');
      if (videoPlayer && videoPlayer.contentWindow) {
        videoPlayer.contentWindow.postMessage({
          method: 'setCurrentTime',
          value: seconds
        }, 'https://player.vimeo.com');
      }
    } else {
      const videoPlayer = document.getElementById('cloudinary-video');
      if (videoPlayer) {
        videoPlayer.currentTime = seconds;
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

 

 const handleDeleteCollection = async (collectionName) => {
  try {
    // First check if collection has any shots
    const hasShots = data?.data?.some(item => 
      (item.collectionName || 'Uncategorized') === collectionName
    );

    if (hasShots) {
      await Swal.fire({
        title: 'Cannot Delete Collection',
        text: 'Please delete all shots in this collection first before deleting the collection itself.',
        icon: 'error',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#d33',
      });
      return;
    }

    // Proceed with deletion if no shots exist
    const result = await Swal.fire({
      title: 'Are you sure?',
      text: `Delete collection "${collectionName}"?`,
      icon: 'warning',
      showCancelButton: true,
      background: '#171717',
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      color: '#ffffff',
      confirmButtonText: 'Yes, delete it!'
    });

    if (result.isConfirmed) {
      await axiosInstance.delete(`${base_url}/collection/delete/delete-collection`, {
        data: { name: collectionName, userId: id }
      });

      await Swal.fire({
        title: 'Deleted!',
        text: `Collection "${collectionName}" has been deleted.`,
        icon: 'success',
        background: '#171717',
        color: '#ffffff',
        confirmButtonColor: '#d33',
      });

      // Refetch both collections and shots
      refetch();
      collectionNameAll.refetch();
    }

  } catch (error) {
    console.error('Error deleting collection:', error);
    Swal.fire({
      title: 'Error!',
      text: error.response?.data?.message || 'Failed to delete collection',
      icon: 'error',
      background: '#171717',
      color: '#ffffff',
      confirmButtonColor: '#d33',
    });
  }
};

  const createNewCollection = async () => {
    if (!newCollectionName.trim()) {
      Swal.fire({
        title: 'Error',
        text: 'Please enter a collection name',
        icon: 'error',
      });
      return;
    }

    try {
      console.log('Creating collection:', {
        userId: id,
        name: newCollectionName
      });

      const response = await axiosInstance.post(`/collection/save-collection`, {
        userId: id,
        name: newCollectionName
      });

      if (response.status === 201) {
        Swal.fire({
          title: 'Success',
          text: 'Collection created successfully',
          icon: 'success',
        });
        refetch();
        collectionNameAll.refetch();
        setNewCollectionName('');
        setShowCreateCollection(false);
      }
    } catch (error) {
      console.error('Error creating collection:', error);
      Swal.fire({
        title: 'Error',
        text: error.response?.data?.message || 'Failed to create collection',
        icon: 'error',
      });
    }
  };

 const renderCollectionTabs = () => {
  return allUniqueCollectionNames.map((name, index) => {
    const shotCount = collections?.[name]?.length || 0;
    const isDeletable = name !== 'All' && name !== 'Uncategorized';
    
    return (
      <div key={`${name}-${index}`} className="relative group">
        <motion.button
          onClick={() => setSelectedCollection(name)}
          className={`px-6 py-2 rounded-full text-sm font-semibold transition-all duration-300 ${
            selectedCollection === name
              ? 'bg-yellow-400 text-black'
              : 'bg-gray-800 text-white hover:bg-gray-700'
          }`}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >


          { name === 'All'? 'All' :    ` ${name} (${shotCount})`}
      
        </motion.button>
        
        {isDeletable && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDeleteCollection(name);
            }}
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
            title={`Delete ${name} collection`}
          >
            <FaTrash className="text-xs" />
          </button>
        )}
      </div>
    );
  });
};

  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-64 bg-gradient-to-b from-gray-900 to-black">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-yellow-400"></div>
      </div>
    );
  }

  if (isError) {
    return <h4 className="text-center py-8 text-white bg-gray-900">Something went wrong!</h4>;
  }

  return (
    <div className='md:px-8 py-16 mt-8 bg-gradient-to-b from-gray-900 to-black min-h-screen'>



      {/* Search Input */}
<div className="w-full max-w-md mx-auto mb-8 relative" data-aos="fade-up">
  <div className="relative">
    <input
      type="text"
      placeholder="Search by title, tags, or collection..."
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
      className="w-full px-4 py-3 bg-gray-800 text-white rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-400 pl-10 pr-10"
    />
    <svg
      className="absolute left-3 top-3.5 h-5 w-5 text-gray-400"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 20 20"
      fill="currentColor"
    >
      <path
        fillRule="evenodd"
        d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
        clipRule="evenodd"
      />
    </svg>
    {searchQuery && (
      <button
        onClick={() => setSearchQuery('')}
        className="absolute right-3 top-3.5 text-gray-400 hover:text-white"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-5 w-5"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
            clipRule="evenodd"
          />
        </svg>
      </button>
    )}
  </div>
</div>


{finalData?.length === 0 ? (
  <div className="col-span-full text-center py-12">
    {searchQuery ? (
      <>
        <h3 className="text-xl text-gray-400">No shots found matching "{searchQuery}"</h3>
        <button 
          onClick={() => setSearchQuery('')} 
          className="mt-2 text-yellow-400 hover:underline"
        >
          Clear search
        </button>
      </>
    ) : (
      <>
        <h3 className="text-xl text-gray-400">No shots found in this collection</h3>
        {selectedCollection !== 'All' && (
          <p className="text-gray-500 mt-2">
            The "{selectedCollection}" collection is empty. Add some shots to it!
          </p>
        )}
      </>
    )}
  </div>
) : null}


      <div className="px-4 max-w-[1820px] mx-auto">
        {/* Collection Tabs */}
        <div className="flex flex-wrap justify-center gap-4 mb-8" data-aos="fade-up" data-aos-delay="100">
          {renderCollectionTabs()}
          
          {/* Add Collection Button */}
          <motion.button
            onClick={() => setShowCreateCollection(true)}
            className="px-4 py-2 rounded-full text-sm font-semibold bg-green-500 text-white hover:bg-green-600 flex items-center gap-2"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <FaPlus /> New
          </motion.button>
        </div>

        {/* Create Collection Modal */}
        <AnimatePresence>
          {showCreateCollection && (
            <motion.div
              className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCreateCollection(false)}
            >
              <motion.div
                className="bg-gray-800 rounded-lg p-6 w-full max-w-md"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
                onClick={(e) => e.stopPropagation()}
              >
                <h3 className="text-xl font-bold text-white mb-4">Create New Collection</h3>
                <input
                  type="text"
                  value={newCollectionName}
                  onChange={(e) => setNewCollectionName(e.target.value)}
                  placeholder="Collection name"
                  className="w-full px-4 py-2 bg-gray-700 text-white rounded mb-4 focus:outline-none focus:ring-2 focus:ring-yellow-400"
                />
                <div className="flex justify-end gap-3">
                  <button
                    onClick={() => setShowCreateCollection(false)}
                    className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={createNewCollection}
                    className="px-4 py-2 bg-yellow-500 text-black rounded hover:bg-yellow-600"
                  >
                    Create
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Shot Grid */}
        <div className="grid relative grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {finalData?.length > 0 ? (
            finalData.map((item, index) => {
              const shotData = item.data;
              let imageSrc;

              // Priority 1: imageUrlThubnail
              if (shotData.imageUrlThubnail) {
                imageSrc = shotData.imageUrlThubnail[0];
              }

              // Priority 2: imageUrl
              if (!imageSrc && shotData.imageUrl) {
                imageSrc = shotData.imageUrl;
              }

              // Priority 3: Generate from video link
              if (!imageSrc && shotData.youtubeLink) {
                if (shotData.youtubeLink.includes('cloudinary.com')) {
                  imageSrc = getCloudinaryThumbnail(shotData.youtubeLink, shotData.thumbnailTimecode);
                } else if (shotData.youtubeLink.includes('youtu')) {
                  imageSrc = getYouTubeThumbnail(shotData.youtubeLink, shotData.thumbnailTimecode);
                } else if (shotData.youtubeLink.includes('vimeo.com')) {
                  imageSrc = getVimeoThumbnail(shotData.youtubeLink);
                }
              }

              return (
                <motion.div
                  key={item._id}
                  className="relative group bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-2xl transition-shadow duration-300"
                  data-aos="fade-up"
                  data-aos-delay={100 + index * 100}
                  onClick={() => {
                    setSelectedShot(shotData);
                    setModalIsOpen(true);
                    handleClick(item._id);
                  }}
                  whileHover={{ y: -5 }}
                >
                  {imageSrc ? (
                    <Image
                      alt={shotData.title}
                      src={imageSrc}
                      height={300}
                      width={300}
                      className="object-cover w-full h-48 transition-transform duration-300 group-hover:scale-105"
                    />
                  ) : (
                    <div className="bg-gray-700 h-48 w-full flex items-center justify-center">
                      <span className="text-gray-400 text-sm">No thumbnail available</span>
                    </div>
                  )}
                  <h1 
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(item._id);
                    }} 
                    className='absolute top-2 bg-gray-50 rounded-full p-2 cursor-pointer right-4 text-red-600'
                  >
                    <MdDeleteForever className='text-xl'/>
                  </h1>
                </motion.div>
              );
            })
          ) : (
            <div className="col-span-full text-center py-12">
              <h3 className="text-xl text-gray-400">No shots found in this collection</h3>
              {selectedCollection !== 'All' && (
                <p className="text-gray-500 mt-2">
                  The "{selectedCollection}" collection is empty. Add some shots to it!
                </p>
              )}
            </div>
          )}
        </div>

        {isDetails ? null : (
          <Link href={'/my-collection'} className="text-yellow-400 flex justify-center text-center w-full mt-8 text-lg font-semibold hover:underline" data-aos="fade-up">
            See More
          </Link>
        )}

        {/* Shot Details Modal */}
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
    </div>
  );
}