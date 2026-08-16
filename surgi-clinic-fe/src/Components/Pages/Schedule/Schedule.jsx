import React, { useState, useEffect } from 'react'
import axios from 'axios'
import ScheduleModal from './ScheduleModal'
import { API_URL, getToken } from '../../../config'

const Schedule = () => {
  const [schedules, setSchedules] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedDay, setSelectedDay] = useState(null)
  const [isModalOpen, setIsModalOpen] = useState(false) // State to manage modal visibility
  const daysOfWeek = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat']

  const TOKEN = getToken()
  const APIURL = `${API_URL}/api/schedule`
  useEffect(() => {
    fetchSchedules()
  }, [searchQuery])

  const fetchSchedules = async () => {
    try {
      const response = await axios.get(`${APIURL}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })
      setSchedules(response.data.data)
    } catch (error) {
      console.error('Error fetching schedules:', error)
    }
  }

  const formatTimeRange = (fromTime, toTime) => {
    return `${fromTime} AM to ${toTime} PM`
  }

  return (
    <div className='p-6'>
      {/* Header */}
      <div className='flex justify-between mb-4'>
        <h1 className='text-[#BF6159] text-3xl'>Schedule List</h1>
        <div className='flex gap-3'>
          <input
            type='text'
            placeholder='Search by Name'
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className='px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-red-600'
          />
          <button
            onClick={() => setIsModalOpen(true)} // Open modal on button click
            className='bg-[#BF6159] text-white px-4 py-2 rounded-md hover:bg-red-600'
          >
            + Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className='border-b py-2 text-left'>Dr. Name</th>
            <th className='border-b py-2 text-left'>Services</th>
            <th className='border-b py-2 text-left'>Available Date</th>
            <th className='border-b py-2 text-left'>Price</th>
          </tr>
        </thead>
        <tbody>
          {schedules.map(schedule => (
            <tr key={schedule.id}>
              <td className='py-5 border-b flex items-center gap-3'>
                <img
                  src={schedule.doctor.image}
                  alt={schedule.doctor.name}
                  className='w-10 h-10 rounded-full'
                />
                <span>{schedule.doctor.name}</span>
              </td>
              <td className='py-6 border-b font-bold'>
                {schedule.service.title}
              </td>
              <td className='border-b'>
                <div>
                  <div className='flex gap-2 p-2'>
                    <div className='border flex p-2'>
                      {daysOfWeek.map((day, index) => {
                        const isAvailable = schedule.dates.some(
                          date => date.day === day
                        )
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              setSelectedDay(
                                isAvailable ? { day, schedule } : null
                              )
                            }
                            className={`cursor-pointer px-3 py-1 ${
                              isAvailable
                                ? 'bg-[#F5E7E6] text-black'
                                : 'bg-transparent'
                            }`}
                          >
                            {day}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {selectedDay && selectedDay.schedule.id === schedule.id && (
                    <div className='text-xs text-gray-600'>
                      {selectedDay.schedule.dates
                        .filter(date => date.day === selectedDay.day)
                        .map((date, idx) => (
                          <div key={idx}>
                            {formatTimeRange(date.fromTime, date.toTime)}
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              </td>
              <td className='py-2 border-b'>{schedule.price} EGP</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && <ScheduleModal onClose={() => setIsModalOpen(false)} />}
    </div>
  )
}

export default Schedule
