import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaTrash, FaPlus, FaCalendarAlt } from 'react-icons/fa'

const ScheduleModal = ({ onClose, onSave }) => {
  const [doctorId, setDoctorId] = useState('')
  const [servicesId, setServicesId] = useState('')
  const [price, setPrice] = useState('')
  const [dates, setDates] = useState([
    { day: 'Sun', fromTime: '09:00', toTime: '13:00' }
  ])

  const [doctors, setDoctors] = useState([])
  const [services, setServices] = useState([])
  const [errors, setErrors] = useState({})
  const [apiError, setApiError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const dayOptions = [
    { value: 'Sun', label: 'Sunday (الأحد)' },
    { value: 'Mon', label: 'Monday (الإثنين)' },
    { value: 'Tue', label: 'Tuesday (الثلاثاء)' },
    { value: 'Wed', label: 'Wednesday (الأربعاء)' },
    { value: 'Thu', label: 'Thursday (الخميس)' },
    { value: 'Fri', label: 'Friday (الجمعة)' },
    { value: 'Sat', label: 'Saturday (السبت)' }
  ]

  useEffect(() => {
    fetchDoctorsAndServices()
  }, [])

  const fetchDoctorsAndServices = async () => {
    try {
      const token = getToken()
      const [docRes, servRes] = await Promise.all([
        axios.get(`${API_URL}/api/doctors/all`, { headers: { Authorization: `Bearer ${token}` } }),
        axios.get(`${API_URL}/api/services/all`, { headers: { Authorization: `Bearer ${token}` } })
      ])
      const docsList = Array.isArray(docRes.data) ? docRes.data : (docRes.data?.data || [])
      const servsList = Array.isArray(servRes.data) ? servRes.data : (servRes.data?.data || [])
      setDoctors(docsList)
      setServices(servsList)
    } catch (err) {
      console.error('Error fetching doctors or services:', err)
    }
  }

  const handleAddSlot = () => {
    setDates(prev => [
      ...prev,
      { day: 'Wed', fromTime: '14:00', toTime: '18:00' }
    ])
  }

  const handleRemoveSlot = index => {
    if (dates.length <= 1) return
    setDates(prev => prev.filter((_, i) => i !== index))
  }

  const handleSlotChange = (index, field, value) => {
    setDates(prev => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!doctorId) newErrors.doctorId = 'Doctor is required.'
    if (!servicesId) newErrors.servicesId = 'Service is required.'
    if (!price || Number(price) <= 0) newErrors.price = 'Valid price is required.'
    if (!dates || dates.length === 0) newErrors.dates = 'At least one working date slot is required.'

    dates.forEach((slot, idx) => {
      if (!slot.day) newErrors[`day_${idx}`] = 'Day is required.'
      if (!slot.fromTime) newErrors[`from_${idx}`] = 'From time is required.'
      if (!slot.toTime) newErrors[`to_${idx}`] = 'To time is required.'
    })

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    setApiError('')
    if (!validateForm()) return

    setIsSubmitting(true)

    try {
      const token = getToken()
      const payload = {
        doctorId: Number(doctorId),
        servicesId: Number(servicesId),
        price: Number(price),
        dates: dates.map(d => ({
          day: d.day,
          fromTime: d.fromTime,
          toTime: d.toTime
        }))
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
      const msg = error.response?.data?.message || error.response?.data?.data?.message || error.message || 'Failed to save schedule.'
      setApiError(msg)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
      <div className='bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
        <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
          <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
            <FaCalendarAlt /> Add Doctor Schedule
          </h2>
          <button
            onClick={onClose}
            className='modal-close'
          >
            ✕
          </button>
        </div>

        {apiError && (
          <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium'>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit} className='space-y-4'>
          {/* Doctor Selection */}
          <div>
            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Doctor</label>
            <select
              value={doctorId}
              onChange={e => setDoctorId(e.target.value)}
              className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
            >
              <option value=''>-- Select Doctor --</option>
              {doctors.map(doc => (
                <option key={doc.id} value={doc.id}>
                  {doc.name} {doc.specialty?.title ? `(${doc.specialty.title})` : ''}
                </option>
              ))}
            </select>
            {errors.doctorId && <p className='text-red-500 text-xs mt-1'>{errors.doctorId}</p>}
          </div>

          {/* Service Selection */}
          <div>
            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Service</label>
            <select
              value={servicesId}
              onChange={e => setServicesId(e.target.value)}
              className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
            >
              <option value=''>-- Select Service --</option>
              {services.map(serv => (
                <option key={serv.id} value={serv.id}>
                  {serv.title}
                </option>
              ))}
            </select>
            {errors.servicesId && <p className='text-red-500 text-xs mt-1'>{errors.servicesId}</p>}
          </div>

          {/* Price */}
          <div>
            <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Price (L.E)</label>
            <input
              type='number'
              value={price}
              onChange={e => setPrice(e.target.value)}
              placeholder='e.g. 250'
              className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
            />
            {errors.price && <p className='text-red-500 text-xs mt-1'>{errors.price}</p>}
          </div>

          {/* Dynamic Dates Array Section */}
          <div className='pt-2 border-t border-gray-100'>
            <div className='flex justify-between items-center mb-2'>
              <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider'>
                Working Days & Time Slots (Array of Objects)
              </label>
              <button
                type='button'
                onClick={handleAddSlot}
                className='inline-flex items-center gap-1 text-xs font-bold text-[#BF6159] hover:text-red-700 bg-red-50 px-2.5 py-1 rounded-lg border border-red-200 transition'
              >
                <FaPlus className='text-[10px]' /> Add Slot
              </button>
            </div>

            <div className='space-y-3 max-h-60 overflow-y-auto pr-1 custom-scroll'>
              {dates.map((slot, idx) => (
                <div key={idx} className='flex gap-2 items-center bg-gray-50 p-3 rounded-xl border border-gray-200'>
                  {/* Day */}
                  <div className='flex-1'>
                    <select
                      value={slot.day}
                      onChange={e => handleSlotChange(idx, 'day', e.target.value)}
                      className='w-full border border-gray-300 rounded-lg px-2.5 py-1.5 text-xs font-medium focus:ring-1 focus:ring-[#BF6159] bg-white'
                    >
                      {dayOptions.map(opt => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* From Time */}
                  <div className='flex-1'>
                    <input
                      type='time'
                      value={slot.fromTime}
                      onChange={e => handleSlotChange(idx, 'fromTime', e.target.value)}
                      className='w-full border border-gray-300 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-[#BF6159] bg-white'
                    />
                  </div>

                  {/* To Time */}
                  <div className='flex-1'>
                    <input
                      type='time'
                      value={slot.toTime}
                      onChange={e => handleSlotChange(idx, 'toTime', e.target.value)}
                      className='w-full border border-gray-300 rounded-lg px-2 py-1 text-xs font-medium focus:ring-1 focus:ring-[#BF6159] bg-white'
                    />
                  </div>

                  {/* Delete Slot */}
                  {dates.length > 1 && (
                    <button
                      type='button'
                      onClick={() => handleRemoveSlot(idx)}
                      className='btn-icon danger'
                      title='Remove Slot'
                    >
                      <FaTrash className='text-xs' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
            <button
              type='button'
              onClick={onClose}
              className='btn-secondary'
            >
              Cancel
            </button>
            <button
              type='submit'
              disabled={isSubmitting}
              className='btn-primary'
            >
              {isSubmitting ? 'Saving...' : 'Save Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
