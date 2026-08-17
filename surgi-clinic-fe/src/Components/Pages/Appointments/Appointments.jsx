import { object } from 'joi'
import { useEffect, useState } from 'react'
import { FaSearch, FaWindowClose } from 'react-icons/fa'
import { FiMoreHorizontal } from 'react-icons/fi'
import { IoIosSave } from 'react-icons/io'
import Select from 'react-select'
import { API_URL, getToken } from '../../../config'

export default function Appointments () {
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
  const [price, setPrice] = useState(0)
  const [errorMessage, setErrorMessage] = useState({})

  const [isLoading, setIsLoading] = useState(false)

  const openModal = () => setIsModalOpen(true)
  const closeModal = () => setIsModalOpen(false)
  const token = getToken()

  const fetchAppointments = async () => {
    try {
      await fetch(`${API_URL}/api/appointment/all`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      })
        .then(response => response.json())
        .then(resData => {
          const list = Array.isArray(resData) ? resData : (resData.data || [])
          const sortedAppointments = list.sort(
            (a, b) => new Date(b.dateTime) - new Date(a.dateTime)
          )
          setData(sortedAppointments)
        })
        .catch(error => console.error('Error fetching data:', error))
    } catch (error) {
      console.error('Error fetching appointments:', error)
      setErrorMessage('Failed to fetch appointments. Please try again later.')
    }
  }

  const groupedData = data.reduce((groups, item) => {
    const date = new Date(item.dateTime).toLocaleDateString()
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
      dateTime: '2024-12-25',
      patientId: Number(selectedOption?.value), // Use selected patient ID
      scheduleId: Number(selectedOptionSchedule?.value),
      dateId: Number(selectedOptionDate?.value)
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

      const data = await response.json()
      console.log('Response:', data)
      fetchAppointments()
      closeModal()
    } catch (error) {
      console.error('Error:', error)
      alert('Failed to create the appointment.')
    }
  }

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
            Authorization: `Bearer ${token}`
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
          Authorization: `Bearer ${token}`
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
          Authorization: `Bearer ${token}`
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
            Authorization: `Bearer ${token}`
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
    console.log(selectedOptionSchedule.value)

    try {
      const response = await fetch(
        `${API_URL}/api/schedule/dates/${selectedOptionSchedule.value}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
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

  useEffect(() => {
    fetchAppointments()
  }, [])

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
        <h3 className='text-2xl font-semibold text-red-600'>
          Appointments List
        </h3>
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
            + Add Appointments
          </button>
        </div>
      </div>

      {Object.keys(groupedData).map(date => (
        <div key={date} className='mb-8'>
          <h2 className='text-lg mb-4'>{date}</h2>
          <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4'>
            {groupedData[date].map(appointment => (
              <div
                key={appointment.id}
                className='border-2 rounded-lg p-4 border-[#BF6159] transition'
              >
                <div>
                  <h3 className='text-2xl mb-3'>{appointment.patient.name}</h3>
                  <div className='flex gap-3 items-center mb-4'>
                    <div className='rounded-full bg-red-50 border border-red-200 w-10 h-10 overflow-hidden flex items-center justify-center'>
                      <img
                        className='w-full h-full object-cover rounded-full'
                        src={appointment.schedule?.doctor?.image || ''}
                        onError={(e) => { e.target.src = 'https://ui-avatars.com/api/?name=' + encodeURIComponent(appointment.schedule?.doctor?.name || 'Doctor') + '&background=BF6159&color=fff' }}
                        alt=''
                      />
                    </div>
                    <h3 className='text-[#898A8D] mb-2'>
                      DR.{appointment.schedule.doctor.name}
                    </h3>
                  </div>
                </div>
                <div className='bg-[#F6F6F6] p-3'>
                  <h3 className='text-[#BF6159] font-semibold'>
                    {appointment.schedule.service.title}
                  </h3>
                  <h3 className='flex text-[#BF6159]'>
                    {appointment.date.fromTime} - {appointment.date.toTime}
                  </h3>
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
                <FaCalendarPlus /> Add New Appointment
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
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
                {/* Date / Time Slot */}
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

              {/* Actions */}
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
                  <IoIosSave className='text-lg' /> Save Appointment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
