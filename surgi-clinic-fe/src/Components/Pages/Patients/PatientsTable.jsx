import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { FaEdit, FaSearch, FaTrashAlt, FaWindowClose } from 'react-icons/fa'
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
      await axios.delete(`${API_URL}/${selectedPatient.id}`, {
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
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg w-full max-w-3xl p-6 relative'>
            {/* Close Button */}
            <button
              onClick={closeModal}
              className='absolute top-6 right-6 text-gray-400 hover:text-red-500'
            >
              <FaWindowClose className='text-3xl' />
            </button>

            <h2 className='text-2xl font-bold mb-6 text-black'>Add Patient</h2>

            {/* Form Section */}
            <form
              onSubmit={handleSubmit(onSubmit)}
              className='flex flex-wrap gap-6'
            >
              {/* Full Name */}
              <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                <label className='block text-gray-700 mb-2'>Full Name</label>
                <input
                  {...register('name')}
                  type='text'
                  placeholder='eg: John Doe'
                  className={`add-p-i pl-6 pr-4 py-2 w-full focus:outline-none focus:ring-2 ${
                    errors.name ? 'focus:ring-red-500' : 'focus:ring-[#BF6159]'
                  }`}
                />
                {errors.name && (
                  <span className='text-red-500 text-sm'>
                    {errors.name.message}
                  </span>
                )}
              </div>

              {/* Gender */}
              <div className='flex-1 min-w-[calc(50%-1.5rem)] group'>
                <label className='block text-gray-700 mb-2'>Gender</label>
                <select
                  {...register('gender')}
                  className={`w-full add-p-i pl-6 py-2 focus:outline-none focus:ring-2 ${
                    errors.gender
                      ? 'focus:ring-red-500'
                      : 'focus:ring-[#BF6159]'
                  }`}
                >
                  <option>Select</option>
                  <option>male</option>
                  <option>female</option>
                </select>
                {errors.gender && (
                  <span className='text-red-500 text-sm'>
                    {errors.gender.message}
                  </span>
                )}
              </div>

              <div className='flex justify-between gap-6'>
                <div className='w-[349px]'>
                  {/* Phone Number */}
                  <div className='flex-1 group'>
                    <label className='block text-gray-700 mb-2'>
                      Phone Number
                    </label>
                    <div className='flex mb-3 items-center border'>
                      <select className='p-2 add-p-i focus:outline-none'>
                        <option>+20</option>
                      </select>
                      <input
                        {...register('phone')}
                        type='text'
                        placeholder='543210987'
                        className={`add-p-i pl-6 pr-4 py-2 w-full focus:outline-none focus:ring-2 ${
                          errors.phone
                            ? 'focus:ring-red-500'
                            : 'focus:ring-[#BF6159]'
                        } `}
                      />
                    </div>
                    <div>
                      {errors.phone && (
                        <span className='text-red-500 text-sm'>
                          {errors.phone.message}
                        </span>
                      )}
                    </div>
                    <div>
                      {errorMessage && (
                        <span className='text-red-500 text-sm'>
                          {errorMessage}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Date of Birth */}
                  <div className='flex-1 group mt-4'>
                    <label className='block text-gray-700 mb-2'>
                      Date of Birth
                    </label>
                    <input
                      {...register('birthdate')}
                      type='date'
                      className={`w-full p-2 add-p-i pl-6 pr-4 py-2 focus:outline-none focus:ring-2 ${
                        errors.birthdate
                          ? 'focus:ring-red-500'
                          : 'focus:ring-[#BF6159]'
                      }`}
                    />
                    {errors.birthdate && (
                      <span className='text-red-500 text-sm'>
                        {errors.birthdate.message}
                      </span>
                    )}
                  </div>
                </div>
                {/* Info */}
                <div className='flex-1 w-[349px] group'>
                  <label className='block text-gray-700 mb-2'>Info</label>
                  <textarea
                    {...register('info')}
                    placeholder='Info'
                    className={`add-p-i pl-6 pr-4 h-[145px] py-2 resize-none w-full focus:outline-none focus:ring-2 ${
                      errors.info
                        ? 'focus:ring-red-500'
                        : 'focus:ring-[#BF6159]'
                    }`}
                  ></textarea>
                  {errors.info && (
                    <span className='text-red-500 text-sm'>
                      {errors.info.message}
                    </span>
                  )}
                </div>
              </div>
              {/* Medical History */}
              <div className='flex-2 min-w-[calc(50%-1.5rem)] w-full group'>
                <label className='block text-gray-700 mb-2'>
                  Medical History
                </label>
                <textarea
                  {...register('medicalHistory')}
                  placeholder='Medical History'
                  className={`w-full p-2 add-p-i h-[132px] resize-none pl-6 pr-4 py-2 focus:outline-none focus:ring-2 ${
                    errors.medicalHistory
                      ? 'focus:ring-red-500'
                      : 'focus:ring-[#BF6159]'
                  }`}
                ></textarea>
                {errors.medicalHistory && (
                  <span className='text-red-500 text-sm'>
                    {errors.medicalHistory.message}
                  </span>
                )}
              </div>

              {/* Save Button */}
              <div className='flex w-full justify-start'>
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
      {isConfirmModalOpen && selectedPatient && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md'>
            <h3 className='text-xl font-semibold mb-4'>
              Are you sure you want to delete {selectedPatient.name}?
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

export default PatientsTable
