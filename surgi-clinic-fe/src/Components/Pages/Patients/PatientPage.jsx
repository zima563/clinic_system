import React from 'react'
import { FaUserMd, FaHeartbeat, FaWeight } from 'react-icons/fa'
import { MdOutlineMedication } from 'react-icons/md'
import patientImage from '../../../assets/patientimg.png'

const PatientPage = () => {
  return (
    <div className=' p-6 min-h-screen'>
      {/* Main Container */}
      <div className='max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Section - Patient Card */}
        <div className='bg-white h-screen shadow-lg rounded-b-[57.73px]  rounded-lg p-6 col-span-1'>
          <div className='flex flex-col items-center mb-6'>
            <img
              src={patientImage}
              alt='Profile'
              className='w-24 h-24 rounded-md mb-4'
            />
            <h2 className='text-xl font-bold text-red-600'>Emma Grace</h2>
          </div>
          <div className='space-y-4  md:mt-14'>
            <div className='flex justify-between'>
              <span className='font-bold'>Gender:</span>
              <p className=' text-[#898A8D]'>Female</p>
            </div>
            <div className='flex justify-between'>
              <span className='font-bold'>Age:</span>
              <p className=' text-[#898A8D]'>42</p>
            </div>
            <div className='flex justify-between'>
              <span className='font-bold'>Family Status:</span>
              <p className=' text-[#898A8D]'>Married</p>
            </div>
            <div className='flex justify-between'>
              <span className='font-bold'>Phone:</span>
              <p className=' text-[#898A8D]'>+20 011346565</p>
            </div>
            <div className='flex justify-between'>
              <span className='font-bold'>Date of Birth:</span>
              <p className=' text-[#898A8D]'>22-12-1980</p>
            </div>
            <div className='flex justify-between'>
              <span className='font-bold'>Address:</span>
              <p className=' text-[#898A8D]'>5 Nasr City</p>
            </div>
          </div>
        </div>

        {/* Right Section */}
        <div className='col-span-2  space-y-6'>
          {/* Appointments and Medical History */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
            {/* Appointments */}
            <div className='bg-white shadow-md rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-red-600 mb-4'>
                Appointments
              </h3>
              <div className='space-y-6'>
                {['16 Oct 2023', '12 Sep 2023', '16 Aug 2023'].map(
                  (date, index) => (
                    <div
                      key={index}
                      className='flex flex-col space-y-1 bg-gray-100 p-4 rounded-lg shadow-sm'
                    >
                      <p className='text-gray-600'>{date}</p>
                      <h4 className='font-bold text-gray-700'>
                        Post-Surgical Care
                      </h4>
                      <p className='text-sm text-gray-500 flex items-center'>
                        <FaUserMd className='text-red-500 mr-2' />
                        Dr. Raffat Ramssis
                      </p>
                    </div>
                  )
                )}
              </div>
            </div>

            {/* Medical History */}
            <div className='bg-white shadow-md rounded-lg p-6'>
              <h3 className='text-lg font-semibold text-red-600 mb-4'>
                Medical History
              </h3>
              <ul className='space-y-4'>
                <li className='flex items-start space-x-2'>
                  <MdOutlineMedication className='text-red-500 mt-1' />
                  <p>
                    Use of chronic medications (e.g., diabetes and hypertension
                    medications).
                  </p>
                </li>
                <li className='flex items-start space-x-2'>
                  <MdOutlineMedication className='text-red-500 mt-1' />
                  <p>Obesity (morbid obesity): 170 kg</p>
                </li>
                <li className='flex items-start space-x-2'>
                  <MdOutlineMedication className='text-red-500 mt-1' />
                  <p>Persistent high blood sugar levels.</p>
                </li>
              </ul>
            </div>
          </div>

          {/* Medical Info */}
          <div className='bg-white shadow-md rounded-lg p-6 grid grid-cols-2 md:grid-cols-4 gap-6'>
            {/* Height */}
            <div className='flex items-center space-x-4'>
              <FaWeight className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Height</p>
                <p className='text-gray-600'>170 cm</p>
              </div>
            </div>
            {/* Weight */}
            <div className='flex items-center space-x-4'>
              <FaWeight className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>Weight</p>
                <p className='text-gray-600'>70 kg</p>
              </div>
            </div>
            {/* BMI */}
            <div className='flex items-center space-x-4'>
              <FaHeartbeat className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>BMI</p>
                <p className='text-gray-600'>24.2 (Normal)</p>
              </div>
            </div>
            {/* Blood Pressure */}
            <div className='flex items-center space-x-4'>
              <FaHeartbeat className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>
                  Blood Pressure
                </p>
                <p className='text-gray-600'>120/80 mmHg (Normal)</p>
              </div>
            </div>
            {/* Fasting Blood Sugar */}
            <div className='flex items-center space-x-4'>
              <FaHeartbeat className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>
                  Fasting Blood Sugar
                </p>
                <p className='text-gray-600'>95 mg/dL (Normal)</p>
              </div>
            </div>
            {/* Body Temperature */}
            <div className='flex items-center space-x-4'>
              <FaHeartbeat className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>
                  Body Temperature
                </p>
                <p className='text-gray-600'>36.8°C (Normal)</p>
              </div>
            </div>
            {/* Blood Type */}
            <div className='flex items-center space-x-4'>
              <FaHeartbeat className='text-red-500 text-2xl' />
              <div>
                <p className='text-sm font-semibold text-gray-700'>
                  Blood Type
                </p>
                <p className='text-gray-600'>A+</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPage
