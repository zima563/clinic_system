import React, { useState } from 'react'

const ScheduleModal = ({ onClose }) => {
  const [formData, setFormData] = useState({
    doctor: '',
    service: '',
    availableDate: '',
    timeFrom: '09:00 AM',
    timeTo: '12:00 PM',
    price: ''
  })

  const [errors, setErrors] = useState({})

  const handleChange = e => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const validateForm = () => {
    const newErrors = {}
    if (!formData.doctor) newErrors.doctor = 'Doctor is required.'
    if (!formData.service) newErrors.service = 'Service is required.'
    if (!formData.availableDate)
      newErrors.availableDate = 'Available date is required.'
    if (!formData.price) newErrors.price = 'Price is required.'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!validateForm()) return

    try {
      const token = 'your_token_here' // Replace with your token
      await axios.post('https://your-api-url.com/api/schedule', formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      onSave() // Refresh data or perform action after saving
      onClose() // Close modal
    } catch (error) {
      console.error('Error saving schedule:', error)
    }
  }
  return (
    <div className='fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50'>
      <div className='bg-white w-full max-w-lg rounded-md p-6 relative'>
        <h2 className='text-xl font-bold text-red-600 mb-4'>Add Schedule</h2>
        <form onSubmit={handleSubmit}>
          {/* Doctor */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Doctor</label>
            <select
              name='doctor'
              value={formData.doctor}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
            >
              <option value=''>Select</option>
              <option value='1'>Dr. Ahmed Ragab</option>
              <option value='2'>Dr. Marina Ehab</option>
            </select>
            {errors.doctor && (
              <p className='text-red-500 text-sm'>{errors.doctor}</p>
            )}
          </div>

          {/* Service */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Services</label>
            <select
              name='service'
              value={formData.service}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
            >
              <option value=''>Select</option>
              <option value='Facial Treatments'>Facial Treatments</option>
              <option value='Botox Injections'>Botox Injections</option>
            </select>
            {errors.service && (
              <p className='text-red-500 text-sm'>{errors.service}</p>
            )}
          </div>

          {/* Available Date */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>
              Available Date
            </label>
            <input
              type='date'
              name='availableDate'
              value={formData.availableDate}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
            />
            {errors.availableDate && (
              <p className='text-red-500 text-sm'>{errors.availableDate}</p>
            )}
          </div>

          {/* Time */}
          <div className='mb-4 flex gap-4'>
            <div>
              <label className='block text-sm font-medium mb-1'>From</label>
              <input
                type='time'
                name='timeFrom'
                value={formData.timeFrom}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
              />
            </div>
            <div>
              <label className='block text-sm font-medium mb-1'>To</label>
              <input
                type='time'
                name='timeTo'
                value={formData.timeTo}
                onChange={handleChange}
                className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
              />
            </div>
          </div>

          {/* Price */}
          <div className='mb-4'>
            <label className='block text-sm font-medium mb-1'>Price</label>
            <input
              type='number'
              name='price'
              value={formData.price}
              onChange={handleChange}
              className='w-full border border-gray-300 rounded-md px-4 py-2 focus:ring-2 focus:ring-red-600'
            />
            {errors.price && (
              <p className='text-red-500 text-sm'>{errors.price}</p>
            )}
          </div>

          {/* Add Another Date */}
          <button
            type='button'
            className='text-red-600 text-sm hover:underline mb-4'
          >
            + Add another Date
          </button>

          {/* Buttons */}
          <div className='flex justify-end gap-4'>
            <button
              type='button'
              onClick={onClose}
              className='px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300'
            >
              Cancel
            </button>
            <button
              type='submit'
              className='px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700'
            >
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default ScheduleModal
