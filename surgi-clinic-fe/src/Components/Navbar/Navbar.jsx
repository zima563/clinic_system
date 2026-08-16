import React from 'react'
import { FaBell, FaCog, FaLanguage, FaSearch } from 'react-icons/fa'
import './Navbar.css'
import avatar from '../../assets/Avatar.png'
import { IoMdArrowDropdown } from 'react-icons/io'
const Navbar = () => {
  return (
    <>
      <nav className='flex justify-between items-center bg-white shadow-md rounded-lg p-4 h-16'>
        {/* Left: Search Input */}
        <div className='relative ms-5 flex items-center w-1/3'>
          <FaSearch className='absolute left-4 text-gray-400' />
          <input
            type='text'
            placeholder='Search'
            className='pl-10 pr-4 py-2 w-full rounded-3xl border bg-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
          />
        </div>

        {/* Right: Language, Profile, and Settings */}
        <div className='flex items-center space-x-4'>
          {/* Language Dropdown */}
          <div className='flex items-center space-x-1 cursor-pointer'>
            <img
              src='https://flagcdn.com/w40/gb.png' // Use a real flag image or asset
              alt='English'
              className='w-6 h-4'
            />
            <span className='text-sm font-medium'>English</span>
            <IoMdArrowDropdown className='text-gray-500' />
          </div>

          {/* Profile Section */}
          <div className='flex items-center space-x-2 cursor-pointer'>
            <img
              src={avatar} // Replace with the user's image
              alt='Profile'
              className='w-8 h-8 rounded-full'
            />
            <div>
              <p className='text-sm font-semibold'>Doha El Hamy</p>
              <p className='text-xs text-gray-500'>Admin</p>
            </div>
          </div>

          {/* Settings Icon */}
          <button className='p-2 rounded-full hover:bg-gray-100'>
            <FaCog className='text-gray-600 me-5' />
          </button>
        </div>
      </nav>
    </>
  )
}

export default Navbar
