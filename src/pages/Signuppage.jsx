import React from 'react'
import Signup from '../components/Signup'
import bgImage from '../assets/backgroung/bg.jpg'
function Signuppage() {
  return (
    <div className='w-full h-full flex items-center justify-center flex-col bg-red-700'>  
    <div className='mb-4'>
        {/* Display the image */}
        <img 
          src={bgImage} 
          alt="Background" 
          className="w-64 h-auto"
        />
      <Signup/>
      </div> 
    </div>
  )
}

export default Signuppage
