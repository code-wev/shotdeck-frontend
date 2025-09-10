
const onSubmit = async (data) => {
  localStorage.setItem('AllTags', JSON.stringify(allTags));
  data.tags = allTags;
  console.log(data, 'Initial data');

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
const response = await fetch(`/api/frames?url=${encodeURIComponent(data.youtubeLink)}&timestamp=${thumbnailTimecode}`);
console.log(response, 'ahare response')

if (!response.ok) throw new Error('Failed to fetch thumbnail');

const blob = await response.blob(); // this will now work
        // console.log(apiUrl, 'API response for thumbnail generation MAMUR BETa');
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

          // const blob = await apiUrl.data.blob();
                  console.log(blob, 'Header put re header put tore ami khaiya lamo')
   
        
        if (apiUrl.data) {
          // Convert the thumbnail URL to a blob
          // const response = await fetch(apiUrl.data);
          // const blob = await response.blob();
          
          // Upload to Cloudinary
     console.log('ha ha ha atai bastob')
        }
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        // Continue with manual image upload if thumbnail generation fails
      }
    }

    // Upload manual image if exists (only if we didn't get a thumbnail from YouTube)
    if (!data.imageUrl && data.imageUrl && data.imageUrl[0]) {
      const img = data.imageUrl[0];
      const formDataImage = new FormData();
      formDataImage.append('file', img);
      formDataImage.append('upload_preset', 'e-paper');
      formDataImage.append('cloud_name', 'djf8l2ahy');
      
      const imgResp = await axios.post(
        'https://api.cloudinary.com/v1_1/djf8l2ahy/image/upload', 
        formDataImage,
        {
          onUploadProgress: (progressEvent) => {
            const progress = Math.round((progressEvent.loaded * 50) / progressEvent.total);
            setUploadProgress(progress);
          }
        }
      );
      
      data.imageUrl = imgResp.data.secure_url;
    } else if (!data.imageUrl) {
      data.imageUrl = null;
    }
    
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
// TODO 1) kio kono kotha bolen na kno.ki soossa?

সারাদেশ