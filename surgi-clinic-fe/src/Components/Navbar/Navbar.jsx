import React, { useState, useRef, useEffect } from 'react'
import { FaCog, FaSearch, FaGlobe } from 'react-icons/fa'
import { useTranslation } from 'react-i18next'
import './Navbar.css'
import avatar from '../../assets/doctor_male.jpg'
import { IoMdArrowDropdown } from 'react-icons/io'

import { useNavigate } from 'react-router-dom'

const Navbar = () => {
  const navigate = useNavigate()
  const { t, i18n } = useTranslation()
  const [isLangOpen, setIsLangOpen] = useState(false)
  const dropdownRef = useRef(null)

  const currentLang = i18n.language || 'ar'
  const user = JSON.parse(localStorage.getItem('user') || '{}')
  const userName = user.userName || user.name || 'Admin User'

  const toggleLangDropdown = () => {
    setIsLangOpen(!isLangOpen)
  }

  const changeLanguage = (lang) => {
    i18n.changeLanguage(lang)
    setIsLangOpen(false)
  }

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsLangOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <nav className='flex justify-between items-center bg-white shadow-sm border border-slate-100 rounded-xl p-4 h-16 relative z-50'>
      {/* Search Input */}
      <div className='relative flex items-center w-1/3 min-w-[200px]'>
        <FaSearch className='absolute ltr:left-3 rtl:right-3 text-gray-400' />
        <input
          type='text'
          placeholder={t('nav.search')}
          className='ltr:pl-9 ltr:pr-4 rtl:pr-9 rtl:pl-4 py-2 w-full rounded-3xl border bg-[#F5F6FA] focus:outline-none focus:ring-2 focus:ring-[#BF6159] text-sm'
        />
      </div>

      {/* Right Controls: Language, Profile, and Settings */}
      <div className='flex items-center space-x-4 rtl:space-x-reverse'>
        {/* Language Selector Dropdown */}
        <div className='relative' ref={dropdownRef}>
          <button
            onClick={toggleLangDropdown}
            className='flex items-center space-x-2 rtl:space-x-reverse px-3 py-1.5 rounded-lg border bg-gray-50 hover:bg-gray-100 transition-colors text-sm font-medium'
          >
            <FaGlobe className='text-[#BF6159]' />
            <span>{currentLang === 'ar' ? 'العربية' : 'English'}</span>
            <IoMdArrowDropdown className='text-gray-500' />
          </button>

          {isLangOpen && (
            <div className='absolute ltr:right-0 rtl:left-0 mt-2 w-36 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50'>
              <button
                onClick={() => changeLanguage('ar')}
                className={`w-full text-right px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                  currentLang === 'ar' ? 'font-bold text-[#BF6159] bg-red-50' : 'text-gray-700'
                }`}
              >
                <span>العربية</span>
                <span className='text-xs'>🇪🇬</span>
              </button>
              <button
                onClick={() => changeLanguage('en')}
                className={`w-full text-left px-4 py-2 text-sm flex items-center justify-between hover:bg-gray-50 ${
                  currentLang === 'en' ? 'font-bold text-[#BF6159] bg-red-50' : 'text-gray-700'
                }`}
              >
                <span>English</span>
                <span className='text-xs'>🇬🇧</span>
              </button>
            </div>
          )}
        </div>

        {/* Profile Section */}
        <div
          onClick={() => navigate('/Settings')}
          className='flex items-center space-x-2 rtl:space-x-reverse cursor-pointer hover:opacity-80 transition'
          title='View Profile & Settings'
        >
          <img
            src={avatar}
            alt={t('nav.profile')}
            className='w-9 h-9 rounded-full border border-red-200 object-cover'
            onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=Admin+Clinic&background=BF6159&color=fff' }}
          />
          <div className='hidden sm:block text-start'>
            <p className='text-sm font-semibold leading-tight text-gray-800'>{userName}</p>
            <p className='text-xs text-red-500 font-medium'>{t('nav.admin')}</p>
          </div>
        </div>

        {/* Settings Icon */}
        <button
          onClick={() => navigate('/Settings')}
          className='p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors'
          title='Settings'
        >
          <FaCog />
        </button>
      </div>
    </nav>
  )
}

export default Navbar
