import React, { useState } from 'react'
import { NavLink } from 'react-router-dom'
import { IoIosArrowDropleft } from 'react-icons/io'
import { IoIosArrowDropright } from 'react-icons/io'
import logo from '../../assets/marinalogo.png'
import './Sidebar.css'
import {
  FaHome,
  FaStethoscope,
  FaPrescriptionBottleAlt,
  FaMicroscope,
  FaRadiation,
  FaShieldAlt,
  FaBriefcaseMedical,
  FaUserMd,
  FaFileAlt,
  FaClipboardList,
  FaCog,
  FaSignOutAlt,
  FaChevronDown,
  FaChevronUp,
  FaUser,
  FaMoneyBill,
  FaMoneyCheck
} from 'react-icons/fa'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true)
  const [isDropdownOpen, setIsDropdownOpen] = useState(false) // For the dropdown toggle

  const toggleSidebar = () => {
    setIsOpen(!isOpen)
  }

  const toggleDropdown = () => {
    setIsDropdownOpen(!isDropdownOpen)
  }

  const getItemClass = ({ isActive }) =>
    isActive
      ? 'text-[#BF6159]  border-2 border-[#BF6159] rounded-3xl' // Active color and background
      : 'text-[#000000] hover:bg-[#F5E7E6]' // Default color and hover background

  return (
    <>
      <div
        className={`sideBar  flex flex-col h-screen ${
          isOpen ? 'w-56' : 'w-16'
        }  transition-width duration-300`}
      >
        {/* Logo and Toggle Button */}
        <div
          className={`flex items-center justify-between ${
            isOpen ? 'px-4' : 'px-0'
          } pt-4 relative mb-8`}
        >
          {/* Logo */}
          <NavLink to='/' className='flex items-center'>
            <img src={logo} alt='Logo' className='h-9 w-10 ms-3 ' />
            {isOpen && (
              <span className='text-xl font-semibold ms-2'>Marina Clinic</span>
            )}
          </NavLink>

          {/* Toggle Button */}
          <button
            className={`absolute top-4 ${isOpen ? 'right-0' : 'right-0'} `}
            onClick={toggleSidebar}
          >
            {isOpen ? (
              <IoIosArrowDropleft className='text-2xl' />
            ) : (
              <IoIosArrowDropright className='text-2xl' />
            )}
          </button>
        </div>

        <nav className='flex-1 ps-4 pe-4 space-y-2 text-left'>
          <NavLink
            to='/'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaHome className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'>Dashboard </span>}
          </NavLink>

          <NavLink
            to='/PatientsTable'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaClipboardList
              className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`}
            />
            {isOpen && <span className='cursor-pointer'>Patients</span>}
          </NavLink>

          <NavLink
            to='/Doctors'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaStethoscope className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'>Doctors </span>}
          </NavLink>

          <NavLink
            to='/Specialties'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaPrescriptionBottleAlt
              className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`}
            />
            {isOpen && <span className='cursor-pointer'> Specialties </span>}
          </NavLink>

          <NavLink
            to='/Services'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaMicroscope className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'> Services </span>}
          </NavLink>

          <NavLink
            to='/Appointments'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaRadiation className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'> Appointments </span>}
          </NavLink>

          <NavLink
            to='/Schedule'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaShieldAlt className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'> schedule </span>}
          </NavLink>

          <NavLink
            to='/Visits'
            className={({ isActive }) =>
              `flex items-center text-sm p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaBriefcaseMedical
              className={`text-xl ${isOpen ? 'me-4 ms-2' : ''}`}
            />
            {isOpen && <span className='cursor-pointer'> Visit </span>}
          </NavLink>

          {/* Dropdown NavLink: Visit */}
          <div className='relative'>
            {/* Dropdown Main Item */}
            <div
              className={`flex items-center hover:bg-[#F5E7E6] text-sm p-2 rounded cursor-pointer ${
                isDropdownOpen ? 'border-2 border-[#BF6159] rounded-3xl' : ''
              }`}
              onClick={toggleDropdown}
            >
              <FaMoneyCheck
                className={`text-2xl ${isOpen ? 'me-4 ms-2' : ''}`}
              />
              {isOpen && (
                <div className='flex justify-between w-full'>
                  <span className='cursor-pointer'>Invoice</span>
                  {isDropdownOpen ? <FaChevronUp /> : <FaChevronDown />}
                </div>
              )}
            </div>

            {/* Dropdown Content */}
            {isDropdownOpen && (
              <div
                className={`mt-2 space-y-2 ${
                  isOpen ? 'ml-8' : 'flex flex-col items-center'
                }`}
              >
                {/* Child Item: Income */}
                <NavLink
                  to='/income'
                  className={({ isActive }) =>
                    `flex items-center text-sm p-2 rounded ${getItemClass({
                      isActive
                    })} hover:bg-[#F5E7E6} ${
                      isOpen ? 'justify-start' : 'justify-center'
                    }`
                  }
                >
                  <FaMoneyCheck className={`text-xl ${isOpen ? 'me-2' : ''}`} />
                  {isOpen && <span className='cursor-pointer'>Income</span>}
                </NavLink>

                {/* Child Item: Expenses */}
                <NavLink
                  to='/Expenses'
                  className={({ isActive }) =>
                    `flex items-center text-sm p-2 rounded ${getItemClass({
                      isActive
                    })} hover:bg-[#F5E7E6} ${
                      isOpen ? 'justify-start' : 'justify-center'
                    }`
                  }
                >
                  <FaMoneyCheck className={`text-xl ${isOpen ? 'me-2' : ''}`} />
                  {isOpen && <span className='cursor-pointer'>Expenses</span>}
                </NavLink>
              </div>
            )}
          </div>

          <hr />

          <NavLink
            to='/users'
            className={({ isActive }) =>
              `flex items-center text-xs p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaUser className={`text-lg ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'>Account</span>}
          </NavLink>

          <NavLink
            to='/Settings'
            className={({ isActive }) =>
              `flex items-center text-xs p-2 rounded ${getItemClass({
                isActive
              })} ${isOpen ? 'justify-start' : 'justify-center'}`
            }
          >
            <FaCog className={`text-lg ${isOpen ? 'me-4 ms-2' : ''}`} />
            {isOpen && <span className='cursor-pointer'>Settings</span>}
          </NavLink>

          {/* Add more NavLink components for other routes as needed */}
        </nav>
      </div>
    </>
  )
}

export default Sidebar
