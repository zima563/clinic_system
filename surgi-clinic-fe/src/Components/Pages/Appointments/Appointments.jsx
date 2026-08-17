import React, { useEffect, useState } from 'react'
import {
  FaSearch,
  FaCalendarPlus,
  FaUserMd,
  FaClock,
  FaStethoscope,
  FaThLarge,
  FaList,
  FaUser,
  FaCalendarAlt
} from 'react-icons/fa'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { API_URL, getToken } from '../../../config'

export default function Appointments() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false)

  // React Select States
  const [selectedOption, setSelectedOption] = useState(null)
  const [dropdownOptions, setDropdownOptions] = useState([])
  const [dropdownOptionsDoctor, setDropdownOptionsDoctor] = useState([])
  const [selectedOptionDoctor, setSelectedOptionDoctor] = useState(null)
  const [dropdownOptionsSchedule, setDropdownOptionsSchedule] = useState([])
  const [selectedOptionSchedule, setSelectedOptionSchedule] = useState(null)
  const [dropdownOptionsDate, setDropdownOptionsDate] = useState([])
  const [selectedOptionDate, setSelectedOptionDate] = useState(null)
  const [selectedDateTime, setSelectedDateTime] = useState('')
  const [price, setPrice] = useState(0)
  const [errorMessage, setErrorMessage] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const token = getToken()

  useEffect(() => {
    fetchAppointments()
  }, [])

  const fetchAppointments = async () => {
    try {
      const res = await fetch(`${API_URL}/api/appointment/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const resData = await res.json()
      const list = Array.isArray(resData) ? resData : resData.data || []
      const sorted = list.sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime))
      setData(sorted)
    } catch (error) {
      console.error('Error fetching appointments:', error)
    }
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage({})
  }

  // Filtered Appointments by search
  const filteredAppointments = data.filter(item => {
    const pName = item.patient?.name || ''
    const dName = item.schedule?.doctor?.name || ''
    const sTitle = item.schedule?.service?.title || ''
    const term = searchTerm.toLowerCase()
    return pName.toLowerCase().includes(term) || dName.toLowerCase().includes(term) || sTitle.toLowerCase().includes(term)
  })

  // Grouped by Date for Grid View
  const groupedData = filteredAppointments.reduce((groups, item) => {
    const dateStr = item.dateTime
      ? new Date(item.dateTime).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unscheduled Date'
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(item)
    return groups
  }, {})

  // Submit Handler
  const handleSubmit = async e => {
    e.preventDefault()
    if (!selectedOption) {
      setErrorMessage({ errorPatient: 'Please select a patient.' })
      return
    }
    if (!selectedOptionSchedule) {
      setErrorMessage({ errorSchedule: 'Please select a schedule.' })
      return
    }
    if (!selectedOptionDate) {
      setErrorMessage({ errorDate: 'Please select a slot date.' })
      return
    }
    if (!selectedDateTime) {
      setErrorMessage({ errorDate: 'Please pick an appointment date.' })
      return
    }

    setErrorMessage({})

    const payload = {
      dateTime: selectedDateTime,
      patientId: Number(selectedOption.value),
      scheduleId: Number(selectedOptionSchedule.value),
      dateId: Number(selectedOptionDate.value)
    }

    try {
      const response = await fetch(`${API_URL}/api/appointment`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        fetchAppointments()
        closeModal()
      } else {
        const errData = await response.json()
        alert(errData.message || 'Failed to create appointment.')
      }
    } catch (error) {
      console.error('Error creating appointment:', error)
    }
  }

  // React Select Search Handlers
  const handleSearchChange = async inputValue => {
    if (!inputValue) return
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/patients?keyword_phone=${inputValue}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (result && result.data) {
        setDropdownOptions(result.data.map(i => ({ value: String(i.id), label: `${i.name} (${i.phone})` })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChangeDoctor = async () => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_URL}/api/doctors`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      if (result && result.data) {
        setDropdownOptionsDoctor(result.data.map(i => ({ value: String(i.id), label: i.name })))
      }
    } catch (err) {
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectDoctor = async selectedDoctor => {
    setSelectedOptionDoctor(selectedDoctor)
    if (!selectedDoctor) return
    try {
      const res = await fetch(`${API_URL}/api/schedule`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      const doctorSchedules = (result.data || []).filter(
        s => String(s.doctorId) === String(selectedDoctor.value)
      )
      setDropdownOptionsSchedule(
        doctorSchedules.map(s => ({
          value: String(s.id),
          label: `${s.service?.title || 'Service'} — ${s.price} L.E`,
          price: s.price,
          dates: s.dates
        }))
      )
    } catch (err) {
      console.error(err)
    }
  }

  const handleSelectSchedule = selectedSchedule => {
    setSelectedOptionSchedule(selectedSchedule)
    if (!selectedSchedule) return
    setPrice(selectedSchedule.price || 0)
    if (selectedSchedule.dates) {
      setDropdownOptionsDate(
        selectedSchedule.dates.map(d => ({
          value: String(d.id),
          label: `${d.day}: ${d.fromTime} - ${d.toTime}`
        }))
      )
    }
  }

  const customSelectStyles = {
    control: provided => ({
      ...provided,
      borderRadius: '0.75rem',
      borderColor: '#E2E8F0',
      padding: '0.1rem',
      boxShadow: 'none',
      '&:hover': { borderColor: '#BF6159' }
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isSelected ? '#BF6159' : state.isFocused ? '#F5E7E6' : '#fff',
      color: state.isSelected ? '#fff' : '#1E293B',
      cursor: 'pointer'
    })
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaCalendarPlus className='text-[#BF6159]' /> Appointments Directory
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Track and schedule patient consultations and specialist bookings</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              placeholder='Search by patient or doctor...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
            />
          </div>

          {/* View Mode Switcher */}
          <div className='flex bg-gray-100 p-1 rounded-xl border border-gray-200'>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 rounded-lg text-sm transition ${viewMode === 'grid' ? 'bg-white text-[#BF6159] shadow-xs' : 'text-gray-500'}`}
              title='Grid View'
            >
              <FaThLarge />
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-sm transition ${viewMode === 'table' ? 'bg-white text-[#BF6159] shadow-xs' : 'text-gray-500'}`}
              title='Table View'
            >
              <FaList />
            </button>
          </div>

          <button onClick={openModal} className='btn-primary'>
            + Add Appointment
          </button>
        </div>
      </div>

      {/* GRID VIEW */}
      {viewMode === 'grid' && (
        <div className='space-y-6'>
          {Object.keys(groupedData).length > 0 ? (
            Object.keys(groupedData).map(dateGroup => (
              <div key={dateGroup} className='space-y-3'>
                <div className='flex items-center gap-2 text-xs font-bold text-gray-500 uppercase tracking-wider bg-gray-100/80 px-3 py-1.5 rounded-lg w-max border border-gray-200'>
                  <FaCalendarAlt className='text-[#BF6159]' /> {dateGroup} ({groupedData[dateGroup].length})
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                  {groupedData[dateGroup].map(item => {
                    const docImg = item.schedule?.doctor?.image && item.schedule.doctor.image.startsWith('http')
                      ? item.schedule.doctor.image
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(item.schedule?.doctor?.name || 'Doctor')}&background=BF6159&color=fff`

                    return (
                      <div
                        key={item.id}
                        className='card p-5 bg-white border border-gray-200 shadow-sm space-y-4 hover:border-red-200 transition'
                      >
                        {/* Patient & Status */}
                        <div className='flex justify-between items-start'>
                          <div
                            onClick={() => item.patient?.id && navigate(`/patient/${item.patient.id}`)}
                            className='cursor-pointer group'
                          >
                            <h3 className='text-lg font-bold text-gray-900 group-hover:text-[#BF6159] transition flex items-center gap-1.5'>
                              <FaUser className='text-xs text-gray-400' /> {item.patient?.name || 'Patient'}
                            </h3>
                            <p className='text-xs font-semibold text-gray-400 mt-0.5'>Phone: {item.patient?.phone || 'N/A'}</p>
                          </div>
                          <span
                            className={`badge ${
                              item.status === 'confirmed'
                                ? 'badge-confirmed'
                                : item.status === 'canceled'
                                ? 'badge-canceled'
                                : 'badge-pending'
                            }`}
                          >
                            {item.status || 'pending'}
                          </span>
                        </div>

                        {/* Doctor Info */}
                        <div className='flex items-center gap-3 p-2.5 bg-gray-50 rounded-xl border border-gray-100'>
                          <img
                            src={docImg}
                            alt={item.schedule?.doctor?.name}
                            className='w-10 h-10 rounded-full object-cover border border-red-100 shadow-2xs'
                            onError={e => {
                              e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(item.schedule?.doctor?.name || 'Doctor')}&background=BF6159&color=fff`
                            }}
                          />
                          <div>
                            <span className='block text-xs font-bold text-gray-900'>
                              Dr. {item.schedule?.doctor?.name || 'Specialist'}
                            </span>
                            <span className='text-[11px] text-[#BF6159] font-medium'>
                              {item.schedule?.service?.title || 'Consultation'}
                            </span>
                          </div>
                        </div>

                        {/* Timing & Price */}
                        <div className='flex justify-between items-center pt-2 border-t border-gray-100 text-xs'>
                          <div className='flex items-center gap-1.5 font-medium text-gray-600'>
                            <FaClock className='text-gray-400' />
                            <span>
                              {item.date?.fromTime || '09:00 AM'} - {item.date?.toTime || '01:00 PM'}
                            </span>
                          </div>
                          <span className='font-bold text-gray-900 bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-2xs'>
                            {item.schedule?.price || 0} L.E
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            ))
          ) : (
            <div className='p-12 text-center bg-white rounded-xl border border-dashed border-gray-200'>
              <FaStethoscope className='text-4xl text-gray-300 mx-auto mb-3' />
              <p className='text-sm font-semibold text-gray-600'>No appointment records match your criteria.</p>
            </div>
          )}
        </div>
      )}

      {/* TABLE VIEW */}
      {viewMode === 'table' && (
        <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
          <table className='data-table'>
            <thead>
              <tr>
                <th>#</th>
                <th>Patient Name</th>
                <th>Attending Doctor</th>
                <th>Service</th>
                <th>Time Slot</th>
                <th>Price</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredAppointments.length > 0 ? (
                filteredAppointments.map((item, idx) => (
                  <tr key={item.id}>
                    <td className='font-medium text-gray-600'>{idx + 1}</td>
                    <td>
                      <span
                        onClick={() => item.patient?.id && navigate(`/patient/${item.patient.id}`)}
                        className='font-bold text-gray-900 hover:text-[#BF6159] cursor-pointer'
                      >
                        {item.patient?.name || 'Patient'}
                      </span>
                    </td>
                    <td className='font-medium text-gray-700'>Dr. {item.schedule?.doctor?.name || 'N/A'}</td>
                    <td>
                      <span className='badge badge-primary'>{item.schedule?.service?.title || 'General'}</span>
                    </td>
                    <td className='text-xs font-medium text-gray-600'>
                      ⏰ {item.date?.fromTime} - {item.date?.toTime}
                    </td>
                    <td className='font-bold text-gray-900'>{item.schedule?.price || 0} L.E</td>
                    <td>
                      <span
                        className={`badge ${
                          item.status === 'confirmed'
                            ? 'badge-confirmed'
                            : item.status === 'canceled'
                            ? 'badge-canceled'
                            : 'badge-pending'
                        }`}
                      >
                        {item.status || 'pending'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className='py-8 text-center text-gray-400'>
                    No appointment records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD APPOINTMENT */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaCalendarPlus /> Add New Appointment
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Select Patient (Phone / Name)</label>
                  <Select
                    options={dropdownOptions}
                    value={selectedOption}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOption(selected)
                    }}
                    onInputChange={inputValue => {
                      if (typeof inputValue === 'string') handleSearchChange(inputValue)
                    }}
                    placeholder='Search patient...'
                    styles={customSelectStyles}
                    isSearchable
                    isLoading={isLoading}
                  />
                  {errorMessage.errorPatient && (
                    <p className='text-red-500 text-xs mt-1'>{errorMessage.errorPatient}</p>
                  )}
                </div>

                <div>
                  <label className='form-label'>Select Doctor</label>
                  <Select
                    options={dropdownOptionsDoctor}
                    value={selectedOptionDoctor}
                    onChange={handleSelectDoctor}
                    onMenuOpen={() => {
                      if (dropdownOptionsDoctor.length === 0) handleSearchChangeDoctor()
                    }}
                    placeholder='Select doctor...'
                    styles={customSelectStyles}
                    isSearchable
                    isLoading={isLoading}
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Doctor Schedule / Service</label>
                  <Select
                    options={dropdownOptionsSchedule}
                    value={selectedOptionSchedule}
                    onChange={handleSelectSchedule}
                    placeholder='Select schedule service...'
                    styles={customSelectStyles}
                    isDisabled={!selectedOptionDoctor}
                  />
                  {errorMessage.errorSchedule && (
                    <p className='text-red-500 text-xs mt-1'>{errorMessage.errorSchedule}</p>
                  )}
                </div>

                <div>
                  <label className='form-label'>Available Working Slot</label>
                  <Select
                    options={dropdownOptionsDate}
                    value={selectedOptionDate}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionDate(selected)
                    }}
                    placeholder='Select time slot...'
                    styles={customSelectStyles}
                    isDisabled={!selectedOptionSchedule}
                  />
                  {errorMessage.errorDate && (
                    <p className='text-red-500 text-xs mt-1'>{errorMessage.errorDate}</p>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Appointment Date</label>
                  <input
                    type='date'
                    value={selectedDateTime}
                    onChange={e => setSelectedDateTime(e.target.value)}
                    className='form-input'
                  />
                </div>

                <div>
                  <label className='form-label'>Consultation Price</label>
                  <div className='form-input bg-gray-100 font-bold text-gray-800 flex items-center'>
                    {price} L.E
                  </div>
                </div>
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
