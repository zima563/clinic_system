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
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
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
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-[28px] border-[4px] border-[#BF6159] shadow-lg w-full max-w-xl p-6 relative'>
            <button
              onClick={closeModal}
              className='absolute top-6 right-6 text-gray-400 hover:text-[#BF6159]'
            >
              <FaWindowClose className='text-3xl' />
            </button>
            <h2 className='text-2xl font-bold mb-6 text-black'>
              Add Appointments
            </h2>
            <form onSubmit={handleSubmit}>
              <div className='flex gap-4'>
                <div className='w-1/2  mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
                    Patient Phone
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
                    placeholder='Search and select...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                    filterOption={null} // Optional: Disable filtering if needed
                  />
                  {errorMessage.errorPatient && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                      {errorMessage.errorPatient}
                    </div>
                  )}
                </div>
                <div className='w-1/2    mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
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
                        handleSearchChangeDoctor() // Fetch all doctors when the dropdown is opened
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

              <div className='flex gap-4'>
                <div className='w-1/2  mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
                    services
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
                        handleSearchChangeService() // Fetch all services when the dropdown is opened
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
                <div className='w-1/2   mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
                    schdule
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
                      console.log(selected)
                    }}
                    onMenuOpen={() => {
                      if (dropdownOptionsSchedule.length === 0) {
                        handleSearchChangeSchedule() // Fetch all Schedules when the dropdown is opened
                      }
                    }}
                    placeholder='Select a Schedule...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                  {errorMessage.errorSchedule && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                      {errorMessage.errorSchedule}
                    </div>
                  )}
                </div>
              </div>

              <div className='flex   gap-12'>
                <div className='w-1/2  mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
                    date
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
                        handleSearchChangeDate() // Fetch all Dates when the dropdown is opened
                      }
                    }}
                    placeholder='Select a Date...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                  {errorMessage.errorDate && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                      {errorMessage.errorDate}
                    </div>
                  )}
                </div>
                <div className='w-1/4 mt-6'>
                  <label htmlFor='price'>Price</label>
                  <h4
                    id='price'
                    className=' mt-2 py-2 rounded-lg px-6 border border-[#BF6159]'
                  >
                    {price}
                  </h4>
                </div>
              </div>

              <div className='flex   gap-12'>
                <div className='w-1/2  mt-6'>
                  <label className='block text-gray-700 mb-2 text-sm font-medium'>
                    date
                  </label>
                  <Select
                    options={dropdownOptionsPayment}
                    value={selectedOptionPayment}
                    onChange={selected => {
                      setErrorMessage({})
                      setSelectedOptionPayment(selected)
                    }}
                    placeholder='Select a payment...'
                    styles={customStyles}
                    className='w-full'
                    isSearchable
                    isLoading={isLoading}
                    noOptionsMessage={() =>
                      isLoading ? 'Loading...' : 'No results found'
                    }
                  />
                  {errorMessage.errorDate && (
                    <div style={{ color: 'red', marginBottom: '10px' }}>
                      {errorMessage.errorDate}
                    </div>
                  )}
                </div>
              </div>

              <button
                type='submit'
                className='mt-6 bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600'
              >
                <IoIosSave className='inline-block mr-2' />
                Save
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
