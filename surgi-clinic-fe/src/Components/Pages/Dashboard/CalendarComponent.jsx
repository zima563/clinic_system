import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css' // This will still be needed for default structure

const CalendarComponent = () => {
  const [value, setValue] = useState(new Date())

  const appointments = ['2025-06-12', '2025-06-13', '2025-06-20']
  const visits = ['2025-06-15', '2025-06-23', '2025-06-29']

  const isAppointment = date =>
    appointments.includes(date.toISOString().split('T')[0])
  const isVisit = date => visits.includes(date.toISOString().split('T')[0])

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      return (
        <div className='flex justify-center items-center mt-1'>
          {isAppointment(date) && (
            <span className='w-2 h-2 rounded-full bg-red-500 mx-0.5'></span>
          )}
          {isVisit(date) && (
            <span className='w-2 h-2 rounded-full bg-green-500 mx-0.5'></span>
          )}
        </div>
      )
    }
  }

  return (
    <div className=' max-w-md mx-auto'>
      <h3 className='text-xl font-semibold text-left text-[#BF6159] ml-4 mb-1'>
        Calendar
      </h3>
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
        className='bg-white  border-none rounded-lg p-2'
        next2Label={null}
        prev2Label={null}
      />
      <div className='flex justify-around mt-2'>
        <div className='flex items-center'>
          <span className='w-3 h-3 bg-red-500 rounded-full mr-2'></span>
          <span className='text-sm'>Appointments</span>
        </div>
        <div className='flex items-center'>
          <span className='w-3 h-3 bg-green-500 rounded-full mr-2'></span>
          <span className='text-sm'>Visit</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarComponent
