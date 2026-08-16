import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'

const ScheduleModal = ({ onClose, onSave }) => {
  const [formData, setFormData] = useState({
    doctorId: '',
    servicesId: '',
    day: 'Sunday',
    timeFrom: '09:00 AM',
    timeTo: '12:00 PM',
    price: ''
  })

  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})

  useEffect(() => {
    fetchDoctorsAndServices()
  }, [])

  const fetchDoctorsAndServices = async () => {
    try {
      const token = getToken()
      const [docRes, servRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctor/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/service/all`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      setDoctors(docRes.data.data || [])
      setServices(servRes.data.data || [])
    } catch (err) {
      console.error('Error fetching doctors or services:', err)
    }
  }

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.doctorId) newErrors.doctorId = 'Doctor is required.'
    if (!formData.servicesId) newErrors.servicesId = 'Service is required.'
    if (!formData.price) newErrors.price = 'Price is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const token = getToken()
      const payload = {
        doctorId: Number(formData.doctorId),
        servicesId: Number(formData.servicesId),
        price: Number(formData.price),
        dates: [
          {
            day: formData.day,
            fromTime: formData.timeFrom,
            toTime: formData.timeTo
          }
        ]
      }

      await axios.post(`${API_URL}/api/schedule`, payload, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      if (onSave) onSave()
      onClose()
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }

  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white w-full max-w-lg rounded-md p-6 relative'>
        <h2 className='text-xl font-bold text-[#BF6159] mb-4'>Add Schedule</h2>
        <form onSubmit={handleSubmit}>
          {/* Doctor */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Doctor</label>
            <select
              name='doctorId'
              value={formData.doctorId}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
            >
              <option value=''>Select Doctor</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name}
                </option>
              ))}
            </select>
            {errors.doctorId && (
              <p className='text-red-500 text-sm'>{errors.doctorId}</p>
            )}
          </div>

          {/* Service */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Service</label>
            <select
              name='servicesId'
              value={formData.servicesId}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
            >
              <option value=''>Select Service</option>
              {services.map(serv => (
                <option key={serv.id} value={serv.id}>
                  {serv.title}
                </option>
              ))}
            </select>
            {errors.servicesId && (
              <p className='text-red-500 text-sm'>{errors.servicesId}</p>
            )}
          </div>

          {/* Day */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Day</label>
            <select
              name='day'
              value={formData.day}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
            >
              <option value='Sunday'>Sunday</option>
              <option value='Monday'>Monday</option>
              <option value='Tuesday'>Tuesday</option>
              <option value='Wednesday'>Wednesday</option>
              <option value='Thursday'>Thursday</option>
              <option value='Friday'>Friday</option>
              <option value='Saturday'>Saturday</option>
            </select>
          </div>

          {/* Time */}
          <div className='mb-4 flex gap-4'>
            <div className='flex-1'>
              <label className='block text-sm font-medium mb-1'>From Time</label>
              <input
                type='text'
                name='timeFrom'
                value={formData.timeFrom}
                onChange={handleChange}
                placeholder='e.g. 09:00 AM'
                className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
              />
            </div>
            <div className='flex-1'>
              <label className='block text-sm font-medium mb-1'>To Time</label>
              <input
                type='text'
                name='timeTo'
                value={formData.timeTo}
                onChange={handleChange}
                placeholder='e.g. 12:00 PM'
                className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
              />
            </div>
          </div>

          {/* Price */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Price (L.E)</label>
            <input
              type='number'
              name='price'
              value={formData.price}
              onChange={handleChange}
              placeholder='e.g. 250'
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-[#BF6159]'
            />
            {errors.price && (
              <p className='text-red-500 text-sm'>{errors.price}</p>
            )}
          </div>

          {/* Buttons */}
          <div className='flex justify-end gap-4 mt-6'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-[#BF6159] text-white rounded-md hover:bg-red-700'
            >
              Save Schedule
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
