import React from 'react'
import signup from './pages/signup'
import { Routes, Route } from 'react-router-dom'
function App() {
  return (
    <Routes>
        <Route path='/' element={<signup />} />
       
    </Routes>
  )
}

export default App
