'use client'
import Aos from 'aos';
import { useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';
import { IoSearchSharp } from "react-icons/io5";

export default function Search() {
  const [search, setSearch] = useState('');
  useEffect(()=>{

    Aos.init()
  }, [])

  const router = useRouter()

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault(); // prevent form submit
      console.log('Search Value:', search);
      router.push(`/browse/${search}`)

 
    }
  };

  return (
    <div className="relative w-full max-w-2xl">
      <form onSubmit={(e) => e.preventDefault()}>
        <input
        data-aos="fade-up" data-aos-duration="1500" data-aos-delay="400" 
          type="search"
          name="search"
          id="search"
          placeholder="Search by Tag...."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={handleKeyPress}
          className="bg-white text-gray-800 px-4 py-3 pl-12 w-full rounded outline-none placeholder:text-gray-600"
        />
        <IoSearchSharp
             data-aos="fade-up"
          data-aos-duration="1500"
          data-aos-delay="500"
        className="absolute top-3 left-3 text-gray-400 text-2xl" />
      </form>

    </div>
  );
}
