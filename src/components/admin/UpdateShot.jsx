'use client'
import { useGetSingleShotQuery } from '@/redux/api/shot';
import { useParams } from 'next/navigation'
import React, { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiUpload,
  FiFilm,
  FiYoutube,
  FiImage,
  FiClock,
  FiChevronDown,
  FiAlertTriangle,
  FiX,
} from "react-icons/fi";
import { FaPalette, FaCamera, FaLightbulb } from "react-icons/fa";
import { GiFilmStrip, GiClapperboard } from "react-icons/gi";
import { MdPeople, MdColorLens, MdLocationOn } from "react-icons/md";
import axios from "axios";
import { base_url } from "@/utils/utils";
import Swal from "sweetalert2";
import { useSecureAxios } from "@/utils/Axios";
import { IoClose } from "react-icons/io5";
import { IoIosColorPalette } from "react-icons/io";
import { AiOutlineMenu } from "react-icons/ai";
import { LiaWindowCloseSolid } from "react-icons/lia";

export default function UpdateShot() {
  const { id } = useParams();
  const { data: shotData, refetch } = useGetSingleShotQuery(id);
  const simulationScrollRef = useRef(null);
  const axiosInstance = useSecureAxios();
  
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      focalLength: [],
      lightingConditions: [],
      videoType: [],
      referenceType: [],
      videoSpeed: [],
      videoQuality: [],
      simulatorTypes: {
        particles: [],
        rigidbodies: [],
        softBodies: [],
        clothgroom: [],
        magicAbstract: [],
        crowd: [],
        mechanicsTech: [],
        compositing: [],
      },
      tags: [],
    },
  });

  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [staticImage, setStaticImage] = useState(null);
  const [tag, setTag] = useState("");
  const [videoPreview, setVideoPreview] = useState(null);
  const [isYouTubeLink, setIsYouTubeLink] = useState(false);
  const [isVimeoLink, setIsVimeoLink] = useState(false);
  const [timecodes, setTimecodes] = useState([]);
  const [currentDesc, setCurrentDesc] = useState("");
  const [currentTime, setCurrentTime] = useState("");
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailTimecode, setThumbnailTimecode] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState(null);
  const [allTags, setAllTags] = useState([]);
  const [thumbnailSource, setThumbnailSource] = useState("default");
  const [videoElement, setVideoElement] = useState(null);
  const [generateLoading, setGenerateLoading] = useState(false);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [scrollPosition, setScrollPosition] = useState(0);
  const [isScrolledToEnd, setIsScrolledToEnd] = useState(false);
  const scrollContainerRef = useRef(null);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const [error, setShowError] = useState('');
  const [selectedImageFile, setSelectedImageFile] = useState(null);
  const [isDragging, setIsDragging] = useState(false);

  // Bunny.net configuration
  const STORAGE_ZONE = "shot-deck";
  const ACCESS_KEY = "71fafdbb-d074-490c-b27b075a536b-69fc-46b0";
  const REGION_PREFIX = "";
  const PULL_BASE = "storage.bunnycdn.com" || "";

  const handleEditSubmit = async(formData) => {
    try {
      const updatedData = await axios.put(`${base_url}/shot/update-shot/${id}`, formData);
      console.log(updatedData, 'This is updated kroar por data')
      
      refetch();
      
      Swal.fire({
        title: 'Success',
        text: 'Shot updated successfully',
        icon: 'success',
        background: '#171717',
        color: '#ffffff'
      });
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



  const generateThumbnailFromTimecode = async () => {
    const videoUrl = watch("youtubeLink");
    const time = thumbnailTimecode;
  
    // Validate time format
    const timeRegex = /^(?:(\d{1,2}):)?([0-5]?\d):([0-5]\d)$/;
    if (!timeRegex.test(time)) {
      Swal.fire({
        title: "Error",
        text: "Invalid time format. Use MM:SS or HH:MM:SS",
        icon: "error",
      });
      return;
    }
  
    if (!time) return;
  
    try {
      setIsUploading(true);
      setGenerateLoading(true);
  
      let videoDuration = 0;
      let timeInSeconds = 0;
  
      // Convert timecode to seconds first
      const timeParts = time.split(':').map(Number);
      timeInSeconds = timeParts.length === 2 
        ? timeParts[0] * 60 + timeParts[1] 
        : timeParts[0] * 3600 + timeParts[1] * 60 + timeParts[2];
  
      // Get video duration based on source
      if (isYouTubeLink && videoUrl) {
        // For YouTube videos - use API to get duration
        const videoId = getYouTubeId(videoUrl);
        if (videoId) {
          try {
            const response = await fetch(`${base_url}/video/duration?videoId=${videoId}`);
            if (response.ok) {
              const data = await response.json();
              videoDuration = data.duration || 0;
            }
          } catch (error) {
            console.error("Error fetching YouTube duration:", error);
          }
        }
      } 
      else if (isVimeoLink && videoUrl) {
        // For Vimeo videos - use API to get duration
        const videoId = getVimeoId(videoUrl);
        if (videoId) {
          try {
            const response = await fetch(`${base_url}/video/duration?vimeoId=${videoId}`);
            if (response.ok) {
              const data = await response.json();
              videoDuration = data.duration || 0;
            }
          } catch (error) {
            console.error("Error fetching Vimeo duration:", error);
          }
        }
      } 
      else if (videoPreview) {
        // For local videos - use video element to get duration
        const video = document.createElement('video');
        video.src = videoPreview;
        video.crossOrigin = 'anonymous';
        
        try {
          await new Promise((resolve, reject) => {
            video.onloadedmetadata = () => {
              videoDuration = video.duration;
              resolve();
            };
            video.onerror = () => reject(new Error("Failed to load video metadata"));
            // Some browsers need this to trigger loading
            video.load();
          });
        } catch (error) {
          console.error("Error getting local video duration:", error);
        }
      }
  
      // Check if we got a valid duration and if timecode exceeds it
      if (videoDuration > 0 && timeInSeconds > videoDuration) {
        Swal.fire({
          title: "Error",
          text: `Timecode exceeds video duration`,
          icon: "error",
        });
        return;
      }
  
      // Proceed with thumbnail generation
      let imageUrl;
      
      if (isYouTubeLink && videoUrl) {
        const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(videoUrl)}&timestamp=${time}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Timecode exceeds video duration");
        const blob = await response.blob();
        const fileName = `${Date.now()}_thumb.jpg`;
        imageUrl = await uploadBlobToBunny(blob, fileName);
      } 
      else if (isVimeoLink && videoUrl) {
        const apiUrl = `${base_url}/shot/dlpv?url=${encodeURIComponent(videoUrl)}&timestamp=${time}`;
        const response = await fetch(apiUrl);
        if (!response.ok) throw new Error("Vimeo API request failed");
        const blob = await response.blob();
        const fileName = `${Date.now()}_thumb.jpg`;
        imageUrl = await uploadBlobToBunny(blob, fileName);
      } 
      else if (videoPreview) {
        const canvas = document.createElement('canvas');
        const video = document.createElement('video');
        video.src = videoPreview;
        
        // Wait for video to load
        await new Promise((resolve, reject) => {
          video.onloadedmetadata = resolve;
          video.onerror = () => reject(new Error("Failed to load video"));
        });
  
        // Seek to timecode
        video.currentTime = timeInSeconds;
        await new Promise((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Seeking timed out")), 5000);
          video.onseeked = () => {
            clearTimeout(timeout);
            resolve();
          };
          video.onerror = () => {
            clearTimeout(timeout);
            reject(new Error("Failed to seek to timecode"));
          };
        });
  
        // Capture frame
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
  
        // Convert to image URL
        imageUrl = await new Promise((resolve, reject) => {
          canvas.toBlob(async (blob) => {
            if (!blob) {
              reject(new Error("Failed to create thumbnail image"));
              return;
            }
            try {
              const fileName = `${Date.now()}_thumb.jpg`;
              const url = await uploadBlobToBunny(blob, fileName);
              resolve(url);
            } catch (error) {
              reject(error);
            }
          }, 'image/jpeg', 0.9); // 90% quality
        });
      }
  
      if (imageUrl) {
        setVideoThumbnail(imageUrl);
        setImagePreview(null);
        setStaticImage(null);
        setThumbnailSource('default');
      }
  
    } catch (error) {
      console.error("Error generating thumbnail:", error);
      Swal.fire({
        title: "Error",
        text: error.message || "Failed to generate thumbnail from timecode",
        icon: "error",
      });
    } finally {
      setIsUploading(false);
      setGenerateLoading(false);
    }
  };

  const getVimeoId = (url) => {
    const regExp =
      /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = url?.match(regExp) || null;
    return match ? match[5] : null;
  };

  const handleAddTimecode = async () => {
    // This function is now disabled as per requirements
    return;
  };

  const handleScroll = useCallback(() => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current;
      const isAtEnd = scrollLeft + clientWidth >= scrollWidth;
      
      // Avoid unnecessary state updates
      setScrollPosition(prev => prev !== scrollLeft ? scrollLeft : prev);
      setIsScrolledToEnd(prev => prev !== isAtEnd ? isAtEnd : prev);
    }
  }, []);

  const useYouTubeThumbnail = async () => {
    const videoUrl = watch("youtubeLink");
    if (!videoUrl) return;

    try {
      setIsUploading(true);
      setGenerateLoading(true);

      if (isYouTubeLink) {
        const videoId = getYouTubeId(videoUrl);
        if (!videoId) return;
        const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
        setVideoThumbnail(thumbnailUrl);
        setThumbnailSource('default');
      } else if (isVimeoLink) {
        const vmId = getVimeoId(videoUrl);
        if (!vmId) return;
        setVideoThumbnail(`https://vumbnail.com/${vmId}.jpg`);
        setThumbnailSource('default');
      }
      
      setImagePreview(null);
      setStaticImage(null);
    } catch (error) {
      console.error("Error getting platform thumbnail:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to get video platform thumbnail",
        icon: "error",
      });
    } finally {
      setIsUploading(false);
      setGenerateLoading(false);
    }
  };

  const handleHorizontalScroll = (e) => {
    if (scrollContainerRef.current) {
      e.preventDefault();
      // Use smooth scrolling behavior
      scrollContainerRef.current.scrollBy({
        left: e.deltaY * 0.5, // Reduced scroll amount for smoother effect
        behavior: 'smooth'
      });
    }
  };

  const getYouTubeId = (url) => {
    try {
      if (url.includes("/shorts/")) {
        const shortsId = url.split("/shorts/")[1]?.split("?")[0]?.split("/")[0];
        if (shortsId?.length === 11) return shortsId;
      }

      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|\/v\/|e\/|watch\?.*v=)([^#&?]*).*/;
      const match = url.match(regExp);
      return match && match[2]?.length === 11 ? match[2] : null;
    } catch (err) {
      console.error("Error parsing YouTube URL:", err);
      return null;
    }
  };

  const suggestionItems =
    typeof window !== "undefined" && localStorage.getItem("AllTags")
      ? JSON.parse(localStorage.getItem("AllTags"))
      : [];

  const tagHandler = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const value = e.target.value.trim();
      if (value && !allTags.includes(value)) {
        setAllTags((prevTags) => [...prevTags, value]);
        setTag("");
      }
    }
  };

  useEffect(() => {
    // When video source changes, reset to default thumbnail if YouTube/Vimeo
    if (isYouTubeLink || isVimeoLink) {
      setThumbnailSource("default");
      useYouTubeThumbnail();
    }
  }, [isYouTubeLink, isVimeoLink]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
      return () => {
        container.removeEventListener('scroll', handleScroll);
      };
    }
  }, [handleScroll]);

  const clearVideoRelatedStates = () => {
    setTimecodes([]);
    setVideoThumbnail(null);
    setThumbnailTimecode("");
    setThumbnailSource("default");
    setImagePreview(null);
    setSelectedImageFile(null);
  };

  const uploadBlobToBunny = async (blob, fileName) => {
    const endpoint = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(fileName)}`;
    
    const response = await axios.put(endpoint, blob, {
      headers: { 
        AccessKey: ACCESS_KEY,
        "Content-Type": "image/jpeg"
      }
    });

    if (response.status !== 201) {
      throw new Error("Failed to upload thumbnail");
    }

    return `https://shot-deck.b-cdn.net/${encodeURIComponent(fileName)}`;
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleScroll();
    }, 100);
    return () => clearTimeout(timer);
  }, [handleScroll]);

  const handleTouchStart = (e) => {
    setIsDragging(true);
    setStartX(e.touches[0].pageX);
    setScrollLeft(scrollContainerRef.current.scrollLeft);
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const x = e.touches[0].pageX;
    const walk = (x - startX) * 2; // Adjust multiplier for sensitivity
    scrollContainerRef.current.scrollLeft = scrollLeft - walk;
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  const removeTimecode = async (index) => {
    // This function is now disabled as per requirements
    return;
  };

  const handleReorder = (fromIndex, toIndex) => {
    // This function is now disabled as per requirements
    return;
  };

  useEffect(() => {
    const url = watch("youtubeLink");
    if (!url) {
      clearVideoRelatedStates();
      return;
    }
  
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
  
    if (youtubeRegex.test(url)) {
      setIsYouTubeLink(true);
      setIsVimeoLink(false);
      setVideoPreview(null);
      clearVideoRelatedStates();
      // Set thumbnail source to default and generate thumbnail
      setThumbnailSource("default");
      useYouTubeThumbnail();
      return;
    }
  
    if (vimeoRegex.test(url)) {
      setIsVimeoLink(true);
      setIsYouTubeLink(false);
      setVideoPreview(null);
      clearVideoRelatedStates();
      // Set thumbnail source to default and generate thumbnail
      setThumbnailSource("default");
      useYouTubeThumbnail();
      return;
    }
  
    // Check for Bunny.net video link (e.g., .mp4, .webm, .mov, etc.)
    const bunnyVideoRegex = /^https:\/\/shot-deck\.b-cdn\.net\/.+\.(mp4|webm|mov|ogg)$/i;
    if (bunnyVideoRegex.test(url)) {
      setIsYouTubeLink(false);
      setIsVimeoLink(false);
      setVideoPreview(url); // <-- This will show the video in the <video> tag
      clearVideoRelatedStates();
      return;
    }
  
    setIsYouTubeLink(false);
    setIsVimeoLink(false);
    setVideoPreview(null);
    clearVideoRelatedStates();
  }, [watch("youtubeLink")]);

  // useEffect(() => {
  //   setValue('tags', allTags);
  // }, [allTags, setValue]);

  const resetForm = async () => {
    try {
      await Promise.all(
        timecodes.map(async (timecode) => {
          if (timecode.image) {
            const urlParts = timecode.image.split('/');
            const fileName = decodeURIComponent(urlParts[urlParts.length - 1]);
            const endpoint = `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}/${fileName}`;
            await axios.delete(endpoint, {
              headers: { 
                AccessKey: ACCESS_KEY
              }
            });
          }
        })
      );
    } catch (error) {
      console.error("Error cleaning up timecode images:", error);
    }

    reset();
    setSelectedVideo(null);
    setVideoPreview(null);
    clearVideoRelatedStates(); // Using our new function here
    setSelectedCategories([]);
  };

  // Pre-fill form when data is loaded
  useEffect(() => {
    if (shotData?.data) {
      const data = shotData.data;
      console.log('Filling form with data:', data);
      
      // Set basic fields
      setValue('title', data.title);
      setValue('youtubeLink', data.youtubeLink);
      setAllTags(data.tags || []);
      
      // Set technical details
      setValue('focalLength', data.focalLength || []);
      setValue('lightingConditions', data.lightingConditions || []);
      setValue('videoType', data.videoType || []);
      setValue('referenceType', data.referenceType || []);
      setValue('videoSpeed', data.videoSpeed || []);
      setValue('videoQuality', data.videoQuality || []);
      setValue('simulationSize', data.simulationSize || []);
      setValue('simulationStyle', data.simulationStyle || []);
      setValue('motionStyle', data.motionStyle || []);
      setValue('emitterSpeed', data.emitterSpeed || []);
      setValue('simulationSoftware', data.simulationSoftware || []);
      
      // Set simulator types
      if (data.simulatorTypes) {
        Object.keys(data.simulatorTypes).forEach(key => {
          setValue(`simulatorTypes.${key}`, data.simulatorTypes[key]);
        });
      }
      
      // Set media
      setVideoThumbnail(data.imageUrl);
      setTimecodes(data.timecodes || []);
      setThumbnailTimecode(data.thumbnailTimecode || "");
      
      // Determine video source
      if (data.youtubeLink) {
        const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
        const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
        
        if (youtubeRegex.test(data.youtubeLink)) {
          setIsYouTubeLink(true);
          setIsVimeoLink(false);
          setVideoPreview(null);
        } else if (vimeoRegex.test(data.youtubeLink)) {
          setIsVimeoLink(true);
          setIsYouTubeLink(false);
          setVideoPreview(null);
        } else {
          setIsYouTubeLink(false);
          setIsVimeoLink(false);
          setVideoPreview(data.youtubeLink);
        }
      }
    }
  }, [shotData, setValue]);

  const onSubmit = async (data) => {
    console.log('Form data to be updated:', data);
    const formData = {
      ...data,
      tags: allTags // Explicitly include the current tags
    };
    await handleEditSubmit(formData);
  };

  return (
    <div className="min-h-screen pt-8 flex items-center justify-center bg-gray-900 overflow-hidden max-w-[1820px] mx-auto">
      <div className="w-full my-auto mx-auto">
        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 mt-4 my-auto rounded-lg shadow-xl p-4 md:p-6 lg:px-6 lg:p-3">
          <div className="xl:flex">
            <div className="flex-1 pr-8">
              <div className="mb-2">
                <div className="gap-6">
                  <div>
                    <div className="flex items-center mb-2">
                      <FiFilm className="mr-2 text-blue-400" />
                      <h2 className="font-semibold">Basic Information</h2>
                    </div>
                    <label className="block text-xs font-medium mb-1">Title *</label>
                    <input
                      {...register("title", { required: true })}
                      className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-3 focus:outline-none"
                      placeholder="Shot title"
                    />
                    {errors.title && (
                      <p className="mt-1 text-xs text-red-400">Title is required</p>
                    )}
                  </div>

                  <div className="relative">
                    <div className="flex mt-2 gap-4">
                      <div className="md:w-[40%]">
                        <label className="block text-xs font-medium mb-1 text-white">Tags</label>
                        <input
                          onClick={() => setShowSelect(true)}
                          onChange={(e) => setTag(e.target.value)}
                          value={tag}
                          onKeyDown={tagHandler}
                          className="w-full bg-gray-700 border border-gray-600 rounded-md py-1 px-3 focus:outline-none text-white"
                          placeholder="Add Tag (press Enter to add)"
                        />
                      </div>

                      <div className="flex-1">
                        <label htmlFor='matureContent' className="underline hidden lg:block underline-offset-4 text-red-600 mt-2">
                          <span className="mr-[10px]">
                            <input type="checkbox" name="" id="matureContent" />
                          </span>
                          <span className="font-semibold text-xs">Mature Content</span>{" "}
                          <span className="text-[10px] cursor-pointer wra font-semibold">
                            (Please Note: Any Sexually Explicit or extremely
                            violent content will not be accepted Keep submissions
                            appropriate and respectful for all audiences)
                          </span>
                        </label>
                      </div>
                    </div>

                    <div className="flex flex-wrap mt-2">

                    {allTags.map((item, idx) => (
  <span
    key={idx}
    className="inline-flex items-center border border-gray-500 bg-gray-600 px-3 text-xs rounded text-gray-200 mr-2 mb-2"
  >
    {item}
    <button 
      type="button" // Important to prevent form submission
      onClick={(e) => {
        e.preventDefault();
        const newTags = allTags.filter((_, i) => i !== idx);
        setAllTags(newTags);
        setValue('tags', newTags, { shouldValidate: true }); // Update form state
      }}
    >
      <IoClose className="w-4 h-4 ml-2 cursor-pointer text-gray-300 hover:text-white" />
    </button>
  </span>
))}


                    </div>
                    <h4 className="underline lg:hidden underline-offset-4 text-red-600 mt-2">
                      <span className="mr-[10px]">
                        <input type="checkbox" name="" id="" />
                      </span>
                      <span className="font-semibold text-xs">Mature Content</span>{" "}
                      <span className="text-[10px] wra font-semibold">
                        (Please Note: Any Sexually Explicit or extremely
                        violent content will not be accepted Keep submissions
                        appropriate and respectful for all audiences)
                      </span>
                    </h4>

                    {showSelect && suggestionItems?.length > 0 && (
                      <select
                        onChange={(e) => {
                          const selected = e.target.value;
                          if (selected && !allTags.includes(selected)) {
                            setAllTags([...allTags, selected]);
                          }
                          setTag("");
                          setShowSelect(false);
                        }}
                        value=""
                        className="absolute top-full mt-2 w-full bg-gray-700 border  scrollbar-thin-gray border-gray-600 text-white rounded-md shadow-lg py-8 px-3 focus:outline-none z-10"
                        size={Math.min(6, suggestionItems.length)}
                      >
                        <option className="py-1 px-4 text-white bg-blue-400">Select A Option</option>
                        {suggestionItems.map((item, idx) => (
                          <option
                            key={idx}
                            value={item}
                            className="py-1 px-4 bg-transparent text-white hover:bg-blue-400"
                          >
                            {item}
                          </option>
                        ))}
                      </select>
                    )}
                    
                    {showSelect && suggestionItems?.length > 0 && <button 
                      onClick={()=> setShowSelect(false)}
                      className="absolute top-20 cursor-pointer z-10 right-6">
                      <LiaWindowCloseSolid className="text-red-500 text-lg font-semibold"/>
                    </button>}
                  </div>

                  <div className="">
                    <div className="flex items-center">
                      <FaCamera className="mr-2 text-blue-400" />
                      <h2 className="font-semibold mt-1">Technical Details</h2>
                    </div>
                    
                    <section className="grid grid-cols-2 mt-1 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-6 lg:grid-cols-5 gap-4 justify-between">
                      <div>
                        <h4 className="text-sm mb-1">Focal Length</h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "ultra-wide", value: "Ultra Wide", label: "Ultra Wide" },
                            { id: "wide", value: "Wide", label: "Wide" },
                            { id: "medium", value: "Medium", label: "Medium" },
                            { id: "long", value: "Long", label: "Long" },
                            { id: "telephoto", value: "Telephoto", label: "Telephoto" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("focalLength")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1 whitespace-nowrap">Lighting/Time </h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "dawn", value: "Dawn", label: "Dawn" },
                            { id: "day", value: "Day", label: "Day" },
                            { id: "night", value: "Night", label: "Night" },
                            { id: "dusk", value: "Dusk", label: "Dusk" },
                            { id: "interior", value: "Interior", label: "Interior" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("lightingConditions")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1">Video Type</h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "reference", value: "Reference", label: "Reference" },
                            { id: "tuto", value: "Tuto", label: "Tuto" },
                            { id: "breakdown", value: "Breakdown", label: "Breakdown" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("videoType")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1">Reference Type</h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "real-video", value: "Real Video", label: "Real Video" },
                            { id: "2d", value: "2D", label: "2D" },
                            { id: "3d", value: "3D", label: "3D" },
                            { id: "full-cgi", value: "Full CGI", label: "Full CGI" },
                            { id: "live-action", value: "Live Action", label: "Live Action" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("referenceType")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1">Video Speed</h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "slow-motion", value: "Slow Motion", label: "Slow Motion" },
                            { id: "normal", value: "Normal", label: "Normal" },
                            { id: "accelerated", value: "Accelerated", label: "Accelerated" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("videoSpeed")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-sm mb-1">Video Quality</h4>
                        <div className="bg-gray-700 space-y-1 text-xs rounded-md p-4 text-white">
                          {[
                            { id: "low", value: "Low", label: "Low" },
                            { id: "medium-quality", value: "Medium", label: "Medium" },
                            { id: "high", value: "High", label: "High" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("videoQuality")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>
                    </section>

                    <div className="flex items-center mt-1">
                      <FiFilm className="mr-2 text-blue-400" />
                      <h2 className="font-semibold mt-1">Simulation</h2>
                    </div>

                    <section className="grid mt-1 grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:flex lg:grid-cols-5 gap-4 justify-between">
                      <div className="">
                        <h4 className="mb-1 text-sm">Simulation Scale</h4>
                        <div className="bg-gray-700 space-y-1 rounded-md p-3 border  border-gray-600 text-white text-xs">
                          {[
                            { id: "extra-small", value: "extra-small", label: "Extra Small .......... (<10cm)" },
                            { id: "small", value: "small", label: "Small .......... (10cm - 1m)" },
                            { id: "human", value: "human", label: "Human .......... (10cm -1m)" },
                            { id: "structural", value: "structural", label: "Structural .......... (10m - 1km)" },
                            { id: "massive", value: "massive", label: "Massive .......... (>1km)" },
                          ].map((item) => (
                            <div key={item.id} className="flex xl:whitespace-nowrap items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("simulationSize")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-1 text-sm">Style</h4>
                        <div className="bg-gray-700 space-y-1 rounded-md p-3 border border-gray-600 text-white text-xs">
                          {[
                            { id: "realist", value: "realist", label: "Realist" },
                            { id: "semi-stylized", value: "semi-stylized", label: "Semi Stylized" },
                            { id: "stylized", value: "stylized", label: "Stylized" },
                            { id: "anime", value: "anime", label: "Anime" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("simulationStyle")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-1 text-sm">Motion Style</h4>
                        <div className="bg-gray-700 space-y-1 rounded-md p-3 border border-gray-600 text-white text-xs">
                          {[
                            { id: "realist-motion", value: "realist", label: "Realist" },
                            { id: "stylized-motion", value: "stylized", label: "Stylized" },
                            { id: "anime-motion", value: "anime", label: "Anime" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("motionStyle")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-1 text-sm">Emitter Speed</h4>
                        <div className="bg-gray-700 space-y-1 rounded-md p-3 border border-gray-600 text-white text-xs">
                          {[
                            { id: "static-emitter", value: "static", label: "Static" },
                            { id: "slow-emitter", value: "slow", label: "Slow" },
                            { id: "fast-emitter", value: "fast", label: "Fast" },
                          ].map((item) => (
                            <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                              <input
                                type="checkbox"
                                id={item.id}
                                value={item.value}
                                {...register("emitterSpeed")}
                                className="cursor-pointer"
                              />
                              <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="mb-1 text-sm">Software</h4>
                        <div className="bg-gray-700 rounded-lg p-3 text-xs text-white overflow-y-auto border border-gray-600 scrollbar-hide max-h-[167px]">
                          <div className="space-y-2">
                            {[
                              { id: "houdini", value: "houdini", label: "Houdini" },
                              { id: "axiom", value: "axiom", label: "Axiom" },
                              { id: "blender", value: "blender", label: "Blender" },
                              { id: "embergen", value: "embergen", label: "EmberGen" },
                              { id: "real-flow", value: "real-flow", label: "RealFlow" },
                              { id: "phoenix-fd", value: "phoenix-fd", label: "Phoenix FD" },
                              { id: "fumefx", value: "fumefx", label: "FumeFX" },
                              { id: "x-particles", value: "x-particles", label: "X-Particles" },
                              { id: "krakatoa", value: "krakatoa", label: "Krakatoa" },
                              { id: "ncloth", value: "ncloth", label: "nCloth" },
                              { id: "yeti", value: "yeti", label: "Yeti" },
                              { id: "ornatrix", value: "ornatrix", label: "Ornatrix" },
                              { id: "marvelous-designer", value: "marvelous-designer", label: "Marvelous Designer" },
                              { id: "ue5-niagara", value: "ue5-niagara", label: "UE5 (Niagara)" },
                            ].map((item) => (
                              <div key={item.id} className="flex items-center gap-2 cursor-pointer">
                                <input
                                  type="checkbox"
                                  id={item.id}
                                  value={item.value}
                                  {...register("simulationSoftware")}
                                  className="cursor-pointer"
                                />
                                <label htmlFor={item.id} className="cursor-pointer">{item.label}</label>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    </section>
                  </div>
                </div>
              </div>
            </div>

            <div className="mb-4 flex-1 xl:border-l border-gray-700 lg:pl-8">
              <div className="flex items-center mb-4">
                <FiImage className="mr-2 text-blue-400" />
                <h2 className="font-semibold">Media</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div>
                  {(videoPreview || isYouTubeLink || isVimeoLink) ? (
                    <div className="">
                      <h4 className="text-xs font-medium mb-2">Video Preview</h4>
                      <div className="w-full bg-black overflow-hidden rounded-lg shadow-md aspect-video">
                        {videoPreview && (
                          <video
                            src={videoPreview}
                            controls
                            className="w-full h-full object-contain"
                            ref={(el) => setVideoElement(el)}
                          />
                        )}
                        {isYouTubeLink && (
                          <iframe
                            src={`https://www.youtube.com/embed/${getYouTubeId(watch("youtubeLink"))}`}
                            frameBorder="0"
                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        )}
                        {isVimeoLink && (
                          <iframe
                            src={`https://player.vimeo.com/video/${getVimeoId(watch("youtubeLink"))}`}
                            frameBorder="0"
                            allow="autoplay; fullscreen; picture-in-picture"
                            allowFullScreen
                            className="w-full h-full"
                          ></iframe>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="mt-4 w-full h-[180px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                      <div className="text-center text-gray-500">
                        <FiImage className="mx-auto text-4xl mb-2" />
                        <p className="text-xs">No video selected</p>
                        <p className="text-xs text-gray-400">Upload a video to see preview here</p>
                      </div>
                    </div>
                  )}
                  <label className="block text-xs font-medium mt-4 mb-1">Video</label>
                  <div className="flex">
                    <input
                      {...register("youtubeLink")}
                      className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-1 px-3 focus:outline-none"
                      placeholder="Upload a video or paste YouTube/Vimeo link"
                      value={selectedVideo ? selectedVideo.name : watch("youtubeLink") || ""}
                      onChange={(e) => {
                        if (!selectedVideo) {
                          setValue("youtubeLink", e.target.value);
                        }
                      }}
                      readOnly
                    />
                    
                    <label className="bg-red-600 hover:bg-red-700 px-4 rounded-r-md flex items-center transition-colors cursor-pointer">
                      <input
                        type="file"
                        accept="video/*"
                        className="hidden"
               
                        disabled
                      />
                      <FiUpload className="mr-1" />
                      <span className="text-sm hidden sm:inline">Upload</span>
                    </label>

                    {selectedVideo && (
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedVideo(null);
                          setVideoPreview(null);
                          setValue("youtubeLink", "");
                        }}
                        className="ml-2 text-red-500 hover:text-red-400 flex items-center"
                        disabled
                      >
                        <FiX />
                      </button>
                    )}
                  </div>

                  <div>
  <label className="block text-xs font-medium mb-2 mt-2 text-white">Thumbnail</label>
  {videoThumbnail && (
    <img
      src={videoThumbnail}
      alt="Video Thumbnail"
      className="mt-2 w-[24%] h-[24%] object-cover rounded-md border border-gray-600"
    />
  )}
  {!videoThumbnail && (
    <div className="w-36 h-[140px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="text-center text-gray-500">
        <FiImage className="mx-auto text-4xl mb-2" />
        <p className="text-xs">No thumbnail available</p>
      </div>
    </div>
  )}
</div>
                </div>
  {

    shotData?.data?.timecodes.length > 0 &&               <div className="space-y-2">
    {/* Interest Points Heading */}
    <div className="flex items-center mb-2">
  
      <h3 className="font-semibold text-sm">Interest Points</h3>
    </div>
  
    {/* Timecodes List */}
    <div className="bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl">
      {shotData?.data?.timecodes?.map((tc, idx) => ( 
        <div 
          key={idx} 
          className={`flex gap-3 items-center hover:bg-[#3a3a3a] p-2 pb-2 cursor-default transition-colors ${
            idx+1 === shotData?.data?.timecodes.length ? '' : 'border-b border-gray-600'
          }`}
        >
          <img 
            src={tc.image} 
            className='w-32 h-20 object-cover rounded-md'
            alt={`Timecode at ${tc.time}`}
          />
          <div className=''>
            <p className="font-semibold font-mono text-sm">{tc.time}</p>
            <p className="text-gray-300 text-xs">{tc.label}</p>
          </div>
        </div>
      ))}
    </div>
  </div>
  }
              </div>
            </div>
          </div>

          <section className="">
            <div className="flex items-center">
              <FaLightbulb className="mr-2 text-blue-400" />
              <h2 className="font-semibold">Simulator Type</h2>
            </div>

            <div className="relative">
              <div 
                className={`absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                  scrollPosition > 0 ? 'opacity-100' : 'opacity-0'
                }`}
              ></div>
              
              <div 
                className={`absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none transition-opacity duration-300 ${
                  isScrolledToEnd ? 'opacity-0' : 'opacity-100'
                }`}
              ></div>

              <div 
                className="bg-gray-700 rounded-md shadow-lg p-2 overflow-x-auto scrollbar-hide"
                ref={scrollContainerRef}
                onScroll={handleScroll}
                onWheel={handleHorizontalScroll}
                style={{
                  scrollBehavior: 'smooth',
                  scrollSnapType: 'x proximity'
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
                      <div
                        key={idx}
                        className={`rounded-lg p-4 w-64 flex-shrink-0 shadow-md border transition-all scroll-item ${
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
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          <div className="md:flex items-center justify-between">
            <div className="min-w-[76%]">
              {error && (
                <div>
                  <h4 className="text-red-900">{error}</h4>
                </div>
              )}

              {isUploading && (
                <div className="mt-12">
                  <div className="w-full bg-gray-700 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${uploadProgress}%` }}
                    ></div>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">
                    Uploading: {uploadProgress}%
                  </p>
                </div>
              )}
            </div>

            <section className="md:flex relative justify-between">
              <div className="flex justify-start md:justify-end space-x-4 mt-8">
                <button
                  type="button"
                  onClick={()=> window.location.reload()}
                  className="px-6 py-1 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
                  disabled={isUploading}
                >
                  Reset
                </button>
                <button
                  type="submit"
                  className="px-6 py-1 bg-[#31caff] hover:bg-[#31caff] text-black rounded-md transition-colors flex items-center justify-center min-w-32"
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <>
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-black"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Updating...
                    </>
                  ) : (
                    "Update Shot"
                  )}
                </button>
              </div>
            </section>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simulation Type Data
const simulatorType = [
  {
    heading: "Pyro / Volumetrics",
    name: "Pyro / Volumetrics",
    items: ["Fire", "Smoke", "Explosion", "Dust"],
    title: 'Pyro / Volumetrics'
  },
  {
    heading: "Liquids / Fluids",
    name: "Liquids / Fluids",
    items: ["Water", "Ocean", "Foam", "Bubbles", "Splashes", "Blood", "Paint"],
    title: 'Liquids / Fluids'
  },
  {
    heading: "particles",
    name: "particles",
    items: ["Sparks", "Debris", "Rain", "Snow", "Ashes", "Magic", "Swarms"],
    title:'Particles'
  },
  {
    heading: "rigidbodies",
    name: "rigidbodies",
    items: ["Destruction", "Impact", "Collisions", "Breaking", "Falling Objects"],
    title:'Rigid Bodies'
  },
  {
    heading: "softBodies",
    name: "softBodies",
    items: ["Muscles system", "Anatomical deformation", "Squishy Objects"],
    title:'Soft Bodies'
  },
  {
    heading: "clothgroom",
    name: "clothgroom",
    items: ["Cloth Setup", "Cloth Dynamics", "Groom Setup", "Groom Dynamics"],
    title:'Cloth & Groom'
  },
  {
    heading: "magicAbstract",
    name: "magicAbstract",
    items: ["Energy FX", "Plasma", "Portals", "Teleportation", "Glitches", "Hologram", "Conceptual"],
    title:'Magic & Abstract'
  },
  {
    heading: "crowd",
    name: "crowd",
    items: ["Agent Simulation", "Crowd Dynamics", "Battles", "Swarms"],
    title:'Crowd'
  },
  {
    heading: "mechanicsTech",
    name: "mechanicsTech",
    items: ["Vehicles Crash", "Cables / Ropes", "Mechanical Parts"],
    title:'Mechanics & Tech'
  },
  {
    heading: "compositing",
    name: "compositing",
    items: ["Volumetrics", "Liquids / Fluids", "Particles", "Base of FX compositing"],
    title:'Compositing'
  },
];