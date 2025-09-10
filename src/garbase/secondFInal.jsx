"use client";
import React, { use, useEffect, useState } from "react";
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
  const {
    register,
    handleSubmit,
    control,
    watch,
    reset,
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
        magicAbstract: [],
        crowd: [],
        mechanicsTech: [],
        compositing: [],
      },
    },
  });

  const [showYoutubeOptions, setShowYoutubeOptions] = useState(false);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [staticImage, setStaticImage] = useState(null);
  const [tag, setTag] = useState("");
  // video preview

  const [videoPreview, setVideoPreview] = useState(null);
  const [isYouTubeLink, setIsYouTubeLink] = useState(false);
  const [isVimeoLink, setIsVimeoLink] = useState(false);
  

  // time code

  const [timecodes, setTimecodes] = useState([]);
  const [currentDesc, setCurrentDesc] = useState("");
  const [currentTime, setCurrentTime] = useState("");

  // image preview
  const [imagePreview, setImagePreview] = useState(null);
  const [thumbnailTimecode, setThumbnailTimecode] = useState("");
  const [videoThumbnail, setVideoThumbnail] = useState(null);

  const handleAddTimecode = () => {


    if (currentDesc && currentTime) {
      setTimecodes((prev) => [
        ...prev,
        { label: currentDesc, time: currentTime },
      ]);
      setCurrentDesc("");
      setCurrentTime("");
    }
  };

  const [allTags, setAllTags] = useState([]);

  const sugetionItems =
    typeof window !== "undefined" && localStorage.getItem("AllTags")
      ? JSON.parse(localStorage.getItem("AllTags"))
      : null;
  console.log(sugetionItems, "this is sugetion items");
  let a = "er";

  //  localStorage.getItem("user")
  // ? JSON.parse(localStorage.getItem("user"))
  // : null;

  const handleReorder = (fromIndex, toIndex) => {
    if (fromIndex === toIndex) return;

    setTimecodes((prev) => {
      const newTimecodes = [...prev];
      const [movedItem] = newTimecodes.splice(fromIndex, 1);
      newTimecodes.splice(toIndex, 0, movedItem);
      return newTimecodes;
    });
  };
  const tagHandler = (e) => {
    e.preventDefault();
    if (e.key === "Enter") {
      const value = e.target.value.trim();
      if (value) {
        setAllTags((prevTags) => [...prevTags, value]);
        e.target.value = "";
      }
    }
  };

  const generateThumbnailFromTimecode = async () => {
    const videoUrl = watch("youtubeLink"); // or vimeo
    const time = thumbnailTimecode;

    if (!videoUrl || !time) return;

    const id = isYouTubeLink(videoUrl)
      ? getYouTubeId(videoUrl)
      : getVimeoId(videoUrl);

    const seconds = convertTimeToSeconds(time);

    if (isYouTubeLink(videoUrl)) {
      // YouTube thumbnails aren't based on timecode, use default
      setVideoThumbnail(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    } else if (isVimeoLink(videoUrl)) {
      // For Vimeo you'll need to fetch the video thumbnail via Vimeo API
      const response = await fetch(
        `/api/vimeo-thumbnail?id=${id}&time=${seconds}`
      );
      const data = await response.json();
      setVideoThumbnail(data.thumbnailUrl);
    }
  };

  // video preview

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

  // Helper function to extract YouTube ID
  const getYouTubeId = (url) => {
    try {
      // Handle YouTube Shorts URLs (e.g., https://youtube.com/shorts/NU44H49f7I8)
      if (url.includes("/shorts/")) {
        const shortsId = url.split("/shorts/")[1]?.split("?")[0]?.split("/")[0];
        if (shortsId?.length === 11) return shortsId;
      }

      // Handle standard YouTube URLs
      const regExp =
        /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|\/v\/|e\/|watch\?.*v=)([^#&?]*).*/;
      const match = url.match(regExp);

      // Return ID only if it's exactly 11 characters (standard YouTube ID length)
      return match && match[2]?.length === 11 ? match[2] : null;
    } catch (err) {
      console.error("Error parsing YouTube URL:", err);
      return null;
    }
  };

  // Helper function to extract Vimeo ID
  const getVimeoId = (url) => {
    const regExp =
      /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
    const match = url.match(regExp);
    return match ? match[5] : null;
  };

  const axiosInstence = useSecureAxios();

//   const onSubmit = async (data) => {
//     localStorage.setItem("AllTags", JSON.stringify(allTags));
//     data.tags = allTags;
//     console.log(data, "Initial data");
//     console.log(staticImage, "this is image url");
//     console.log(thumbnailTimecode, data.youtubeLink, "asco tom ra");

//     if (staticImage) {
//       data.imageUrl = staticImage;
//     }

//     try {
//       setIsUploading(true);

//       // Upload video first if exists (since we need its URL for thumbnail generation)
//       if (selectedVideo) {
//         const formDataVideo = new FormData();
//         formDataVideo.append("file", selectedVideo);
//         formDataVideo.append("upload_preset", "e-paper");
//         formDataVideo.append("cloud_name", "djf8l2ahy");

//         const videoResp = await axios.post(
//           "https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload",
//           formDataVideo,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress =
//                 50 +
//                 Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             },
//           }
//         );

//         data.youtubeLink = videoResp.data.secure_url;
//       }

//       // Handle thumbnail generation if timecode exists
//       if (thumbnailTimecode && data.youtubeLink) {
//         try {
//           console.log(thumbnailTimecode, "This is thumbnail time code");
//           const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(
//             data.youtubeLink
//           )}&timestamp=${thumbnailTimecode}`;
//           console.log(apiUrl, "API response for thumbnail generation");
//           const response = await fetch(apiUrl);
//           const blob = await response.blob();

//           const formDataThumbnail = new FormData();
//           formDataThumbnail.append("file", blob);
//           formDataThumbnail.append("upload_preset", "e-paper");
//           formDataThumbnail.append("cloud_name", "djf8l2ahy");

//           const thumbnailResp = await axios.post(
//             "https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload",
//             formDataThumbnail
//           );

//           console.log(thumbnailResp, "ho vai ho tor paye dhori");
//           data.imageUrlThubnail = thumbnailResp.data.secure_url;
//           // const blob = await response.blob();
//           console.log(blob, "this i sblob re blob");

//           if (apiUrl.data) {
//             // Convert the thumbnail URL to a blob
//             // const response = await fetch(apiUrl.data);
//             // const blob = await response.blob();
//             // Upload to Cloudinary
//           }
//         } catch (error) {
//           console.error("Error generating thumbnail:", error);
//           // Continue with manual image upload if thumbnail generation fails
//         }
//       }

//       data.timecodes = timecodes;
//       data.thumbnailTimecode = thumbnailTimecode;

//       console.log("Final data with uploaded URLs:", data.timecodes, data.youtubeLink
// );
      
//       // const resp = await axiosInstence.post(`${base_url}/shot/create`, data);

//       if (data.status) {
//         await Swal.fire({
//           title: "Success",
//           text: "Shot Added Successfully!",
//           icon: "success",
//         });
//       }

//       Swal.fire({
//         title: "Shot added successfully",
//         text: "Shot Saved Successfully wait for approval",
//         icon: "success",
//       });

//       // resetForm();
//     } catch (error) {
//       console.error("Upload error:", error);
//       Swal.fire({
//         title: "Error",
//         text:
//           error.response?.data?.message ||
//           error.message ||
//           "Failed to add shot",
//         icon: "error",
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };

  async function getYouTubeThumbnail(url, timestamp = "00:00:10") {
    try {
      const yt = new URL(url);
      let videoId;

      if (
        yt.hostname.includes("youtube.com") &&
        yt.pathname.includes("/shorts/")
      ) {
        videoId = yt.pathname.split("/")[2]; // YouTube Shorts
      } else if (yt.hostname.includes("youtu.be")) {
        videoId = yt.pathname.split("/")[1]; // Shortened URL
      } else if (yt.hostname.includes("youtube.com")) {
        videoId = yt.searchParams.get("v"); // Standard YouTube
      }

      if (!videoId) return null;

      // Try to get custom frame from backend
      try {
        const apiUrl = `/api/frame?url=${encodeURIComponent(
          url
        )}&timestamp=${timestamp}`;
        const res = await fetch(apiUrl);

        if (res.ok) {
          const blob = await res.blob();
          const objectUrl = URL.createObjectURL(blob);
          return objectUrl;
        } else {
          console.warn(
            "API fallback: failed to get frame, status:",
            res.status
          );
        }
      } catch (err) {
        console.warn("API fallback: exception while fetching frame:", err);
      }

      // Fallback to default YouTube thumbnail
      return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
    } catch (err) {
      console.error("Error parsing YouTube URL:", err);
      return null;
    }
  }


// Image upload blob

const uploadBlobToBunny = async (blob, fileName) => {
  const endpoint = `https://${REGION_PREFIX}storage.bunnycdn.com/${STORAGE_ZONE}/${encodeURIComponent(fileName)}`;

  await axios.put(endpoint, blob, {
    headers: { AccessKey: ACCESS_KEY, "Content-Type": "image/jpeg" },
  });

  return `https://shot-deck.b-cdn.net/${encodeURIComponent(fileName)}`;
};


const onSubmit = async (data) => {

  console.log(data, 'baba amare toi maf koira deeee')
    localStorage.setItem("AllTags", JSON.stringify(allTags));
    data.tags = allTags;
    console.log(data, "Initial data");
    console.log(staticImage, "this is image url");
    console.log(thumbnailTimecode, data.youtubeLink, "asco tom ra");

    if (staticImage) {
      data.imageUrl = staticImage;
    }

    try {
      setIsUploading(true);

      // Upload video first if exists (since we need its URL for thumbnail generation)
      if (selectedVideo) {
  try {
    const fileName = encodeURIComponent(selectedVideo.name); // স্পেস বা স্পেশাল ক্যারেক্টার হ্যান্ডেল করার জন্য
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
      const publicUrl = `https://shot-deck.b-cdn.net/${fileName}`;
      data.youtubeLink = publicUrl; // Bunny.net public video URL
    } else {
      console.error("Unexpected response code:", status);
    }
  } catch (e) {
    console.error("Video upload failed:", e);
  }
}



 if (thumbnailTimecode) {
          try {
            console.log(thumbnailTimecode, "This is thumbnail time code");


            const isCloudinary = false;
            
            if (isCloudinary) {
              // Cloudinary-specific thumbnail generation
              const timeInSeconds = convertTimeToSeconds(thumbnailTimecode);
              const publicId = data.youtubeLink.split('/').pop().split('.')[0];
              data.imageUrlThubnail = `https://res.cloudinary.com/djf8l2ahy/video/upload/so_${timeInSeconds},h_300,w_300/${publicId}.jpg`;
            } else {
              // Original YouTube/DLP processing

              console.log('vai seradsklfsdfhngf')
              const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(
                data.youtubeLink
              )}&timestamp=${thumbnailTimecode}`;
              console.log(apiUrl, "API response for thumbnail generation");
              const response = await fetch(apiUrl);
              const blob = await response.blob();

                const fileName  = `${Date.now()}_thumb.jpg`;
                   const image = await uploadBlobToBunny(blob, fileName);

                   console.log(image, 'vai amare toi maf kor')

          
              data.imageUrlThubnail = image;
            }
          } catch (error) {
            console.error("Error generating main thumbnail:", error);
          }
        }


      // Handle thumbnail generation for each timecode if youtubeLink exists
      if (data.youtubeLink && timecodes && timecodes.length > 0) {
        const isCloudinary = data.youtubeLink.includes('cloudinary.com');
        
        // Process thumbnail for the main thumbnailTimecode if it exists
       
        // Process thumbnails for each timecode in the timecodes array
        const timecodesWithImages = await Promise.all(
          timecodes.map(async (timecode) => {
            try {
              let imageUrl;
              
              const isCloudinary = false;
              if (isCloudinary) {
                // Cloudinary-specific thumbnail generation
                const timeInSeconds = convertTimeToSeconds(timecode.time);
                const publicId = data.youtubeLink.split('/').pop().split('.')[0];
                imageUrl = `https://res.cloudinary.com/djf8l2ahy/video/upload/so_${timeInSeconds},h_300,w_300/${publicId}.jpg`;
              } else {
                // Original YouTube/DLP processing
                const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(
                  data.youtubeLink
                )}&timestamp=${timecode.time}`;
                
                const response = await fetch(apiUrl);
                const blob = await response.blob();

                 const fileName  = `${Date.now()}_thumb.jpg`;
                   const image = await uploadBlobToBunny(blob, fileName);

                imageUrl = image;
              }

              return {
                ...timecode,
                image: imageUrl
              };
            } catch (error) {
              console.error(`Error generating thumbnail for timecode ${timecode.time}:`, error);
              return {
                ...timecode,
                image: null
              };
            }
          })
        );

        data.timecodes = timecodesWithImages;
      }

      data.thumbnailTimecode = thumbnailTimecode;

      console.log("Final data with uploaded URLs:", data.timecodes, data.youtubeLink);
      
      const resp = await axiosInstence.post(`${base_url}/shot/create`, data);

      if (data.status) {
        await Swal.fire({
          title: "Success",
          text: "Shot Added Successfully!",
          icon: "success",
        });
      }

      Swal.fire({
        title: "Shot added successfully",
        text: "Shot Saved Successfully wait for approval",
        icon: "success",
      });

      // resetForm();
    } catch (error) {
      console.error("Upload error:", error);
      Swal.fire({
        title: "Error",
        text:
          error.response?.data?.message ||
          error.message ||
          "Failed to add shot",
        icon: "error",
      });
    } finally {
      setIsUploading(false);
    }
  };

// Helper function to convert time string (mm:ss) to seconds
function convertTimeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}

// Helper function to convert time string (mm:ss) to seconds





// Helper function to convert time string (mm:ss) to seconds



function convertTimeToSeconds(timeString) {
  const [minutes, seconds] = timecodes.label.split(':').map(Number);
  return minutes * 60 + seconds;
}










function convertTimeToSeconds(timeString) {
  const [minutes, seconds] = timeString.split(':').map(Number);
  return minutes * 60 + seconds;
}
  const resetForm = () => {
    reset();
    setSelectedVideo(null);
    setUploadProgress(0);
  };

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

    setSelectedVideo(file);
    setShowVideoOptions(false);
  };

  // Tag Handler

  
const STORAGE_ZONE  = "shot-deck";
const ACCESS_KEY    = "71fafdbb-d074-490c-b27b075a536b-69fc-46b0";
const REGION_PREFIX = ""
const PULL_BASE     ="storage.bunnycdn.com" || ""; 

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

      reset({ ...watch(), imageUrl: `https://shot-deck.b-cdn.net/${file.name}` });
      setStaticImage(`https://shot-deck.b-cdn.net/${file.name}`);
    } else {
      console.error("Unexpected response code", status);
    }
  } catch (err) {
    console.error("Upload error:", err);
  } finally {
    setIsUploading(false);
  }
};


  // Checkbox group component
  const CheckboxGroup = ({ name, options, register, className = "" }) => (
    <div
      className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-2 ${className}`}
    >
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

        <form
          // onKeyDown={(e)=> {
          //   if(e.key === 'Enter'){
          //     e.preventDefault();
          //   }
          // }}
          onSubmit={handleSubmit(onSubmit)}
          className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6"
        >
          {/* Basic Information Section */}

          {/* Media Section */}

          {/* Technical Details Section */}
          <div className="mb-10">
            {/* Checkbox detaisl */}

            <div className="2xl:flex gap-8 ">
              <div className="flex-1 ">
                <div className="mb-10">
                  <div className="flex items-center mb-4">
                    <FiFilm className="mr-2 text-blue-400" />
                    <h2 className="text-xl font-semibold">Basic Information</h2>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Title *
                      </label>
                      <input
                        {...register("title", { required: true })}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                        placeholder="Shot title"
                      />
                      {errors.title && (
                        <p className="mt-1 text-sm text-red-400">
                          Title is required
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-medium mb-1">
                        Description
                      </label>
                      <textarea
                        {...register("description")}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                        rows={2}
                        placeholder="Brief description"
                      />
                    </div>
                    {/* Tag Section */}
                    <div className="relative">
                      <label className="block text-sm font-medium mb-1 text-white">
                        Tags
                      </label>

                      {/* Input Box for Adding Tags */}
                      <input
                        onClick={() => {
                          setShowSelect(true);
                        }}
                        onChange={(e) => setTag(e.target.value)}
                        value={tag}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            setShowSelect(false);
                            const value = e.target.value.trim();
                            if (value && !allTags.includes(value)) {
                              setAllTags((prevTags) => [...prevTags, value]);
                              setTag("");
                              setShowSelect(false);
                            }
                          }
                        }}
                        className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none text-white"
                        placeholder="Add Tag (press Enter to add)"
                      />

                      {/* Display Added Tags */}
                      <div className="mt-2 flex flex-wrap">
                        {allTags.map((item, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center border border-gray-500 bg-gray-600 px-3 text-sm rounded text-gray-200 mr-2 mb-2"
                          >
                            {item}
                            <button
                              onClick={() =>
                                setAllTags(allTags.filter((_, i) => i !== idx))
                              }
                            >
                              <IoClose className="w-4 h-4 ml-2 cursor-pointer text-gray-300 hover:text-white" />
                            </button>
                          </span>
                        ))}
                      </div>

                      {/* Hidden input for form submission */}
                      <input
                        type="hidden"
                        {...register("tags")}
                        value={allTags.join(",")}
                      />

                      {/* Suggestion Dropdown Styled Like ArtStation */}
                      {showSelect && sugetionItems?.length > 0 && (
                        <select
                          onChange={(e) => {
                            const selected = e.target.value;
                            if (selected && !allTags.includes(selected)) {
                              setAllTags([...allTags, selected]);
                              setShowSelect(false);
                            }
                            setTag("");
                            setShowSelect(false);
                          }}
                          value=""
                          className="absolute top-full mt-2 w-full bg-gray-700  border border-gray-600 text-white rounded-md shadow-lg py-8 px-3 focus:outline-none z-10"
                          size={Math.min(6, sugetionItems.length)}
                        >
                          <option className="py-2 px-4  text-white bg-blue-400">
                            Select A Option
                          </option>

                          {sugetionItems.map((item, idx) => (
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

                    {/* Tag alert */}

                    <div>
                      <h4 className="underline underline-offset-4 text-red-600 mt-4">
                        <span className="mr-[10px]">
                          <input type="checkbox" name="" id="" />
                        </span>
                        <span className="font-semibold   text-2xl">
                          Mature Content
                        </span>{" "}
                        <span className=" text-lg">
                          (Please Note: Any Sexualy Explicit, Gore, or extremely
                          violent content will not be accepted Keep submissions
                          appropriate and respectful for all audiences)
                        </span>
                      </h4>
                    </div>

                    <div></div>

                    <div></div>
                  </div>
                </div>

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
                        {
                          id: "ultra-wide",
                          value: "Ultra Wide",
                          label: "Ultra Wide",
                        },
                        { id: "wide", value: "Wide", label: "Wide" },
                        { id: "medium", value: "Medium", label: "Medium" },
                        { id: "long", value: "Long", label: "Long" },
                        {
                          id: "telephoto",
                          value: "Telephoto",
                          label: "Telephoto",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("focalLength")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
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
                        {
                          id: "interior",
                          value: "Interior",
                          label: "Interior",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("lightingConditions")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Type */}
                  <div>
                    <h4>Video Type</h4>
                    <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                      {[
                        {
                          id: "reference",
                          value: "Reference",
                          label: "Reference",
                        },
                        { id: "tuto", value: "Tuto", label: "Tuto" },
                        {
                          id: "breakdown",
                          value: "Breakdown",
                          label: "Breakdown",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("videoType")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Reference Type */}
                  <div>
                    <h4>Reference Type</h4>
                    <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                      {[
                        {
                          id: "real-video",
                          value: "Real Video",
                          label: "Real Video",
                        },
                        { id: "2d", value: "2D", label: "2D" },
                        { id: "3d", value: "3D", label: "3D" },
                        {
                          id: "full-cgi",
                          value: "Full CGI",
                          label: "Full CGI",
                        },
                        {
                          id: "live-action",
                          value: "Live Action",
                          label: "Live Action",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("referenceType")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Video Speed */}
                  <div>
                    <h4>Video Speed</h4>
                    <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                      {[
                        {
                          id: "slow-motion",
                          value: "Slow Motion",
                          label: "Slow Motion",
                        },
                        { id: "normal", value: "Normal", label: "Normal" },
                        {
                          id: "accelerated",
                          value: "Accelerated",
                          label: "Accelerated",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("videoSpeed")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
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
                        {
                          id: "medium-quality",
                          value: "Medium",
                          label: "Medium",
                        },
                        { id: "high", value: "High", label: "High" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("videoQuality")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
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
                        {
                          id: "extra-small",
                          value: "extra-small",
                          label: "Extra Small (<10cm)",
                        },
                        {
                          id: "small",
                          value: "small",
                          label: "Small (10cm - 1m)",
                        },
                        {
                          id: "human",
                          value: "human",
                          label: "Human (10cm -1m)",
                        },
                        {
                          id: "structural",
                          value: "structural",
                          label: "Structural (10m - 1km)",
                        },
                        {
                          id: "massive",
                          value: "massive",
                          label: "Massive (>1km)",
                        },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("simulationSize")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
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
                        {
                          id: "semi-stylized",
                          value: "semi-stylized",
                          label: "Semi Stylized",
                        },
                        {
                          id: "stylized",
                          value: "stylized",
                          label: "Stylized",
                        },
                        { id: "anime", value: "anime", label: "Anime" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("simulationStyle")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Motion Style */}
                  <div>
                    <h4>Motion Style</h4>
                    <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                      {[
                        {
                          id: "realist-motion",
                          value: "realist",
                          label: "Realist",
                        },
                        {
                          id: "stylized-motion",
                          value: "stylized",
                          label: "Stylized",
                        },
                        { id: "anime-motion", value: "anime", label: "Anime" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("motionStyle")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Emitter Speed */}
                  <div>
                    <h4>Emitter Speed</h4>
                    <div className="bg-gray-700 space-y-4 rounded-md p-4 text-white">
                      {[
                        {
                          id: "static-emitter",
                          value: "static",
                          label: "Static",
                        },
                        { id: "slow-emitter", value: "slow", label: "Slow" },
                        { id: "fast-emitter", value: "fast", label: "Fast" },
                      ].map((item) => (
                        <div
                          key={item.id}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            id={item.id}
                            value={item.value}
                            {...register("emitterSpeed")}
                            className="cursor-pointer"
                          />
                          <label htmlFor={item.id} className="cursor-pointer">
                            {item.label}
                          </label>
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
                          {
                            id: "embergen",
                            value: "embergen",
                            label: "EmberGen",
                          },
                          {
                            id: "real-flow",
                            value: "real-flow",
                            label: "RealFlow",
                          },
                          {
                            id: "phoenix-fd",
                            value: "phoenix-fd",
                            label: "Phoenix FD",
                          },
                          { id: "fumefx", value: "fumefx", label: "FumeFX" },
                          {
                            id: "x-particles",
                            value: "x-particles",
                            label: "X-Particles",
                          },
                          {
                            id: "krakatoa",
                            value: "krakatoa",
                            label: "Krakatoa",
                          },
                          { id: "ncloth", value: "ncloth", label: "nCloth" },
                          { id: "yeti", value: "yeti", label: "Yeti" },
                          {
                            id: "ornatrix",
                            value: "ornatrix",
                            label: "Ornatrix",
                          },
                          {
                            id: "marvelous-designer",
                            value: "marvelous-designer",
                            label: "Marvelous Designer",
                          },
                          {
                            id: "ue5-niagara",
                            value: "ue5-niagara",
                            label: "UE5 (Niagara)",
                          },
                        ].map((item) => (
                          <div
                            key={item.id}
                            className="flex items-center gap-2 cursor-pointer"
                          >
                            <input
                              type="checkbox"
                              id={item.id}
                              value={item.value}
                              {...register("simulationSoftware")}
                              className="cursor-pointer"
                            />
                            <label htmlFor={item.id} className="cursor-pointer">
                              {item.label}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                <section></section>
              </div>

              <div className="border-r  border-gray-700 border-2"></div>
              <div className="flex-1">
                {/* THis is media secaiton */}

           {/* video preview */}

           <div className="md:flex  gap-8">

                <div className="mb-10 flex-1">
  <div className="flex mt-8 items-center mb-4">
    <FiImage className="mr-2 text-blue-400" />
    <h2 className="text-xl font-semibold">Media</h2>
  </div>

  {(videoPreview || isYouTubeLink || isVimeoLink) ? (
    <div className="mt-8">
      <h4 className="text-sm font-medium mb-2">Video Preview</h4>
      <div className="w-full h-[300px] bg-black overflow-hidden rounded-lg shadow-md">
        {videoPreview && (
          <video
            src={videoPreview}
            controls
            className="w-full h-full object-contain"
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
    <div className="sm:w-[400px] w-[300px] h-[300px] flex items-center justify-center border-2 border-dashed border-gray-300 rounded-lg bg-gray-50">
      <div className="text-center text-gray-500">
        <FiImage className="mx-auto text-4xl mb-2" />
        <p className="text-sm">No video selected</p>
        <p className="text-xs text-gray-400">Upload a video to see preview here</p>
      </div>
    </div>
  )}
</div>





                       <div className="mt-8 flex-1">
                        <label className="block text-sm font-medium mb-2 text-white">
                          Interest Point
                        </label>

                        {/* Input Row */}
                      <div className="bg-gray-700 p-4 rounded-xl">
                          <div className="flex flex-col rounded sm:flex-row sm:items-center gap-2 mb-3">
                          <input
                            type="text"
                            className="flex-1 bg-gray-800  rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                            placeholder="Short Description"
                            value={currentDesc}
                            onChange={(e) => setCurrentDesc(e.target.value)}
                          />
                          <input
                            type="text"
                            className="sm:w-32 bg-gray-800 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                            placeholder="Choose Timecode"
                            value={currentTime}
                            onChange={(e) => setCurrentTime(e.target.value)}
                          />
                         
                        </div>
                         <button
                            type="button"
                            onClick={handleAddTimecode}
                            className="bg-blue-500 my-4 text-left ml-auto flex justify-end hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded"
                          >
                            ADD
                          </button>
                      </div>

                        {/* List of Timecodes */}
                        <ul className="divide-y divide-gray-600  rounded text-sm text-white overflow-hidden">
                          {timecodes.map((tc, idx) => (
                         <li
  key={idx}
  className="relative px-3 py-4 text-gray-400 cursor-move"
  draggable
  onDragStart={(e) => e.dataTransfer.setData('text/plain', idx)}
  onDragOver={(e) => e.preventDefault()}
  onDrop={(e) => {
    e.preventDefault();
    const draggedIdx = parseInt(e.dataTransfer.getData('text/plain'));
    handleReorder(draggedIdx, idx);
  }}
>
  {/* 📌 Icon – বামে ফিক্সড পজিশন */}
  <AiOutlineMenu className="absolute left-3 top-1/2 -translate-y-1/2 text-2xl" />

  {/* 🏷️ Label – একদম সেন্টারে (পুরো লাইনের উপর) */}
  <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {tc.label}
  </span>

  {/* ⏱️ Time – ডানে ফিক্সড পজিশন */}
  <span className="absolute right-3 top-1/2 -translate-y-1/2">{tc.time}</span>
</li>

                          ))}
                        </ul>
                      </div>

           </div>

    <div>
                      <label className="block text-sm font-medium mb-1">
                        Video
                      </label>
                      <div className="flex flex-col">
                        <div className="flex">
                          <input
                            {...register("youtubeLink")}
                            className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
                            placeholder={
                              selectedVideo
                                ? selectedVideo.name
                                : "Upload a video or paste YouTube link"
                            }
                            onChange={(e) => {
                              // setValue('youtubeLink', e.target.value);
                              setSelectedVideo(null); // Clear selected file if pasting a link
                            }}
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setShowVideoOptions(!showVideoOptions)
                            }
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

                        {/* Video Preview Section */}
                

                     
                    </div>
                  <div className="grid grid-cols-1  gap-6">
                    <div className="mt-6">
                      <label className="block text-sm font-medium mb-2 text-white">
                        Thumbnail
                      </label>

                      <div className="flex flex-col md:flex-row gap-4  ">
                        {/* Upload Image */}
                        <div className="flex flex-col">
                          <input
                            type="file"
                            accept="image/*"
                            // {...register("imageUrl")}
                            onChange={handleFileUpload} // You need to handle and preview this
                            className="bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none w-[250px]"
                          />
                          {imagePreview && (
                            <img
                              src={imagePreview}
                              alt="Thumbnail Preview"
                              className="mt-2 w-[250px] h-auto rounded-md border border-gray-600"
                            />
                          )}
                        </div>

                        <div className="flex flex-col">
                          <label className="text-sm md:-mt-6 text-white mb-1">
                            Or choose from video (Timecode)
                          </label>
                          <div className="flex items-center gap-2">
                            <input
                              type="text"
                              placeholder="e.g. 2:15"
                              className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
                              value={thumbnailTimecode}
                              onChange={(e) =>
                                setThumbnailTimecode(e.target.value)
                              }
                            />
                          </div>

                          {/* Timecode Thumbnail Preview */}
                          {videoThumbnail && (
                            <img
                              src={videoThumbnail}
                              alt="Video Timecode Thumbnail"
                              className="mt-2 w-[250px] h-auto rounded-md border border-gray-600"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                
                  </div>
                </div>

                {/* Gender section */}

                {/*
                 */}
              </div>
            </div>

            {/* OC Haron marka section------------>>>>>> */}
            <section className="mb-10">
              <div className="flex items-center mt-8 mb-4">
                <FaLightbulb className="mr-2 text-blue-400" />
                <h2 className="text-xl  font-semibold">Simulator Type</h2>
              </div>

              <div className="relative">
                {/* Shadow gradients for scroll indication */}
                <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none"></div>
                <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none"></div>

                <div className="bg-gray-700 rounded-md shadow-lg p-4 overflow-x-auto scrollbar-hide">
                  <div className="flex gap-4 w-max">
                    {simulatorType.map((category, idx) => {
                      const categoryValue = watch(
                        `simulatorTypes.${category.name}`
                      );
                      const isCategorySelected =
                        Array.isArray(categoryValue) &&
                        categoryValue.length > 0;

                      return (
                        <div
                          key={idx}
                          className={`rounded-lg p-4 w-64 flex-shrink-0 shadow-md border transition-all ${
                            isCategorySelected
                              ? "bg-[#2a3a4a] border-blue-400"
                              : "bg-[#1E2A3A] border-gray-600"
                          }`}
                        >
                          <h3
                            className={`font-medium text-lg border-b pb-2 mb-3 ${
                              isCategorySelected
                                ? "border-blue-400"
                                : "border-gray-500"
                            }`}
                          >
                            {category.heading}
                          </h3>
                          <div className="space-y-2">
                            {category.items.map((item, i) => (
                              <div key={i} className="flex items-center group">
                                <input
                                  type="checkbox"
                                  id={`${category.name}-${i}`}
                                  value={item}
                                  {...register(
                                    `simulatorTypes.${category.name}`
                                  )}
                                  className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                                />
                                <label
                                  htmlFor={`${category.name}-${i}`}
                                  className={`ml-3 block text-sm ${
                                    isCategorySelected
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
          </div>

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

// Semuletor type

const simulatorType = [
  {
    heading: "Particles",
    name: "particles", // lowercase for form field name
    items: ["Sparks", "Debris", "Rain", "Snow", "Ashes", "Magic", "Swarms"], // Fixed typos
  },
  {
    heading: "Rigid Bodies",
    name: "rigidbodies",
    items: [
      "Destruction",
      "Impact",
      "Collisions",
      "Breaking",
      "Falling Objects",
    ],
  },
  {
    heading: "Soft Bodies",
    name: "softBodies", // Note camelCase to match backend
    items: ["Muscles system", "Anatomical deformation", "Squishy Objects"],
  },
  {
    heading: "Cloth & Groom",
    name: "clothgroom",
    items: ["Cloth Setup", "Cloth Dynamics", "Groom Setup", "Groom Dynamics"],
  },
  {
    heading: "Magic & Abstract",
    name: "magicAbstract", // Note camelCase to match backend
    items: [
      "Energy FX",
      "Plasma",
      "Portals",
      "Teleportation",
      "Glitches",
      "Hologram",
      "Conceptual",
    ],
  },
  {
    heading: "Crowd",
    name: "crowd",
    items: ["Agent Simulation", "Crowd Dynamics", "Battles", "Swarms"], // Fixed typo
  },
  {
    heading: "Mechanics & Tech",
    name: "mechanicsTech", // Note camelCase to match backend
    items: ["Vehicles Crash", "Cables / Ropes", "Mechanical Parts"],
  },
  {
    heading: "Compositing",
    name: "compositing",
    items: [
      "Volumetrics",
      "Liquids / Fluids",
      "Particles",
      "Base of FX compositing",
    ],
  },
];
