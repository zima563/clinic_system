import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io'
import logo from '../../assets/clinic_logo.jpg'
import './Sidebar.css'
import {
  FaHome,
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaMicroscope,
  FaRadiation,
  FaShieldAlt,
  FaBriefcaseMedical,
  FaClipboardList,
  FaCog,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaMoneyCheck
} from 'react-icons/fa'

const Sidebar = () => {
  const { t, i18n } = useTranslation()
  const isRtl = i18n.language === 'ar'
  const [isOpen, setIsOpen] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const getItemClass = ({ isActive }) =>
    isActive
      ? 'text-[#BF6159] border-2 border-[#BF6159] rounded-3xl font-medium'
      : 'text-[#000000] hover:bg-[#F5E7E6]'

  return (
    <aside
      className={`sideBar flex flex-col h-screen ${
        isOpen ? 'w-56' : 'w-16'
      } transition-all duration-300 bg-white border-r rtl:border-l rtl:border-r-0 shadow-sm z-40 select-none`}
    >
      {/* Logo and Toggle Button */}
      <div
        className={`flex items-center justify-between ${
          isOpen ? 'px-4' : 'px-2'
        } pt-4 relative mb-6`}
      >
        <NavLink to='/' className='flex items-center space-x-2 rtl:space-x-reverse overflow-hidden'>
          <img src={logo} alt='Logo' className='h-9 w-9 min-w-[2.25rem] object-contain' />
          {isOpen && (
            <span className='text-lg font-bold text-gray-800 whitespace-nowrap'>
              {t('sidebar.appName')}
            </span>
          )}
        </NavLink>

        <button
          className='p-1 rounded-full text-gray-500 hover:text-gray-800 transition-colors'
          onClick={toggleSidebar}
          aria-label='Toggle Sidebar'
        >
          {isOpen ? (
            isRtl ? <IoIosArrowDropright className='text-2xl' /> : <IoIosArrowDropleft className='text-2xl' />
          ) : (
            isRtl ? <IoIosArrowDropleft className='text-2xl' /> : <IoIosArrowDropright className='text-2xl' />
          )}
        </button>
      </div>

      {/* Navigation items */}
      <nav className='flex-1 px-3 space-y-1.5 overflow-y-auto'>
        <NavLink
          to='/'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaHome className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.dashboard')}</span>}
        </NavLink>

        <NavLink
          to='/PatientsTable'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaClipboardList className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.patients')}</span>}
        </NavLink>

        <NavLink
          to='/Doctors'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaStethoscope className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.doctors')}</span>}
        </NavLink>

        <NavLink
          to='/Specialties'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaPrescriptionBottleAlt className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.specialties')}</span>}
        </NavLink>

        <NavLink
          to='/Services'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaMicroscope className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.services')}</span>}
        </NavLink>

        <NavLink
          to='/Appointments'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaRadiation className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.appointments')}</span>}
        </NavLink>

        <NavLink
          to='/Schedule'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaShieldAlt className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.schedule')}</span>}
        </NavLink>

        <NavLink
          to='/Visits'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaBriefcaseMedical className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.visits')}</span>}
        </NavLink>

        {/* Dropdown NavLink: Invoices */}
        <div>
          <div
            className={`flex items-center hover:bg-[#F5E7E6] text-sm p-2.5 rounded-lg cursor-pointer transition-colors ${
              isDropdownOpen ? 'border-2 border-[#BF6159] rounded-3xl font-medium' : ''
            }`}
            onClick={toggleDropdown}
          >
            <FaMoneyCheck className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
            {isOpen && (
              <div className='flex justify-between items-center w-full'>
                <span>{t('sidebar.invoices')}</span>
                {isDropdownOpen ? <FaChevronUp className='text-xs' /> : <FaChevronDown className='text-xs' />}
              </div>
            )}
          </div>

          {isDropdownOpen && (
            <div className={`mt-1 space-y-1 ${isOpen ? 'rtl:pr-6 ltr:pl-6' : 'flex flex-col items-center'}`}>
              <NavLink
                to='/Income'
                className={({ isActive }) =>
                  `flex items-center text-sm p-2 rounded-lg transition-colors ${getItemClass({
                    isActive
                  })} ${isOpen ? 'justify-start' : 'justify-center'}`
                }
              >
                <span className='text-xs font-semibold'>•</span>
                {isOpen && <span className='mx-2'>{t('sidebar.income')}</span>}
              </NavLink>

              <NavLink
                to='/Expenses'
                className={({ isActive }) =>
                  `flex items-center text-sm p-2 rounded-lg transition-colors ${getItemClass({
                    isActive
                  })} ${isOpen ? 'justify-start' : 'justify-center'}`
                }
              >
                <span className='text-xs font-semibold'>•</span>
                {isOpen && <span className='mx-2'>{t('sidebar.expenses')}</span>}
              </NavLink>
            </div>
          )}
        </div>

        <hr className='my-3 border-gray-200' />

        <NavLink
          to='/users'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaUser className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.account')}</span>}
        </NavLink>

        <NavLink
          to='/Settings'
          className={({ isActive }) =>
            `flex items-center text-sm p-2.5 rounded-lg transition-colors ${getItemClass({
              isActive
            })} ${isOpen ? 'justify-start' : 'justify-center'}`
          }
        >
          <FaCog className={`text-xl ${isOpen ? 'mx-2' : ''}`} />
          {isOpen && <span>{t('sidebar.settings')}</span>}
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
