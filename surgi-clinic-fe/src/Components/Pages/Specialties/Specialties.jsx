import React, { useState, useEffect } from 'react'
import axios from 'axios'
import {
  FaSearch,
  FaPrescriptionBottleAlt,
  FaPlus,
  FaTrash,
  FaEdit,
  FaCheckCircle
} from 'react-icons/fa'
import { IoCameraOutline } from 'react-icons/io5'
import specialPlaceholder from '../../../assets/special.png'
import { API_URL, getToken } from '../../../config'
import { toast } from 'react-toastify'

const APIURL = `${API_URL}/api/specialist`

function Specialties() {
  const [specialtiesData, setSpecialtiesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [image, setImage] = useState(null)
  const [specialtyName, setSpecialtyName] = useState('')
  const [error, setError] = useState('')

  const token = getToken()

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${APIURL}/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSpecialtiesData(response.data.data || [])
    } catch (err) {
      console.error('Error fetching specialties:', err)
    }
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setImage(null)
    setSpecialtyName('')
    setError('')
    setIsModalOpen(false)
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
    } else {
      toast.error('Please upload a valid image file.')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!specialtyName.trim()) {
      toast.error('Please enter a specialty name')
      return
    }
    if (!image) {
      toast.error('Please upload an image icon')
      return
    }

    const formData = new FormData()
    formData.append('title', specialtyName.trim())
    formData.append('icon', image)

    try {
      await axios.post(APIURL, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      })
      toast.success('Specialty added successfully!')
      fetchSpecialties()
      closeModal()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to add specialty'
      setError(msg)
      toast.error(msg)
    }
  }

  const handleDelete = async id => {
    if (!window.confirm('Are you sure you want to delete this medical specialty?')) return
    try {
      await axios.delete(`${APIURL}/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Specialty deleted successfully.')
      fetchSpecialties()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete specialty')
    }
  }

  const filteredSpecialties = specialtiesData.filter(item =>
    (item.title || '').toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaPrescriptionBottleAlt className='text-[#BF6159]' /> Medical Specialties ({specialtiesData.length})
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Configure clinical specialties, departments, and medical categories</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search Specialty Title...'
            />
          </div>

          <button onClick={openModal} className='btn-primary'>
            <FaPlus /> Add Specialty
          </button>
        </div>
      </div>

      {/* Specialty Cards Grid */}
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
        {filteredSpecialties.length > 0 ? (
          filteredSpecialties.map(item => {
            const iconUrl = item.icon && item.icon.startsWith('http')
              ? item.icon
              : specialPlaceholder

            return (
              <div
                key={item.id}
                className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between space-x-4 hover:border-red-200 transition'
              >
                <div className='flex items-center gap-4'>
                  <div className='w-14 h-14 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center p-2 shadow-2xs'>
                    <img
                      src={iconUrl}
                      alt={item.title}
                      className='w-full h-full object-contain'
                      onError={e => {
                        e.target.src = specialPlaceholder
                      }}
                    />
                  </div>

                  <div className='space-y-1'>
                    <h3 className='text-base font-bold text-gray-900'>{item.title}</h3>
                    <span className='badge badge-confirmed text-[10px] inline-flex items-center gap-1'>
                      <FaCheckCircle className='text-[9px]' /> Active Specialty
                    </span>
                  </div>
                </div>

                <button onClick={() => handleDelete(item.id)} className='btn-icon danger' title='Delete Specialty'>
                  <FaTrash />
                </button>
              </div>
            )
          })
        ) : (
          <div className='col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-200'>
            <FaPrescriptionBottleAlt className='text-4xl text-gray-300 mx-auto mb-3' />
            <p className='text-sm font-semibold text-gray-600'>No medical specialties found matching your query.</p>
          </div>
        )}
      </div>

      {/* MODAL: ADD SPECIALTY */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-md'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaPrescriptionBottleAlt /> Add Medical Specialty
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            {error && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold'>
                ⚠️ {error}
              </div>
            )}

            {/* Icon Preview Upload */}
            <div className='flex justify-center mb-4'>
              <div className='relative w-20 h-20'>
                <div className='w-full h-full rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden p-2 shadow-2xs'>
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt='Specialty Icon' className='w-full h-full object-contain' />
                  ) : (
                    <img src={specialPlaceholder} className='w-10 h-10 object-contain opacity-70' alt='Specialty Placeholder' />
                  )}
                </div>
                <label
                  htmlFor='iconUpload'
                  className='absolute -bottom-1 -right-1 bg-[#BF6159] hover:bg-red-700 text-white p-1.5 rounded-full cursor-pointer shadow-md transition'
                  title='Upload Icon'
                >
                  <IoCameraOutline className='text-sm' />
                  <input type='file' id='iconUpload' accept='image/*' onChange={handleImageChange} className='hidden' />
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div>
                <label className='form-label'>Specialty Title</label>
                <input
                  type='text'
                  required
                  placeholder='e.g. Cardiology & Vascular'
                  value={specialtyName}
                  onChange={e => setSpecialtyName(e.target.value)}
                  className='form-input'
                />
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Specialty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Specialties
