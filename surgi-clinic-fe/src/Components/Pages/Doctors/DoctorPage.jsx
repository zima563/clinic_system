import React from 'react'
import docImage from '../../../assets/docimage.png'
import { FaRegCalendarCheck } from 'react-icons/fa6'
import { FiPhone } from 'react-icons/fi'
import { BiMessageDots } from 'react-icons/bi'

export default function DoctorPage () {
  return (
    <>
      <div className='flex flex-col md:flex-row items-center justify-center pt-6 ps-6 md:pt-4 md:ps-12'>
        {/* Left Card */}
        <div className='bg-white shadow-lg rounded-b-[57.73px] p-6 w-full md:w-1/3 mb-6 md:mb-0'>
          <div className='flex flex-col items-center'>
            <img
              src={docImage}
              alt='Doctor'
              className='rounded-full w-[200px] h-[200px] mb-4'
            />
            <span className='bg-[#BF6159] text-white text-xs px-3 py-1 rounded-full mb-4'>
              ★ 5.0
            </span>
          </div>
          <div className='text-center'>
            <div className='flex justify-center gap-4 mb-4'>
              <button className='p-3 rounded-sm bg-red-100 text-[#BF6159]'>
                <FaRegCalendarCheck className='text-2xl' />
              </button>
              <button className='p-3 rounded-sm bg-red-100 text-[#BF6159]'>
                <FiPhone className='text-2xl' />
              </button>
              <button className='p-3 rounded-sm bg-red-100 text-[#BF6159]'>
                <BiMessageDots className='text-2xl' />
              </button>
            </div>
            <p className='text-gray-700 text-3xl font-semibold mb-2'>
              $100 - $350
            </p>
            <p className='text-gray-500 mb-4'>Online / Offline</p>
            <button className='bg-[#BF6159] text-white py-2 px-4 rounded-lg shadow-lg hover:bg-[#BF6159]'>
              Book Appointment
            </button>
          </div>
          <div className='mt-6 flex justify-center gap-4'>
            <span className='text-sm bg-red-100 text-red-500 px-3 py-1 rounded-full'>
              Friendly
            </span>
            <span className='text-sm bg-red-100 text-red-500 px-3 py-1 rounded-full'>
              Good Listener
            </span>
            <span className='text-sm bg-red-100 text-red-500 px-3 py-1 rounded-full'>
              Patient
            </span>
          </div>
        </div>

        {/* Right Information */}
        <div className='w-full md:w-2/3 md:pl-12'>
          <h3 className='text-4xl  text-black font-semibold mb-2'>
            Dr. Annah Ray
          </h3>
          <p className='text-[#979797] text-2xl mb-4'>
            Specialist of implants and cosmetic dentistry
          </p>
          <div className=' mb-6'>
            <p className=' font-semibold text-2xl mb-4'>
              <span className='text-red-500'>📍</span> Accra, Ghana
            </p>
            <p className='text-xl text-[#979797]'>
              Kwame Nkrumah Circle, Accra Ghana lorem <br /> ipsum dolor sit
              amet, consectetur adipiscing elit.
            </p>
          </div>

          <div className='mb-6'>
            <h2 className='font-semibold text-black text-2xl mb-3'>
              Specialities
            </h2>
            <div className='flex flex-wrap gap-2'>
              {['Oral Radiology', 'Implantology', 'Cosmetic Dentistry'].map(
                speciality => (
                  <span
                    key={speciality}
                    className='bg-red-100 text-red-500 px-4 py-2 rounded-md text-xl'
                  >
                    {speciality}
                  </span>
                )
              )}
            </div>
          </div>

          <div className='mb-6'>
            <h2 className='font-semibofont-semibold text-black text-2xl mb-3'>
              Issues
            </h2>
            <div className='flex flex-wrap gap-2'>
              {['Oral Radiology', 'Implantology', 'Cosmetic Dentistry'].map(
                issue => (
                  <span
                    key={issue}
                    className='bg-red-100 text-red-500 px-4 py-2 rounded-md text-xl'
                  >
                    {issue}
                  </span>
                )
              )}
            </div>
          </div>

          <div className='mb-6'>
            <h2 className='font-semibold text-gray-800 mb-2'>Qualification</h2>
            <p className='text-gray-600 text-sm'>
              Licenses of implant and cosmetic dentistry
            </p>
          </div>

          <div>
            <h2 className='font-semibold text-gray-800 mb-2'>Experience</h2>
            <p className='text-gray-600 text-sm'>
              Licenses of implant and cosmetic dentistry (
              <span className='text-red-500'>15 years of Experience</span>)
            </p>
          </div>
        </div>
      </div>
    </>
  )
}
