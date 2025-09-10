'use client'
import UpdateShot from '@/components/admin/UpdateShot'
import { useParams } from 'next/navigation'
import React from 'react'

export default function page() {


    const id = useParams()?.id;
    console.log(id, 'kuryem er sawa')
  return (
    <div className=''>
        

        <UpdateShot/>
    </div>
  )
}
