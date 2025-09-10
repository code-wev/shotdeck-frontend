'use client'
import React from 'react'
import logo from '@/assets/logo.png'
import Image from 'next/image'
import { useGetSettingQuery } from '@/redux/api/shot'
import { usePathname } from 'next/navigation'
import footerImg2 from '@/./assets/cover/footer_cover.jpg'

export default function Footer() {
  const {data} = useGetSettingQuery();
  console.log(data?.data[0], 'this is settings er data re ');
  const data2 = data?.data[0];


  const pathname = usePathname();
  if(pathname.includes('/admin')){
    return null;
  }
  if(pathname.includes('/browse')){
    return null;
  }
  if(pathname.includes('/add-shot')){
    return null;
  }

  let imgFalse ;
  if(pathname.includes('/browse') || pathname.includes('random') || pathname.includes('my-collection') || pathname.includes('my-shot') || pathname.includes('donation') || pathname.includes('admin') || pathname.includes('add-shots')){
    imgFalse = true;
  }

  return (
<section>
  <div className={`${imgFalse ? 'hidden' : 'block'}`}>
    <Image src={footerImg2} alt='img' className='w-full object-cover'/>
  </div>

      <div className='bg-primary absolute z-50 w-full   items-end py-4 md:flex'>
        
        <div>
         <Image alt='logo' src={data2?.logo || logo} width={100} height={100} className=' max-h-[32px] md:w-72  px-4  mx-auto'/>
        </div>
        <div>
          <p className='text-xs mx-auto text-center md:text-left mt-2 md:-mt-0'>{data?.footerText || '© 2025 Fx-references - All rights reserved..'}</p>
        </div>

        
        
        </div>
</section>
  )
}
