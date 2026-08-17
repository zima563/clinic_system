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
        ? `${API_URL}/api/invoice?ex=false&createdAt=${formattedDate}`
        : `${API_URL}/api/invoice?ex=false`

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

      {/* Invoice Details Modal */}
      {isModalOpen && selectedRow && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-md rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                📄 Invoice #{selectedRow.ref || selectedRow.id}
              </h2>
              <button
                onClick={() => closeModal()}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            {/* Patient Header */}
            <div className='bg-red-50/50 p-3 rounded-xl border border-red-100 mb-4'>
              <span className='block text-xs font-bold text-gray-500 uppercase tracking-wider'>Patient Name</span>
              <h3 className='text-lg font-bold text-gray-900 mt-0.5'>
                {selectedRow.details[0]?.visitDetail?.patient?.name || 'Walk-in Patient'}
              </h3>
            </div>

            {/* Details Section */}
            <div className='space-y-3 mb-4 max-h-60 overflow-y-auto pr-1 custom-scroll'>
              {selectedRow.details.map((detail, index) => (
                <div key={index} className='bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center'>
                  <div>
                    <h4 className='text-sm font-bold text-gray-900'>
                      {detail.visitDetail?.schedule?.service?.title || 'General Consultation'}
                    </h4>
                    <p className='text-xs font-medium text-gray-500 mt-0.5'>
                      Dr. {detail.visitDetail?.schedule?.doctor?.name || 'Attending Specialist'}
                    </p>
                    {detail.visitDetail?.date && (
                      <p className='text-[11px] text-gray-400 mt-0.5'>
                        ⏰ {detail.visitDetail.date.fromTime} - {detail.visitDetail.date.toTime}
                      </p>
                    )}
                  </div>
                  <div className='text-right'>
                    <span className='text-sm font-bold text-[#BF6159] bg-white px-2.5 py-1 rounded-lg border border-red-100 shadow-sm block'>
                      {detail.amount} L.E
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className='flex justify-between items-center pt-3 border-t border-gray-100 bg-gray-50 p-4 rounded-xl border'>
              <div>
                <span className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1'>Payment Method</span>
                <span className='badge-active text-xs font-bold uppercase tracking-wider'>
                  💳 {selectedRow.paymentMethod || 'Cash'}
                </span>
              </div>
              <div className='text-right'>
                <span className='block text-xs font-bold text-gray-500 uppercase tracking-wider'>Grand Total</span>
                <span className='text-2xl font-black text-[#BF6159]'>
                  {selectedRow.total} L.E
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Income
