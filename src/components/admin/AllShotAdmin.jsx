'use client'
import { useGetShotsQuery, useDeleteShotMutation } from '@/redux/api/shot'
import { useSecureAxios } from '@/utils/Axios';
import { base_url, filters } from '@/utils/utils';
import Image from 'next/image';
import React, { useState, useRef, useEffect } from 'react'
import { FiTrash2, FiFilter, FiEdit, FiFilm } from 'react-icons/fi'
import Swal from 'sweetalert2';
import { useForm } from 'react-hook-form';
import { FaCamera, FaLightbulb } from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';

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
    if (cloudinaryUrl.hostname.includes('cloudinary.com') && url.includes('/video/')) {
      const pathParts = cloudinaryUrl.pathname.split('/');
      const uploadIndex = pathParts.findIndex(part => part === 'upload');
      
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

const simulatorType = [
  {
    name: "particles",
    items: ["Fire", "Smoke", "Explosion", "Dust"],
    title: 'Pyro / Volumetrics',
    icon: '🔥',
    heading: 'Pyro / Volumetrics'
  },
  {
    name: "liquids",
    items: ["Water", "Ocean", "Foam", "Bubbles", "Splashes", "Blood", "Paint"],
    title: 'Liquids / Fluids',
    icon: '💧',
    heading: 'Liquids / Fluids'
  },
  {
    name: "particles",
    items: ["Sparks", "Debris", "Rain", "Snow", "Ashes", "Magic", "Swarms"],
    title: 'Particles',
    icon: '✨',
    heading: 'Particles'
  },
  {
    name: "rigidbodies",
    items: ["Destruction", "Impact", "Collisions", "Breaking", "Falling Objects"],
    title: 'Rigid Bodies',
    icon: '🧱',
    heading: 'Rigid Bodies'
  },
  {
    name: "softBodies",
    items: ["Muscles system", "Anatomical deformation", "Squishy Objects"],
    title: 'Soft Bodies',
    icon: '🫧',
    heading: 'Soft Bodies'
  },
  {
    name: "clothgroom",
    items: ["Cloth Setup", "Cloth Dynamics", "Groom Setup", "Groom Dynamics"],
    title: 'Cloth & Groom',
    icon: '👕',
    heading: 'Cloth & Groom'
  },
  {
    name: "magicAbstract",
    items: ["Energy FX", "Plasma", "Portals", "Teleportation", "Glitches", "Hologram", "Conceptual"],
    title: 'Magic & Abstract',
    icon: '🔮',
    heading: 'Magic & Abstract'
  },
  {
    name: "crowd",
    items: ["Agent Simulation", "Crowd Dynamics", "Battles", "Swarms"],
    title: 'Crowd',
    icon: '👥',
    heading: 'Crowd'
  },
  {
    name: "mechanicsTech",
    items: ["Vehicles Crash", "Cables / Ropes", "Mechanical Parts"],
    title: 'Mechanics & Tech',
    icon: '⚙️',
    heading: 'Mechanics & Tech'
  },
  {
    name: "compositing",
    items: ["Volumetrics", "Liquids / Fluids", "Particles", "Base of FX compositing"],
    title: 'Compositing',
    icon: '🎨',
    heading: 'Compositing'
  },
];

export default function AllShotAdmin() {
  const [showDropDown, setShowDropDown] = useState(false);
  const [id, setId] = useState(null);
  const [selectedFilters, setSelectedFilters] = useState({});
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentShot, setCurrentShot] = useState(null);
  const axiosInstance = useSecureAxios();
  const scrollContainerRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);

  // Build query from selected filters
  const query = {};
  for (const key in selectedFilters) {
    if (selectedFilters[key].length > 0) {
      query[key] = selectedFilters[key];
    }
  }

  const { data, refetch, isLoading } = useGetShotsQuery(query);

  // React Hook Form for edit modal
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm();

  // Enhanced wheel scrolling with momentum
  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    let animationFrameId;
    let targetScrollLeft = container.scrollLeft;
    let isScrolling = false;

    const handleWheel = (e) => {
      if (Math.abs(e.deltaY) > 0) {
        e.preventDefault();
        
        // Apply momentum effect
        targetScrollLeft += e.deltaY * 3;
        
        // Clamp the target scroll position
        targetScrollLeft = Math.max(
          0,
          Math.min(targetScrollLeft, container.scrollWidth - container.clientWidth)
        );

        if (!isScrolling) {
          isScrolling = true;
          smoothScroll();
        }
      }
    };

    const smoothScroll = () => {
      const currentScroll = container.scrollLeft;
      const diff = targetScrollLeft - currentScroll;
      
      if (Math.abs(diff) > 1) {
        container.scrollLeft = currentScroll + diff * 0.2; // Smoothing factor
        animationFrameId = requestAnimationFrame(smoothScroll);
      } else {
        container.scrollLeft = targetScrollLeft;
        isScrolling = false;
      }
    };

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  const handleScroll = () => {
    if (!scrollContainerRef.current) return;
    
    const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
    setScrollPosition(scrollLeft);
    
    // Check if scrolled to end with 5px tolerance
    setIsScrolledToEnd(scrollLeft + clientWidth >= scrollWidth - 5);
  };

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2;
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => container.removeEventListener('scroll', handleScroll);
    }
  }, []);

  const dropDownHandler = (id) => {
    setShowDropDown(!showDropDown);
    setId(id);
  };

  const filterHandler = (e, groupName, value) => {
    const isChecked = e.target.checked;
    setSelectedFilters((prev) => {
      const currentValues = prev[groupName] || [];
      if (isChecked) {
        return { ...prev, [groupName]: [...currentValues, value] };
      } else {
        return { ...prev, [groupName]: currentValues.filter((v) => v !== value) };
      }
    });
  };

  const clearAllFilters = () => {
    setSelectedFilters({});
  };

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
        
        refetch();
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

  const openEditModal = (shot) => {
    setCurrentShot(shot);
    setIsEditModalOpen(true);
    
    reset({
      tags: shot.tags || [],
      focalLength: shot.focalLength || [],
      lightingConditions: shot.lightingConditions || [],
      videoType: shot.videoType || [],
      referenceType: shot.referenceType || [],
      videoSpeed: shot.videoSpeed || [],
      videoQuality: shot.videoQuality || [],
      simulationSize: shot.simulationSize || [],
      simulationSoftware: shot.simulationSoftware || [],
      simulationStyle: shot.simulationStyle || [],
      motionStyle: shot.motionStyle || [],
      emitterSpeed: shot.emitterSpeed || [],
      ...(shot.simulatorTypes ? 
        Object.fromEntries(
          Object.entries(shot.simulatorTypes).map(([key, value]) => 
            [`simulatorTypes.${key}`, value || []]
          )
        ) : {}
      )
    });
  };

  const handleEditSubmit = async(formData) => {
    try {
      await axios.put(`${base_url}/shot/update-shot/${currentShot._id}`, formData);
      
      refetch();
      
      Swal.fire({
        title: 'Success',
        text: 'Shot updated successfully',
        icon: 'success',
        background: '#171717',
        color: '#ffffff'
      });
      
      setIsEditModalOpen(false);
    } catch (error) {
      Swal.fire({
        title: 'Error',
        text: 'Failed to update shot',
        icon: 'error',
        background: '#171717',
        color: '#ffffff'
      });
      console.error('Update error:', error);
    }
  };

  if(isLoading){
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen mt-8 p-6 relative">
      <h1 className={`${isEditModalOpen ? 'hidden': 'block'} text-2xl font-bold text-white mb-6`}>Admin - All Shots</h1>
      
      {/* Filter Section */}
      <div className={`${isEditModalOpen ? 'hidden': 'block'} rounded-lg p-4 mb-6 bg-gray-900/50`}>
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <FiFilter className="text-primary" />
            <p className="text-white">FILTERS</p>
          </div>
          <button 
            onClick={clearAllFilters} 
            className="text-primary text-sm hover:underline"
          >
            Clear all
          </button>
        </div>

        <div className="flex flex-wrap gap-4">
          {filters.map((filterGroup, idx) => (
            <div key={idx} className="relative">
              <button
                onClick={() => dropDownHandler(filterGroup?.id)}
                className="bg-gray-800 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-gray-700 transition-colors"
              >
                {filterGroup.title}
                <span className={`transition-transform ${showDropDown && filterGroup.id === id ? 'rotate-180' : ''}`}>
                  ▼
                </span>
              </button>

              {showDropDown && filterGroup.id === id && (
                <motion.div 
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="absolute z-10 mt-2 w-56 bg-gray-800 rounded-md shadow-lg p-2"
                >
                  {filterGroup?.item.map((item, index) => {
                    const key = filterGroup.name;
                    const checked = selectedFilters[key]?.includes(item) ?? false;
                    return (
                      <label key={index} className="flex items-center gap-2 p-2 hover:bg-gray-700 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={(e) => filterHandler(e, key, item)}
                          className="form-checkbox h-4 w-4 text-primary rounded"
                        />
                        <span className="text-white capitalize">{item}</span>
                      </label>
                    );
                  })}
                </motion.div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Shots Grid */}
      <div className={`${isEditModalOpen ? 'hidden' : 'grid'} grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6`}>
        {data?.data?.map((shot) => {
          let imageSrc = shot?.imageUrl;
          
          if (!imageSrc && shot?.youtubeLink) {
            imageSrc = getYouTubeThumbnail(shot.youtubeLink);
          }
          
          if (!imageSrc && shot?.youtubeLink?.includes('cloudinary.com')) {
            imageSrc = getCloudinaryThumbnail(shot.youtubeLink);
          }

          return (
            <motion.div 
              key={shot._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-gray-900 rounded-lg overflow-hidden  transition-shadow relative group"
            >
              <div className="relative h-48 w-full">
                {imageSrc ? (
                  <Image 
                    src={imageSrc} 
                    alt={shot.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    priority={false}
                  />
                ) : (
                  <div className="bg-gray-800 h-full w-full flex items-center justify-center">
                    <span className="text-gray-500">No thumbnail</span>
                  </div>
                )}
                
                {/* Action Buttons */}
                <div className="absolute top-2 right-2 flex gap-2 opacity-0 
                
                 transition-opacity">
                  <motion.button
                    onClick={() => openEditModal(shot)}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-full"
                    title="Edit shot"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiEdit size={16} />
                  </motion.button>
                  <motion.button
                    onClick={() => handleDelete(shot._id, shot.title)}
                    className="bg-red-600 hover:bg-red-700 text-white p-2 rounded-full"
                    title="Delete shot"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    <FiTrash2 size={16} />
                  </motion.button>
                </div>

                {/* Views count */}
                <div className='absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded'>
                  {shot.click || 0} Views
                </div>
              </div>

              <div className="p-4">
                <h3 className="text-white font-medium truncate">{shot.title}</h3>
                <p className="text-gray-500 text-xs mt-2">
                  {new Date(shot.createdAt).toLocaleDateString()}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Animated Edit Modal */}
      <AnimatePresence>
        {isEditModalOpen && currentShot && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            className="fixed inset-0 flex items-center justify-center z-50 p-4 bg-black/80 backdrop-blur-sm"
          >
            <motion.div
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: 50, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-gray-800 rounded-lg max-w-6xl w-full max-h-[80vh] overflow-y-auto scrollbar-hide p-6 relative border border-gray-700"
            >
              <div className="flex justify-between items-center mb-4 top-0 bg-gray-800 pt-4 pb-2 z-10">
                <h2 className="text-xl font-bold text-white">Edit Shot: {currentShot.title}</h2>
                <motion.button 
                  onClick={() => setIsEditModalOpen(false)}
                  className="text-gray-400 cursor-pointer hover:text-white transition-colors"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <IoClose size={24} />
                </motion.button>
              </div>

              <form onSubmit={handleSubmit(handleEditSubmit)}>
                {/* Basic Information Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <FiFilm className="mr-2 text-blue-400" />
                    <h3 className="font-semibold">Basic Information</h3>
                  </div>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-white mb-1">Tags</label>
                    <div className="flex flex-wrap gap-2 mb-2">
                      <AnimatePresence>
                        {watch("tags")?.map((tag, index) => (
                          <motion.div
                            key={tag}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="bg-gray-700 px-3 py-1 rounded-full text-sm flex items-center"
                          >
                            {tag}
                            <button 
                              type="button"
                              onClick={() => {
                                const newTags = watch("tags").filter((_, i) => i !== index);
                                setValue("tags", newTags);
                              }}
                              className="ml-2 text-gray-400 cursor-pointer hover:text-white"
                            >
                              <IoClose size={16} />
                            </button>
                          </motion.div>
                        ))}
                      </AnimatePresence>
                    </div>
                    <input
                      type="text"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const value = e.target.value.trim();
                          if (value && !watch("tags")?.includes(value)) {
                            setValue("tags", [...(watch("tags") || []), value]);
                            e.target.value = '';
                          }
                        }
                      }}
                      placeholder="Add tag (press Enter)"
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 text-white focus:outline-none focus:ring-2 focus:ring-primary/50"
                    />
                  </div>
                </div>

                {/* Technical Details Section */}
                <div className="mb-8">
                  <div className="flex items-center mb-4">
                    <FaCamera className="mr-2 text-blue-400" />
                    <h3 className="font-semibold">Technical Details</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Focal Length */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Focal Length</h4>
                      <div className="space-y-2">
                        {["Ultra Wide", "Wide", "Medium", "Long", "Telephoto"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("focalLength")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Lighting Conditions */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Lighting Conditions</h4>
                      <div className="space-y-2">
                        {["Dawn", "Day", "Night", "Dusk", "Interior"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("lightingConditions")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Video Type */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Video Type</h4>
                      <div className="space-y-2">
                        {["Reference", "Tuto", "Breakdown"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("videoType")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Reference Type */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Reference Type</h4>
                      <div className="space-y-2">
                        {["Real Video", "2D", "3D", "Full CGI", "Live Action"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("referenceType")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Video Speed */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Video Speed</h4>
                      <div className="space-y-2">
                        {["Slow Motion", "Normal", "Accelerated"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("videoSpeed")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>

                    {/* Video Quality */}
                    <motion.div 
                      className="bg-gray-700 p-4 rounded-lg"
                      whileHover={{ y: -2 }}
                    >
                      <h4 className="text-sm font-medium mb-2">Video Quality</h4>
                      <div className="space-y-2">
                        {["Low", "Medium", "High"].map((item) => (
                          <label key={item} className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="checkbox"
                              value={item}
                              {...register("videoQuality")}
                              className="rounded border-gray-600 text-primary focus:ring-primary"
                            />
                            <span className="text-sm text-gray-300">{item}</span>
                          </label>
                        ))}
                      </div>
                    </motion.div>
                  </div>
                </div>

                {/* Simulation Type Section */}
                <section
                  onTouchStart={handleTouchStart}
                  onTouchMove={handleTouchMove}
                  onTouchEnd={handleTouchEnd}
                  className="mb-8"
                >
                  <div className="flex items-center mb-4">
                    <FaLightbulb className="mr-2 text-blue-400" />
                    <h2 className="font-semibold">Simulator Type</h2>
                  </div>

                  <div className="relative">
                    {/* Left fade - only show when scrolled to the right */}
                    <div 
                      className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                        scrollPosition > 10 ? 'opacity-100' : 'opacity-0'
                      }`}
                    ></div>
                    
                    {/* Right fade - only show when not scrolled all the way to the end */}
                    <div 
                      className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                        isScrolledToEnd ? 'opacity-0' : 'opacity-100'
                      }`}
                    ></div>

                    <div 
                      className="bg-gray-700 rounded-md shadow-lg p-2 overflow-x-auto scrollbar-hide"
                      ref={scrollContainerRef}
                      onScroll={handleScroll}
                      style={{
                        scrollBehavior: 'smooth',
                        scrollSnapType: 'x mandatory'
                      }}
                    >
                      <div className="flex gap-4 w-max">
                        {simulatorType.map((category, idx) => {
                          const currentValues = watch(`simulatorTypes.${category.name}`) || [];
                          const cleanValues = currentValues.filter(v => v !== null && v !== undefined);
                          const isHeadingSelected = cleanValues.includes(category.heading);
                          const hasItemsSelected = cleanValues.some(val => 
                            category.items.includes(val)
                          );
                          
                          return (
                            <motion.div
                              key={idx}
                              whileHover={{ scale: 1.02 }}
                              whileTap={{ scale: 0.98 }}
                              className={`rounded-lg p-4 w-64 flex-shrink-0 shadow-md border transition-all scroll-snap-align-start ${
                                isHeadingSelected || hasItemsSelected
                                  ? "bg-[#2a3a4a] border-blue-400"
                                  : "bg-[#1E2A3A] border-gray-600"
                              }`}
                            >
                              <h3 
                                onClick={() => {
                                  if (isHeadingSelected) {
                                    setValue(`simulatorTypes.${category.name}`, []);
                                  } else {
                                    setValue(`simulatorTypes.${category.name}`, 
                                      [...cleanValues, category.heading]
                                    );
                                  }
                                }}
                                className={`font-medium text-sm border-b pb-1 cursor-pointer ${
                                  isHeadingSelected || hasItemsSelected 
                                    ? "border-blue-400" 
                                    : "border-gray-500"
                                }`}
                              >
                                {category.title}
                              </h3>
                              <div className="space-y-1">
                                {category.items.map((item, i) => {
                                  const isItemSelected = cleanValues.includes(item);
                                  return (
                                    <div key={i} className="flex mt-2 items-center group">
                                      <input
                                        type="checkbox"
                                        id={`${category.name}-${i}`}
                                        checked={isItemSelected}
                                        onChange={(e) => {
                                          if (e.target.checked) {
                                            const newValues = [...cleanValues, item];
                                            if (!newValues.includes(category.heading)) {
                                              newValues.push(category.heading);
                                            }
                                            setValue(`simulatorTypes.${category.name}`, newValues);
                                          } else {
                                            setValue(`simulatorTypes.${category.name}`,
                                              cleanValues.filter(v => v !== item)
                                            );
                                          }
                                        }}
                                        className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                      />
                                      <label
                                        htmlFor={`${category.name}-${i}`}
                                        className={`ml-3 block text-xs cursor-pointer ${
                                          isItemSelected || isHeadingSelected
                                            ? "text-gray-300 group-hover:text-white"
                                            : "text-gray-300"
                                        }`}
                                      >
                                        {item}
                                      </label>
                                    </div>
                                  );
                                })}
                              </div>
                            </motion.div>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Submit Buttons */}
                <motion.div 
                  className="flex justify-end gap-4 mt-6 bottom-0 bg-gray-800 pt-4 pb-2"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <motion.button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 bg-gray-600 cursor-pointer hover:bg-gray-500 rounded-md text-white transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Cancel
                  </motion.button>
                  <motion.button
                    type="submit"
                    className="px-4 py-2 bg-primary cursor-pointer hover:bg-primary/90 rounded-md text-white transition-colors"
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    Save Changes
                  </motion.button>
                </motion.div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {data?.data?.length === 0 && (
        <div className="text-center py-12 text-gray-400">
          No shots found matching your filters
        </div>
      )}
    </div>
  );
}