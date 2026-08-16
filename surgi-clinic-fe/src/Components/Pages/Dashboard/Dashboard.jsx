import React, { useState } from 'react'
import { FaArrowUp, FaArrowDown } from 'react-icons/fa'
import Chart from './Chart'
import CalendarComponent from './CalendarComponent'

const Dashboard = () => {
  const [value, setValue] = useState(new Date())
  return (
    <div
      style={{ maxHeight: 'calc(100vh - 100px)' }}
      className=' overflow-y-auto custom-scroll'
    >
      <div className='p-4 flex flex-wrap gap-4'>
        {/* Main Section */}
        <div className='flex-1 flex flex-col gap-4'>
          {/* Header & Stats Section */}
          <div className='flex gap-4'>
            {/* Stats Section */}
            <div className='flex flex-1 gap-4'>
              <div className='flex flex-col items-center bg-red-50 border border-red-200 p-4 rounded-md w-full'>
                <h2 className='text-lg font-semibold text-red-500'>
                  Total Visits
                </h2>
                <p className='text-3xl font-bold'>289</p>
                <p className='flex items-center text-green-500'>
                  <FaArrowUp className='mr-1' /> 10.5% From last week
                </p>
              </div>
              <div className='flex flex-col items-center bg-blue-50 border border-blue-200 p-4 rounded-md w-full'>
                <h2 className='text-lg font-semibold text-blue-500'>
                  Total Doctors
                </h2>
                <p className='text-3xl font-bold'>27</p>
                <p className='flex items-center text-green-500'>
                  <FaArrowUp className='mr-1' /> 1.5% From last week
                </p>
              </div>
              <div className='flex flex-col items-center bg-green-50 border border-green-200 p-4 rounded-md w-full'>
                <h2 className='text-lg font-semibold text-green-500'>
                  Total Patients
                </h2>
                <p className='text-3xl font-bold'>170</p>
                <p className='flex items-center text-green-500'>
                  <FaArrowUp className='mr-1' /> 1.5% From last week
                </p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className='bg-gray-100 p-4 rounded-md w-full h-72 flex items-center justify-center'>
            <Chart />
          </div>
        </div>

        {/* Calendar Section */}
        <div className='w-80 bg-white  rounded-md'>
          <CalendarComponent
            tileClassName={({ date }) => {
              const baseClasses =
                'p-2 text-center hover:bg-[#F5E7E6] rounded-md'
              if (isAppointment(date)) return `${baseClasses} bg-red-100`
              if (isVisit(date)) return `${baseClasses} bg-green-100`
              return baseClasses
            }}
            onChange={setValue}
            value={value}
          />
        </div>
      </div>
      <div className='flex gap-6 p-4 '>
        {/* Patients Overview */}
        <div className='w-3/4 bg-white p-4 rounded-lg border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-700'>
            Patients Overview
          </h3>
          <div className='mt-4 overflow-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead className='border-b'>
                <tr>
                  <th className='py-2'>No</th>
                  <th>Name</th>
                  <th>Age</th>
                  <th>Date of Birth</th>
                  <th>Gender</th>
                  <th>Phone</th>
                  <th>Joining Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {Array.from({ length: 6 }, (_, index) => (
                  <tr key={index} className='border-b'>
                    <td className='py-2'>O{index + 1}</td>
                    <td>Ahmed Ali</td>
                    <td>25</td>
                    <td>29-4-1999</td>
                    <td>Male</td>
                    <td>+20 01144589895</td>
                    <td>22-12-2024</td>
                    <td>
                      <button className='text-blue-500'>View</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Top Services */}
        <div className='bg-white w-1/4 p-4 rounded-lg border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-700'>Top Services</h3>
          <ul className='mt-4 space-y-4'>
            {[
              { service: 'Facial Treatments', times: 50, price: 480 },
              { service: 'Botox Injections', times: 30, price: 550 },
              { service: 'Dermal Fillers', times: 22, price: 250 },
              { service: 'Laser Hair Removal', times: 15, price: 1450 },
              { service: 'Microdermabrasion', times: 5, price: 380 }
            ].map((item, index) => (
              <li key={index} className='flex justify-between text-sm'>
                <span>{item.service}</span>
                <span>
                  {item.times} Times | {item.price} L.E
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
