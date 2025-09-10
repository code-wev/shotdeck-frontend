'use client'
import React, { use, useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { FiUpload, FiFilm, FiYoutube, FiImage, FiClock, FiChevronDown } from 'react-icons/fi';
import { FaPalette, FaCamera, FaLightbulb} from 'react-icons/fa';
import { GiFilmStrip, GiClapperboard } from 'react-icons/gi';
import { MdPeople, MdColorLens, MdLocationOn } from 'react-icons/md';
import axios from 'axios';
import { base_url } from '@/utils/utils';
import Swal from 'sweetalert2';
import { useSecureAxios } from '@/utils/Axios';
import { IoClose } from 'react-icons/io5';
import { IoIosColorPalette } from 'react-icons/io';


export default function AddShot() {

  
const { register, handleSubmit, control, watch, reset, formState: { errors } } = useForm({
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
      compositing: []
    }
  }
});
  


  const [showYoutubeOptions, setShowYoutubeOptions] = useState(false);
  const [showVideoOptions, setShowVideoOptions] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedVideo, setSelectedVideo] = useState(null);
  const [showSelect, setShowSelect] = useState(false);
  const [staticImage, setStaticImage]= useState(null)
  const [tag, setTag] = useState('');
// video preview

const [videoPreview, setVideoPreview] = useState(null);
const [isYouTubeLink, setIsYouTubeLink] = useState(false);
const [isVimeoLink, setIsVimeoLink] = useState(false);

// time code

const [timecodes, setTimecodes] = useState([]);
const [currentDesc, setCurrentDesc] = useState('');
const [currentTime, setCurrentTime] = useState('');

// image preview
const [imagePreview, setImagePreview] = useState(null);
const [thumbnailTimecode, setThumbnailTimecode] = useState('');
const [videoThumbnail, setVideoThumbnail] = useState(null);


const handleAddTimecode = () => {
  if (currentDesc && currentTime) {
    setTimecodes(prev => [...prev, { label: currentDesc, time: currentTime }]);
    setCurrentDesc('');
    setCurrentTime('');
  }
};



const [allTags, setAllTags] = useState([]);
// const sugetionItems =  localStorage.getItem('AllTags') ? JSON.parse(localStorage.getItem('AllTags')) : null
const sugetionItems = typeof window !== 'undefined' && localStorage.getItem('AllTags') 
  ? JSON.parse(localStorage.getItem('AllTags')) 
  : null;
console.log(sugetionItems, 'this is sugetion items')
let a = 'er'



