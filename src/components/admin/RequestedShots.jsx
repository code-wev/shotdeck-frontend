'use client'
import * as React from 'react';
import PropTypes from 'prop-types';
import Box from '@mui/material/Box';
import Collapse from '@mui/material/Collapse';
import IconButton from '@mui/material/IconButton';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import Paper from '@mui/material/Paper';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import { useGetRequestedShotQuery } from '@/redux/api/shot';
import Image from 'next/image';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Divider from '@mui/material/Divider';
import { useSecureAxios } from '@/utils/Axios';
import Button from '@mui/material/Button';
import Swal from 'sweetalert2';
import { useSession } from 'next-auth/react';

function Row({ row }) {
  const [open, setOpen] = React.useState(false);
  const axiosInstance = useSecureAxios();
  const user = useSession();
     const token = user?.data?.user?.token;
  
  const { refetch } = useGetRequestedShotQuery(token);

 const handleStatusChange = async (newStatus) => {
    try {
      // Show confirmation dialog
      const result = await Swal.fire({
        title: `Are you sure you want to ${newStatus} this?`,
        text: `${newStatus === 'approved' ? 'This shot will be approved' : 'This shot will be rejected'}`,
        icon: 'warning',
        showCancelButton: true,
          background: '#171717',
               confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        color: '#ffffff',
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
        confirmButtonColor: newStatus === 'approved' ? '#3085d6' : '#d33',
        cancelButtonColor: '#aaa',
        confirmButtonText: `Yes, ${newStatus} it!`,
        cancelButtonText: 'Cancel',
        reverseButtons: true
      });

      if (result.isConfirmed) {
        // Show loading
       Swal.fire({
          title: 'Processing...',
          allowOutsideClick: false,
              background: '#171717',
       color: '#ffffff',
          didOpen: () => {
           Swal.showLoading();
          }
        });

        const resp = await axiosInstance.patch(`/shot/update-status/${row._id}`, { 
          status: newStatus 
        });

        console.log(resp, 'update statsu')

        if(resp.status === 201){
           refetch();
            Swal.fire({
          title: 'Success!',
              background: '#171717',
       color: '#ffffff',
          text: `Shot has been ${newStatus}`,
          icon: 'success',
          timer: 1500,
          showConfirmButton: false
        });

        }
        
    
       
     
      }
    } catch (error) {
     Swal.close();
     Swal.fire({
        title: 'Error!',
        text: error.response?.data?.message || 'Failed to update status',
        icon: 'error'
      });
    }
  };

  return (
    <React.Fragment>
      <TableRow sx={{ '& > *': { borderBottom: 'unset' } }} className='bg-gray-800 scroll-hide  transition-colors'>
        <TableCell>
          <IconButton
            aria-label="expand row"
            size="small"
            onClick={() => setOpen(!open)}
            sx={{ color: 'white' }}
          >
            {open ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
          </IconButton>
        </TableCell>
        <TableCell sx={{ color: 'white' }}>
          {row.imageUrl && (
            <div className="relative w-16 h-16 rounded-md overflow-hidden">
              <Image
                src={row?.imageUrl}
                alt={row.title}
                fill
                className="object-cover"
              />
            </div>
          )}
        </TableCell>
        <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>{row.title}</TableCell>
        {/* <TableCell sx={{ color: 'white' }}>{row.director}</TableCell>
        <TableCell sx={{ color: 'white' }}>{row.cinematographer}</TableCell> */}
        <TableCell sx={{ color: 'white' }}>
          <Stack direction="row" spacing={1}>
            <Button
              variant="contained"
              color="success"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('active');
              }}
              disabled={row.status === 'active'}
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Approve
            </Button>
            <Button
              variant="contained"
              color="error"
              size="small"
              onClick={(e) => {
                e.stopPropagation();
                handleStatusChange('rejected');
              }}
              disabled={row.status === 'rejected'}
              sx={{ 
                color: 'white',
                fontWeight: 'bold',
                textTransform: 'none'
              }}
            >
              Reject
            </Button>
          </Stack>
        </TableCell>
      </TableRow>
      {/* Rest of your row implementation remains the same */}
      <TableRow>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={6} className='bg-neutral-400'>
          <Collapse in={open} timeout="auto" unmountOnExit>
            <Box sx={{ margin: 1 }}>
              <Typography variant="h6" gutterBottom component="div" className="text-blue-800">
                Shot Details
              </Typography>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Left Column */}
                <div>
                  <Typography variant="subtitle1" className="font-bold text-blue-700">Title:</Typography>
                  <Typography paragraph className="text-gray-700">{row.title}</Typography>
                  
                  <Typography variant="subtitle1" className="font-bold text-blue-700 mt-4">Technical Details</Typography>
                  <div className="space-y-2">


                    <div className="flex ">
                      <span className="text-gray-600">Focal Length:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.focalLength?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>



                    <div className="flex ">
                      <span className="text-gray-600">Lighting/Time:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.lightingConditions?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>


                    <div className="flex ">
                      <span className="text-gray-600">Reference Type:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.referenceType?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>

                    <div className="flex ">
                      <span className="text-gray-600">Video Speed:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.videoSpeed?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>



                    <div className="flex ">
                      <span className="text-gray-600">Video Quality:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.videoQuality?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>











              
                  </div>
                </div>
                
                {/* Right Column */}
                <div>
                  <Typography variant="subtitle1" className="font-bold text-blue-700">Simulation</Typography>
                  <div className="space-y-2">



                  <div className="flex ">
                      <span className="text-gray-600">Simulation Scale:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.simulationSize?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>

                  <div className="flex ">
                      <span className="text-gray-600">Style:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.simulationStyle?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>
                  <div className="flex ">
                      <span className="text-gray-600">Motion Style:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.motionStyle?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>




                  <div className="flex ">
                      <span className="text-gray-600">Emitter Speed:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.emitterSpeed?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>

                  <div className="flex ">
                      <span className="text-gray-600">Software:</span>
         <span className="text-gray-800 space-x-2 font-medium ml-6">
  {row?.simulationSoftware?.map((item, idx) => (<span key={idx}>{item}</span>))}
</span>

                    </div>



                  </div>
                  
                  {row.youtubeLink && (
                    <>
                     <div className='flex gap-4 items-center mt-4'>
                       <Typography variant="subtitle1" className="font-bold text-blue-700 mt-4">Video Link:</Typography>
                      <a 
                        href={row.youtubeLink} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        Watch Video
                      </a>
                     </div>
                    </>
                  )}
                </div>
              </div>
              
              <Divider sx={{ my: 2 }} />
              
           <Typography variant="subtitle1" className="font-bold text-blue-700">Simulator Types</Typography>
<div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-2">
  {Object.entries(row.simulatorTypes).map(([type, values]) => (
    values.length > 0 && (
      <div key={type}>
        <Typography className="text-gray-600 capitalize">
          {type.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
        </Typography>
        <Typography className="text-gray-800 font-medium">
          {values.filter(v => v !== type).join(', ')}
        </Typography>
      </div>
    )
  ))}
</div>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment>
  );
}

// Rest of your component remains the same

Row.propTypes = {
  row: PropTypes.object.isRequired,
};

export default function CollapsibleTable() {
  const user = useSession();
    const token = user?.data?.user?.token;
  const { data, isLoading, error, refetch } = useGetRequestedShotQuery(token);

  const reqData = data?.data;
  console.log(reqData, 'this is -.**') 
  

  if (isLoading) return    <div className="flex justify-center items-center h-64">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>;
  if (error) return console.log(error);

  return (
    <TableContainer 
      component={Paper} 
      sx={{ 
        bgcolor: 'transparent',
        boxShadow: '0 4px 20px rgba(0, 120, 255, 0.1)',
        borderRadius: '12px',
        // overflow: 'scroll'
 
      }}
    >
      <Table aria-label="collapsible table">
        <TableHead>
          <TableRow className="bg-gradient-to-r scroll-hide bg-neutral-400 scroll-auto scroll-hide">
            <TableCell sx={{ color: 'white', width: '50px' }} />
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Thumbnail</TableCell>
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Title</TableCell>
    
            <TableCell sx={{ color: 'white', fontWeight: 'bold' }}>Status</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {reqData.map((row, idx) => (
            <Row key={idx} row={row} />
          ))}
        </TableBody>
      </Table>
      
      {reqData.length === 0 && (
        <div className="py-12 text-center text-gray-500">
          No shot requests found
        </div>
      )}
    </TableContainer>
  );
}