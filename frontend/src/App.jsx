import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

function App() {

  return (
    <>
      <div className='bg-sky-100 dark:bg-slate-950 min-h-screen relative flex justify-between flex-col'>

        <Navbar />

        <Outlet className='relative' />

        <Footer />

      </div>
    </>
  )
}

export default App
