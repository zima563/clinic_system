import React, { useEffect, useState } from 'react'
import { FaSearch, FaWindowClose, FaStethoscope } from 'react-icons/fa'
import { IoIosSave } from 'react-icons/io'
import { IoCameraOutline } from 'react-icons/io5'
import axios from 'axios'
import Joi from 'joi'
import { useFormik } from 'formik'
import addDoctor from '../../../assets/heart.png'
import { API_URL, getToken } from '../../../config'

export default function Services () {
  const token = getToken()

  const addServiceValidation = Joi.object({
    title: Joi.string().min(3).max(100).required().messages({
      'string.base': 'Title must be a string.',
      'string.min': 'Title must be at least 3 characters long.',
      'string.max': 'Title cannot exceed 100 characters.',
      'any.required': 'Title is required.'
    }),
    desc: Joi.string().min(10).max(1000).required().messages({
      'string.base': 'Description must be a string.',
      'string.min': 'Description must be at least 10 characters long.',
      'string.max': 'Description cannot exceed 1000 characters.',
      'any.required': 'Description is required.'
    }),
    status: Joi.string()
      .valid('Available', 'Not Available')
      .required()
      .messages({
        'any.only': 'Status must be "Available" or "Not Available".'
      }),
    icon: Joi.any().optional()
  })

  const [services, setServices] = useState([])
  const [image, setImage] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const fetchServices = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/services/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setServices(response.data.data)
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const formik = useFormik({
    initialValues: {
      title: '',
      status: 'Available',
      desc: ''
    },
    validate: values => {
      const { error } = addServiceValidation.validate(values, {
        abortEarly: false
      })
      if (error) {
        return error.details.reduce((acc, detail) => {
          acc[detail.path[0]] = detail.message
          return acc
        }, {})
      }
      return {}
    },
    onSubmit: async values => {
      if (loading) return

      setLoading(true)
      const formData = new FormData()
      formData.append('title', values.title)
      formData.append('status', values.status === 'Available')
      formData.append('desc', values.desc)
      if (image) formData.append('icon', image)

      try {
        await axios.post(`${API_URL}/api/services`, formData, {
          headers: { Authorization: `Bearer ${token}` }
        })
        fetchServices()
        closeModal()
        setImage(null)
        formik.resetForm()
      } catch (error) {
        console.error('Error adding service:', error)
      } finally {
        setLoading(false)
      }
    }
  })

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file) setImage(file)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const handleStatusClick = async id => {
    try {
      const response = await axios.patch(
        `${API_URL}/api/services/${id}`,
        {},
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      fetchServices()
    } catch (error) {
      console.error('Error updating status:', error.response || error.message)
    }
  }

  return (
    <div
      style={{ maxHeight: 'calc(100vh - 50px)' }}
      className='container mx-auto px-4 overflow-y-auto custom-scroll'
    >
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-2xl font-semibold text-red-600'>Services List</h3>
        <div className='flex justify-between gap-5 items-center mb-4'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3 text-gray-400' />
            <input
              type='text'
              value={searchTerm}
              placeholder='Search by Name'
              onChange={e => setSearchTerm(e.target.value)}
              className='p-s-i pl-12 pr-4 py-2 w-full  focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
            />
          </div>
          <button
            onClick={openModal}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
          >
            + Add Service
          </button>
        </div>
      </div>

      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
        {services
          .filter(service =>
            service.title.toLowerCase().includes(searchTerm.toLowerCase())
          )
          .map(service => (
            <div
              key={service.id}
              className='bg-white rounded-lg shadow-md hover:shadow-lg transition cursor-pointer'
            >
              <img
                className='rounded-t-lg w-full h-48 object-cover border-b border-gray-100'
                src={service.img || ''}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1579684385127-1ef15d508118?w=500&auto=format&fit=crop&q=60' }}
                alt={service.title || 'Service'}
              />
              <div className='p-4'>
                <h3 className='text-xl font-semibold text-gray-800'>
                  {service.title}
                </h3>
                <p className='mt-2 text-gray-600'>{service.desc}</p>
                <span
                  onClick={e => {
                    e.preventDefault()
                    handleStatusClick(service.id)
                  }}
                  className={`inline-block px-3 py-1 text-sm font-medium rounded-full ${
                    service.status
                      ? 'bg-green-100 text-green-800'
                      : 'bg-red-100 text-red-800'
                  }`}
                >
                  {service.status ? 'Available' : 'Not Available'}
                </span>
              </div>
            </div>
          ))}
      </div>

      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                <FaStethoscope /> Add New Service
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            <form onSubmit={formik.handleSubmit} className='space-y-4'>
              {/* Image Upload */}
              <div className='flex justify-center mb-6'>
                <div className='relative w-24 h-24'>
                  <div className='w-full h-full rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden shadow-inner'>
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt='Selected'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <img src={addDoctor} className='w-12 h-12 object-contain opacity-70' alt='Placeholder' />
                    )}
                  </div>
                  <label
                    htmlFor='imageInput'
                    className='absolute bottom-0 right-0 bg-[#BF6159] hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition'
                    title='Upload Service Image'
                  >
                    <IoCameraOutline className='text-base' />
                    <input
                      type='file'
                      id='imageInput'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Title */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Service Title
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder='e.g. General Dental Checkup'
                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                  />
                  {formik.errors.title && formik.touched.title && (
                    <div className='text-red-500 text-xs mt-1'>{formik.errors.title}</div>
                  )}
                </div>

                {/* Status */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Availability Status
                  </label>
                  <select
                    name='status'
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                  >
                    <option value='Available'>Available</option>
                    <option value='Not Available'>Not Available</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Description & Medical Details
                </label>
                <textarea
                  name='desc'
                  value={formik.values.desc}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='Write a brief description of the medical service...'
                  rows='3'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 resize-none'
                ></textarea>
                {formik.errors.desc && formik.touched.desc && (
                  <div className='text-red-500 text-xs mt-1'>{formik.errors.desc}</div>
                )}
              </div>

              {/* Action Buttons */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  disabled={loading}
                  className='px-6 py-2.5 bg-[#BF6159] text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200 flex items-center gap-2 disabled:opacity-50'
                >
                  <IoIosSave className='text-lg' /> {loading ? 'Saving...' : 'Save Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
