import React, { useState } from 'react'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

const CalendarComponent = ({ appointmentDates = [] }) => {
  const [value, setValue] = useState(new Date())

  const isAppointment = date => {
    const formatted = date.toISOString().split('T')[0]
    return appointmentDates.includes(formatted)
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      return (
        <div className='flex justify-center items-center mt-1'>
          {isAppointment(date) && (
            <span className='w-2 h-2 rounded-full bg-red-500 mx-0.5'></span>
          )}
        </div>
      )
    }
  }

  return (
    <div className='max-w-md mx-auto'>
      <h3 className='text-xl font-semibold text-left text-[#BF6159] ml-4 mb-1'>
        Calendar
      </h3>
      <Calendar
        onChange={setValue}
        value={value}
        tileContent={tileContent}
        className='bg-white border-none rounded-lg p-2'
        next2Label={null}
        prev2Label={null}
      />
      <div className='flex justify-around mt-2'>
        <div className='flex items-center'>
          <span className='w-3 h-3 bg-red-500 rounded-full mr-2'></span>
          <span className='text-sm'>Scheduled Appointments</span>
        </div>
      </div>
    </div>
  )
}

export default CalendarComponent
