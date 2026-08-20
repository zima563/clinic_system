import React, { useEffect, useState } from 'react'
import {
  FaSearch,
  FaStethoscope,
  FaPlus,
  FaTrash,
  FaCheckCircle,
  FaTimesCircle,
  FaMicroscope
} from 'react-icons/fa'
import { IoCameraOutline } from 'react-icons/io5'
import axios from 'axios'
import Joi from 'joi'
import { useFormik } from 'formik'
import defaultServiceIcon from '../../../assets/heart.png'
import { API_URL, getToken } from '../../../config'
import { toast } from 'react-toastify'

export default function Services() {
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
    status: Joi.string().valid('Available', 'Not Available').required().messages({
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
      setServices(response.data.data || [])
    } catch (error) {
      console.error('Error fetching services:', error)
    }
  }

  useEffect(() => {
    fetchServices()
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setImage(null)
    formik.resetForm()
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
    } else {
      toast.error('Please upload a valid image file.')
    }
  }

  const handleDeleteService = async id => {
    if (!window.confirm('Are you sure you want to delete this clinical service?')) return
    try {
      await axios.delete(`${API_URL}/api/services/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Clinical service deleted successfully.')
      fetchServices()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete service')
    }
  }

  const formik = useFormik({
    initialValues: {
      title: '',
      status: 'Available',
      desc: ''
    },
    validate: values => {
      const { error } = addServiceValidation.validate(values, { abortEarly: false })
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
        toast.success('Clinical service added successfully!')
        fetchServices()
        closeModal()
      } catch (error) {
        console.error('Error adding service:', error)
        toast.error(error.response?.data?.message || 'Failed to add service')
      } finally {
        setLoading(false)
      }
    }
  })

  const filteredServices = services.filter(
    s =>
      (s.title || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (s.desc || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaMicroscope className='text-[#BF6159]' /> Clinical Services ({services.length})
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Manage available medical treatments, consultations, and procedure catalog</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search Service Title or Desc...'
            />
          </div>

          <button onClick={openModal} className='btn-primary'>
            <FaPlus /> Add Service
          </button>
        </div>
      </div>

      {/* Services Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {filteredServices.length > 0 ? (
          filteredServices.map(item => {
            const iconUrl = item.icon && item.icon.startsWith('http')
              ? item.icon
              : defaultServiceIcon

            return (
              <div
                key={item.id}
                className='card p-5 bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-200 transition'
              >
                <div className='space-y-3'>
                  <div className='flex items-start justify-between gap-3'>
                    <div className='flex items-center gap-3'>
                      <div className='w-12 h-12 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center p-2 shadow-2xs'>
                        <img
                          src={iconUrl}
                          alt={item.title}
                          className='w-full h-full object-contain'
                          onError={e => {
                            e.target.src = defaultServiceIcon
                          }}
                        />
                      </div>
                      <div>
                        <h3 className='text-base font-bold text-gray-900'>{item.title}</h3>
                        <span
                          className={`badge ${item.status ? 'badge-confirmed' : 'badge-canceled'} text-[10px] inline-flex items-center gap-1`}
                        >
                          {item.status ? (
                            <>
                              <FaCheckCircle className='text-[9px]' /> Available
                            </>
                          ) : (
                            <>
                              <FaTimesCircle className='text-[9px]' /> Not Available
                            </>
                          )}
                        </span>
                      </div>
                    </div>

                    <button onClick={() => handleDeleteService(item.id)} className='btn-icon danger' title='Delete Service'>
                      <FaTrash />
                    </button>
                  </div>

                  <p className='text-xs text-gray-600 line-clamp-3 leading-relaxed bg-gray-50 p-3 rounded-xl border border-gray-100/60'>
                    {item.desc || 'No procedure description provided.'}
                  </p>
                </div>
              </div>
            )
          })
        ) : (
          <div className='col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-200'>
            <FaMicroscope className='text-4xl text-gray-300 mx-auto mb-3' />
            <p className='text-sm font-semibold text-gray-600'>No clinical services found matching your query.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD SERVICE */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-lg'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaStethoscope /> Add Clinical Service
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            {/* Icon Preview Upload */}
            <div className='flex justify-center mb-4'>
              <div className='relative w-20 h-20'>
                <div className='w-full h-full rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden p-2 shadow-2xs'>
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt='Service Icon' className='w-full h-full object-contain' />
                  ) : (
                    <img src={defaultServiceIcon} className='w-10 h-10 object-contain opacity-70' alt='Service Placeholder' />
                  )}
                </div>
                <label
                  htmlFor='serviceIconUpload'
                  className='absolute -bottom-1 -right-1 bg-[#BF6159] hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition'
                  title='Upload Icon'
                >
                  <IoCameraOutline className='text-sm' />
                  <input type='file' id='serviceIconUpload' accept='image/*' onChange={handleImageChange} className='hidden' />
                </label>
              </div>
            </div>

            <form onSubmit={formik.handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Service Title</label>
                  <input
                    type='text'
                    name='title'
                    placeholder='e.g. General Dental Checkup'
                    value={formik.values.title}
                    onChange={formik.handleChange}
                    className={`form-input ${formik.errors.title ? 'border-red-500' : ''}`}
                  />
                  {formik.errors.title && <p className='text-red-500 text-xs mt-1'>{formik.errors.title}</p>}
                </div>

                <div>
                  <label className='form-label'>Service Status</label>
                  <select
                    name='status'
                    value={formik.values.status}
                    onChange={formik.handleChange}
                    className='form-input'
                  >
                    <option value='Available'>Available</option>
                    <option value='Not Available'>Not Available</option>
                  </select>
                </div>
              </div>

              <div>
                <label className='form-label'>Service Description</label>
                <textarea
                  name='desc'
                  rows={3}
                  placeholder='Detailed medical service description, duration, requirements...'
                  value={formik.values.desc}
                  onChange={formik.handleChange}
                  className={`form-input ${formik.errors.desc ? 'border-red-500' : ''}`}
                />
                {formik.errors.desc && <p className='text-red-500 text-xs mt-1'>{formik.errors.desc}</p>}
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' disabled={loading} className='btn-primary'>
                  {loading ? 'Saving...' : 'Save Clinical Service'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
