import DashboardLayoutCustomPageItems from '@/components/admin/DashBoardLayout'
import React from 'react'

export default function layout({children}) {
  return (
    <div className='scrollbar-hide'>
      
      
      
   
<DashboardLayoutCustomPageItems>
  {children}
</DashboardLayoutCustomPageItems>

   
   </div>
  )
}
