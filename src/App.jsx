import React from 'react'

import { Routes, Route } from 'react-router-dom'
import Login from './pages/Login'
import Signup from './pages/Signup'
import Homepage from './pages/Homepage'
function App() {
  return (
    <div>
   

    <Routes>

    <Route path="/" element={token ? <Homepage /> : <Navigate to='/login' />} />
        <Route path="/login" element={token ? <Navigate to='/' /> : <Login />} />
        <Route path="/signup" element={<Signup />} />
    </Routes>
    </div>
  )
}

export default App
