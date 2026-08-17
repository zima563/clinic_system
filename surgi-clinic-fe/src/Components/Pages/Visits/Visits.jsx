import React, { useEffect, useState } from 'react'
import {
  FaSearch,
  FaStethoscope,
  FaClock,
  FaThLarge,
  FaList,
  FaUser,
  FaCalendarAlt,
  FaMoneyCheckAlt,
  FaReceipt
} from 'react-icons/fa'
import { MdMedicalServices } from 'react-icons/md'
import Select from 'react-select'
import { useNavigate } from 'react-router-dom'
import { API_URL, getToken } from '../../../config'

export default function Visits() {
  const navigate = useNavigate()
  const [data, setData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [viewMode, setViewMode] = useState('grid') // 'grid' | 'table'
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Form & Dropdown States
  const [selectedOption, setSelectedOption] = useState(null)
  const [dropdownOptions, setDropdownOptions] = useState([])
  const [dropdownOptionsDoctor, setDropdownOptionsDoctor] = useState([])
  const [selectedOptionDoctor, setSelectedOptionDoctor] = useState(null)
  const [dropdownOptionsSchedule, setDropdownOptionsSchedule] = useState([])
  const [selectedOptionSchedule, setSelectedOptionSchedule] = useState(null)
  const [dropdownOptionsDate, setDropdownOptionsDate] = useState([])
  const [selectedOptionDate, setSelectedOptionDate] = useState(null)
  const [dropdownOptionsPayment] = useState([
    { value: 'Cash', label: 'Cash' },
    { value: 'Visa', label: 'Visa' },
    { value: 'PayPal', label: 'PayPal' }
  ])
  const [selectedOptionPayment, setSelectedOptionPayment] = useState({ value: 'Cash', label: 'Cash' })
  const [price, setPrice] = useState(0)
  const [errorMessage, setErrorMessage] = useState({})
  const [isLoading, setIsLoading] = useState(false)

  const token = getToken()

  useEffect(() => {
    fetchVisits()
  }, [])

  const fetchVisits = async () => {
    try {
      const res = await fetch(`${API_URL}/api/visit`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const result = await res.json()
      const sorted = (result.visits || []).sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      )
      setData(sorted)
    } catch (error) {
      console.error('Error fetching visits:', error)
    }
  }

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
    setErrorMessage({})
  }

  // Filter Visits
  const filteredVisits = data.filter(v => {
    const pName = v.details?.[0]?.patient?.name || ''
    const dName = v.details?.[0]?.schedule?.doctor?.name || ''
    const sTitle = v.details?.[0]?.schedule?.service?.title || ''
    const term = searchTerm.toLowerCase()
    return pName.toLowerCase().includes(term) || dName.toLowerCase().includes(term) || sTitle.toLowerCase().includes(term)
  })

  // Group by Date for Grid View
  const groupedData = filteredVisits.reduce((groups, item) => {
    const dateStr = item.createdAt
      ? new Date(item.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
      : 'Unscheduled Date'
    if (!groups[dateStr]) groups[dateStr] = []
    groups[dateStr].push(item)
    return groups
  }, {})

  // Submit Visit Form
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
      setErrorMessage({ errorDate: 'Please select a date slot.' })
      return
    }

    setErrorMessage({})

    const payload = {
      patientId: Number(selectedOption.value),
      visitDetails: [
        {
          scheduleId: Number(selectedOptionSchedule.value),
          dateId: Number(selectedOptionDate.value)
        }
      ],
      paymentMethod: selectedOptionPayment?.value || 'Cash'
    }

    try {
      const response = await fetch(`${API_URL}/api/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      })

      if (response.ok) {
        fetchVisits()
        closeModal()
      } else {
        alert('Failed to create visit record.')
      }
    } catch (error) {
      console.error('Error submitting visit:', error)
    }
  }

  // Search Patients
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

  // Search Doctors & Schedules
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
            <StethoscopeIcon /> Clinic Visits Log
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Record patient consultations, medical procedures, and income transactions</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              placeholder='Search patient or doctor...'
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
            + Add Visit
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
                  <FaCalendarAlt className='text-[#BF6159]' /> {dateGroup} ({groupedData[dateGroup].length} visits)
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5'>
                  {groupedData[dateGroup].map(visit => {
                    const firstDetail = visit.details?.[0]
                    const docImg = firstDetail?.schedule?.doctor?.image && firstDetail.schedule.doctor.image.startsWith('http')
                      ? firstDetail.schedule.doctor.image
                      : `https://ui-avatars.com/api/?name=${encodeURIComponent(firstDetail?.schedule?.doctor?.name || 'Doctor')}&background=BF6159&color=fff`

                    return (
                      <div
                        key={visit.id}
                        className='card p-5 bg-white border border-gray-200 shadow-sm space-y-4 hover:border-red-200 transition flex flex-col justify-between'
                      >
                        {/* Patient & RF */}
                        <div className='space-y-1'>
                          <div className='flex justify-between items-start'>
                            <h3
                              onClick={() => firstDetail?.patient?.id && navigate(`/patient/${firstDetail.patient.id}`)}
                              className='text-lg font-bold text-gray-900 hover:text-[#BF6159] cursor-pointer flex items-center gap-1.5'
                            >
                              <FaUser className='text-xs text-gray-400' /> {firstDetail?.patient?.name || 'Walk-in Patient'}
                            </h3>
                            <span className='badge badge-primary text-[10px] uppercase font-bold'>
                              💳 {visit.paymentMethod || 'Cash'}
                            </span>
                          </div>
                          <p className='text-[11px] font-mono text-gray-400'>RF: #{visit.rf || visit.id}</p>
                        </div>

                        {/* Doctor & Services */}
                        <div className='space-y-2 p-3 bg-gray-50 rounded-xl border border-gray-100'>
                          <div className='flex items-center gap-2.5 pb-2 border-b border-gray-200/60'>
                            <img
                              src={docImg}
                              alt={firstDetail?.schedule?.doctor?.name}
                              className='w-8 h-8 rounded-full object-cover border border-red-100 shadow-2xs'
                            />
                            <div>
                              <span className='block text-xs font-bold text-gray-900'>
                                Dr. {firstDetail?.schedule?.doctor?.name || 'Attending Doctor'}
                              </span>
                            </div>
                          </div>

                          <div className='space-y-1.5 pt-1'>
                            {visit.details?.map(d => (
                              <div key={d.id} className='flex justify-between items-center text-xs'>
                                <span className='font-semibold text-gray-700 flex items-center gap-1'>
                                  <MdMedicalServices className='text-[#BF6159]' /> {d.schedule?.service?.title || 'General Service'}
                                </span>
                                <span className='text-[11px] font-medium text-gray-500'>
                                  ⏰ {d.date?.fromTime} - {d.date?.toTime}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Footer Total */}
                        <div className='flex justify-between items-center pt-2 border-t border-gray-100'>
                          <span className='text-xs font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1'>
                            <FaReceipt className='text-[#BF6159]' /> Visit Total:
                          </span>
                          <span className='text-base font-extrabold text-[#BF6159] bg-white px-3 py-1 rounded-lg border border-red-100 shadow-2xs'>
                            {visit.total} L.E
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
              <p className='text-sm font-semibold text-gray-600'>No visit records found matching your query.</p>
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
                <th>Services Rendered</th>
                <th>Payment Method</th>
                <th>Total (L.E)</th>
              </tr>
            </thead>
            <tbody>
              {filteredVisits.length > 0 ? (
                filteredVisits.map((item, idx) => (
                  <tr key={item.id}>
                    <td className='font-medium text-gray-600'>{idx + 1}</td>
                    <td>
                      <span
                        onClick={() => item.details?.[0]?.patient?.id && navigate(`/patient/${item.details[0].patient.id}`)}
                        className='font-bold text-gray-900 hover:text-[#BF6159] cursor-pointer'
                      >
                        {item.details?.[0]?.patient?.name || 'Walk-in Patient'}
                      </span>
                    </td>
                    <td className='font-medium text-gray-700'>
                      Dr. {item.details?.[0]?.schedule?.doctor?.name || 'N/A'}
                    </td>
                    <td>
                      <span className='badge badge-primary'>
                        {item.details?.[0]?.schedule?.service?.title || 'Consultation'}
                      </span>
                    </td>
                    <td>
                      <span className='badge badge-info'>💳 {item.paymentMethod || 'Cash'}</span>
                    </td>
                    <td className='font-extrabold text-[#BF6159]'>{item.total} L.E</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className='py-8 text-center text-gray-400'>
                    No visit records found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL: ADD VISIT */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaStethoscope /> Create New Clinic Visit
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
                  <label className='form-label'>Select Attending Doctor</label>
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
                  <label className='form-label'>Service / Schedule</label>
                  <Select
                    options={dropdownOptionsSchedule}
                    value={selectedOptionSchedule}
                    onChange={handleSelectSchedule}
                    placeholder='Select service schedule...'
                    styles={customSelectStyles}
                    isDisabled={!selectedOptionDoctor}
                  />
                  {errorMessage.errorSchedule && (
                    <p className='text-red-500 text-xs mt-1'>{errorMessage.errorSchedule}</p>
                  )}
                </div>

                <div>
                  <label className='form-label'>Available Time Slot</label>
                  <Select
                    options={dropdownOptionsDate}
                    value={selectedOptionDate}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionDate(selected)
                    }}
                    placeholder='Select slot date...'
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
                  <label className='form-label'>Payment Method</label>
                  <Select
                    options={dropdownOptionsPayment}
                    value={selectedOptionPayment}
                    onChange={setSelectedOptionPayment}
                    styles={customSelectStyles}
                  />
                </div>

                <div>
                  <label className='form-label'>Visit Fee Total</label>
                  <div className='form-input bg-gray-100 font-extrabold text-[#BF6159] flex items-center'>
                    {price} L.E
                  </div>
                </div>
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Clinic Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

function StethoscopeIcon() {
  return <FaStethoscope className='text-[#BF6159]' />
}
