import React, { useEffect, useState } from 'react'
import { FaSearch, FaWindowClose } from 'react-icons/fa'
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
      status: '',
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
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-2xl p-6 relative'>
            <button
              onClick={closeModal}
              className='absolute top-4 right-4 text-gray-400 hover:text-red-600'
            >
              <FaWindowClose className='text-2xl' />
            </button>
            <h2 className='text-2xl font-bold mb-6'>Add Service</h2>
            <form onSubmit={formik.handleSubmit}>
              <div className='relative w-[146px] h-[143px] mb-9 mx-auto border rounded-[50px]'>
                <div className='relative w-full h-full flex items-center justify-center'>
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)} // Display the uploaded image
                      alt='Selected'
                      className='w-full h-full'
                    />
                  ) : (
                    <div className='rounded-full overflow-hidden'>
                      <img src={addDoctor} className='w-full h-full' alt='' />
                    </div>
                  )}
                  <label
                    htmlFor='imageInput'
                    className='absolute bottom-0 border-white  border-2 right-0 bg-[#BF6159] text-white p-2 rounded-full cursor-pointer'
                  >
                    <IoCameraOutline />
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

              <div className='flex gap-4'>
                <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                  <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                    Title
                  </label>
                  <input
                    type='text'
                    name='title'
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    placeholder='eg: John Doe'
                    className='add-p-i pl-6 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                  {formik.errors.title && formik.touched.title && (
                    <div className='error'>{formik.errors.title}</div>
                  )}
                </div>

                <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                  <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                    Status
                  </label>
                  <select
                    name='status'
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    className='w-full add-p-i pl-6 py-2 focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  >
                    <option value='Available'>Available</option>
                    <option value='Not Available'>Not Available</option>
                  </select>
                </div>
              </div>

              <div className='flex-1 w-full group mt-5 mb-5'>
                <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                  Description
                </label>
                <textarea
                  name='desc'
                  value={formik.values.desc}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  placeholder='Info'
                  className='add-p-i pl-6 pr-4 h-[110px] py-2 resize-none w-full focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                ></textarea>
                {formik.errors.desc && formik.touched.desc && (
                  <div className='error'>{formik.errors.desc}</div>
                )}
              </div>

              <div className='mt-6'>
                <button
                  type='submit'
                  disabled={loading}
                  className={`bg-[#BF6159] text-white px-6 py-2 rounded-md hover:bg-[#BF6159] ${
                    loading ? 'cursor-wait' : ''
                  }`}
                >
                  <div className='flex'>
                    {loading ? 'Saving...' : 'Save'}{' '}
                    <IoIosSave className='text-2xl' />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
