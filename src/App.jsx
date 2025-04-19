import React from 'react'

import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Homepage from './pages/Homepage'
function App() {
  return (
    <div>
   

    <Routes>

    <Route path='/' element={<Login />} />
          <Route path='/signup' element={<Signup />} />
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Homepage/>}/>
    </Routes>
    </div>
  )
}

export default App
