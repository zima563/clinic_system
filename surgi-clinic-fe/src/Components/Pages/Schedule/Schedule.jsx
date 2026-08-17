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
      <div className='flex justify-between items-center mb-6'>
        <h1 className='page-title'>📅 Schedule List</h1>
        <div className='flex gap-3'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              placeholder='Search by name...'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className='btn-primary'
          >
            + Add Schedule
          </button>
        </div>
      </div>

      {/* Schedule Table */}
      <table className='w-full border-collapse'>
        <thead>
          <tr>
            <th className='border-b-2 border-gray-100 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-2'>Dr. Name</th>
            <th className='border-b-2 border-gray-100 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-2'>Service</th>
            <th className='border-b-2 border-gray-100 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-2'>Available Days</th>
            <th className='border-b-2 border-gray-100 py-3 text-left text-xs font-bold uppercase tracking-wider text-gray-500 px-2'>Price</th>
          </tr>
        </thead>
        <tbody>
          {schedules?.map(schedule => (
            <tr key={schedule.id}>
              <td className='py-5 border-b flex items-center gap-3'>
                <img
                  src={schedule.doctor?.image || ''}
                  alt={schedule.doctor?.name || 'Doctor'}
                  className='w-10 h-10 rounded-full object-cover border border-red-200 shadow-sm'
                  onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(schedule.doctor?.name || 'Doctor') + '&background=BF6159&color=fff' }}
                />
                <span className='font-semibold text-gray-800'>{schedule.doctor?.name || 'Doctor'}</span>
              </td>
              <td className='py-6 border-b font-bold text-gray-700'>
                {schedule.service?.title || 'General Service'}
              </td>
              <td className='border-b'>
                <div>
                  <div className='flex gap-2 p-2'>
                    <div className='border rounded-lg flex p-1 bg-gray-50'>
                      {daysOfWeek.map((day, index) => {
                        const matchedDate = schedule.dates?.find(
                          date => date.day?.toLowerCase().startsWith(day.toLowerCase())
                        )
                        const isAvailable = !!matchedDate
                        return (
                          <div
                            key={index}
                            onClick={() =>
                              setSelectedDay(
                                isAvailable ? { day, schedule, matchedDate } : null
                              )
                            }
                            className={`cursor-pointer px-3 py-1 text-xs font-semibold rounded ${
                              isAvailable
                                ? 'bg-[#BF6159] text-white shadow-sm'
                                : 'bg-transparent text-gray-400'
                            }`}
                          >
                            {day.toUpperCase()}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                  {selectedDay && selectedDay.schedule.id === schedule.id && (
                    <div className='text-xs text-[#BF6159] font-medium px-2 py-1 bg-red-50 rounded mt-1'>
                      {selectedDay.matchedDate?.fromTime} - {selectedDay.matchedDate?.toTime}
                    </div>
                  )}
                </div>
              </td>
              <td className='py-2 border-b font-bold text-slate-800'>{schedule.price} EGP</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Modal */}
      {isModalOpen && (
        <ScheduleModal
          onClose={() => setIsModalOpen(false)}
          onSave={fetchSchedules}
        />
      )}
    </div>
  )
}

export default Schedule
