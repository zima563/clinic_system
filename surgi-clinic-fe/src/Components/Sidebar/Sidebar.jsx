import React, { useState } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { IoIosArrowDropleft, IoIosArrowDropright } from 'react-icons/io'
import logo from '../../assets/clinic_logo.jpg'
import { hasPermission } from '../PrivateRoute'
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
  FaUserShield,
  FaMoneyCheckAlt
} from 'react-icons/fa'

const Sidebar = () => {
  const { t, i18n } = useTranslation()
  const location = useLocation()
  const isRtl = i18n.language === 'ar'

  const [isOpen, setIsOpen] = useState(true)
  const isInvoiceActive = location.pathname === '/Income' || location.pathname === '/Expenses'
  const [isDropdownOpen, setIsDropdownOpen] = useState(isInvoiceActive)

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const getItemClass = isActive =>
    isActive
      ? 'bg-[#BF6159] text-white font-bold shadow-md shadow-red-200/50 rounded-xl'
      : 'text-gray-600 hover:bg-[#F5E7E6]/70 hover:text-[#9B4A43] font-medium rounded-xl'

  const navItems = [
    {
      to: '/',
      label: t('sidebar.dashboard'),
      icon: FaHome,
      permissions: ['getAppointment']
    },
    {
      to: '/PatientsTable',
      label: t('sidebar.patients'),
      icon: FaClipboardList,
      permissions: ['listPatient']
    },
    {
      to: '/Doctors',
      label: t('sidebar.doctors'),
      icon: FaStethoscope,
      permissions: ['listDoctors']
    },
    {
      to: '/Specialties',
      label: t('sidebar.specialties'),
      icon: FaPrescriptionBottleAlt,
      permissions: ['allSpecialtys']
    },
    {
      to: '/Services',
      label: t('sidebar.services'),
      icon: FaMicroscope,
      permissions: ['allServices']
    },
    {
      to: '/Appointments',
      label: t('sidebar.appointments'),
      icon: FaRadiation,
      permissions: ['getAppointment']
    },
    {
      to: '/Schedule',
      label: t('sidebar.schedule'),
      icon: FaShieldAlt,
      permissions: ['listSchedules']
    },
    {
      to: '/Visits',
      label: t('sidebar.visits'),
      icon: FaBriefcaseMedical,
      permissions: ['getAllVisits']
    }
  ]

  return (
    <aside
      className={`sidebar-container flex flex-col h-screen ${
        isOpen ? 'w-60' : 'w-20'
      } transition-all duration-300 bg-white border-r rtl:border-l rtl:border-r-0 shadow-sm z-40 select-none relative`}
    >
      {/* Brand Logo & Collapse Toggle */}
      <div className='flex items-center justify-between px-4 py-4 border-b border-gray-100 mb-3'>
        <NavLink to='/' className='flex items-center gap-3 overflow-hidden'>
          <div className='w-10 h-10 min-w-[2.5rem] rounded-xl overflow-hidden shadow-2xs border border-gray-100 flex items-center justify-center bg-white'>
            <img src={logo} alt='Logo' className='w-full h-full object-contain' />
          </div>
          {isOpen && (
            <div className='flex flex-col overflow-hidden whitespace-nowrap'>
              <span className='text-base font-extrabold text-gray-900 leading-tight'>
                {t('sidebar.appName')}
              </span>
              <span className='text-[10px] font-bold text-[#BF6159] tracking-wider uppercase'>
                Medical Center
              </span>
            </div>
          )}
        </NavLink>

        <button
          className='toggle-btn flex items-center justify-center w-7 h-7 rounded-full bg-white border border-gray-200 shadow-xs text-gray-500 hover:text-[#BF6159] hover:bg-red-50 transition'
          onClick={toggleSidebar}
          aria-label='Toggle Sidebar'
        >
          {isOpen ? (
            isRtl ? <IoIosArrowDropright className='text-lg' /> : <IoIosArrowDropleft className='text-lg' />
          ) : (
            isRtl ? <IoIosArrowDropleft className='text-lg' /> : <IoIosArrowDropright className='text-lg' />
          )}
        </button>
      </div>

      {/* Main Navigation Scroll Area */}
      <nav className='flex-1 px-3 space-y-1 overflow-y-auto custom-scroll py-2'>
        {navItems.map(
          item =>
            hasPermission(item.permissions) && (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center text-sm px-3 py-2.5 transition-all duration-200 ${getItemClass(
                    isActive
                  )} ${isOpen ? 'justify-start gap-3' : 'justify-center'}`
                }
              >
                <item.icon className={`text-lg min-w-[1.25rem] ${isOpen ? '' : 'mx-auto'}`} />
                {isOpen && <span className='truncate'>{item.label}</span>}
              </NavLink>
            )
        )}

        {/* Dropdown Group: Invoices */}
        {hasPermission(['listInvoice']) && (
          <div>
            <div
              className={`flex items-center text-sm px-3 py-2.5 cursor-pointer transition-all duration-200 ${
                isInvoiceActive && !isDropdownOpen
                  ? 'bg-red-50 text-[#BF6159] font-bold rounded-xl border border-red-200'
                  : 'text-gray-600 hover:bg-[#F5E7E6]/70 hover:text-[#9B4A43] font-medium rounded-xl'
              } ${isOpen ? 'justify-between' : 'justify-center'}`}
              onClick={toggleDropdown}
            >
              <div className='flex items-center gap-3'>
                <FaMoneyCheckAlt className='text-lg min-w-[1.25rem]' />
                {isOpen && <span>{t('sidebar.invoices')}</span>}
              </div>
              {isOpen && (
                <span className='text-xs text-gray-400'>
                  {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                </span>
              )}
            </div>

            {isDropdownOpen && (
              <div className={`mt-1 space-y-1 ${isOpen ? 'ltr:pl-6 rtl:pr-6' : 'flex flex-col items-center'}`}>
                <NavLink
                  to='/Income'
                  className={({ isActive }) =>
                    `flex items-center text-xs px-3 py-2 rounded-xl transition ${getItemClass(
                      isActive
                    )} ${isOpen ? 'justify-start gap-2' : 'justify-center'}`
                  }
                >
                  <span className='text-xs font-bold'>•</span>
                  {isOpen && <span>{t('sidebar.income')}</span>}
                </NavLink>

                <NavLink
                  to='/Expenses'
                  className={({ isActive }) =>
                    `flex items-center text-xs px-3 py-2 rounded-xl transition ${getItemClass(
                      isActive
                    )} ${isOpen ? 'justify-start gap-2' : 'justify-center'}`
                  }
                >
                  <span className='text-xs font-bold'>•</span>
                  {isOpen && <span>{t('sidebar.expenses')}</span>}
                </NavLink>
              </div>
            )}
          </div>
        )}

        <div className='pt-2 my-2 border-t border-gray-100' />

        {/* System Administration & Settings */}
        {hasPermission(['allUsers']) && (
          <NavLink
            to='/users'
            className={({ isActive }) =>
              `flex items-center text-sm px-3 py-2.5 transition-all duration-200 ${getItemClass(
                isActive
              )} ${isOpen ? 'justify-start gap-3' : 'justify-center'}`
            }
          >
            <FaUserShield className={`text-lg min-w-[1.25rem] ${isOpen ? '' : 'mx-auto'}`} />
            {isOpen && <span className='truncate'>{t('sidebar.account')}</span>}
          </NavLink>
        )}

        <NavLink
          to='/Settings'
          className={({ isActive }) =>
            `flex items-center text-sm px-3 py-2.5 transition-all duration-200 ${getItemClass(
              isActive
            )} ${isOpen ? 'justify-start gap-3' : 'justify-center'}`
          }
        >
          <FaCog className={`text-lg min-w-[1.25rem] ${isOpen ? '' : 'mx-auto'}`} />
          {isOpen && <span className='truncate'>{t('sidebar.settings')}</span>}
        </NavLink>
      </nav>
    </aside>
  )
}

export default Sidebar
