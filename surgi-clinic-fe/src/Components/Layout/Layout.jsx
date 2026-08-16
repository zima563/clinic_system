import React from 'react'
import Sidebar from '../Sidebar/Sidebar.jsx'
import Navbar from '../Navbar/Navbar.jsx'

const Layout = ({ children }) => {
  return (
    <div className='flex'>
      {/* Sidebar */}
      <Sidebar />

      {/* Main Content */}
      <div className='flex-1 flex flex-col'>
        {/* Navbar */}
        <Navbar />

        {/* Page Content */}
        <div className='p-4 overflow-auto'>{children}</div>
      </div>
    </div>
  )
}

export default Layout
