import React, { useEffect, useState } from 'react'
import { FaTrash, FaEdit, FaSearch } from 'react-icons/fa'
import { IoIosSave } from 'react-icons/io'
import { FaWindowClose } from 'react-icons/fa'
import { useNavigate } from 'react-router-dom'
import addDoctor from '../../../assets/addDoctor.png'
import { IoCameraOutline } from 'react-icons/io5'
import axios from 'axios'

import { API_URL, getToken } from '../../../config'

function Doctors () {
  const [doctors, setDoctors] = useState([])
  const [Speciality, setSpeciality] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedDoctor, setSelectedDoctor] = useState(null)
  const [image, setImage] = useState(null)

  const [formInputs, setFormInputs] = useState({
    name: '',
    phoneCode: '+971',
    phone: '',
    specialty: '',
    info: ''
  })

  const handleInputChange = e => {
    const { name, value } = e.target
    setFormInputs(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const token = getToken()

  const navigate = useNavigate()
  const fetchDoctors = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setDoctors(response.data.data)
    } catch (error) {
      console.error('Error fetching doctors:', error)
    }
  }
  useEffect(() => {
    fetchDoctors()
  }, [])

  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/specialist/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setSpeciality(response.data.data)
    } catch (error) {}
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  const handleAddDoctor = async e => {
    e.preventDefault()

    // Create a FormData object
    const formData = new FormData()
    formData.append('name', formInputs.name)
    if (formInputs.status) {
      formData.append('status', formInputs.status)
    }
    formData.append('phone', `${formInputs.phoneCode}${formInputs.phone}`)
    formData.append('specialtyId', formInputs.specialty)
    formData.append('info', formInputs.info)

    // Append image only if it exists
    if (image) {
      formData.append('icon', image)
    }

    try {
      const response = await axios.post(`${API_URL}/api/doctors`, formData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })

      // Update the doctors list
      fetchDoctors()
      closeModal() // Close the modal after adding
    } catch (error) {
      console.error('Error adding doctor:', error)
    }
  }

  const handleRowClick = id => {
    navigate(`/doctor/${id}`)
  }

  const handleDelete = async () => {
    if (!selectedDoctor) return
    try {
      await axios.delete(`${API_URL}/api/doctors/${selectedDoctor.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      // Re-fetch the doctors after delete
      const response = await axios.get(`${API_URL}/api/doctors`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setDoctors(response.data.data)
      closeConfirmModal() // Close the confirmation modal after delete
    } catch (error) {
      console.error('Error deleting doctor:', error)
    }
  }

  const handleEdit = id => {
    alert(`Edit doctor with ID: ${id}`)
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  const openConfirmModal = doctor => {
    setSelectedDoctor(doctor)
    setIsConfirmModalOpen(true)
  }

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedDoctor(null)
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file) // Store the file in state
    } else {
      alert('Please upload a valid image file.')
    }
  }

  return (
    <div className='container mx-auto mt-10'>
      <div className='flex items-center justify-between mb-4'>
        <h3 className='text-2xl font-semibold text-red-600'>Doctors List</h3>
        <div className='flex gap-4'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3 text-gray-400' />
            <input
              type='text'
              placeholder='Search by Name or Phone'
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className='p-s-i pl-12 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
            />
          </div>
          <button
            onClick={openModal}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
          >
            + Add Doctor
          </button>
        </div>
      </div>

      <table className='min-w-full patient-table mb-5 mt-10'>
        <thead className='p-t-h'>
          <tr>
            <th className='p-2'>No</th>
            <th className='p-2'>Name</th>
            <th className='p-2'>Phone</th>
            <th className='p-2'>Specialties</th>
            <th className='p-2'>Actions</th>
          </tr>
        </thead>
        <tbody>
          {doctors.length > 0 ? (
            doctors.map((doctor, index) => (
              <tr
                key={doctor.id}
                className='p-t-r cursor-pointer'
                onClick={() => handleRowClick(doctor.id)}
              >
                <td className='p-2 text-center'>{index + 1}</td>
                <td className='p-2 text-center flex items-center justify-center gap-3'>
                  <img
                    src={doctor.image || ''}
                    alt={doctor.name}
                    className='w-9 h-9 rounded-full object-cover border border-red-200 shadow-sm'
                    onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(doctor.name) + '&background=BF6159&color=fff' }}
                  />
                  <span className='font-semibold text-slate-800'>{doctor.name}</span>
                </td>
                <td className='p-2 text-center'>{doctor.phone}</td>
                <td className='p-2 text-center'>
                  <span className='badge-active'>{doctor.specialty?.title || 'General'}</span>
                </td>
                <td className='p-2 flex justify-center space-x-2'>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      handleEdit(doctor.id)
                    }}
                    className='text-[#000000] hover:text-[#000000]'
                  >
                    <FaEdit />
                  </button>
                  <button
                    onClick={e => {
                      e.stopPropagation()
                      openConfirmModal(doctor)
                    }}
                    className='text-[#E31B25] hover:text-red-700'
                  >
                    <FaTrash />
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan='6' className='text-center text-gray-500 py-4'>
                No Doctors Found
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* Add Doctor Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                <FaUserPlus /> Add New Doctor
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            {/* Avatar Upload */}
            <div className='flex justify-center mb-6'>
              <div className='relative w-24 h-24'>
                <div className='w-full h-full rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden shadow-inner'>
                  {image ? (
                    <img
                      src={URL.createObjectURL(image)}
                      alt='Selected'
                      className='w-full h-full object-cover'
                    />
                  ) : (
                    <img src={addDoctor} className='w-12 h-12 object-contain opacity-70' alt='Doctor Placeholder' />
                  )}
                </div>
                <label
                  htmlFor='imageInput'
                  className='absolute bottom-0 right-0 bg-[#BF6159] hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition'
                  title='Upload Doctor Avatar'
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

            <form onSubmit={handleAddDoctor} className='space-y-4'>
              {/* Doctor Name */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Doctor Name</label>
                <input
                  type='text'
                  name='name'
                  placeholder='e.g. Dr. Alexander Fleming'
                  value={formInputs.name}
                  onChange={handleInputChange}
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Phone Number */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Phone Number</label>
                  <div className='flex gap-2'>
                    <select
                      name='phoneCode'
                      value={formInputs.phoneCode}
                      onChange={handleInputChange}
                      className='px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 focus:outline-none'
                    >
                      <option>+20</option>
                      <option>+971</option>
                    </select>
                    <input
                      type='text'
                      name='phone'
                      value={formInputs.phone}
                      onChange={handleInputChange}
                      placeholder='1012345678'
                      className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                    />
                  </div>
                </div>

                {/* Specialties */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Specialties</label>
                  <select
                    name='specialty'
                    value={formInputs.specialty}
                    onChange={handleInputChange}
                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                  >
                    <option value=''>-- Select Specialty --</option>
                    {Speciality?.length > 0 ? (
                      Speciality.map(spe => (
                        <option key={spe.id} value={spe.id}>
                          {spe.title}
                        </option>
                      ))
                    ) : (
                      <option disabled>No specialties available</option>
                    )}
                  </select>
                </div>
              </div>

              {/* Info / Biography */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Doctor Info / Bio</label>
                <textarea
                  name='info'
                  value={formInputs.info}
                  onChange={handleInputChange}
                  placeholder='Specialization details, certifications, experience...'
                  rows='3'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 resize-none'
                ></textarea>
              </div>

              {/* Save Button */}
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
                  className='px-6 py-2.5 bg-[#BF6159] text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200 flex items-center gap-2'
                >
                  <IoIosSave className='text-lg' /> Save Doctor
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmModalOpen && selectedDoctor && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 relative'>
            <h3 className='text-xl font-bold mb-3 text-gray-900'>
              Confirm Deletion
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete <strong className='text-red-600'>{selectedDoctor.name}</strong>? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={closeConfirmModal}
                className='px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200'
              >
                Delete Doctor
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
