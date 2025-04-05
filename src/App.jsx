import React from 'react'
import signup from './pages/signup'
import { Routes, Route } from 'react-router-dom'
import Signuppage from './pages/Signuppage'
function App() {
  return (
    <div>
    <Signuppage/>

    <Routes>

        {/* <Route path='/' element={<signup />} /> */}
       
    </Routes>
    </div>
  )
}

export default App
