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
                <td className='p-2 text-center'>{doctor.name}</td>
                <td className='p-2 text-center'>{doctor.phone}</td>
                <td className='p-2 text-center'>{doctor.specialty.title}</td>
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
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative'>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className='absolute top-6 right-6 text-gray-400 hover:text-red-500'
            >
              <FaWindowClose className='text-3xl' />
            </button>

            <h2 className='text-2xl font-bold mb-6 text-black'>Add Doctor</h2>

            {/* Form Section */}

            <div className='relative w-24 h-24 mb-9'>
              {/* Circle background */}
              <div className='relative w-full h-full rounded-full bg-red-100 flex items-center justify-center'>
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt='Selected'
                    className='w-full h-full object-cover rounded-full'
                  />
                ) : (
                  <div className='rounded-full overflow-hidden'>
                    <img src={addDoctor} className=' mt-6' alt='' />
                  </div>
                )}
                {/* Camera icon */}
                <label
                  htmlFor='imageInput'
                  className='absolute bottom-0 border-white  border-2 right-0 bg-[#5F66EA] text-white p-2 rounded-full cursor-pointer'
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
            <form onSubmit={handleAddDoctor} className='flex flex-wrap gap-6'>
              {/* Name */}
              <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                  Name
                </label>
                <input
                  type='text'
                  name='name'
                  placeholder='eg: John Doe'
                  value={formInputs.name}
                  onChange={handleInputChange}
                  className='add-p-i pl-6 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                />
              </div>

              {/* Status */}
              {/* <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                  Status
                </label>
                <select
                  name='status'
                  value={formInputs.status}
                  onChange={handleInputChange}
                  className='w-full add-p-i pl-6 py-2 focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                >
                  <option value={null}>Select</option>
                  <option value={true}>Available</option>
                  <option value={false}>Not Available</option>
                </select>
              </div> */}

              <div className='flex justify-between gap-6'>
                <div className='w-[349px]'>
                  {/* Phone Number */}
                  <div className='flex-1   group'>
                    <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                      Phone Number
                    </label>
                    <div className='flex mb-6 items-center border'>
                      <select
                        name='phoneCode'
                        value={formInputs.phoneCode}
                        onChange={handleInputChange}
                        className='p-2 add-p-i focus:outline-none'
                      >
                        <option>+971</option>
                        <option>+20</option>
                      </select>
                      <input
                        type='text'
                        name='phone'
                        value={formInputs.phone}
                        onChange={handleInputChange}
                        placeholder='543210987'
                        className='add-p-i pl-6 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                      />
                    </div>
                  </div>
                  {/* Specialties */}
                  <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                    <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                      Specialties
                    </label>
                    <select
                      name='specialty'
                      value={formInputs.specialty}
                      onChange={handleInputChange}
                      className='w-full add-p-i pl-6 py-2 focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                    >
                      <option value={null}>Select</option>
                      {Speciality?.length > 0 ? (
                        Speciality.map(spe => (
                          <option key={spe.id} value={spe.id}>
                            {spe.title}
                          </option>
                        ))
                      ) : (
                        <option>not found</option>
                      )}
                    </select>
                  </div>
                </div>
                {/* Info */}
                <div className='flex-1 w-[349px] group'>
                  <label className='block text-gray-700 mb-2 group-focus-within:text-[#BF6159]'>
                    Info
                  </label>
                  <textarea
                    name='info'
                    value={formInputs.info}
                    onChange={handleInputChange}
                    placeholder='Info'
                    className='add-p-i pl-6 pr-4 h-[145px] py-2 resize-none w-full focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  ></textarea>
                </div>
              </div>

              {/* Save Button */}
              <div className='flex w-full  justify-start'>
                <button
                  type='submit'
                  className='bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600'
                >
                  <div className='flex align-baseline gap-3 justify-between items-center'>
                    Save
                    <IoIosSave className='text-2xl' />
                  </div>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Delete Modal */}
      {isConfirmModalOpen && selectedDoctor && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md'>
            <h3 className='text-xl font-semibold mb-4'>
              Are you sure you want to delete {selectedDoctor.name}?
            </h3>
            <div className='flex justify-end gap-4'>
              <button
                onClick={closeConfirmModal}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Doctors
