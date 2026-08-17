import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  FaCalendarAlt,
  FaFileInvoiceDollar,
  FaSearch,
  FaEye,
  FaWallet,
  FaReceipt,
  FaExchangeAlt
} from 'react-icons/fa'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'

function Income() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [incomeList, setIncomeList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedRow, setSelectedRow] = useState(null)

  const token = getToken()

  const formatDate = date => (date ? date.toLocaleDateString('en-CA') : null)

  const fetchIncome = async () => {
    try {
      const formattedDate = selectedDate ? formatDate(selectedDate) : null
      const url = formattedDate
        ? `${API_URL}/api/invoice?ex=false&createdAt=${formattedDate}`
        : `${API_URL}/api/invoice?ex=false`

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        const mappedData = (response.data.data || []).map(item => ({
          id: item.id,
          rf: item.rf || item.id,
          paymentFrom:
            item.VisitInvoice?.[0]?.visit?.details?.[0]?.patient?.name || 'Walk-in Patient',
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          amount: item.total || 0,
          method: item.paymentMethod || 'Cash'
        }))
        setIncomeList(mappedData)
      }
    } catch (error) {
      console.error('Error fetching income data:', error)
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [selectedDate])

  const handleRowClick = async id => {
    if (!id) return
    try {
      const response = await axios.get(`${API_URL}/api/invoice/${id}`, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        const invoiceDetails = response.data.details || []
        setSelectedRow({ ...response.data, details: invoiceDetails })
        setIsModalOpen(true)
      }
    } catch (error) {
      console.error('Error fetching invoice details:', error)
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
    setSelectedRow(null)
  }

  const filteredIncome = incomeList.filter(item => {
    const fromStr = item.paymentFrom || ''
    const rfStr = String(item.rf || item.id)
    const term = searchTerm.toLowerCase()
    return fromStr.toLowerCase().includes(term) || rfStr.includes(term)
  })

  // Financial Metrics
  const totalIncomeSum = filteredIncome.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)
  const cashPayments = filteredIncome.filter(i => (i.method || '').toLowerCase() === 'cash').length
  const digitalPayments = filteredIncome.length - cashPayments

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaFileInvoiceDollar className='text-[#BF6159]' /> Income & Financial Invoices
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Track patient payments, consultation fees, and medical revenue</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search by Patient or RF #...'
            />
          </div>

          {/* Date Picker Filter */}
          <div className='relative'>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              placeholderText='Filter Date...'
              isClearable
              className='form-input pl-9 pr-8 text-xs py-2 w-36 cursor-pointer'
            />
            <FaCalendarAlt className='absolute left-3 top-3 text-gray-400 text-xs pointer-events-none' />
          </div>
        </div>
      </div>

      {/* Financial Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-3 gap-5'>
        <div className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider block'>Total Income</span>
            <span className='text-2xl font-black text-[#BF6159]'>{totalIncomeSum.toLocaleString()} L.E</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-red-50 text-[#BF6159] border border-red-100 flex items-center justify-center text-xl shadow-2xs'>
            <FaWallet />
          </div>
        </div>

        <div className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider block'>Total Invoices</span>
            <span className='text-2xl font-extrabold text-gray-900'>{filteredIncome.length} Records</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 border border-blue-100 flex items-center justify-center text-xl shadow-2xs'>
            <FaReceipt />
          </div>
        </div>

        <div className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider block'>Payment Breakdown</span>
            <div className='flex items-center gap-2 text-xs font-semibold text-gray-700'>
              <span className='badge badge-confirmed text-[10px]'>Cash: {cashPayments}</span>
              <span className='badge badge-info text-[10px]'>Card/Online: {digitalPayments}</span>
            </div>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-green-50 text-green-600 border border-green-100 flex items-center justify-center text-xl shadow-2xs'>
            <FaExchangeAlt />
          </div>
        </div>
      </div>

      {/* Income Invoices Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>#</th>
              <th>RF / Invoice ID</th>
              <th>Payment Source</th>
              <th>Issue Date</th>
              <th>Payment Method</th>
              <th>Amount (L.E)</th>
              <th className='text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredIncome.length > 0 ? (
              filteredIncome.map((item, index) => (
                <tr
                  key={item.id}
                  onClick={() => handleRowClick(item.id)}
                  className='cursor-pointer hover:bg-red-50/40 transition'
                >
                  <td className='font-medium text-gray-600'>{index + 1}</td>
                  <td className='font-mono font-bold text-gray-800'>#{item.rf}</td>
                  <td className='font-bold text-gray-900'>{item.paymentFrom}</td>
                  <td className='text-gray-600 text-xs'>{item.date}</td>
                  <td>
                    <span className='badge badge-primary uppercase text-[10px] font-bold'>
                      💳 {item.method}
                    </span>
                  </td>
                  <td className='font-extrabold text-[#BF6159]'>{item.amount} L.E</td>
                  <td className='text-center' onClick={e => e.stopPropagation()}>
                    <button
                      onClick={() => handleRowClick(item.id)}
                      className='btn-icon'
                      title='View Invoice Receipt'
                    >
                      <FaEye />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='7' className='py-8 text-center text-gray-400'>
                  No income records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL: INVOICE RECEIPT DETAILS */}
      {isModalOpen && selectedRow && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-md'>
            <div className='modal-header'>
              <div>
                <h3 className='modal-title'>
                  <FaReceipt /> Invoice Receipt #{selectedRow.ref || selectedRow.id}
                </h3>
                <p className='text-xs text-gray-500 mt-0.5'>Official Clinic Payment Breakdown</p>
              </div>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            {/* Patient Info Card */}
            <div className='bg-red-50/60 p-3 rounded-xl border border-red-100 mb-4'>
              <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block'>Patient Name</span>
              <h3 className='text-base font-bold text-gray-900 mt-0.5'>
                {selectedRow.details?.[0]?.visitDetail?.patient?.name || 'Walk-in Patient'}
              </h3>
            </div>

            {/* Line Items Breakdown */}
            <div className='space-y-2.5 mb-4 max-h-56 overflow-y-auto pr-1 custom-scroll'>
              {selectedRow.details?.map((detail, index) => (
                <div key={index} className='bg-gray-50 p-3 rounded-xl border border-gray-200 flex justify-between items-center'>
                  <div>
                    <h4 className='text-xs font-bold text-gray-900'>
                      {detail.visitDetail?.schedule?.service?.title || 'General Consultation'}
                    </h4>
                    <p className='text-[11px] font-medium text-gray-500 mt-0.5'>
                      Dr. {detail.visitDetail?.schedule?.doctor?.name || 'Attending Specialist'}
                    </p>
                  </div>
                  <span className='text-xs font-bold text-[#BF6159] bg-white px-2.5 py-1 rounded-lg border border-red-100 shadow-2xs'>
                    {detail.amount} L.E
                  </span>
                </div>
              ))}
            </div>

            {/* Total Footer */}
            <div className='flex justify-between items-center pt-3 border-t border-gray-100 bg-gray-50 p-3 rounded-xl border'>
              <div>
                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block mb-0.5'>Payment Method</span>
                <span className='badge badge-confirmed text-[10px] uppercase font-bold'>
                  💳 {selectedRow.paymentMethod || 'Cash'}
                </span>
              </div>
              <div className='text-right'>
                <span className='text-[10px] font-bold text-gray-400 uppercase tracking-wider block'>Grand Total</span>
                <span className='text-xl font-black text-[#BF6159]'>
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
