import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FaEdit,
  FaSearch,
  FaTrashAlt,
  FaUserPlus,
  FaUserInjured,
  FaThLarge,
  FaList,
  FaPhone,
  FaCalendarAlt,
  FaVenusMars,
  FaUser
} from 'react-icons/fa'
import axios from 'axios'
import * as yup from 'yup'
import { useForm } from 'react-hook-form'
import { yupResolver } from '@hookform/resolvers/yup'
import { API_URL, getToken } from '../../../config'
import { hasPermission } from '../../PrivateRoute'

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
  const [patients, setPatients] = useState([])
  const [viewMode, setViewMode] = useState('table') // 'table' | 'grid'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false)
  const [selectedPatient, setSelectedPatient] = useState(null)

  const token = getToken()

  const fetchPatients = async (query = '') => {
    try {
      const response = await axios.get(
        `${API_URL}/api/patients?keyword_phone=${query}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
            Authorization: `Bearer ${token}`
          }
        }
      )
      setPatients(response.data.data || [])
    } catch (error) {
      console.error('Error fetching patients:', error)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  const handleSearchChange = e => {
    const query = e.target.value
    setSearchQuery(query)
    fetchPatients(query)
  }

  const openConfirmModal = patient => {
    setSelectedPatient(patient)
    setIsConfirmModalOpen(true)
  }

  const closeConfirmModal = () => {
    setIsConfirmModalOpen(false)
    setSelectedPatient(null)
  }

  const handleDelete = async () => {
    if (!selectedPatient) return
    try {
      await axios.delete(`${API_URL}/api/patients/${selectedPatient.id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
      setPatients(patients.filter(p => p.id !== selectedPatient.id))
    } catch (error) {
      console.error('Error deleting patient:', error)
      alert('Failed to delete the patient.')
    } finally {
      closeConfirmModal()
    }
  }

  const handleRowClick = id => navigate(`/patient/${id}`)
  const handleEdit = id => navigate(`/edit-patient/${id}`)
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage('')
  }

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
      await axios.post(`${API_URL}/api/patients`, data, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })
      fetchPatients()
      closeModal()
      reset()
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Failed to create patient')
    }
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaUserInjured className='text-[#BF6159]' /> Patients Directory ({patients.length})
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Manage registered clinic patients, medical records, and profiles</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchQuery}
              onChange={handleSearchChange}
              placeholder='Search by Phone or Name...'
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

          {hasPermission(['addPatient']) && (
            <button onClick={openModal} className='btn-primary'>
              + Add Patient
            </button>
          )}
        </div>
      </div>

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Phone Number</th>
                <th>Birthdate</th>
                <th>Gender</th>
                <th className='text-center'>Actions</th>
              </tr>
            </thead>
            <tbody>
              {patients.length > 0 ? (
                patients.map((patient, index) => {
                  const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || 'Patient')}&background=BF6159&color=fff`
                  return (
                    <tr
                      key={patient.id}
                      onClick={() => handleRowClick(patient.id)}
                      className='cursor-pointer hover:bg-red-50/40 transition'
                    >
                      <td className='font-medium text-gray-600'>{index + 1}</td>
                      <td>
                        <div className='flex items-center gap-3 py-1'>
                          <img
                            src={avatarUrl}
                            alt={patient.name}
                            className='w-9 h-9 rounded-full object-cover border border-red-200 shadow-2xs'
                          />
                          <span className='font-bold text-gray-900 hover:text-[#BF6159] transition'>
                            {patient.name}
                          </span>
                        </div>
                      </td>
                      <td className='text-gray-700 font-medium'>{patient.phone || 'N/A'}</td>
                      <td className='text-gray-600 text-xs'>
                        {patient.birthdate ? new Date(patient.birthdate).toLocaleDateString() : 'N/A'}
                      </td>
                      <td>
                        <span className={`badge ${patient.gender === 'female' ? 'badge-info' : 'badge-primary'}`}>
                          {patient.gender || 'N/A'}
                        </span>
                      </td>
                      <td className='text-center' onClick={e => e.stopPropagation()}>
                        <div className='flex items-center justify-center gap-2'>
                          <button onClick={() => handleEdit(patient.id)} className='btn-icon' title='Edit Patient'>
                            <FaEdit />
                          </button>
                          <button onClick={() => openConfirmModal(patient)} className='btn-icon danger' title='Delete Patient'>
                            <FaTrashAlt />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              ) : (
                <tr>
                  <td colSpan='6' className='py-8 text-center text-gray-400'>
                    No patient records found matching your query.
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
          {patients.length > 0 ? (
            patients.map(patient => {
              const avatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name || 'Patient')}&background=BF6159&color=fff`
              return (
                <div
                  key={patient.id}
                  className='card p-5 bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-4 hover:border-red-200 transition'
                >
                  <div className='flex items-start gap-4'>
                    <img
                      src={avatarUrl}
                      alt={patient.name}
                      className='w-14 h-14 rounded-full object-cover border-2 border-red-100 shadow-2xs'
                    />
                    <div className='space-y-1 overflow-hidden'>
                      <h3
                        onClick={() => handleRowClick(patient.id)}
                        className='text-base font-bold text-gray-900 hover:text-[#BF6159] cursor-pointer truncate'
                      >
                        {patient.name}
                      </h3>
                      <p className='text-xs font-semibold text-gray-500 flex items-center gap-1.5'>
                        <FaPhone className='text-[#BF6159]' /> {patient.phone || 'N/A'}
                      </p>
                      <div className='flex gap-2 pt-1'>
                        <span className={`badge ${patient.gender === 'female' ? 'badge-info' : 'badge-primary'}`}>
                          <FaVenusMars className='text-[10px]' /> {patient.gender || 'N/A'}
                        </span>
                        {patient.birthdate && (
                          <span className='badge badge-canceled text-[10px]'>
                            <FaCalendarAlt className='text-[10px]' /> {new Date(patient.birthdate).toLocaleDateString()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className='flex items-center justify-between pt-3 border-t border-gray-100'>
                    <button onClick={() => handleRowClick(patient.id)} className='btn-secondary text-xs py-1.5'>
                      <FaUser /> View Profile
                    </button>

                    <div className='flex gap-2'>
                      <button onClick={() => handleEdit(patient.id)} className='btn-icon' title='Edit Patient'>
                        <FaEdit />
                      </button>
                      <button onClick={() => openConfirmModal(patient)} className='btn-icon danger' title='Delete Patient'>
                        <FaTrashAlt />
                      </button>
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className='col-span-full p-12 text-center bg-white rounded-xl border border-dashed border-gray-200'>
              <FaUserInjured className='text-4xl text-gray-300 mx-auto mb-3' />
              <p className='text-sm font-semibold text-gray-600'>No patient records found.</p>
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: ADD PATIENT */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-xl'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaUserPlus /> Add New Patient
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            {errorMessage && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold'>
                ⚠️ {errorMessage}
              </div>
            )}

            <form onSubmit={handleSubmit(onSubmit)} className='space-y-4'>
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Full Name</label>
                  <input
                    {...register('name')}
                    type='text'
                    placeholder='e.g. John Doe'
                    className={`form-input ${errors.name ? 'border-red-500' : ''}`}
                  />
                  {errors.name && <span className='text-red-500 text-xs mt-1 block'>{errors.name.message}</span>}
                </div>

                <div>
                  <label className='form-label'>Gender</label>
                  <select {...register('gender')} className={`form-input ${errors.gender ? 'border-red-500' : ''}`}>
                    <option value=''>-- Select Gender --</option>
                    <option value='male'>Male</option>
                    <option value='female'>Female</option>
                  </select>
                  {errors.gender && <span className='text-red-500 text-xs mt-1 block'>{errors.gender.message}</span>}
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Phone Number</label>
                  <input
                    {...register('phone')}
                    type='text'
                    placeholder='01012345678'
                    className={`form-input ${errors.phone ? 'border-red-500' : ''}`}
                  />
                  {errors.phone && <span className='text-red-500 text-xs mt-1 block'>{errors.phone.message}</span>}
                </div>

                <div>
                  <label className='form-label'>Birthdate</label>
                  <input
                    {...register('birthdate')}
                    type='date'
                    className={`form-input ${errors.birthdate ? 'border-red-500' : ''}`}
                  />
                  {errors.birthdate && <span className='text-red-500 text-xs mt-1 block'>{errors.birthdate.message}</span>}
                </div>
              </div>

              <div>
                <label className='form-label'>Medical History (Optional)</label>
                <textarea
                  {...register('medicalHistory')}
                  rows={2}
                  placeholder='Chronic illnesses, allergies, past operations...'
                  className='form-input'
                />
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Patient Record
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
            <h3 className='text-lg font-bold text-gray-900'>Delete Patient Record?</h3>
            <p className='text-xs text-gray-500'>
              Are you sure you want to remove <strong>{selectedPatient?.name}</strong>? This action cannot be undone.
            </p>
            <div className='flex justify-center gap-3 pt-2'>
              <button onClick={closeConfirmModal} className='btn-secondary'>
                Cancel
              </button>
              <button onClick={handleDelete} className='btn-danger'>
                Yes, Delete Patient
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientsTable
