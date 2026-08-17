import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaSearch, FaTrashAlt, FaWindowClose, FaUserPlus } from 'react-icons/fa'
import { IoIosSave } from 'react-icons/io'
import axios from 'axios'
import * as yup from 'yup'
import { API_URL, getToken } from '../../../config'

import './PatientsTable.css'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { hasPermission } from '../../PrivateRoute'

// Define Yup validation schema
const validationSchema = yup.object().shape({
  name: yup
    .string()
    .min(3, 'Name must be at least 3 characters long.')
    .max(255, 'Name must not exceed 255 characters.')
    .required('Name is required.'),
  phone: yup
    .string()
    .matches(/^[0-9]{7,15}$/, 'Phone number must be 7 to 15 digits long.')
    .required('Phone number is required.'),
  birthdate: yup
    .date()
    .max(new Date(), 'Birthdate must be a date in the past.')
    .required('Birthdate is required.'),
  gender: yup
    .string()
    .oneOf(['male', 'female'], "Gender must be either 'male' or 'female'.")
    .required('Gender is required.'),
  medicalHistory: yup
    .string()
    .max(1000, 'Medical history must not exceed 1000 characters.')
    .nullable(),
  info: yup
    .string()
    .max(1000, 'Info must not exceed 1000 characters.')
    .nullable()
})

const PatientsTable = () => {
  const navigate = useNavigate()

  // State for patients data
  const [patients, setPatients] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, seterrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')

  const token = getToken()

  // Fetch patients data from the API, can handle search query
  const fetchPatients = async (searchQuery = '') => {
    try {
      const response = await axios.get(
        `${API_URL}/api/patients?keyword_phone=${searchQuery}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPatients(response.data.data) // Assuming API returns a 'data' field with patients
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // Handle search input change
  const handleSearchChange = e => {
    const query = e.target.value
    setSearchQuery(query)
    fetchPatients(query) // Call API with the search query
  }

  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  // Open the confirmation modal
  const openConfirmModal = patient => {
    setSelectedPatient(patient)
    setIsConfirmModalOpen(true)
  }

  // Close the modal
  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedPatient(null)
  }

  const handleDelete = async () => {
    if (!selectedPatient) return

    try {
      // Send DELETE request to the API
      await axios.delete(`${API_URL}/api/patients/${selectedPatient.id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      // Update the state to remove the deleted patient
      const updatedPatients = patients.filter(
        patient => patient.id !== selectedPatient.id
      )
      setPatients(updatedPatients)

      console.log(`Patient with ID ${selectedPatient.id} deleted successfully.`)
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('Failed to delete the patient. Please try again.')
    } finally {
      closeConfirmModal()
    }
  }

  const handleRowClick = id => navigate(`/patient/${id}`)
  const handleEdit = id => navigate(`/edit-patient/${id}`)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)

  // React Hook Form setup with validation
  const {
    register,
    handleSubmit,
    formState: { errors },
    reset
  } = useForm({
    resolver: yupResolver(validationSchema)
  })

  const onSubmit = async data => {
    try {
      // Adjust API request if needed based on API requirements
      const response = await axios.post(`${API_URL}/api/patients`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      // // Handle success (e.g., add the new patient to the list)
      // setPatients(prevPatients => [...prevPatients, response.data.data])
      fetchPatients()

      // Close modal and reset form
      closeModal()
      reset()

      // Optional: Display success message
      console.log('Patient added successfully:', response.data)
    } catch (error) {
      // Handle errors
      seterrorMessage(error.response.data.message)
    }
  }

  return (
    <div className='container mx-auto p-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-2xl font-semibold mb-4 text-red-600'>
          Patients List
        </h3>
        <div className='flex justify-between gap-5 items-center mb-4'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3 text-gray-400' />
            <input
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='Search by Phone'
              className='p-s-i pl-12 pr-4 py-2 w-full  focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
            />
          </div>
          {hasPermission(['addPatient']) ? (
            <button
              onClick={openModal}
              className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
            >
              + Add Patient
            </button>
          ) : (
            ''
          )}
        </div>
      </div>

      <div className='overflow-x-auto'>
        <table className='min-w-full patient-table bg-white mb-5 mt-10 shadow-md'>
          <thead className='p-t-h'>
            <tr>
              <th className='py-2 px-4 text-left'>No</th>
              <th className='py-2 px-4 text-left'>Name</th>
              <th className='py-2 px-4 text-left'>Phone</th>
              <th className='py-2 px-4 text-left'>Birthdate</th>
              <th className='py-2 px-4 text-left'>Gender</th>
              <th className='py-2 px-4 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {patients?.length > 0 ? (
              patients?.map((patient, index) => (
                <tr
                  key={patient.id}
                  className='hover:bg-[#F5E7E6] p-t-r cursor-pointer'
                  onClick={() => handleRowClick(patient.id)}
                >
                  <td className='py-4 px-4'>{index + 1}</td>
                  <td>{patient.name || 'N/A'}</td>
                  <td>{patient.phone || 'N/A'}</td>
                  <td>
                    {patient.birthdate
                      ? new Date(patient.birthdate).toLocaleDateString()
                      : 'N/A'}
                  </td>
                  <td>{patient.gender || 'N/A'}</td>
                  <td
                    className='py-4 px-4 text-center flex justify-center items-center space-x-4'
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => handleEdit(patient.id)}
                      className='text-blue-600 hover:text-blue-800'
                    >
                      <FaEdit size={18} />
                    </button>
                    <button
                      onClick={() => openConfirmModal(patient)}
                      className='text-red-600 hover:text-red-800'
                    >
                      <FaTrashAlt size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='text-center text-gray-500 py-4'>
                  No patients found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add Patient Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                <FaUserPlus /> Add New Patient
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            {/* Form Section */}
            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Full Name */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Full Name</label>
                  <input
                    {...register('name')}
                    type='text'
                    placeholder='e.g. John Doe'
                    className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 ${
                      errors.name ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.name && (
                    <span className='text-red-500 text-xs mt-1 block'>
                      {errors.name.message}
                    </span>
                  )}
                </div>

                {/* Gender */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Gender</label>
                  <select
                    {...register('gender')}
                    className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 ${
                      errors.gender ? 'border-red-500' : ''
                    }`}
                  >
                    <option value=''>Select Gender</option>
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                  </select>
                  {errors.gender && (
                    <span className='text-red-500 text-xs mt-1 block'>
                      {errors.gender.message}
                    </span>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Phone Number */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Phone Number
                  </label>
                  <div className='flex gap-2'>
                    <span className='px-3 py-2.5 bg-gray-100 border border-gray-300 rounded-xl text-sm font-semibold text-gray-600 flex items-center'>
                      +20
                    </span>
                    <input
                      {...register('phone')}
                      type='text'
                      placeholder='1012345678'
                      className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 ${
                        errors.phone ? 'border-red-500' : ''
                      }`}
                    />
                  </div>
                  {errors.phone && (
                    <span className='text-red-500 text-xs mt-1 block'>
                      {errors.phone.message}
                    </span>
                  )}
                  {errorMessage && (
                    <span className='text-red-500 text-xs mt-1 block'>
                      {errorMessage}
                    </span>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Date of Birth
                  </label>
                  <input
                    {...register('birthdate')}
                    type='date'
                    className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 ${
                      errors.birthdate ? 'border-red-500' : ''
                    }`}
                  />
                  {errors.birthdate && (
                    <span className='text-red-500 text-xs mt-1 block'>
                      {errors.birthdate.message}
                    </span>
                  )}
                </div>
              </div>

              {/* Info */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Additional Notes / Info</label>
                <textarea
                  {...register('info')}
                  placeholder='e.g. Allergies, blood type, emergency contact...'
                  rows='2'
                  className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 resize-none ${
                    errors.info ? 'border-red-500' : ''
                  }`}
                ></textarea>
                {errors.info && (
                  <span className='text-red-500 text-xs mt-1 block'>
                    {errors.info.message}
                  </span>
                )}
              </div>

              {/* Medical History */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Medical History
                </label>
                <textarea
                  {...register('medicalHistory')}
                  placeholder='Previous chronic conditions, surgeries...'
                  rows='2'
                  className={`w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 resize-none ${
                    errors.medicalHistory ? 'border-red-500' : ''
                  }`}
                ></textarea>
                {errors.medicalHistory && (
                  <span className='text-red-500 text-xs mt-1 block'>
                    {errors.medicalHistory.message}
                  </span>
                )}
              </div>

              {/* Save Button */}
              <div className='flex justify-end gap-3 pt-3 border-t border-gray-100'>
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
                  <IoIosSave className='text-lg' /> Save Patient
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {isConfirmModalOpen && selectedPatient && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 relative'>
            <h3 className='text-xl font-bold mb-3 text-gray-900'>
              Confirm Deletion
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete patient <strong className='text-red-600'>{selectedPatient.name}</strong>? This action cannot be undone.
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
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientsTable
