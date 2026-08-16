import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

import { FaCalendarAlt, FaWindowClose } from 'react-icons/fa'

import axios from 'axios'
import payPal from '../../../assets/payPal.png'
import ApplePay from '../../../assets/ApplePay.png'
import Visa from '../../../assets/Visa.png'
import Cash from '../../../assets/cash.png'
import { FiEdit2 } from 'react-icons/fi'

import { API_URL, getToken } from '../../../config'

function Income () {
  const [selectedDate, setSelectedDate] = useState(null)
  const [incomeList, setIncomeList] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const formatDate = date => {
    return date ? date.toLocaleDateString('en-CA') : null // "en-CA" gives "YYYY-MM-DD"
  }

  const fetchIncome = async () => {
    try {
      const formattedDate = selectedDate ? formatDate(selectedDate) : null
      const url = formattedDate
        ? `${API_URL}/api/invoice?ex=1&createdAt=${formattedDate}`
        : `${API_URL}/api/invoice?ex=1`

      const TOKEN = getToken()
      console.log(url)

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })

      if (response.status === 200) {
        console.log(response.data.data)

        const mappedData = response.data.data.map(item => ({
          id: item.id,
          paymentFrom:
            item.VisitInvoice[0]?.visit.details[0]?.patient.name || 'N/A',
          date: new Date(item.createdAt).toLocaleDateString(),
          amount: item.total,
          method: item.paymentMethod
        }))

        setIncomeList(mappedData)
      } else {
        console.error('Error fetching data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [selectedDate])

  const paymentMethodImages = {
    payPal: payPal,
    ApplePay: ApplePay,
    Visa: Visa,
    Cash: Cash
  }

  const handleRowClick = async id => {
    const TOKEN = getToken()

    if (!id) return // Ensure the id is valid
    try {
      // Fetch related data using the item's ID
      const response = await axios.get(`${API_URL}/api/invoice/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })

      if (response.status === 200) {
        // Set the fetched data to the selectedRow state
        console.log(response.data)

        const invoiceDetails = response.data.details || [] // Safeguard in case details is null
        setSelectedRow({ ...response.data, details: invoiceDetails })
        setIsModalOpen(true) // Open the modal
      } else {
        console.error('Error fetching related data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching related data:', error.message)
    }
  }

  const onRowSelect = id => {
    if (id) {
      handleRowClick(id) // Fetch details for the selected row
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRow(null) // Clear selected row details
  }

  return (
    <div
      style={{ maxHeight: 'calc(100vh - 50px)' }}
      className='p-4  custom-scroll '
    >
      <div className='flex justify-between items-center'>
        <h3 className='text-[36px] text-[#BF6159]'>Income List</h3>
        <div className='flex gap-4'>
          {/* Date Picker Dropdown */}
          <div className='relative'>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              placeholderText='Select Day'
              className='pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5D5D5] border rounded-md'
            />
            <FaCalendarAlt className='absolute left-3 top-3 text-gray-400' />
          </div>
        </div>
      </div>

      <table className='min-w-full mb-5 mt-10'>
        <thead>
          <tr>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Invoice ID
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Payment From
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Date
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Amount
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Methods
            </th>
            {/* <th className="p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] ">
              Actions
            </th> */}
          </tr>
        </thead>
        <tbody>
          {incomeList.map((item, index) => (
            <tr
              key={item.id}
              className='p-t-r cursor-pointer  border-b border-gray-300'
              onClick={() => onRowSelect(item.id)}
            >
              <td className='px-4 py-2 text-[20px] text-center text-black font-cairo'>
                {index + 1}
              </td>
              <td className='px-4 py-2 text-[20px] text-center'>
                {item.paymentFrom}
              </td>
              <td className='px-4 py-2 text-center'>{item.date}</td>
              <td className='px-4 py-2 text-center'>{item.amount}</td>
              <td className='px-4 py-2 text-center'>
                <img
                  src={paymentMethodImages[item.method]}
                  alt={item.method}
                  className='object-contain mx-auto w-8 h-8'
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {isModalOpen && selectedRow && (
        <div className='fixed inset-0  flex items-center justify-center bg-black bg-opacity-50 z-50 scroll-auto '>
          <div className='relative w-1/3 bg-white border-4 border-[#BF6159] rounded-lg shadow-lg p-6 '>
            {/* Close Icon */}
            <button
              onClick={() => closeModal()}
              className='absolute top-4 right-4 text-gray-400 hover:text-red-500'
            >
              <FaWindowClose className='text-3xl' />
            </button>

            {/* Top Section: Patient and Doctor Info */}
            <div className=' pb-4'>
              <div>
                <h2 className='font-[700] text-[32px] leading-[40px]'>
                  {selectedRow.details[0]?.visitDetail?.patient?.name ||
                    'Patient Name'}
                </h2>
              </div>
            </div>

            {/* Details Section */}
            <div className='mt-4 border-b'>
              {selectedRow.details.map((detail, index) => (
                <div key={index} className='flex justify-between pb-4 mb-4'>
                  <div>
                    <h4 className='text-l font-semibold'>
                      {detail.visitDetail?.schedule?.service?.title ||
                        'Service Title'}
                    </h4>
                    <p className='text-gray-600'>
                      DR.{' '}
                      {detail.visitDetail?.schedule?.doctor?.name ||
                        'Doctor Name'}
                    </p>
                  </div>

                  <div>
                    <p className='text-gray-600 text-sm'>
                      {detail.visitDetail?.date?.fromTime} -{' '}
                      {detail.visitDetail?.date?.toTime}
                    </p>
                    <p className='text-gray-900 text-md text-center font-medium'>
                      {detail.amount} L.E
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Payment and Total Section */}
            <div className='flex  justify-between items-center mt-4'>
              <div>
                <p className=' text-center text-black'>Payment Method</p>
                <img
                  src={
                    paymentMethodImages[selectedRow.paymentMethod] ||
                    '/path/to/default-payment.png'
                  }
                  alt={selectedRow.paymentMethod}
                />
              </div>
              <div className='justify-between'>
                <p className='text-black text-lg font-semibold'>Total</p>
                <p className='text-red-500 text-lg font-bold'>
                  {selectedRow.total} L.E
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Income