//  localStorage.getItem("user")
  // ? JSON.parse(localStorage.getItem("user"))
  // : null;

    

  const handleReorder = (fromIndex, toIndex) => {
  if (fromIndex === toIndex) return;
  
  setTimecodes(prev => {
    const newTimecodes = [...prev];
    const [movedItem] = newTimecodes.splice(fromIndex, 1);
    newTimecodes.splice(toIndex, 0, movedItem);
    return newTimecodes;
  });
};
const tagHandler = (e) => {
  e.preventDefault();
  if (e.key === 'Enter') {
    const value = e.target.value.trim();
    if (value) {
      setAllTags(prevTags => [...prevTags, value]);
      e.target.value = ''; 
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
    const response = await fetch(`/api/vimeo-thumbnail?id=${id}&time=${seconds}`);
    const data = await response.json();
    setVideoThumbnail(data.thumbnailUrl);
  }
};



// video preview

useEffect(() => {
  const url = watch('youtubeLink');
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
}, [watch('youtubeLink')]);

// Helper function to extract YouTube ID
const getYouTubeId = (url) => {
  try {
    // Handle YouTube Shorts URLs (e.g., https://youtube.com/shorts/NU44H49f7I8)
    if (url.includes('/shorts/')) {
      const shortsId = url.split('/shorts/')[1]?.split('?')[0]?.split('/')[0];
      if (shortsId?.length === 11) return shortsId;
    }

    // Handle standard YouTube URLs
    const regExp = /^.*(youtu\.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=|shorts\/|\/v\/|e\/|watch\?.*v=)([^#&?]*).*/;
    const match = url.match(regExp);
    
    // Return ID only if it's exactly 11 characters (standard YouTube ID length)
    return (match && match[2]?.length === 11) ? match[2] : null;
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
    return null;
  }
};

// Helper function to extract Vimeo ID
const getVimeoId = (url) => {
  const regExp = /^.*(vimeo\.com\/)((channels\/[A-z]+\/)|(groups\/[A-z]+\/videos\/))?([0-9]+)/;
  const match = url.match(regExp);
  return match ? match[5] : null;
};

  const axiosInstence = useSecureAxios();



//   const onSubmit = async (data) => {

// localStorage.setItem('AllTags', JSON.stringify(allTags));
//  data.tags = allTags;
//     console.log(data, 'Initial data')
//     try {
//       setIsUploading(true);
    
//     // Upload image if exists
//     if (data.imageUrl && data.imageUrl[0]) {
//       const img = data.imageUrl[0];
//       const formDataImage = new FormData();
//       formDataImage.append('file', img);
//       formDataImage.append('upload_preset', 'e-paper');
//       formDataImage.append('cloud_name', 'djf8l2ahy');
      
//       const imgResp = await axios.post(
//         'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
//         formDataImage,
//         {
//           onUploadProgress: (progressEvent) => {
//             const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
//             setUploadProgress(progress);
//           }
//         }
//       );
      
//       data.imageUrl = imgResp.data.secure_url;
//     } else {
//       // Set a default image or handle the case where no image is provided
//       data.imageUrl = null;
//     }
//     data.timecodes = timecodes
//     data.thumbnailTimecode = thumbnailTimecode

//       // Upload video if exists
//       if (selectedVideo) {
//         const formDataVideo = new FormData();
//         formDataVideo.append('file', selectedVideo);
//         formDataVideo.append('upload_preset', 'e-paper');
//         formDataVideo.append('cloud_name', 'djf8l2ahy');
        
//         const videoResp = await axios.post(
//           'https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload', 
//           formDataVideo,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             }
//           }
//         );
        
//         data.youtubeLink = videoResp.data.secure_url;
//       }
   

//       console.log('Final data with uploaded URLs:', data);
//       const resp =await axiosInstence.post(`${base_url}/shot/create`, data);
//       if(data.status){
//         await  Swal.fire({
//           title: "Sucess",
//           text: "Shot Added Sucessfully!",
//           icon: "success"})
//       }
//       console.log(resp, 'done')
//       // Here you would typically send the data to your API
//       // await axios.post('/api/shots', data);
      
//      Swal.fire({
//          title: 'Shot added successfully',
//          text: 'Shot Saved Sucessfully waitn for aproval',
//          icon: 'success'
//        });
//       resetForm();

//     } catch (error) {
//       console.error('Upload error:', error);
//  Swal.fire({
//         title: 'Error',
//         text: error.response?.data?.message || error.message || 'Failed add shot',
//         icon: 'error'
//       });
//     } finally {
//       setIsUploading(false);
//     }
//   };


const onSubmit = async (data) => {
  localStorage.setItem('AllTags', JSON.stringify(allTags));
  data.tags = allTags;
  console.log(data, 'Initial data');
  console.log(staticImage, 'this is image url')
  console.log(thumbnailTimecode, data.youtubeLink, 'asco tom ra')
  
  if(staticImage){
    data.imageUrl = staticImage
  }

  try {
    setIsUploading(true);
    
    // Upload video first if exists (since we need its URL for thumbnail generation)
    if (selectedVideo) {
      const formDataVideo = new FormData();
      formDataVideo.append('file', selectedVideo);
      formDataVideo.append('upload_preset', 'e-paper');
      formDataVideo.append('cloud_name', 'djf8l2ahy');
      
      const videoResp = await axios.post(
        'https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload', 
        formDataVideo,
        {
          onUploadProgress: (progressEvent) => {
            const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      
      data.youtubeLink = videoResp.data.secure_url;
    }

    // Handle thumbnail generation if timecode exists
    if (thumbnailTimecode && data.youtubeLink) {
      try {
        console.log(thumbnailTimecode, 'This is thumbnail time code');
        const apiUrl = `${base_url}/shot/dlp?url=${encodeURIComponent(data.youtubeLink)}&timestamp=${thumbnailTimecode}`;
        console.log(apiUrl, 'API response for thumbnail generation');
                const response = await fetch(apiUrl);
                          const blob = await response.blob();

                   const formDataThumbnail = new FormData();
          formDataThumbnail.append('file', blob);
          formDataThumbnail.append('upload_preset', 'e-paper');
          formDataThumbnail.append('cloud_name', 'djf8l2ahy');
          
          const thumbnailResp = await axios.post(
            'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload',
            formDataThumbnail
          );
          

          console.log(thumbnailResp, 'ho vai ho tor paye dhori')
          data.imageUrlThubnail = thumbnailResp.data.secure_url;
          // const blob = await response.blob();
          console.log(blob, 'this i sblob re blob')
        
        if (apiUrl.data) {
          // Convert the thumbnail URL to a blob
          // const response = await fetch(apiUrl.data);
          // const blob = await response.blob();
          
          // Upload to Cloudinary
       
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Continue with manual image upload if thumbnail generation fails
      }
    }

    // Upload manual image if exists (only if we didn't get a thumbnail from YouTube)
    // if (staticImage) {
    //   console.log('first')
    //   // const img = staticImage;
    //   // const formDataImage = new FormData();
    //   // formDataImage.append('file', img);
    //   // formDataImage.append('upload_preset', 'e-paper');
    //   // formDataImage.append('cloud_name', 'djf8l2ahy');
      
    //   // const imgResp = await axios.post(
    //   //   'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
    //   //   formDataImage,
    //   //   {
    //   //     onUploadProgress: (progressEvent) => {
    //   //       const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
    //   //       setUploadProgress(progress);
    //   //     }
    //   //   }
    //   // );
      
    //   // data.imageUrl = imgResp.data.secure_url;
    // } else if (!data.imageUrl) {
    //   data.imageUrl = null;
    // }
    
    data.timecodes = timecodes;
    data.thumbnailTimecode = thumbnailTimecode;

    console.log('Final data with uploaded URLs:', data);
    const resp = await axiosInstence.post(`${base_url}/shot/create`, data);
    
    if (data.status) {
      await Swal.fire({
        title: "Success",
        text: "Shot Added Successfully!",
        icon: "success"
      });
    }
    
    Swal.fire({
      title: 'Shot added successfully',
      text: 'Shot Saved Successfully wait for approval',
      icon: 'success'
    });
    
    resetForm();

  } catch (error) {
    console.error('Upload error:', error);
    Swal.fire({
      title: 'Error',
      text: error.response?.data?.message || error.message || 'Failed to add shot',
      icon: 'error'
    });
  } finally {
    setIsUploading(false);
  }
};

async function getYouTubeThumbnail(url, timestamp = '00:00:10') {
  try {
    const yt = new URL(url);
    let videoId;

    if (yt.hostname.includes('youtube.com') && yt.pathname.includes('/shorts/')) {
      videoId = yt.pathname.split('/')[2]; // YouTube Shorts
    } else if (yt.hostname.includes('youtu.be')) {
      videoId = yt.pathname.split('/')[1]; // Shortened URL
    } else if (yt.hostname.includes('youtube.com')) {
      videoId = yt.searchParams.get('v'); // Standard YouTube
    }

    if (!videoId) return null;

    // Try to get custom frame from backend
    try {
      const apiUrl = `/api/frame?url=${encodeURIComponent(url)}&timestamp=${timestamp}`;
      const res = await fetch(apiUrl);

      if (res.ok) {
        const blob = await res.blob();
        const objectUrl = URL.createObjectURL(blob);
        return objectUrl;
      } else {
        console.warn('API fallback: failed to get frame, status:', res.status);
      }
    } catch (err) {
      console.warn('API fallback: exception while fetching frame:', err);
    }

    // Fallback to default YouTube thumbnail
    return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
  } catch (err) {
    console.error('Error parsing YouTube URL:', err);
    return null;
  }
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

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];

    console.log(file[0], 'ami image.')
    if (!file) return;
   setVideoThumbnail(null); // Reset video thumbnail if uploading image
    setImagePreview(URL.createObjectURL(file));
    setIsUploading(true);
    setUploadProgress(0);

    // Create a form data object
    const formData = new FormData();
    formData.append('file', file);
    formData.append('upload_preset', 'e-paper'); 
    formData.append('cloud_name', 'djf8l2ahy'); 

    try {
      const response = await fetch(`https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload`, {
        method: 'POST',
        body: formData,
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          setUploadProgress(percentCompleted);
        }
      });

      const data = await response.json();
      // Set the YouTube link field with the Cloudinary URL
      reset({ ...watch(), imageUrl: data.secure_url });
      setStaticImage(data.secure_url)
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setIsUploading(false);
    }
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
    <div  className="min-h-screen mt-16 text-gray-100 md:p-6">
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
        onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg shadow-xl p-4 md:p-6">
          {/* Basic Information Section */}
        
          {/* Media Section */}
   

          {/* Technical Details Section */}
          <div className="mb-10">
         
            


{/* Checkbox detaisl */}




<div className='xl:flex gap-8 '>
<div className='xl:w-[60%] '>

  <div className="mb-10">
            <div className="flex items-center mb-4">
              <FiFilm className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Basic Information</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Title *</label>
                <input
                  {...register("title", { required: true })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="Shot title"
                />
                {errors.title && <p className="mt-1 text-sm text-red-400">Title is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Description</label>
                <textarea
                  {...register("description")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  rows={2}
                  placeholder="Brief description"
                />
              </div>
{/* Tag Section */}
<div className="relative">
  <label className="block text-sm font-medium mb-1 text-white">Tags</label>

  {/* Input Box for Adding Tags */}
  <input
  onClick={()=>{
    setShowSelect(true)
  }}
    onChange={(e) => setTag(e.target.value)}
    value={tag}
    onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
           setShowSelect(false)
        const value = e.target.value.trim();
        if (value && !allTags.includes(value)) {
          setAllTags(prevTags => [...prevTags, value]);
          setTag(''); 
             setShowSelect(false)
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
          onClick={() => setAllTags(allTags.filter((_, i) => i !== idx))}
        >
          <IoClose className="w-4 h-4 ml-2 cursor-pointer text-gray-300 hover:text-white" />
        </button>
      </span>
    ))}
  </div>

  {/* Hidden input for form submission */}
  <input type="hidden" {...register("tags")} value={allTags.join(',')} />

  {/* Suggestion Dropdown Styled Like ArtStation */}
  {  showSelect && sugetionItems?.length > 0 && (
    <select
      onChange={(e) => {
        const selected = e.target.value;
        if (selected && !allTags.includes(selected)) {
          setAllTags([...allTags, selected]);
             setShowSelect(false)
        }
        setTag('');
           setShowSelect(false)
      }}
      value=""
      className="absolute top-full mt-2 w-full bg-gray-700  border border-gray-600 text-white rounded-md shadow-lg py-8 px-3 focus:outline-none z-10"
      size={Math.min(6, sugetionItems.length)} 
    >
       <option className="py-2 px-4  text-white bg-blue-400">
         Select A Option
        </option>
  

      {sugetionItems.map((item, idx) => (
        <option key={idx} value={item} className="py-2 px-4 bg-transparent text-white hover:bg-blue-400">
          {item}
        </option>
      ))}
    </select>
  )}
</div>




              {/* Tag alert */}

              <div>
                <h4 className='underline underline-offset-4 text-red-600 mt-4'>
                  
                  
                  <span className='mr-[10px]'>
                    <input type="checkbox" name="" id="" />
                  </span>
                  <span className='font-semibold   text-2xl'>Mature Content</span> <span className=' text-lg'>(Please Note: Any Sexualy Explicit, Gore, or extremely violent content will not be accepted Keep submissions appropriate and respectful for all audiences)</span></h4>
              </div>

              <div>
         

              </div>

<div>

</div>
              <div>
                <label className="block text-sm font-medium mb-1">Media Type *</label>
                <select
                  {...register("mediaType", { required: true })}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select media type</option>
                  <option value="Movie">Movie</option>
                  <option value="TV">TV</option>
                  <option value="Trailer">Trailer</option>
                  <option value="Music Video">Music Video</option>
                  <option value="Commercial">Commercial</option>
                </select>
                {errors.mediaType && <p className="mt-1 text-sm text-red-400">Media type is required</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Release Year</label>
                <input
                  type="number"
                  {...register("releaseYear")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="2023"
                  min="1900"
                  max={new Date().getFullYear()}
                />
              </div>

            </div>



            
          </div>



              <div className="md:col-span-2 mb-8">
           <div className='flex gap-2 items-center mb-4'>
                               <FaCamera className="mr-2 text-blue-400" />
                <label className="block  text-xl ">Genre</label>
           </div>
                <CheckboxGroup
                  name="genre"
                  register={register}
                  options={[
                    { value: "Movie/TV", label: "Movie/TV" },
                    { value: "Music Video", label: " Music Video" },
                    { value: "Commercial", label: "Commercial" },
                    // { value: "DC Extended Universe", label: "DC Extended Universe" },
                    // { value: "Drama", label: "Drama" },
                    // { value: "Satire", label: "Satire" },
                    // { value: "Science Fiction", label: "Science Fiction" },
                    // { value: "Vigilante", label: "Vigilante" },
                    // { value: "Dark Comedy", label: "Dark Comedy" },
                    // { value: "Superhero", label: "Superhero" }
                  ]}
                />
              </div>


     <div className="flex items-center mb-4">
              <FaCamera className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Technical Details</h2>
            </div>
<section className='my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-5 gap-4 justify-between'>
  {/* Focal Length */}
  <div>
    <h4>Focal Length</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "ultra-wide", value: "Ultra Wide", label: "Ultra Wide" },
        { id: "wide", value: "Wide", label: "Wide" },
        { id: "medium", value: "Medium", label: "Medium" },
        { id: "long", value: "Long", label: "Long" },
        { id: "telephoto", value: "Telephoto", label: "Telephoto" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("focalLength")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Lighting Conditions */}
  <div>
    <h4>Lighting Conditions</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "dawn", value: "Dawn", label: "Dawn" },
        { id: "day", value: "Day", label: "Day" },
        { id: "night", value: "Night", label: "Night" },
        { id: "dusk", value: "Dusk", label: "Dusk" },
        { id: "interior", value: "Interior", label: "Interior" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("lightingConditions")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Video Type */}
  <div>
    <h4>Video Type</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "reference", value: "Reference", label: "Reference" },
        { id: "tuto", value: "Tuto", label: "Tuto" },
        { id: "breakdown", value: "Breakdown", label: "Breakdown" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("videoType")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Reference Type */}
  <div>
    <h4>Reference Type</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "real-video", value: "Real Video", label: "Real Video" },
        { id: "2d", value: "2D", label: "2D" },
        { id: "3d", value: "3D", label: "3D" },
        { id: "full-cgi", value: "Full CGI", label: "Full CGI" },
        { id: "live-action", value: "Live Action", label: "Live Action" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("referenceType")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Video Speed */}
  <div>
    <h4>Video Speed</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "slow-motion", value: "Slow Motion", label: "Slow Motion" },
        { id: "normal", value: "Normal", label: "Normal" },
        { id: "accelerated", value: "Accelerated", label: "Accelerated" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("videoSpeed")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Video Quality */}
  <div>
    <h4>Video Quality</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "low", value: "Low", label: "Low" },
        { id: "medium-quality", value: "Medium", label: "Medium" },
        { id: "high", value: "High", label: "High" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("videoQuality")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>







  
</section>


 <div className=" grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
                <select
                  {...register("aspectRatio")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select aspect ratio</option>
                  <option value="9:16">9:16</option>
                  <option value="1:1">1:1</option>
                  <option value="1.20">1.20</option>
                  <option value="1.33">1.33</option>
                  <option value="1.37">1.37</option>
                  <option value="1.43">1.43</option>
                  <option value="1.66">1.66</option>
                  <option value="1.78">1.78</option>
                  <option value="1.85">1.85</option>
                  <option value="1.90">1.90</option>
                  <option value="2.00">2.00</option>
                  <option value="2.20">2.20</option>
                  <option value="2.35">2.35</option>
                  <option value="2.39">2.39</option>
                  <option value="2.55">2.55</option>
                  <option value="2.67">2.67</option>
                  <option value="2.76">2.76</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Optical Format</label>
                <select
                  {...register("opticalFormat")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select optical format</option>
                  <option value="Anamorphic">Anamorphic</option>
                  <option value="Spherical">Spherical</option>
                  <option value="Super 35">Super 35</option>
                  <option value="3 perf">3 perf</option>
                  <option value="2 perf">2 perf</option>
                  <option value="Open Gate">Open Gate</option>
                  <option value="3D">3D</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Format</label>
                <select
                  {...register("format")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select format</option>
                  <option value="Film - 35mm">Film - 35mm</option>
                  <option value="Film - 16mm">Film - 16mm</option>
                  <option value="Film - Super 8mm">Film - Super 8mm</option>
                  <option value="Film - 65mm">Film - 65mm</option>
                  <option value="Film - 70mm">Film - 70mm</option>
                  <option value="Film - IMAX">Film - IMAX</option>
                  <option value="Digital">Digital</option>
                  <option value="Animation">Animation</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Camera</label>
                <input
                  {...register("camera")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Sony VENICE"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lens</label>
                <input
                  {...register("lens")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Cooke Anamorphic/I SF"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Film Stock / Resolution</label>
                <input
                  {...register("filmStockResolution")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. 4K"
                />
              </div>
            </div>
{/* Simulation */}


<div className="flex items-center mb-4 mt-8">
  <FiFilm className="mr-2 text-blue-400" />
  <h2 className="text-xl font-semibold">Simulation</h2>
</div>

<section className='my-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-3 2xl:grid-cols-5 lg:grid-cols-5 gap-4 justify-between'>
  {/* Simulation Size */}
  <div>
    <h4>Simulation Scale</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "extra-small", value: "extra-small", label: "Extra Small (<10cm)" },
        { id: "small", value: "small", label: "Small (10cm - 1m)" },
        { id: "human", value: "human", label: "Human (10cm -1m)" },
        { id: "structural", value: "structural", label: "Structural (10m - 1km)" },
        { id: "massive", value: "massive", label: "Massive (>1km)" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("simulationSize")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Style */}
  <div>
    <h4>Style</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "realist", value: "realist", label: "Realist" },
        { id: "semi-stylized", value: "semi-stylized", label: "Semi Stylized" },
        { id: "stylized", value: "stylized", label: "Stylized" },
        { id: "anime", value: "anime", label: "Anime" },
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("simulationStyle")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Motion Style */}
  <div>
    <h4>Motion Style</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "realist-motion", value: "realist", label: "Realist" },
        { id: "stylized-motion", value: "stylized", label: "Stylized" },
        { id: "anime-motion", value: "anime", label: "Anime" }
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("motionStyle")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
        </div>
      ))}
    </div>
  </div>

  {/* Emitter Speed */}
  <div>
    <h4>Emitter Speed</h4>
    <div className='bg-gray-700 space-y-4 rounded-md p-4 text-white'>
      {[
        { id: "static-emitter", value: "static", label: "Static" },
        { id: "slow-emitter", value: "slow", label: "Slow" },
        { id: "fast-emitter", value: "fast", label: "Fast" },
      ].map((item) => (
        <div key={item.id} className='flex items-center gap-2 cursor-pointer'>
          <input
            type="checkbox"
            id={item.id}
            value={item.value}
            {...register("emitterSpeed")}
            className='cursor-pointer'
          />
          <label htmlFor={item.id} className='cursor-pointer'>{item.label}</label>
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
        { id: "ue5-niagara", value: "ue5-niagara", label: "UE5 (Niagara)" }
      ].map((item) => (
        <div key={item.id} className="flex items-center gap-2 cursor-pointer">
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


<section>
     <div className="mb-10">
            <div className="flex  items-center mb-4">
              <FaPalette className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Visual Style</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-1  gap-6">
              <div className="md:col-span-2 lg:col-span-1">
                <div className='flex items-center gap-2'>
                                 
                <label className="block text-sm font-medium  text-2xl mb-1">Color Palette</label>
                </div>

             <div className='bg-gray-700 p-4 rounded-md'>
                 <CheckboxGroup
                  name="color"
                  register={register}
                  options={[
                    { value: "Warm", label: "Warm" },
                    { value: "Cool", label: "Cool" },
                    { value: "Mixed", label: "Mixed" },
                    { value: "Saturated", label: "Saturated" },
                    { value: "Desaturated", label: "Desaturated" },
                    { value: "Red", label: "Red" },
                    { value: "Orange", label: "Orange" },
                    { value: "Yellow", label: "Yellow" },
                    { value: "Green", label: "Green" },
                    { value: "Cyan", label: "Cyan" },
                    { value: "Blue", label: "Blue" },
                    { value: "Purple", label: "Purple" },
                    { value: "Magenta", label: "Magenta" },
                    { value: "Pink", label: "Pink" },
                    { value: "White", label: "White" },
                    { value: "Sepia", label: "Sepia" },
                    { value: "Black & White", label: "Black & White" }
                  ]}
                />
             </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Custom Color (HEX)</label>
                <div className="flex items-center">
                  <input
                    {...register("customColor")}
                    className="w-24 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                    placeholder="#RRGGBB"
                  />
                  <div className="ml-3 w-10 h-10 rounded-md border border-gray-600" 
                       style={{ backgroundColor: watch('customColor') || 'transparent' }} />
                </div>
              </div>

              


                   <div>
                <label className="block text-sm font-medium mb-1">Shot Type</label>
                <div className='bg-gray-700 rounded p-4'>
                  <CheckboxGroup
                  name="shotType"
                  register={register}
                  options={[
                    { value: "Aerial", label: "Aerial" },
                    { value: "Overhead", label: "Overhead" },
                    { value: "High Angle", label: "High Angle" },
                    { value: "Low Angle", label: "Low Angle" },
                    { value: "Dutch Angle", label: "Dutch Angle" },
                    { value: "Establishing Shot", label: "Establishing Shot" },
                    { value: "Over the Shoulder", label: "Over the Shoulder" },
                    { value: "Clean Single", label: "Clean Single" },
                    { value: "2 Shot", label: "2 Shot" },
                    { value: "3 Shot", label: "3 Shot" },
                    { value: "Group Shot", label: "Group Shot" },
                    { value: "Insert", label: "Insert" }
                  ]}
                />
                </div>
              </div>


           
            </div>
          </div>


          <div className="mb-10">
            <div className="flex items-center mb-4">
              <FaLightbulb className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Lighting</h2>
            </div>
            
            <div className="grid grid-cols-1  gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Lighting Style</label>
               <div className='bg-gray-700 p-4 rounded-md'>
                 <CheckboxGroup
                  name="lightingStyle"
                  register={register}
                  options={[
                    { value: "Soft Light", label: "Soft Light" },
                    { value: "Hard Light", label: "Hard Light" },
                    { value: "High Contrast", label: "High Contrast" },
                    { value: "Low Contrast", label: "Low Contrast" },
                    { value: "Silhouette", label: "Silhouette" },
                    { value: "Top Light", label: "Top Light" },
                    { value: "Underlight", label: "Underlight" },
                    { value: "Side Light", label: "Side Light" },
                    { value: "Backlight", label: "Backlight" },
                    { value: "Edge Light", label: "Edge Light" }
                  ]}
                />
               </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Lighting Type</label>
               <div className='bg-gray-700 p-4 rounded-md'>
                 <CheckboxGroup
                  name="lightingType"
                  register={register}
                  options={[
                    { value: "Daylight", label: "Daylight" },
                    { value: "Sunny", label: "Sunny" },
                    { value: "Overcast", label: "Overcast" },
                    { value: "Moonlight", label: "Moonlight" },
                    { value: "Artificial Light", label: "Artificial Light" },
                    { value: "Practical Light", label: "Practical Light" },
                    { value: "Fluorescent", label: "Fluorescent" },
                    { value: "Firelight", label: "Firelight" },
                    { value: "Mixed Light", label: "Mixed Light" }
                  ]}
                />
               </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Time of Day</label>
             <div className='bg-gray-700 rounded-md p-4'>
                 <CheckboxGroup
                  name="timeOfDay"
                  register={register}
                  options={[
                    { value: "Day", label: "Day" },
                    { value: "Night", label: "Night" },
                    { value: "Dusk", label: "Dusk" },
                    { value: "Dawn", label: "Dawn" },
                    { value: "Sunrise", label: "Sunrise" },
                    { value: "Sunset", label: "Sunset" }
                  ]}
                />
             </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Interior/Exterior</label>
              <div className='bg-gray-700 p-4 rounded-md'>
                  <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Interior"
                      {...register("interiorExterior")}
                      className="rounded bg-gray-700 border-gray-600 text-[#31caff] "
                    />
                    <span>Interior</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="radio"
                      value="Exterior"
                      {...register("interiorExterior")}
                      className="rounded bg-gray-700 border-gray-600 text-[#31caff] "
                    />
                    <span>Exterior</span>
                  </label>
                </div>
              </div>
              </div>
            </div>
          </div>
</section>

           
</div>

<div className='border-r border-gray-700 border-2'>
  
</div>
<div>
  {/* THis is media secaiton */}


  <div className="mb-10">
            <div className="flex items-center mb-4">
              <MdPeople className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">People</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Director</label>
                <input
                  {...register("director")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Fred Toye"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Cinematographer</label>
                <input
                  {...register("cinematographer")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Dan Stoloff"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Production Designer</label>
                <input
                  {...register("productionDesigner")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Arvinder Grewal"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Costume Designer</label>
                <input
                  {...register("costumeDesigner")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Rebecca Gregg, Laura Jean Shannon"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Editor</label>
                <input
                  {...register("editor")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Jonathan Chibnall"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Colorist</label>
                <input
                  {...register("colorist")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Siggy Ferstl"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Actors</label>
                <input
                  {...register("actors")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Erin Moriarty"
                />
              </div>
            </div>
          </div>




      <div className="mb-10">
            <div className="flex items-center mb-4">
              <FiImage className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Media</h2>
            </div>
            
            <div className="grid grid-cols-1  gap-6">
        <div className="mt-6">
  <label className="block text-sm font-medium mb-2 text-white">Thumbnail</label>

  <div className="flex flex-col md:flex-row gap-4 items-start md:items-end">
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
      <label className="text-sm text-white mb-1">Or choose from video (Timecode)</label>
      <div className="flex items-center gap-2">
        <input
          type="text"
          placeholder="e.g. 2:15"
          className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
          value={thumbnailTimecode}
          onChange={(e) => setThumbnailTimecode(e.target.value)}
        />
        {/* <button
          type="button"
          onClick={generateThumbnailFromTimecode}
          className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm"
        >
          Capture
        </button> */}
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


             <div>
  <label className="block text-sm font-medium mb-1">Video</label>
  <div className="flex flex-col">
    <div className="flex">
      <input
        {...register("youtubeLink")}
        className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
        placeholder={selectedVideo ? selectedVideo.name : "Upload a video or paste YouTube link"}
        onChange={(e) => {
          // setValue('youtubeLink', e.target.value);
          setSelectedVideo(null); // Clear selected file if pasting a link
        }}
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
    
    {/* Video Preview Section */}
    {(videoPreview || isYouTubeLink || isVimeoLink) && (
      <div className="mt-4">
        <h4 className="text-sm font-medium mb-2">Video Preview</h4>
        <div className="aspect-w-16 aspect-h-9 bg-black rounded-md overflow-hidden">
          {videoPreview && (
            <video 
              src={videoPreview} 
              controls 
              className="w-full h-full object-contain"
            />
          )}
          
          {isYouTubeLink && (
            <iframe
              src={`https://www.youtube.com/embed/${getYouTubeId(watch('youtubeLink'))}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          )}
          
          {isVimeoLink && (
            <iframe
              src={`https://player.vimeo.com/video/${getVimeoId(watch('youtubeLink'))}`}
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
            ></iframe>
          )}
        </div>
      </div>
    )}
  </div>

<div className="mt-4">
  <label className="block text-sm font-medium mb-2 text-white">Interest Point</label>

  {/* Input Row */}
  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mb-3">
    <input
      type="text"
      className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
      placeholder="Short Description"
      value={currentDesc}
      onChange={(e) => setCurrentDesc(e.target.value)}
    />
    <input
      type="text"
      className="sm:w-32 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-sm text-white placeholder-gray-400 focus:outline-none"
      placeholder="Choose Timecode"
      value={currentTime}
      onChange={(e) => setCurrentTime(e.target.value)}
    />
    <button
    type='button'
      onClick={handleAddTimecode}
      className="bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded"
    >
      ADD
    </button>
  </div>

  {/* List of Timecodes */}
  <ul className="divide-y divide-gray-600 border border-gray-600 rounded text-sm text-white overflow-hidden">
    {timecodes.map((tc, idx) => (
      <li 
        key={idx} 
        className="flex items-center justify-between px-3 py-2 bg-gray-700 hover:bg-gray-600 transition cursor-move"
        draggable
        onDragStart={(e) => e.dataTransfer.setData("text/plain", idx)}
        onDragOver={(e) => {
          e.preventDefault();
          e.currentTarget.style.backgroundColor = "#4B5563"; // Change bg on drag over
        }}
        onDragLeave={(e) => {
          e.currentTarget.style.backgroundColor = "#374151"; // Revert bg when leaves
        }}
        onDrop={(e) => {
          e.preventDefault();
          e.currentTarget.style.backgroundColor = "#374151"; // Revert bg after drop
          const draggedIdx = parseInt(e.dataTransfer.getData("text/plain"));
          handleReorder(draggedIdx, idx);
        }}
      >
        <div className="flex items-center gap-3">
          <div className="w-4 h-4 bg-gray-400 rounded-sm"></div> {/* Dummy icon */}
          <span>{tc.label}</span>
        </div>
        <span>{tc.time}</span>
      </li>
    ))}
  </ul>
</div>

</div>



            </div>

        
          </div>









<section className='grid grid-cols-2 gap-6'>
  <div>
                <label className="block text-sm font-medium mb-1">Time Period</label>
                <select
                  {...register("timePeriod")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select time period</option>
                  <option value="Future">Future</option>
                  <option value="2020s">2020s</option>
                  <option value="2010s">2010s</option>
                  <option value="2000s">2000s</option>
                  <option value="1900s">1900s</option>
                  <option value="1800s">1800s</option>
                  <option value="1700s">1700s</option>
                  <option value="Renaissance: 1400–1700">Renaissance: 1400–1700</option>
                  <option value="Medieval: 500–1499">Medieval: 500–1499</option>
                  <option value="Ancient: 2000BC–500AD">Ancient: 2000BC–500AD</option>
                  <option value="Stone Age: pre–2000BC">Stone Age: pre–2000BC</option>
                </select>
              </div>

                 <div>
                <label className="block text-sm font-medium mb-1">Frame Size</label>
                <select
                  {...register("frameSize")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select frame size</option>
                  <option value="Extreme Wide">Extreme Wide</option>
                  <option value="Wide">Wide</option>
                  <option value="Medium Wide">Medium Wide</option>
                  <option value="Medium">Medium</option>
                  <option value="Medium Close-Up">Medium Close-Up</option>
                  <option value="Close-Up">Close-Up</option>
                  <option value="Extreme Close-Up">Extreme Close-Up</option>
                </select>
              </div>

         
              <div>
                <label className="block text-sm font-medium mb-1">Lens Size</label>
                <select
                  {...register("lensType")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select lens size</option>
                  <option value="Ultra Wide / Fisheye">Ultra Wide / Fisheye</option>
                  <option value="Wide">Wide</option>
                  <option value="Medium">Medium</option>
                  <option value="Long Lens">Long Lens</option>
                  <option value="Telephoto">Telephoto</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Composition</label>
                <select
                  {...register("composition")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                >
                  <option value="">Select composition</option>
                  <option value="Center">Center</option>
                  <option value="Left Heavy">Left Heavy</option>
                  <option value="Right Heavy">Right Heavy</option>
                  <option value="Balanced">Balanced</option>
                  <option value="Symmetrical">Symmetrical</option>
                  <option value="Short Side">Short Side</option>
                </select>
              </div>
</section>

{/* Gender section */}



{/* 
 */}

 <section className='my-8 mb-8'>
<div>
  <label className="block text-sm font-medium mb-4">Gender</label>
  <div className='bg-gray-700 rounded p-4'>
    <CheckboxGroup
      name="gender"
      register={register}
      options={[
        { value: "male", label: "Male" },
        { value: "female", label: "Female" },
        { value: "trans", label: "Trans" },
        { value: "any", label: "Any" }
      ]}
    />
  </div>
</div>
    <div className="mb-10 mt-8">
            <div className="flex items-center mb-4">
              <MdLocationOn className="mr-2 text-blue-400" />
              <h2 className="text-xl font-semibold">Location & Time</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium mb-1">Shot Time</label>
                <div className="flex items-center">
                  <input
                    {...register("shotTime")}
                    className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                    placeholder="e.g. 00:21:15"
                  />
                  <FiClock className="ml-2 text-gray-400" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Set</label>
                <input
                  {...register("set")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Car (Driving) > Front Passenger Seat"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Story Location</label>
                <input
                  {...register("storyLocation")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. New York > New York City"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Filming Location</label>
                <input
                  {...register("filmingLocation")}
                  className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none "
                  placeholder="e.g. Canada > Ontario"
                />
              </div>
            </div>
          </div>
 </section>
          
</div>

</div>






{/* OC Haron marka section------------>>>>>> */}
<section className="mb-10">
  <div className="flex items-center mb-4">
    <FaLightbulb className="mr-2 text-blue-400" />
    <h2 className="text-xl font-semibold">Simulator Type</h2>
  </div>

 <div className="relative">
  {/* Shadow gradients for scroll indication */}
  <div className="absolute left-0 top-0 bottom-0 w-8 bg-gradient-to-r from-gray-800 to-transparent z-10 pointer-events-none"></div>
  <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-gray-800 to-transparent z-10 pointer-events-none"></div>
  
  <div className="bg-gray-700 rounded-md shadow-lg p-4 overflow-x-auto scrollbar-hide">
    <div className="flex gap-4 w-max">
      {simulatorType.map((category, idx) => {
        const categoryValue = watch(`simulatorTypes.${category.name}`);
        const isCategorySelected = Array.isArray(categoryValue) && categoryValue.length > 0;
        
        return (
          <div 
            key={idx} 
            className={`rounded-lg p-4 w-64 flex-shrink-0 shadow-md border transition-all ${
              isCategorySelected 
                ? "bg-[#2a3a4a] border-blue-400" 
                : "bg-[#1E2A3A] border-gray-600"
            }`}
          >
            <h3 className={`font-medium text-lg border-b pb-2 mb-3 ${
              isCategorySelected ? "border-blue-400" : "border-gray-500"
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

          {/* Visual Style Section */}
       


          

          {/* Lighting Section */}
          

          {/* People Section */}
        

          {/* Location & Time Section */}
        

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
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Uploading...
                </>
              ) : (
                'Add Shot'
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
    heading: 'Particles',
    name: 'particles', // lowercase for form field name
    items: ['Sparks', 'Debris', 'Rain', 'Snow', 'Ashes', 'Magic', 'Swarms'] // Fixed typos
  },
  {
    heading: 'Rigid Bodies',
    name: 'rigidbodies',
    items: ['Destruction', 'Impact', 'Collisions', 'Breaking', 'Falling Objects']
  },
  {
    heading: 'Soft Bodies',
    name: 'softBodies', // Note camelCase to match backend
    items: ['Muscles system', 'Anatomical deformation', 'Squishy Objects']
  },
  {
    heading: 'Cloth & Groom',
    name: 'clothgroom',
    items: ['Cloth Setup', 'Cloth Dynamics', 'Groom Setup', 'Groom Dynamics']
  },
  {
    heading: 'Magic & Abstract',
    name: 'magicAbstract', // Note camelCase to match backend
    items: ['Energy FX', 'Plasma', 'Portals', 'Teleportation', 'Glitches', 'Hologram', 'Conceptual']
  },
  {
    heading: 'Crowd',
    name: 'crowd',
    items: ['Agent Simulation', 'Crowd Dynamics', 'Battles', 'Swarms'] // Fixed typo
  },
  {
    heading: 'Mechanics & Tech',
    name: 'mechanicsTech', // Note camelCase to match backend
    items: ['Vehicles Crash', 'Cables / Ropes', 'Mechanical Parts']
  },
  {
    heading: 'Compositing',
    name: 'compositing',
    items: ['Volumetrics', 'Liquids / Fluids', 'Particles', 'Base of FX compositing']
  }
];



















// 'use client'
// import React, { useState } from 'react';
// import { useForm } from 'react-hook-form';
// import { FiUpload, FiFilm, FiYoutube, FiImage, FiClock, FiChevronDown, FiX } from 'react-icons/fi';
// import { FaPalette, FaCamera, FaLightbulb } from 'react-icons/fa';
// import { GiFilmStrip, GiClapperboard } from 'react-icons/gi';
// import { MdPeople, MdColorLens, MdLocationOn } from 'react-icons/md';
// import axios from 'axios';

// export default function AddShot() {
//   const { 
//     register, 
//     handleSubmit, 
//     watch, 
//     reset, 
//     setValue,
//     formState: { errors } 
//   } = useForm();
  
//   const [showVideoOptions, setShowVideoOptions] = useState(false);
//   const [uploadProgress, setUploadProgress] = useState(0);
//   const [isUploading, setIsUploading] = useState(false);
//   const [selectedVideo, setSelectedVideo] = useState(null);

//   const onSubmit = async (data) => {
//     try {
//       setIsUploading(true);
      
//       // Upload image if exists
//       if (data.imageUrl && data.imageUrl[0]) {
//         const img = data.imageUrl[0];
//         const formDataImage = new FormData();
//         formDataImage.append('file', img);
//         formDataImage.append('upload_preset', 'e-paper');
//         formDataImage.append('cloud_name', 'djf8l2ahy');
        
//         const imgResp = await axios.post(
//           'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
//           formDataImage,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             }
//           }
//         );
        
//         data.imageUrl = imgResp.data.secure_url;
//       }

//       // Upload video if exists
//       if (selectedVideo) {
//         const formDataVideo = new FormData();
//         formDataVideo.append('file', selectedVideo);
//         formDataVideo.append('upload_preset', 'e-paper');
//         formDataVideo.append('cloud_name', 'djf8l2ahy');
        
//         const videoResp = await axios.post(
//           'https://api.cloudinary.com/v1_1/djf8l2ahy/video/upload', 
//           formDataVideo,
//           {
//             onUploadProgress: (progressEvent) => {
//               const progress = 50 + Math.round((progressEvent.loaded * 50) / progressEvent.total);
//               setUploadProgress(progress);
//             }
//           }
//         );
        
//         data.youtubeLink = videoResp.data.secure_url;
//       }

//       console.log('Final data with uploaded URLs:', data);
//       // Here you would typically send the data to your API
//       // await axios.post('/api/shots', data);
      
//       alert('Shot added successfully!');
//       resetForm();

//     } catch (error) {
//       console.error('Upload error:', error);
//       alert('Error uploading files. Please try again.');
//     } finally {
//       setIsUploading(false);
//     }
//   };

//   const resetForm = () => {
//     reset();
//     setSelectedVideo(null);
//     setUploadProgress(0);
//   };

//   const handleVideoUpload = async (event) => {
//     const file = event.target.files[0];
//     if (!file) return;

//     setSelectedVideo(file);
//     setShowVideoOptions(false);
//   };

//   // Checkbox group component
//   const CheckboxGroup = ({ name, options, register, className = "" }) => (
//     <div className={`grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 w-full gap-2 ${className}`}>
//       {options.map((option) => (
//         <label key={option.value} className="flex items-center space-x-2">
//           <input
//             type="checkbox"
//             value={option.value}
//             {...register(name)}
//             className="rounded bg-gray-700 border-gray-600 text-[#31caff]"
//           />
//           <span>{option.label}</span>
//         </label>
//       ))}
//     </div>
//   );

//   return (
//     <div className="min-h-screen text-gray-100 p-6 bg-gray-900">
//       <div className="w-full max-w-6xl mx-auto">
//         <div className="flex items-center mb-8">
//           <GiClapperboard className="text-2xl mr-2 text-blue-400" />
//           <h1 className="text-2xl font-bold">Add New Shot</h1>
//         </div>

//         <form onSubmit={handleSubmit(onSubmit)} className="bg-gray-800 rounded-lg shadow-xl p-6">
//           {/* Basic Information Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FiFilm className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Basic Information</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Title *</label>
//                 <input
//                   {...register("title", { required: true })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                   placeholder="Shot title"
//                 />
//                 {errors.title && <p className="mt-1 text-sm text-red-400">Title is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Description</label>
//                 <textarea
//                   {...register("description")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                   rows={2}
//                   placeholder="Brief description"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Media Type *</label>
//                 <select
//                   {...register("mediaType", { required: true })}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                 >
//                   <option value="">Select media type</option>
//                   <option value="Movie">Movie</option>
//                   <option value="TV">TV</option>
//                   <option value="Trailer">Trailer</option>
//                   <option value="Music Video">Music Video</option>
//                   <option value="Commercial">Commercial</option>
//                 </select>
//                 {errors.mediaType && <p className="mt-1 text-sm text-red-400">Media type is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Release Year</label>
//                 <input
//                   type="number"
//                   {...register("releaseYear")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                   placeholder="2023"
//                   min="1900"
//                   max={new Date().getFullYear()}
//                 />
//               </div>

//               <div className="md:col-span-2">
//                 <label className="block pb-2 text-xl mb-1">Genre</label>
//                 <CheckboxGroup
//                   name="genre"
//                   register={register}
//                   options={[
//                     { value: "Action", label: "Action" },
//                     { value: "Comedy", label: "Comedy" },
//                     { value: "Drama", label: "Drama" },
//                     { value: "Science Fiction", label: "Science Fiction" },
//                     { value: "Horror", label: "Horror" },
//                     { value: "Romance", label: "Romance" },
//                     { value: "Thriller", label: "Thriller" },
//                     { value: "Documentary", label: "Documentary" }
//                   ]}
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Media Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FiImage className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Media</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Image *</label>
//                 <div className="flex">
//                   <input
//                     type="file"
//                     accept="image/*"
//                     {...register("imageUrl", { required: true })}
//                     className="flex-1 bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none"
//                   />
//                 </div>
//                 {errors.imageUrl && <p className="mt-1 text-sm text-red-400">Image is required</p>}
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Video</label>
//                 <div className="flex flex-col">
//                   <div className="flex">
//                     <input
//                       {...register("youtubeLink")}
//                       className="flex-1 bg-gray-700 border border-gray-600 rounded-l-md py-2 px-3 focus:outline-none"
//                       placeholder={selectedVideo ? selectedVideo.name : "Upload a video or paste YouTube link"}
//                       readOnly
//                     />
//                     <button
//                       type="button"
//                       onClick={() => setShowVideoOptions(!showVideoOptions)}
//                       className="bg-red-600 hover:bg-red-700 px-4 rounded-r-md flex items-center transition-colors"
//                     >
//                       <FiYoutube className="mr-1" /> <FiChevronDown />
//                     </button>
//                   </div>
                  
//                   {/* Video Options Dropdown */}
//                   {showVideoOptions && (
//                     <div className="mt-2 bg-gray-700 rounded-md p-2 border border-gray-600">
//                       <div className="flex flex-col space-y-2">
//                         <label className="flex items-center px-3 py-2 hover:bg-gray-600 rounded cursor-pointer">
//                           <input
//                             type="file"
//                             accept="video/*"
//                             className="hidden"
//                             onChange={handleVideoUpload}
//                           />
//                           <span className="flex items-center">
//                             <FiUpload className="mr-2" /> Upload Video
//                           </span>
//                         </label>
//                         <div 
//                           className="px-3 py-2 hover:bg-gray-600 rounded cursor-pointer"
//                           onClick={() => {
//                             setSelectedVideo(null);
//                             setValue('youtubeLink', '');
//                             setShowVideoOptions(false);
//                           }}
//                         >
//                           <span className="flex items-center">
//                             <FiX className="mr-2" /> Clear
//                           </span>
//                         </div>
//                       </div>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </div>

//             {/* Upload Progress */}
//             {isUploading && (
//               <div className="mt-4">
//                 <div className="w-full bg-gray-700 rounded-full h-2.5">
//                   <div 
//                     className="bg-blue-600 h-2.5 rounded-full" 
//                     style={{ width: `${uploadProgress}%` }}
//                   ></div>
//                 </div>
//                 <p className="text-sm text-gray-400 mt-1">
//                   Uploading: {uploadProgress}%
//                 </p>
//               </div>
//             )}
//           </div>

//           {/* Technical Details Section */}
//           <div className="mb-10">
//             <div className="flex items-center mb-4">
//               <FaCamera className="mr-2 text-blue-400" />
//               <h2 className="text-xl font-semibold">Technical Details</h2>
//             </div>
            
//             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//               <div>
//                 <label className="block text-sm font-medium mb-1">Aspect Ratio</label>
//                 <select
//                   {...register("aspectRatio")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                 >
//                   <option value="">Select aspect ratio</option>
//                   <option value="16:9">16:9</option>
//                   <option value="4:3">4:3</option>
//                   <option value="1.85:1">1.85:1</option>
//                   <option value="2.39:1">2.39:1</option>
//                   <option value="1:1">1:1</option>
//                 </select>
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Camera</label>
//                 <input
//                   {...register("camera")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                   placeholder="e.g. Sony A7S III"
//                 />
//               </div>

//               <div>
//                 <label className="block text-sm font-medium mb-1">Lens</label>
//                 <input
//                   {...register("lens")}
//                   className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-[#31caff]"
//                   placeholder="e.g. Canon 24-70mm f/2.8"
//                 />
//               </div>
//             </div>
//           </div>

//           {/* Submit Section */}
//           <div className="flex justify-end space-x-4 mt-8">
//             <button
//               type="button"
//               onClick={resetForm}
//               className="px-6 py-2 border border-gray-600 rounded-md hover:bg-gray-700 transition-colors"
//               disabled={isUploading}
//             >
//               Reset
//             </button>
//             <button
//               type="submit"
//               className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-md transition-colors flex items-center justify-center min-w-32"
//               disabled={isUploading}
//             >
//               {isUploading ? (
//                 <>
//                   <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
//                     <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
//                     <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
//                   </svg>
//                   Uploading...
//                 </>
//               ) : (
//                 'Add Shot'
//               )}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }




