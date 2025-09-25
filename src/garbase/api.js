 <section>

    <div>
      adsf
    </div>

         {shot.timecodes && shot.timecodes.length > 0 ? (

      
      <div className="mt-4 text-left  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg">
              <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>

        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl ">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3  items-center hover:bg-[#3a3a3a] p-2  pb-2  cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink , tc.time)}



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
    )   : <div className='mt-4  lg:hidden max-h-full overflow-y-scroll lg:p-3 lg:ml-2 rounded-lg'>
      
      
      <h4>No Intrest point added</h4>
      
      
      </div>}

        <div className="mt-4 lg:mt-0 lg:w-96 lg:ml-4">
    <div className="hidden lg:block h-full overflow-y-scroll scrollbar-thin-gray lg:p-3 rounded-lg">
      <h3 className="font-semibold text-2xl mb-2">Interest Points</h3>
      
      {shot.timecodes && shot.timecodes.length > 0 ? (
        <div className="space-y-2 bg-[#2a2a2a] lg:p-3 p-2 rounded-3xl">
          {shot.timecodes.map((tc, idx) => ( 
            <div 
              key={idx} 
              className={`flex gap-3 items-center hover:bg-[#3a3a3a] p-2 pb-2 cursor-pointer transition-colors ${idx+1 === shot.timecodes.length ? '' : 'border-b border-gray-600'}`}
              onClick={() => handleTimecodeClick(tc.time, shot.youtubeLink, tc.time)}
            >
              <img src={tc.image} alt={tc.label} className='w-32 h-20 object-cover rounded-lg'/>
              <div className=''>
                <p className="font-semibold font-mono mr-3">{tc.time}</p>
                <p className="text-gray-300">{tc.label}</p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-[#2a2a2a] lg:p-6  p-4 rounded-3xl">
          <p className="text-gray-400 italic">No interest points available for this shot</p>
        </div>
      )}
    </div>
  </div>
     </section>