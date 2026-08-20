import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import {
  FaCalendarAlt,
  FaTrash,
  FaPlus,
  FaEdit,
  FaFileInvoiceDollar,
  FaReceipt,
  FaMoneyBillWave
} from 'react-icons/fa'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { toast } from 'react-toastify'

function Expenses() {
  const [selectedDate, setSelectedDate] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)

  const [expenseDetails, setExpenseDetails] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState(null)

  const token = getToken()

  const formatDate = date => (date ? date.toLocaleDateString('en-CA') : null)

  const fetchExpenses = async () => {
    try {
      const formattedDate = selectedDate ? formatDate(selectedDate) : null
      const url = formattedDate
        ? `${API_URL}/api/invoice?ex=true&createdAt=${formattedDate}`
        : `${API_URL}/api/invoice?ex=true`

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        }
      })

      if (response.status === 200) {
        const mappedData = (response.data.data || []).map(item => ({
          id: item.id,
          ref: item.rf || item.id,
          date: new Date(item.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
          }),
          amount: item.total || 0,
          details: item.details?.[0]?.description || 'Operational Expense',
          invoiceDetailsId: item.details?.[0]?.id
        }))
        setExpenses(mappedData)
      }
    } catch (error) {
      console.error('Error fetching expenses:', error)
    }
  }

  useEffect(() => {
    fetchExpenses()
  }, [selectedDate])

  const openModal = () => {
    resetModal()
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
    resetModal()
  }

  const resetModal = () => {
    setExpenseDetails('')
    setExpenseAmount('')
    setEditingExpenseId(null)
    setIsEditing(false)
  }

  const handleEdit = expenseId => {
    const item = expenses.find(exp => exp.invoiceDetailsId === expenseId || exp.id === expenseId)
    if (item) {
      setExpenseDetails(item.details)
      setExpenseAmount(item.amount)
      setEditingExpenseId(item.invoiceDetailsId || item.id)
      setIsEditing(true)
      setIsModalOpen(true)
    }
  }

  const openDeleteModal = expenseId => {
    setExpenseToDelete(expenseId)
    setIsDeleteModalOpen(true)
  }

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setExpenseToDelete(null)
  }

  const handleDeleteConfirmed = async () => {
    if (!expenseToDelete) return
    try {
      await axios.delete(`${API_URL}/api/invoice/${expenseToDelete}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Expense record deleted successfully.')
      fetchExpenses()
      closeDeleteModal()
    } catch (error) {
      console.error('Error deleting expense:', error)
      toast.error('Failed to delete expense record.')
    }
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!expenseDetails.trim() || !expenseAmount) {
      toast.error('Please fill in both description and amount.')
      return
    }

    try {
      if (isEditing) {
        const payload = {
          description: expenseDetails.trim(),
          amount: parseFloat(expenseAmount)
        }
        await axios.put(`${API_URL}/api/invoice/${editingExpenseId}`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Expense updated successfully!')
      } else {
        const payload = {
          description: expenseDetails.trim(),
          amount: parseFloat(expenseAmount)
        }
        await axios.post(`${API_URL}/api/invoice`, payload, {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`
          }
        })
        toast.success('Expense created successfully!')
      }
      fetchExpenses()
      closeModal()
    } catch (error) {
      console.error('Error saving expense:', error)
      toast.error(error.response?.data?.message || 'Failed to save expense.')
    }
  }

  const filteredExpenses = expenses.filter(item => {
    const descStr = item.details || ''
    const refStr = String(item.ref || item.id)
    const term = searchTerm.toLowerCase()
    return descStr.toLowerCase().includes(term) || refStr.includes(term)
  })

  // Financial Metrics
  const totalExpensesSum = filteredExpenses.reduce((acc, curr) => acc + (Number(curr.amount) || 0), 0)

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-3 border-b border-gray-200'>
        <div>
          <h2 className='page-title text-2xl'>
            <FaFileInvoiceDollar className='text-[#BF6159]' /> Clinic Expenses & Outgoings
          </h2>
          <p className='text-xs text-gray-500 mt-0.5'>Record clinic operational costs, medical inventory, and maintenance expenses</p>
        </div>

        <div className='flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end'>
          <div className='search-wrap'>
            <span className='search-icon'>🔍</span>
            <input
              type='text'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder='Search Expense Description...'
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

          <button onClick={openModal} className='btn-primary'>
            <FaPlus /> Add Expense
          </button>
        </div>
      </div>

      {/* Expense Metric Cards */}
      <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
        <div className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider block'>Total Outgoing Expenses</span>
            <span className='text-2xl font-black text-red-600'>{totalExpensesSum.toLocaleString()} L.E</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-red-50 text-red-600 border border-red-100 flex items-center justify-center text-xl shadow-2xs'>
            <FaMoneyBillWave />
          </div>
        </div>

        <div className='card p-5 bg-white border border-gray-200 shadow-sm flex items-center justify-between'>
          <div className='space-y-1'>
            <span className='text-xs font-bold text-gray-500 uppercase tracking-wider block'>Recorded Expense Items</span>
            <span className='text-2xl font-extrabold text-gray-900'>{filteredExpenses.length} Records</span>
          </div>
          <div className='w-12 h-12 rounded-2xl bg-gray-100 text-gray-700 border border-gray-200 flex items-center justify-center text-xl shadow-2xs'>
            <FaReceipt />
          </div>
        </div>
      </div>

      {/* Expenses Table */}
      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='data-table'>
          <thead>
            <tr>
              <th>#</th>
              <th>Expense ID / Ref</th>
              <th>Description / Category</th>
              <th>Record Date</th>
              <th>Amount (L.E)</th>
              <th className='text-center'>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredExpenses.length > 0 ? (
              filteredExpenses.map((item, index) => (
                <tr key={item.id}>
                  <td className='font-medium text-gray-600'>{index + 1}</td>
                  <td className='font-mono font-bold text-gray-800'>#{item.ref}</td>
                  <td className='font-bold text-gray-900'>{item.details}</td>
                  <td className='text-gray-600 text-xs'>{item.date}</td>
                  <td className='font-extrabold text-red-600'>{item.amount} L.E</td>
                  <td className='text-center'>
                    <div className='flex items-center justify-center gap-2'>
                      <button
                        onClick={() => handleEdit(item.invoiceDetailsId || item.id)}
                        className='btn-icon'
                        title='Edit Expense'
                      >
                        <FaEdit />
                      </button>
                      <button
                        onClick={() => openDeleteModal(item.id)}
                        className='btn-icon danger'
                        title='Delete Expense'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan='6' className='py-8 text-center text-gray-400'>
                  No expense records found matching your filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* MODAL 1: ADD / EDIT EXPENSE */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-md'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaFileInvoiceDollar /> {isEditing ? 'Edit Expense Record' : 'Record New Expense'}
              </h3>
              <button onClick={closeModal} className='modal-close'>
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='form-label'>Expense Description</label>
                <input
                  type='text'
                  required
                  placeholder='e.g. Medical Gloves & Disposable Syringes'
                  value={expenseDetails}
                  onChange={e => setExpenseDetails(e.target.value)}
                  className='form-input'
                />
              </div>

              <div>
                <label className='form-label'>Expense Amount (L.E)</label>
                <input
                  type='number'
                  step='0.01'
                  required
                  placeholder='e.g. 450.00'
                  value={expenseAmount}
                  onChange={e => setExpenseAmount(e.target.value)}
                  className='form-input'
                />
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={closeModal} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  {isEditing ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CONFIRM DELETE */}
      {isDeleteModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-sm text-center space-y-4'>
            <div className='w-12 h-12 rounded-full bg-red-100 text-red-600 flex items-center justify-center mx-auto text-xl'>
              ⚠️
            </div>
            <h3 className='text-lg font-bold text-gray-900'>Delete Expense Record?</h3>
            <p className='text-xs text-gray-500'>
              Are you sure you want to delete this expense record? This action cannot be undone.
            </p>
            <div className='flex justify-center gap-3 pt-2'>
              <button onClick={closeDeleteModal} className='btn-secondary'>
                Cancel
              </button>
              <button onClick={handleDeleteConfirmed} className='btn-danger'>
                Yes, Delete Record
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
