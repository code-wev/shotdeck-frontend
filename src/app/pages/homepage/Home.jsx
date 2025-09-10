'use client'
import About from '@/components/homepage/About'
import CinematographersSpotlight from '@/components/homepage/CinematographersSpotlight'
import Cover from '@/components/homepage/Cover'
import FAQ from '@/components/homepage/FAQ'
import MyCollection from '@/components/homepage/MyCollection'
import MySHot from '@/components/homepage/MyShot'
import Treanding from '@/components/homepage/Treanding'
import TrendingShots from '@/components/homepage/TrendingShots'
import { useSession } from 'next-auth/react'
import React from 'react'
import footerImg2 from '@/./assets/cover/footer_cover.jpg'
import Image from 'next/image'

export default function HomePage() {
  const user = useSession();
  console.log(user.status, 'this is user')



  return (
    <div>
     <Cover/>
     {/* <Treanding/> */}
   <div className='max-w-[1820px] mx-auto'>
      <TrendingShots/>
     <About/>
     <FAQ/>
     {/* <CinematographersSpotlight/> */}
 {
  user.status === 'authenticated' &&     <MySHot/> 
 }
    </div>
<div className=''>
   {
  user.status === 'authenticated' &&    <MyCollection/>
 }
</div>


    </div>
  )
}
