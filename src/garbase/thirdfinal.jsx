"use client";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import {
  FiUpload,
  FiFilm,
  FiYoutube,
  FiImage,
  FiClock,
  FiChevronDown,
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

export default function AddShot() {
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
  const [thumbnailSource, setThumbnailSource] = useState("timecode"); // 'timecode', 'youtube', 'custom'
  const [selectedSimulatorCategories, setSelectedSimulatorCategories] = useState([]);
  const [videoElement, setVideoElement] = useState(null);

  // Bunny.net configuration
  const STORAGE_ZONE = "shot-deck";
  const ACCESS_KEY = "71fafdbb-d074-490c-b27b075a536b-69fc-46b0";
  const REGION_PREFIX = "";
  const PULL_BASE = "storage.bunnycdn.com" || "";

  // Get tags from localStorage
  const suggestionItems =
    typeof window !== "undefined" && localStorage.getItem("AllTags")
      ? JSON.parse(localStorage.getItem("AllTags"))
      : [];

  // Handle timecode addition
  const handleAddTimecode = () => {
    if (currentDesc && currentTime) {
      setTimecodes((prev) => [
        ...prev,
        { label: currentDesc, time: currentTime, image: null },
      ]);
      setCurrentDesc("");
      setCurrentTime("");
    }
  };

  // Remove timecode
  const removeTimecode = (index) => {
    setTimecodes(timecodes.filter((_, i) => i !== index));
  };

  // Reorder timecodes
  const handleReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;
    const newTimecodes = [...timecodes];
    const [movedItem] = newTimecodes.splice(fromIndex, 1);
    newTimecodes.splice(toIndex, 0, movedItem);
    setTimecodes(newTimecodes);
  };

  // Tag handler
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

  // Video URL handling
  useEffect(() => {
    const url = watch("youtubeLink");
    if (!url) return;

    // Check for YouTube URL
    const youtubeRegex = /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\/.+/;
    if (youtubeRegex.test(url)) {
      setIsYouTubeLink(true);
      setIsVimeoLink(false);
      setVideoPreview(null);
      return;
    }

    // Check for Vimeo URL
    const vimeoRegex = /^(https?:\/\/)?(www\.)?vimeo\.com\/.+/;
    if (vimeoRegex.test(url)) {
      setIsVimeoLink(true);
      setIsYouTubeLink(false);
      setVideoPreview(null);
      return;
    }

    // If not a recognized video URL
    setIsYouTubeLink(false);
    setIsVimeoLink(false);
    setVideoPreview(null);
  }, [watch("youtubeLink")]);

  // YouTube ID extractor
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

  // Vimeo ID extractor
  const getVimeoId = (url) => {
    const regExp =
      /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[5] : null;
  };

  // Time to seconds converter
  const convertTimeToSeconds = (timeString) => {
    const parts = timeString.split(':');
    if (parts.length === 2) {
      // mm:ss format
      const [minutes, seconds] = parts.map(Number);
      return minutes * 60 + seconds;
    } else if (parts.length === 3) {
      // hh:mm:ss format
      const [hours, minutes, seconds] = parts.map(Number);
      return hours * 3600 + minutes * 60 + seconds;
    }
    return 0;
  };

  // Generate thumbnail from timecode
  const generateThumbnailFromTimecode = async () => {
    const videoUrl = watch("youtubeLink");
    const time = thumbnailTimecode;

    if (!time) return;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      let imageUrl;
      
      if (isYouTubeLink && videoUrl) {
        // Handle YouTube timecode thumbnail
        const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(
          videoUrl
        )}&timestamp=${time}`;
        const response = await fetch(apiUrl);
        const blob = await response.blob();
        const fileName = `${Date.now()}_thumb.jpg`;
        imageUrl = await uploadBlobToBunny(blob, fileName);
      } else if (videoPreview) {
        // Handle uploaded video timecode thumbnail
        const canvas = document.createElement('canvas');
        const video = document.createElement('video');
        video.src = videoPreview;
        
        await new Promise((resolve) => {
          video.onloadedmetadata = () => {
            const [minutes, seconds] = time.split(':').map(Number);
            const timeInSeconds = minutes * 60 + seconds;
            video.currentTime = timeInSeconds;
            resolve();
          };
        });

        await new Promise((resolve) => {
          video.onseeked = () => {
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            canvas.toBlob(async (blob) => {
              const fileName = `${Date.now()}_thumb.jpg`;
              imageUrl = await uploadBlobToBunny(blob, fileName);
              resolve();
            }, 'image/jpeg');
          };
        });
      }

      if (imageUrl) {
        setVideoThumbnail(imageUrl);
        setImagePreview(null);
        setStaticImage(null);
        setThumbnailSource('timecode');
      }

    } catch (error) {
      console.error("Error generating thumbnail:", error);
      Swal.fire({
        title: "Error",
        text: "Failed to generate thumbnail from timecode",
        icon: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Use YouTube default thumbnail
  const useYouTubeThumbnail = () => {
    const videoUrl = watch("youtubeLink");
    if (!videoUrl || !isYouTubeLink) return;

    const videoId = getYouTubeId(videoUrl);
    if (!videoId) return;

    const thumbnailUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    setVideoThumbnail(thumbnailUrl);
    setImagePreview(null);
    setStaticImage(null);
    setThumbnailSource('youtube');
  };

  // Upload blob to Bunny.net
  const uploadBlobToBunny = async (blob, fileName) => {
    const endpoint = `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(fileName)}`;

    await axios.put(endpoint, blob, {
      headers: { 
        AccessKey: ACCESS_KEY, 
        "Content-Type": "image/jpeg" 
      },
    });

    return `https://shot-deck.b-cdn.net/${encodeURIComponent(fileName)}`;
  };

  // Handle video upload
  const handleVideoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setSelectedVideo(file);
    setShowVideoOptions(false);

    // Create preview for uploaded video
    const videoURL = URL.createObjectURL(file);
    setVideoPreview(videoURL);
    setIsYouTubeLink(false);
    setIsVimeoLink(false);
  };

  // Handle file upload for custom thumbnail
  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    setVideoThumbnail(null);
    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadProgress(0);

    const endpoint = `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}/${file.name}`;

    try {
      const { status } = await axios.put(endpoint, file, {
        headers: {
          AccessKey: ACCESS_KEY,
          "Content-Type": file.type || "application/octet-stream",
        },
        onUploadProgress: (e) => {
          const percent = Math.round((e.loaded * 100) / e.total);
          setUploadProgress(percent);
        },
      });

      if (status === 201) {
        const publicUrl = PULL_BASE
          ? `${PULL_BASE}/${file.name}`
          : `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}/${file.name}`;

        setStaticImage(`https://shot-deck.b-cdn.net/${file.name}`);
        setThumbnailSource('custom');
      } else {
        console.error("Unexpected response code", status);
      }
    } catch (err) {
      console.error("Upload error:", err);
    } finally {
      setIsUploading(false);
    }
  };

  // Form submission
  const onSubmit = async (data) => {
    localStorage.setItem("AllTags", JSON.stringify(allTags));
    data.tags = allTags;

    try {
      setIsUploading(true);
      setUploadProgress(0);

      // Upload video if selected
      if (selectedVideo) {
        const fileName = encodeURIComponent(selectedVideo.name);
        const endpoint = `https://storage.bunnycdn.com/${STORAGE_ZONE}/${fileName}`;

        const { status } = await axios.put(endpoint, selectedVideo, {
          headers: {
            AccessKey: ACCESS_KEY,
            "Content-Type": selectedVideo.type || "application/octet-stream",
          },
          onUploadProgress: (progressEvent) => {
            const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(progress);
          },
        });

        if (status === 201) {
          data.youtubeLink = `https://shot-deck.b-cdn.net/${fileName}`;
        }
      }

      // Set thumbnail based on selected source
      if (thumbnailSource === 'timecode' && videoThumbnail) {
        data.imageUrl = videoThumbnail;
      } else if (thumbnailSource === 'youtube' && isYouTubeLink) {
        const videoId = getYouTubeId(data.youtubeLink);
        data.imageUrl = `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
      } else if (thumbnailSource === 'custom' && staticImage) {
        data.imageUrl = staticImage;
      }

      // Process timecodes if video exists
      if ((data.youtubeLink || videoPreview) && timecodes.length > 0) {
        const timecodesWithImages = await Promise.all(
          timecodes.map(async (timecode) => {
            try {
              let imageUrl = null;
              
              if (isYouTubeLink && data.youtubeLink) {
                // Handle YouTube timecodes
                const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(
                  data.youtubeLink
                )}&timestamp=${timecode.time}`;
                const response = await fetch(apiUrl);
                const blob = await response.blob();
                const fileName = `${Date.now()}_${timecode.time.replace(/:/g, '-')}.jpg`;
                imageUrl = await uploadBlobToBunny(blob, fileName);
              } else if (videoPreview) {
                // Handle uploaded video timecodes
                const canvas = document.createElement('canvas');
                const video = document.createElement('video');
                video.src = videoPreview;
                
                await new Promise((resolve) => {
                  video.onloadedmetadata = () => {
                    const [minutes, seconds] = timecode.time.split(':').map(Number);
                    const timeInSeconds = minutes * 60 + seconds;
                    video.currentTime = timeInSeconds;
                    resolve();
                  };
                });

                await new Promise((resolve) => {
                  video.onseeked = () => {
                    canvas.width = video.videoWidth;
                    canvas.height = video.videoHeight;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
                    canvas.toBlob(async (blob) => {
                      const fileName = `${Date.now()}_${timecode.time.replace(/:/g, '-')}.jpg`;
                      imageUrl = await uploadBlobToBunny(blob, fileName);
                      resolve();
                    }, 'image/jpeg');
                  };
                });
              }

              return { ...timecode, image: imageUrl };
            } catch (error) {
              console.error(`Error generating thumbnail for timecode ${timecode.time}:`, error);
              return { ...timecode, image: null };
            }
          })
        );
        data.timecodes = timecodesWithImages;
      }

      data.thumbnailTimecode = thumbnailTimecode;
      data.thumbnailSource = thumbnailSource;

      const resp = await axiosInstance.post(`${base_url}/shot/create`, data);

      Swal.fire({
        title: "Shot added successfully",
        text: "Shot Saved Successfully wait for approval",
        icon: "success",
      });

      resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Error",
        text: error.response?.data?.message || error.message || "Failed to add shot",
        icon: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

  // Reset form
  const resetForm = () => {
    reset();
    setSelectedVideo(null);
    setVideoPreview(null);
    setImagePreview(null);
    setVideoThumbnail(null);
    setTimecodes([]);
    setAllTags([]);
    setUploadProgress(0);
    setThumbnailSource('timecode');
    setThumbnailTimecode('');
    setStaticImage(null);
    setSelectedSimulatorCategories([]);
  };

  // Toggle simulator category selection
  const toggleSimulatorCategory = (categoryName) => {
    setSelectedSimulatorCategories(prev => 
      prev.includes(categoryName) 
        ? prev.filter(name => name !== categoryName) 
        : [...prev, categoryName]
    );
  };

  // Checkbox group component
  const CheckboxGroup = ({ name, options, register, className = "" }) => (
    <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-2 ${className}`}>
      {options.map((option) => (
        <label key={option.value} className="flex items-center space-x-2">
          <input
            type="checkbox"
            value={option.value}
            {...register(name)}
            className="rounded bg-gray-700 border-gray-600 text-[ "
          />
          <span>{option.label}</span>
        </label>
      ))}
    </div>
  );

  return (
    <div className="min-h-screen mt-16 text-gray-100 md:p-6">
      <div className="w-full mx-auto">
        <div className="flex px-4 items-center mb-8">
          <GiClapperboard className="text-2xl mr-2 text-blue-400" />
          <h1 className="text-2xl font-bold">Add New Shot</h1>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
          {/* Basic Information Section */}
    <div className="xl:flex  ">

          <div className="flex-1 pr-8">
              <div className="mb-10">
           

            <div className=" gap-6">
               
              <div>

                <div className="flex items-center mb-4">
              <FiFilm className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
                <label className="block text-xs font-medium mb-1">Title *</label>
                <input
                  {...register("title", { required: true })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none"
                  placeholder="Shot title"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-400">Title is required</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium mt-2 mb-1">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none"
                  rows={2}
                  placeholder="Brief description"
                />
              </div>

              {/* Tag Section */}
              <div className="relative">
         
              <div className="flex  mt-4  gap-8">
                <div className="flex-1 ">
                         <label className="block text-sm font-medium mb-1  text-white">Tags</label>
                  <input
                  onClick={() => setShowSelect(true)}
                  onChange={(e) => setTag(e.target.value)}
                  value={tag}
                  onKeyDown={tagHandler}
                  className="w-full bg-gray-700 border  border-gray-600 rounded-md py-2 px-3 focus:outline-none text-white"
                  placeholder="Add Tag (press Enter to add)"
                />
                </div>

                    <div className="flex-1">
                <h4 className="underline underline-offset-4 text-red-600 mt-4">
                  <span className="mr-[10px]">
                    <input type="checkbox" name="" id="" />
                  </span>
                  <span className="font-semibold text-2xl">Mature Content</span>{" "}
                  <span className="text-lg">
                    (Please Note: Any Sexually Explicit, Gore, or extremely
                    violent content will not be accepted Keep submissions
                    appropriate and respectful for all audiences)
                  </span>
                </h4>
              </div>
              </div>

                {/* Display Added Tags */}
                <div className="mt-2 flex flex-wrap">
                  {allTags.map((item, idx) => (
                    <span
                      key={idx}
                      className="inline-flex items-center border border-gray-500 bg-gray-600 px-3 text-sm rounded text-gray-200 mr-2 mb-2"
                    >
                      {item}
                      <button onClick={() => setAllTags(allTags.filter((_, i) => i !== idx))}>
                        <IoClose className="w-4 h-4 ml-2 cursor-pointer text-gray-300 hover:text-white" />
                      </button>
                    </span>
                  ))}
                </div>

                {/* Suggestion Dropdown */}
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
                    className="absolute top-full mt-2 w-full bg-gray-700 border border-gray-600 text-white rounded-md shadow-lg py-8 px-3 focus:outline-none z-10"
                    size={Math.min(6, suggestionItems.length)}
                  >
                    <option className="py-2 px-4 text-white bg-blue-400">Select A Option</option>
                    {suggestionItems.map((item, idx) => (
                      <option
                        key={idx}
                        value={item}
                        className="py-2 px-4 bg-transparent text-white hover:bg-blue-400"
                      >
                        {item}
                      </option>
                    ))}
                  </select>
                )}
              </div>

              {/* Mature Content Warning */}
          
            </div>
          </div>

          {/* Technical Details Section */}
          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FaCamera className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Technical Details</h2>
            </div>
            
            <section className="my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-5 gap-4 justify-between">
              {/* Focal Length */}
              <div>
                <h4>Focal Length</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Lighting Conditions */}
              <div>
                <h4>Lighting Conditions</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Video Type */}
              <div>
                <h4>Video Type</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Reference Type */}
              <div>
                <h4>Reference Type</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Video Speed */}
              <div>
                <h4>Video Speed</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Video Quality */}
              <div>
                <h4>Video Quality</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

            <div className="flex items-center mb-4 mt-8">
              <FiFilm className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Simulation</h2>
            </div>

            <section className="my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-5 gap-4 justify-between">
              {/* Simulation Size */}
              <div>
                <h4>Simulation Scale</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                  {[
                    { id: "extra-small", value: "extra-small", label: "Extra Small (<10cm)" },
                    { id: "small", value: "small", label: "Small (10cm - 1m)" },
                    { id: "human", value: "human", label: "Human (10cm -1m)" },
                    { id: "structural", value: "structural", label: "Structural (10m - 1km)" },
                    { id: "massive", value: "massive", label: "Massive (>1km)" },
                  ].map((item) => (
                    <div key={item.id} className="flex items-center gap-2 cursor-pointer">
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

              {/* Style */}
              <div>
                <h4>Style</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Motion Style */}
              <div>
                <h4>Motion Style</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Emitter Speed */}
              <div>
                <h4>Emitter Speed</h4>
                <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
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

              {/* Software */}
              <div>
                <h4 className="mb-2">Software</h4>
                <div className="bg-gray-700 rounded-md p-4 text-white overflow-y-auto max-h-60">
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

          {/* Media Section */}
          <div className="mb-10 flex-1 border-l border-gray-700 pl-8">
            <div className="flex items-center mb-4">
              <FiImage className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Media</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Video Section */}
              <div>

                  {(videoPreview || isYouTubeLink || isVimeoLink) ? (
                  <div className="mt-4">
                    <h4 className="text-sm font-medium mb-2">Video Preview</h4>
                    <div className="w-full h-[300px] bg-black overflow-hidden rounded-lg shadow-md">
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
                  <div className="mt-4 w-full h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                    <div className="text-center text-gray-500">
                      <FiImage className="mx-auto text-4xl mb-2" />
                      <p className="text-sm">No video selected</p>
                      <p className="text-xs text-gray-400">Upload a video to see preview here</p>
                    </div>
                  </div>
                )}
                <label className="block text-sm font-medium mt-4 mb-1">Video</label>
                <div className="flex">
                  <input
                    {...register("youtubeLink")}
                    className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
                    placeholder="Upload a video or paste YouTube/Vimeo link"
                  />
                  <button
                    type="button"
                    onClick={() => setShowVideoOptions(!showVideoOptions)}
                    className="bg-red-600 hover:bg-red-700 px-4 rounded-r-md flex items-center transition-colors"
                  >
                    <FiYoutube className="mr-1" /> <FiChevronDown />
                  </button>
                </div>

                {/* Video Options Dropdown */}
                {showVideoOptions && (
                  <div className="mt-2 bg-gray-700 rounded-md p-2 border border-gray-600">
                    <div className="flex flex-col space-y-2">
                      <label className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer">
                        <input
                          type="file"
                          accept="video/*"
                          className="hidden"
                          onChange={handleVideoUpload}
                        />
                        <span className="flex items-center">
                          <FiUpload className="mr-2" /> Upload Video
                        </span>
                      </label>
                    </div>
                  </div>
                )}

                {/* Video Preview */}
              
              </div>

              {/* Thumbnail Section */}


                    <div className="mt-8">
              <label className="block text-sm font-medium mb-2 text-white">Interest Point</label>
              
              <div className="bg-gray-700 p-4 rounded-xl">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
                  <input
                    type="text"
                    className="flex-1 bg-gray-800 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Short Description"
                    value={currentDesc}
                    onChange={(e) => setCurrentDesc(e.target.value)}
                  />
                  <input
                    type="text"
                    className="sm:w-32 bg-gray-800 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                    placeholder="Timecode (mm:ss)"
                    value={currentTime}
                    onChange={(e) => setCurrentTime(e.target.value)}
                  />
                
                </div>
                  <button
                    type="button"
                    onClick={handleAddTimecode}
                    className="bg-blue-500 hover:bg-blue-600 ml-auto flex justify-end text-right text-white text-sm font-medium px-4 py-2 rounded"
                    disabled={!currentDesc || !currentTime}
                  >
                    ADD
                  </button>
              </div>

              {/* List of Timecodes */}
              <ul className="mt-4 divide-y divide-gray-600 rounded text-sm text-white overflow-hidden">
                {timecodes.map((tc, idx) => (
                  <li
                    key={idx}
                    className="relative px-3 py-4 text-gray-400 cursor-move group"
                    draggable
                    onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
                      handleReorder(draggedIdx, idx);
                    }}
                  >
                    <AiOutlineMenu className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl" />
                    <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {tc.label}
                    </span>
                    <span className="absolute right-10 top-1/2 -translate-y-1/2">{tc.time}</span>
                    <button
                      onClick={() => removeTimecode(idx)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <IoClose className="text-red-500 hover:text-red-400" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
             
            </div>

            {/* Interest Points */}
       <div>
                <label className="block text-sm font-medium mb-2 mt-2 text-white">Thumbnail</label>
                
                {/* Thumbnail Source Selection */}
                <div className="mb-4">
                  <select
                    value={thumbnailSource}
                    onChange={(e) => {
                      setThumbnailSource(e.target.value);
                      // Clear other thumbnail sources when changing selection
                      if (e.target.value === 'timecode') {
                        setStaticImage(null);
                      } else if (e.target.value === 'youtube') {
                        setVideoThumbnail(null);
                        setStaticImage(null);
                      } else if (e.target.value === 'custom') {
                        setVideoThumbnail(null);
                      }
                    }}
                    className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white focus:outline-none"
                  >
                    <option value="timecode">From Timecode</option>
                    <option value="youtube" disabled={!isYouTubeLink}>YouTube Default</option>
                    <option value="custom">Custom Image</option>
                  </select>
                </div>

                {/* Timecode Thumbnail */}
                {thumbnailSource === 'timecode' && (
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        placeholder="e.g. 2:15"
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                        value={thumbnailTimecode}
                        onChange={(e) => setThumbnailTimecode(e.target.value)}
                      />
                      <button
                        type="button"
                        onClick={generateThumbnailFromTimecode}
                        className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded"
                        disabled={isUploading || !thumbnailTimecode || (!isYouTubeLink && !videoPreview)}
                      >
                        Generate
                      </button>
                    </div>
                    {videoThumbnail && (
                      <img
                        src={videoThumbnail}
                        alt="Video Timecode Thumbnail"
                        className="mt-2 w-full h-auto rounded-md border border-gray-600"
                      />
                    )}
                  </div>
                )}

                {/* YouTube Default Thumbnail */}
                {thumbnailSource === 'youtube' && isYouTubeLink && (
                  <div>
                    <button
                      type="button"
                      onClick={useYouTubeThumbnail}
                      className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded mb-2"
                      disabled={!isYouTubeLink}
                    >
                      Use YouTube Thumbnail
                    </button>
                    {videoThumbnail && (
                      <img
                        src={videoThumbnail}
                        alt="YouTube Default Thumbnail"
                        className="w-full h-auto rounded-md border border-gray-600"
                      />
                    )}
                  </div>
                )}

                {/* Custom Image Upload */}
                {thumbnailSource === 'custom' && (
                  <div>
                    <input
                      type="file"
                      accept="image/*"
                      id="customThumbnail"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <label
                      htmlFor="customThumbnail"
                      className="block cursor-pointer"
                    >
                      {imagePreview ? (
                        <img
                          src={imagePreview}
                          alt="Custom Thumbnail Preview"
                          className="w-full h-auto rounded-md border border-gray-600"
                        />
                      ) : (
                        <div className="w-full h-[200px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
                          <div className="text-center text-gray-500">
                            <FiUpload className="mx-auto text-4xl mb-2" />
                            <p className="text-sm">Click to upload thumbnail</p>
                          </div>
                        </div>
                      )}
                    </label>
                    {isUploading && (
                      <div className="mt-2">
                        <div className="w-full bg-gray-700 rounded-full h-2.5">
                          <div
                            className="bg-blue-600 h-2.5 rounded-full"
                            style={{ width: `${uploadProgress}%` }}
                          ></div>
                        </div>
                        <p className="text-sm text-gray-400 mt-1">
                          Uploading: {uploadProgress}%
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
          </div>
    </div>





//! This is simulaiton type

          {/* Simulator Type Section */}
          <section className="mb-10">
            <div className="flex items-center mt-8 mb-4">
              <FaLightbulb className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Simulator Type</h2>
            </div>

            <div className="relative">
              <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none"></div>
              <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none"></div>

              <div className="bg-gray-700 rounded-md shadow-lg p-4 overflow-x-auto scrollbar-hide">
                <div className="flex gap-4 w-max">
                  {simulatorType.map((category, idx) => {
                    const isSelected = selectedSimulatorCategories.includes(category.name);
                    return (
                      <div
                        key={idx}
                        className={`rounded-lg p-4 w-64 flex-shrink-0 shadow-md border transition-all cursor-pointer ${
                          isSelected
                            ? "bg-[#2a3a4a] border-blue-400"
                            : "bg-[#1E2A3A] border-gray-600"
                        }`}
                        onClick={() => toggleSimulatorCategory(category.name)}
                      >
                        <h3 className={`font-medium text-lg border-b pb-2 mb-3 ${
                          isSelected ? "border-blue-400" : "border-gray-500"
                        }`}>
                          {category.heading}
                        </h3>
                        <div className="space-y-2">
                          {category.items.map((item, i) => (
                            <div key={i} className="flex items-center group">
                              <input
                                type="checkbox"
                                id={`${category.name}-${i}`}
                                value={item}
                                {...register(`simulatorTypes.${category.name}`)}
                                className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                              />
                              <label
                                htmlFor={`${category.name}-${i}`}
                                className={`ml-3 block text-sm ${
                                  isSelected
                                    ? "text-gray-300 group-hover:text-white"
                                    : "text-gray-300"
                                } transition-colors cursor-pointer`}
                              >
                                {item}
                              </label>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </section>

          {/* Upload Progress */}
          {isUploading && (
            <div className="mt-4">
              <div className="w-full bg-gray-700 rounded-full h-2.5">
                <div
                  className="bg-blue-600 h-2.5 rounded-full"
                  style={{ width: `${uploadProgress}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400 mt-1">
                Uploading: {uploadProgress}%
              </p>
            </div>
          )}

          {/* Submit Section */}
          <div className="flex justify-end space-x-4 mt-8">
            <button
              type="button"
              onClick={resetForm}
              className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
              disabled={isUploading}
            >
              Reset
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-[#31caff] hover:bg-[#31caff] text-black rounded-md transition-colors flex items-center justify-center min-w-32"
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
                  Uploading...
                </>
              ) : (
                "Add Shot"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// Simulator Type Data
const simulatorType = [
  {
    heading: "Particles",
    name: "particles",
    items: ["Sparks", "Debris", "Rain", "Snow", "Ashes", "Magic", "Swarms"],
  },
  {
    heading: "Rigid Bodies",
    name: "rigidbodies",
    items: ["Destruction", "Impact", "Collisions", "Breaking", "Falling Objects"],
  },
  {
    heading: "Soft Bodies",
    name: "softBodies",
    items: ["Muscles system", "Anatomical deformation", "Squishy Objects"],
  },
  {
    heading: "Cloth & Groom",
    name: "clothgroom",
    items: ["Cloth Setup", "Cloth Dynamics", "Groom Setup", "Groom Dynamics"],
  },
  {
    heading: "Magic & Abstract",
    name: "magicAbstract",
    items: ["Energy FX", "Plasma", "Portals", "Teleportation", "Glitches", "Hologram", "Conceptual"],
  },
  {
    heading: "Crowd",
    name: "crowd",
    items: ["Agent Simulation", "Crowd Dynamics", "Battles", "Swarms"],
  },
  {
    heading: "Mechanics & Tech",
    name: "mechanicsTech",
    items: ["Vehicles Crash", "Cables / Ropes", "Mechanical Parts"],
  },
  {
    heading: "Compositing",
    name: "compositing",
    items: ["Volumetrics", "Liquids / Fluids", "Particles", "Base of FX compositing"],
  },
];




































