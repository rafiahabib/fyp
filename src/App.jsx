import React from 'react'

import { Routes, Route } from 'react-router-dom'
import Signuppage from './pages/Signuppage'
import Loginpage from './pages/Loginpage'
function App() {
  return (
    <div>
   

    <Routes>

    <Route path="/" element={<Loginpage/>} />
        <Route path="/signup" element={<Signuppage />} />
       
    </Routes>
    </div>
  )
}

export default App
