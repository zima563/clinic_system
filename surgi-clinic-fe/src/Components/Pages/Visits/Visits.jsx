import Select from 'react-select'
import { useEffect, useState } from 'react'
import { FaSearch, FaWindowClose } from 'react-icons/fa'
import { FiMoreHorizontal } from 'react-icons/fi'
import { IoIosSave } from 'react-icons/io'
import icon from '../../../assets/cash.png'
import { API_URL, getToken } from '../../../config'

export default function Visits () {
  const [expandedVisit, setExpandedVisit] = useState(null)

  const toggleExpand = visitId => {
    setExpandedVisit(prev => (prev === visitId ? null : visitId))
  }
  const [data, setData] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOption, setSelectedOption] = useState(null)
  const [dropdownOptions, setDropdownOptions] = useState([])
  const [dropdownOptionsDoctor, setDropdownOptionsDoctor] = useState([])
  const [selectedOptionDoctor, setSelectedOptionDoctor] = useState(null)
  const [dropdownOptionsservice, setDropdownOptionsservice] = useState([])
  const [selectedOptionservice, setSelectedOptionservice] = useState(null)
  const [dropdownOptionsSchedule, setDropdownOptionsSchedule] = useState([])
  const [selectedOptionSchedule, setSelectedOptionSchedule] = useState(null)
  const [dropdownOptionsDate, setDropdownOptionsDate] = useState([])
  const [selectedOptionDate, setSelectedOptionDate] = useState(null)
  const [dropdownOptionsPayment, setDropdownOptionsPayment] = useState([
    { value: 'Cash', label: 'cash' }
  ])
  const [selectedOptionPayment, setSelectedOptionPayment] = useState(null)
  const [price, setPrice] = useState(0)
  const [errorMessage, setErrorMessage] = useState({})
  const [isLoading, setIsLoading] = useState(false)
  // Modal toggle functions
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setIsModalOpen(false)
  }

  const TOKEN = getToken()
  const fetchVisits = async () => {
    try {
      await fetch(`${API_URL}/api/visit`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      })
        .then(response => response.json())
        .then(data => {
          console.log(data)
          const sortedAppointments = data.visits.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          )
          setData(sortedAppointments || [])
        })
        .catch(error => console.error('Error fetching data:', error))
    } catch (error) {
      console.error('Error fetching visits:', error)
      setErrorMessage('Failed to fetch visits. Please try again later.')
    }
  }

  // Group data by date
  const groupedData = data.reduce((groups, item) => {
    const date = new Date(item.createdAt).toLocaleDateString() // Format date
    if (!groups[date]) groups[date] = []
    groups[date].push(item)
    return groups
  }, {})

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
      setErrorMessage({ errorDate: 'Please select a date.' })
      return
    }

    setErrorMessage('')

    const payload = {
      patientId: Number(selectedOption?.value), // Ensure patientId is a number
      visitDetails: [
        {
          scheduleId: Number(selectedOptionSchedule?.value), // Ensure scheduleId is a number
          dateId: Number(selectedOptionDate?.value)
        }
      ],
      paymentMethod: selectedOptionPayment?.value
    }

    try {
      const response = await fetch(`${API_URL}/api/visit`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        },
        body: JSON.stringify(payload)
      })

      const data = await response.json()
      console.log('Response:', data)
      fetchVisits()
      closeModal()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create the visit.')
    }
  }

  useEffect(() => {
    fetchVisits()
  }, [])

  const handleSearchChange = async inputValue => {
    if (!inputValue) return

    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/patients?keyword_phone=${inputValue}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
          }
        }
      )

      const result = await response.json()
      console.log('API Response:', result) // Log the full response

      if (result && result.data) {
        const options = result.data.map(item => ({
          value: String(item.id),
          label: `${item.name} (${item.phone})`
        }))
        setDropdownOptions(options)
      } else {
        console.error('No data found or API response format is incorrect')
        setDropdownOptions([]) // Clear options if no data is found
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChangeDoctor = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/doctors`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })

      const result = await response.json()
      console.log('API Response:', result) // Log the full response

      if (result && result.data) {
        const options = result.data.map(item => ({
          value: String(item.id),
          label: item.name
        }))
        setDropdownOptionsDoctor(options)
      } else {
        console.error('No data found or API response format is incorrect')
        setDropdownOptionsDoctor([]) // Clear options if no data is found
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChangeService = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(`${API_URL}/api/services/all`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })

      const result = await response.json()
      console.log('API Response:', result) // Log the full response

      if (result && result.data) {
        const options = result.data.map(item => ({
          value: String(item.id),
          label: item.title
        }))
        setDropdownOptionsservice(options)
      } else {
        console.error('No data found or API response format is incorrect')
        setDropdownOptionsservice([]) // Clear options if no data is found
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChangeSchedule = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/schedule?doctorId=${selectedOptionDoctor.value}&servicesId=${selectedOptionservice.value}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
          }
        }
      )

      const result = await response.json()
      console.log('API Response:', result) // Log the full response

      if (result && result.data) {
        const options = result.data.map(item => ({
          value: String(item.id),
          label: `price ${item.price} dates ${item.dates.map(val => val.day)}`,
          price: item.price
        }))
        setDropdownOptionsSchedule(options)
        console.log(dropdownOptionsSchedule)
      } else {
        console.error('No data found or API response format is incorrect')
        setDropdownOptionsSchedule([]) // Clear options if no data is found
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSearchChangeDate = async () => {
    setIsLoading(true)
    try {
      const response = await fetch(
        `${API_URL}/api/schedule/dates/${selectedOptionSchedule.value}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
          }
        }
      )

      const result = await response.json()
      console.log('API Response:', result) // Log the full response

      if (result) {
        const options = result.map(item => ({
          value: String(item.id),
          label: `${item.day} - ${item.fromTime} to ${item.toTime}`
        }))
        setDropdownOptionsDate(options)
        console.log(dropdownOptionsDate)
      } else {
        console.error('No data found or API response format is incorrect')
        setDropdownOptionsDate([]) // Clear options if no data is found
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const customStyles = {
    control: base => ({
      ...base,
      border: '1px solid #E5E7EB',
      boxShadow: 'none',
      '&:hover': {
        borderColor: '#EF4444'
      }
    }),
    option: (base, state) => ({
      ...base,
      backgroundColor: state.isFocused ? '#FEE2E2' : '#FFFFFF',
      color: state.isFocused ? '#B91C1C' : '#374151',
      '&:active': {
        backgroundColor: '#EF4444',
        color: '#FFFFFF'
      }
    })
  }

  return (
    <div
      style={{ maxHeight: 'calc(100vh - 50px)' }}
      className='p-4 overflow-y-auto custom-scroll'
    >
      {/* Header */}
      <div className='flex items-center ps-10 pe-10 justify-between mb-4'>
        <h3 className='text-2xl font-semibold text-red-600'>Visit List</h3>
        <div className='flex gap-4'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3 text-gray-400' />
            <input
              type='text'
              placeholder='Search by Name'
              className='p-s-i pl-12 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
            />
          </div>
          <button
            onClick={openModal}
            className='btn-primary'
          >
            + Add Visit
          </button>
        </div>
      </div>
      {Object.keys(groupedData).map(date => (
        <div key={date} className='mb-8'>
          <h2 className='text-lg font-semibold mb-4'>{date}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {groupedData[date].map(visit => (
              <div
                key={visit.id}
                className={`border rounded-lg p-4 border-[#BF6159] transition w-88 overflow-hidden ${
                  expandedVisit === visit.id ? 'max-h-auto' : 'max-h-[300px]'
                }`}
                style={{
                  maxHeight: expandedVisit === visit.id ? 'none' : '200px',
                  cursor: 'pointer'
                }}
                onClick={() => toggleExpand(visit.id)}
              >
                <div>
                  <div className='flex justify-between'>
                    <h3 className='font-semibold text-2xl mb-2'>
                      {visit.details[0].patient.name}
                    </h3>
                    <FiMoreHorizontal className='text-gray-500' />
                  </div>
                  <div>
                    <p className='text-sm text-gray-600'>
                      DR: {visit.details[0].schedule.doctor.name}
                    </p>
                  </div>
                </div>
                <div className='mt-4 flex justify-between'>
                  <div>
                    {visit.details.map(detail => (
                      <div key={detail.id} className='mb-3'>
                        <h3 className='font-semibold text-[#BF6159] text-[15px]'>
                          {detail.schedule.service.title}
                        </h3>
                        <div className='flex text-sm gap-3'>
                          <div>
                            {detail.date.fromTime} - {detail.date.toTime}
                          </div>
                          <div>{detail.schedule.price}.LE</div>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div>
                    <div className='text-center mb-3'>
                      <h3 className='text-[#BF6159] text-center text-[15px] font-semibold'>
                        Payment Method
                      </h3>
                      {visit.paymentMethod === 'Cash' ? (
                        <img src={icon} alt='' className='w-12 h-4 mx-auto' />
                      ) : (
                        'not found'
                      )}
                    </div>
                    <div className='text-center'>
                      <h4 className='text-[#BF6159] text-center text-[15px] font-semibold'>
                        Total
                      </h4>
                      {visit.total}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                🩺 Add New Clinic Visit
              </h2>
              <button
                onClick={closeModal}
                className='modal-close'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Patient Selection */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Patient Phone / Name
                  </label>
                  <Select
                    options={dropdownOptions}
                    value={selectedOption}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOption(selected)
                    }}
                    onInputChange={inputValue => {
                      if (typeof inputValue === 'string')
                        handleSearchChange(inputValue)
                    }}
                    placeholder='Search patient...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                    filterOption={null}
                  />
                  {errorMessage.errorPatient && (
                    <div className='text-red-500 text-xs mt-1'>
                      {errorMessage.errorPatient}
                    </div>
                  )}
                </div>

                {/* Doctor Selection */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Doctor
                  </label>
                  <Select
                    options={dropdownOptionsDoctor}
                    value={selectedOptionDoctor}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionDoctor(selected)
                      setDropdownOptionsSchedule([])
                      setSelectedOptionSchedule(null)
                      setDropdownOptionsDate([])
                      setSelectedOptionDate(null)
                      setPrice(0)
                    }}
                    onMenuOpen={() => {
                      if (dropdownOptionsDoctor.length === 0) {
                        handleSearchChangeDoctor()
                      }
                    }}
                    placeholder='Select a doctor...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                {/* Service Selection */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Service
                  </label>
                  <Select
                    options={dropdownOptionsservice}
                    value={selectedOptionservice}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionservice(selected)
                      setDropdownOptionsSchedule([])
                      setSelectedOptionSchedule(null)
                      setDropdownOptionsDate([])
                      setSelectedOptionDate(null)
                      setPrice(0)
                    }}
                    onMenuOpen={() => {
                      if (dropdownOptionsservice.length === 0) {
                        handleSearchChangeService()
                      }
                    }}
                    placeholder='Select a service...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                </div>

                {/* Schedule Selection */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Schedule
                  </label>
                  <Select
                    options={dropdownOptionsSchedule}
                    value={selectedOptionSchedule}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionSchedule(selected)
                      setDropdownOptionsDate([])
                      setSelectedOptionDate(null)
                      setPrice(selected.price)
                    }}
                    onMenuOpen={() => {
                      if (dropdownOptionsSchedule.length === 0) {
                        handleSearchChangeSchedule()
                      }
                    }}
                    placeholder='Select schedule...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                  {errorMessage.errorSchedule && (
                    <div className='text-red-500 text-xs mt-1'>
                      {errorMessage.errorSchedule}
                    </div>
                  )}
                </div>
              </div>

              <div className='grid grid-cols-1 md:grid-cols-3 gap-4 items-end'>
                {/* Available Date */}
                <div className='md:col-span-2'>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                    Available Date / Time Slot
                  </label>
                  <Select
                    options={dropdownOptionsDate}
                    value={selectedOptionDate}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionDate(selected)
                    }}
                    onMenuOpen={() => {
                      if (dropdownOptionsDate.length === 0) {
                        handleSearchChangeDate()
                      }
                    }}
                    placeholder='Select date slot...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                  {errorMessage.errorDate && (
                    <div className='text-red-500 text-xs mt-1'>
                      {errorMessage.errorDate}
                    </div>
                  )}
                </div>

                {/* Price Display */}
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Total Price</label>
                  <div className='py-2.5 px-4 bg-red-50 border border-red-200 rounded-xl text-center font-bold text-[#BF6159] text-base'>
                    {price ? `${price} L.E` : '0 L.E'}
                  </div>
                </div>
              </div>

              {/* Payment Method */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Payment Method
                </label>
                <Select
                  options={dropdownOptionsPayment}
                  value={selectedOptionPayment}
                  onChange={selected => {
                    setErrorMessage({})
                    setSelectedOptionPayment(selected)
                  }}
                  placeholder='Select payment method (Cash/Card)...'
                  styles={customStyles}
                  className='w-full'
                  isSearchable
                  isLoading={isLoading}
                  noOptionsMessage={() =>
                    isLoading ? 'Loading...' : 'No results found'
                  }
                />
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={closeModal}
                  className='btn-secondary'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='btn-primary'
                >
                  <IoIosSave className='text-lg' /> Save Visit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
