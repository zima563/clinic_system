import React, { useEffect, useState } from 'react'
import {
  FaTrash,
  FaEdit,
  FaSearch,
  FaUserPlus,
  FaStethoscope,
  FaThLarge,
  FaList,
  FaPhone,
  FaUserMd
} from 'react-icons/fa'
import { IoCameraOutline } from 'react-icons/io5'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import addDoctor from '../../../assets/addDoctor.png'
import { API_URL, getToken } from '../../../config'
import { toast } from 'react-toastify'

function Doctors() {
  const navigate = useNavigate()
  const [doctors, setDoctors] = useState([])
  const [specialties, setSpecialties] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [image, setImage] = useState(null)

  const [formInputs, setFormInputs] = useState({
    name: '',
    phoneCode: '+20',
    phone: '',
    specialty: '',
    info: ''
  })

  const token = getToken()

  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctors(response.data.data || [])
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/Specialist`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setSpecialties(response.data.data || [])
    } catch (error) {
      console.error('Error fetching specialties:', error)
    }
  }

  useEffect(() => {
    fetchDoctors()
    fetchSpecialties()
  }, [])

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormInputs(prev => ({ ...prev, [name]: value }))
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file)
    } else {
      toast.error('Please upload a valid image file.')
    }
  }

  const handleAddDoctor = async e => {
    e.preventDefault()
    const formData = new FormData()
    formData.append('name', formInputs.name)
    formData.append('phone', `${formInputs.phoneCode}${formInputs.phone}`)
    formData.append('specialtyId', formInputs.specialty)
    formData.append('info', formInputs.info)
    if (image) formData.append('icon', image)

    try {
      await axios.post(`${API_URL}/api/doctors`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Doctor added successfully!')
      fetchDoctors()
      closeModal()
    } catch (error) {
      console.error('Error adding doctor:', error)
      toast.error(error.response?.data?.message || 'Failed to add doctor.')
    }
  }

  const handleDeleteDoctor = async () => {
    if (!selectedDoctor) return
    try {
      await axios.delete(`${API_URL}/api/doctors/${selectedDoctor.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctors(doctors.filter(d => d.id !== selectedDoctor.id))
      toast.success('Doctor deleted successfully.')
    } catch (error) {
      console.error('Error deleting doctor:', error)
      toast.error('Failed to delete doctor.')
    } finally {
      closeConfirmModal()
    }
  }

  const handleRowClick = id => navigate(`/doctor/${id}`)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setImage(null)
    setFormInputs({ name: '', phoneCode: '+20', phone: '', specialty: '', info: '' })
  }

  const openConfirmModal = doc => {
    setSelectedDoctor(doc)
    setIsConfirmModalOpen(true)
  }
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedDoctor(null)
  }

  const filteredDoctors = doctors.filter(doc => {
    const nameStr = doc.name || ''
    const phoneStr = doc.phone || ''
    const specStr = doc.specialty?.title || ''
    const term = searchQuery.toLowerCase()
    return nameStr.toLowerCase().includes(term) || phoneStr.includes(term) || specStr.toLowerCase().includes(term)
  })

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaStethoscope className='text-[#BF6159]' /> Medical Doctors ({doctors.length})
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Manage clinic specialist physicians, schedules, and clinical staff</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder='Search Doctor, Phone or Specialty...'
            />
          </div>

          {/* View Mode Switcher */}
          <div className='flex bg-gray-100 p-1 rounded-xl border border-gray-200'>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-sm transition ${viewMode === 'table' ? 'bg-white text-[#BF6159] shadow-xs' : 'text-gray-500'}`}
              title='Table View'
            >
              <FaList />
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-sm transition ${viewMode === 'grid' ? 'bg-white text-[#BF6159] shadow-xs' : 'text-gray-500'}`}
              title='Grid Cards View'
            >
              <FaThLarge />
            </button>
          </div>

          <button onClick={openModal} className='btn-primary'>
            + Add Doctor
          </button>
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Doctor Name</th>
                <th>Phone Number</th>
                <th>Medical Specialty</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredDoctors.length > 0 ? (
                filteredDoctors.map((doc, index) => {
                  const avatarUrl = doc.image && doc.image.startsWith('http')
                    ? doc.image
                    : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=BF6159&color=fff`

                  return (
                    <tr
                      key={doc.id}
                      onClick={() => handleRowClick(doc.id)}
                      className='cursor-pointer hover:bg-red-50/40 transition'
                    >
                      <td className='font-medium text-gray-600'>{index + 1}</td>
                      <td>
                        <div className='flex items-center gap-3 py-1'>
                          <img
                            src={avatarUrl}
                            alt={doc.name}
                            className='w-9 h-9 rounded-full object-cover border border-red-200 shadow-2xs'
                            onError={e => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=BF6159&color=fff`
                            }}
                          />
                          <span className='font-bold text-gray-900 hover:text-[#BF6159] transition'>
                            Dr. {doc.name}
                          </span>
                        </div>
                      </td>
                      <td className='text-gray-700 font-medium'>{doc.phone || 'N/A'}</td>
                      <td>
                        <span className='badge badge-primary'>
                          {doc.specialty?.title || 'General Practitioner'}
                        </span>
                      </td>
                      <td className='text-center' onClick={e => e.stopPropagation()}>
                        <div className='flex items-center justify-center gap-2'>
                          <button onClick={() => openConfirmModal(doc)} className='btn-icon danger' title='Delete Doctor'>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan='5' className='py-8 text-center text-gray-400'>
                    No doctor records found matching your search.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map(doc => {
              const avatarUrl = doc.image && doc.image.startsWith('http')
                ? doc.image
                : `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=BF6159&color=fff`

              return (
                <div
                  key={doc.id}
                  className='card p-5 bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-200 transition'
                >
                  <div className='flex items-start gap-4'>
                    <img
                      src={avatarUrl}
                      alt={doc.name}
                      className='w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-2xs'
                      onError={e => {
                        e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(doc.name || 'Doctor')}&background=BF6159&color=fff`
                      }}
                    />
                    <div className='space-y-1 overflow-hidden'>
                      <h3
                        onClick={() => handleRowClick(doc.id)}
                        className='text-base font-bold text-gray-900 hover:text-[#BF6159] cursor-pointer truncate'
                      >
                        Dr. {doc.name}
                      </h3>
                      <p className='text-xs font-semibold text-gray-500 flex items-center gap-1.5'>
                        <FaPhone className='text-[#BF6159]' /> {doc.phone || 'N/A'}
                      </p>
                      <div className='pt-1'>
                        <span className='badge badge-primary'>
                          <FaStethoscope className='text-[10px]' /> {doc.specialty?.title || 'General Practitioner'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <button onClick={() => handleRowClick(doc.id)} className='btn-secondary text-xs py-1.5'>
                      <FaUserMd /> View Doctor Profile
                    </button>

                    <button onClick={() => openConfirmModal(doc)} className='btn-icon danger' title='Delete Doctor'>
                      <FaTrash />
                    </button>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-200'>
              <FaStethoscope className='text-4xl text-gray-300 mx-auto mb-3' />
              <p className='text-sm font-semibold text-gray-600'>No doctor records found.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD DOCTOR */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-xl'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaUserPlus /> Add New Doctor
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            {/* Avatar Selection Box */}
            <div className='flex justify-center mb-4'>
              <div className='relative w-24 h-24'>
                <div className='w-full h-full rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden shadow-xs'>
                  {image ? (
                    <img src={URL.createObjectURL(image)} alt='Selected Avatar' className='w-full h-full object-cover' />
                  ) : (
                    <img src={addDoctor} className='w-12 h-12 object-contain opacity-70' alt='Doctor Placeholder' />
                  )}
                </div>
                <label
                  htmlFor='imageInput'
                  className='absolute bottom-0 right-0 bg-[#BF6159] hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition'
                  title='Upload Avatar'
                >
                  <IoCameraOutline className='text-base' />
                  <input type='file' id='imageInput' accept='image/*' onChange={handleImageChange} className='hidden' />
                </label>
              </div>
            </div>

            <form onSubmit={handleAddDoctor} className='space-y-4'>
              <div>
                <label className='form-label'>Doctor Full Name</label>
                <input
                  type='text'
                  name='name'
                  required
                  placeholder='e.g. Dr. Alexander Fleming'
                  value={formInputs.name}
                  onChange={handleInputChange}
                  className='form-input'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Phone Number</label>
                  <div className='flex gap-2'>
                    <select
                      name='phoneCode'
                      value={formInputs.phoneCode}
                      onChange={handleInputChange}
                      className='form-input w-24'
                    >
                      <option>+20</option>
                      <option>+971</option>
                    </select>
                    <input
                      type='text'
                      name='phone'
                      required
                      placeholder='1012345678'
                      value={formInputs.phone}
                      onChange={handleInputChange}
                      className='form-input flex-1'
                    />
                  </div>
                </div>

                <div>
                  <label className='form-label'>Specialty</label>
                  <select
                    name='specialty'
                    required
                    value={formInputs.specialty}
                    onChange={handleInputChange}
                    className='form-input'
                  >
                    <option value=''>-- Select Specialty --</option>
                    {specialties.map(spe => (
                      <option key={spe.id} value={spe.id}>
                        {spe.title}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className='form-label'>Doctor Bio / Professional Summary</label>
                <textarea
                  name='info'
                  rows={2}
                  placeholder='Specialization details, degrees, clinic room...'
                  value={formInputs.info}
                  onChange={handleInputChange}
                  className='form-input'
                />
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Doctor Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE */}
      {isConfirmModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-sm text-center space-y-4'>
            <div className='w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl'>
              ⚠️
            </div>
            <h3 className='text-lg font-bold text-gray-900'>Delete Doctor Record?</h3>
            <p className='text-xs text-gray-500'>
              Are you sure you want to remove <strong>Dr. {selectedDoctor?.name}</strong>? This action cannot be undone.
            </p>
            <div className='flex justify-center gap-3 pt-2'>
              <button onClick={closeConfirmModal} className='btn-secondary'>
                Cancel
              </button>
              <button onClick={handleDeleteDoctor} className='btn-danger'>
                Yes, Delete Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
