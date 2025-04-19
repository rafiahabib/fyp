import React from 'react'
import { Link } from 'react-router-dom'
import { useState } from 'react'
function Nevbar() {
  const[search , setSearch]=useState(false)
  const SEARCH=()=>{
   setSearch(true)
  }
  return (
    
 
    <div className='flex flex-between justify-between flex-wrap'>
      <div className='flex flex-wrap'>
        <ul className=' gap-3 w-full flex my-10 ml-20 flex-wrap'>
          <Link to="/shop" >
            <li className='flex'>Shop
            <svg class="w-6 h-6 text-red-600 dark:text-red-600" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 24 24">
            <path d="m12.75 20.66 6.184-7.098c2.677-2.884 2.559-6.506.754-8.705-.898-1.095-2.206-1.816-3.72-1.855-1.293-.034-2.652.43-3.963 1.442-1.315-1.012-2.678-1.476-3.973-1.442-1.515.04-2.825.76-3.724 1.855-1.806 2.201-1.915 5.823.772 8.706l6.183 7.097c.19.216.46.34.743.34a.985.985 0 0 0 .743-.34Z"/>
            </svg>

            </li>
          </Link>
          <Link to="/about">
            <li>About Us</li>
          </Link>
        </ul>
      </div >
      <div className='my-8 m-6'>
      <svg class="w-[48px] h-[48px] text-black dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
       <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5.005 11.19V12l6.998 4.042L19 12v-.81M5 16.15v.81L11.997 21l6.998-4.042v-.81M12.003 3 5.005 7.042l6.998 4.042L19 7.042 12.003 3Z"/>
       </svg>
      </div>

      <div className='flex flex-wrap m-10'>
      {
        search? 
        <div> <input type="text" placeholder='Search Here: ' className='w-72 h-8 bg-gray-200 mr-2 border border-gray-400 rounded-md'/></div>:null
      }
      <button onClick={SEARCH} ><svg class=" w-[29px] h-[29px] text-balck dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-width="2" d="m21 21-3.5-3.5M17 10a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z"/>
      </svg>
      </button>
      
      <svg class="mx-2 w-[29px] h-[29px] text-black dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 10V6a3 3 0 0 1 3-3v0a3 3 0 0 1 3 3v4m3-2 .917 11.923A1 1 0 0 1 17.92 21H6.08a1 1 0 0 1-.997-1.077L6 8h12Z"/>
      </svg>

      <svg class="w-[29px] h-[29px] text-black dark:text-black" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="none" viewBox="0 0 24 24">
      <path stroke="currentColor" stroke-width="2" d="M7 17v1a1 1 0 0 0 1 1h8a1 1 0 0 0 1-1v-1a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3Zm8-9a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"/>
      </svg>
      </div>
 





    </div>
  )
}

export default Nevbar
