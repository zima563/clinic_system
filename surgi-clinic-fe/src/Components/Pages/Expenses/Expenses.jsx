import React, { useState, useEffect } from 'react'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'
import { FaCalendarAlt, FaTrash, FaWindowClose } from 'react-icons/fa'
import { RiDeleteBin6Line } from 'react-icons/ri'
import { FiEdit2 } from 'react-icons/fi'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'

function Expenses () {
  const [selectedDate, setSelectedDate] = useState(null)
  const [expenses, setExpenses] = useState([])
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [expenseToDelete, setExpenseToDelete] = useState(null)

  const [expenseDetails, setExpenseDetails] = useState('')
  const [expenseAmount, setExpenseAmount] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editingExpenseId, setEditingExpenseId] = useState(null)

  const formatDate = date => (date ? date.toLocaleDateString('en-CA') : null)

  const fetchIncome = async () => {
    const TOKEN = getToken()
    try {
      const formattedDate = selectedDate ? formatDate(selectedDate) : null
      const url = formattedDate
        ? `${API_URL}/api/invoice?ex=true&createdAt=${formattedDate}`
        : `${API_URL}/api/invoice?ex=true`

      const response = await axios.get(url, {
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${TOKEN}`
        }
      })

      if (response.status === 200) {
        const mappedData = response.data.data.map(item => ({
          id: item.id,
          ref: item.rf,
          date: new Date(item.createdAt).toLocaleDateString(),
          amount: item.total,
          details: item.details[0]?.description
            ? item.details[0].description
            : undefined,
          invoiceDetailsId: item.details[0]?.id
        }))
        setExpenses(mappedData)
      } else {
        console.error('Error fetching data:', response.statusText)
      }
    } catch (error) {
      console.error('Error fetching data:', error)
    }
  }

  const handleSave = async e => {
    const TOKEN = getToken()
    e.preventDefault()
    if (!expenseDetails || !expenseAmount) {
      alert('Please fill in all fields.')
      return
    }

    try {
      if (isEditing) {
        let updatedExpense = {
          description: expenseDetails,
          amount: parseFloat(expenseAmount)
        }

        const response = await axios.put(
          `${API_URL}/api/invoice/${editingExpenseId}`,
          updatedExpense,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${TOKEN}`
            }
          }
        )

        if (response.status === 200) {
          console.log('Expense updated successfully:', response.data)
          fetchIncome()
          setIsModalOpen(false)
          setExpenseDetails('')
          setExpenseAmount('')
          resetModal()
        } else {
          console.error('Failed to update the expense:', response)
        }
      } else {
        const newExpense = {
          description: expenseDetails,
          amount: parseFloat(expenseAmount)
        }

        const response = await axios.post(
          `${API_URL}/api/invoice`,
          newExpense,
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${TOKEN}`
            }
          }
        )

        if (response.status === 200) {
          console.log('Expense saved successfully:', response.data)
          fetchIncome()
          setIsModalOpen(false)
          resetModal()
        } else {
          console.error('Failed to save the expense:', response)
        }
      }
    } catch (error) {
      console.error('Error while saving the expense:', error)
    }
  }

  const handleEdit = expenseId => {
    const expense = expenses.find(item => item.invoiceDetailsId === expenseId)
    if (expense) {
      setExpenseDetails(expense.details)
      setExpenseAmount(expense.amount)
      setEditingExpenseId(expenseId)
      setIsEditing(true)
      setIsModalOpen(true)
    }
  }

  const resetModal = () => {
    setExpenseDetails('')
    setExpenseAmount('')
    setEditingExpenseId(null)
    setIsEditing(false)
  }

  const openDeleteModal = expenseId => {
    setExpenseToDelete(expenseId)
    setIsDeleteModalOpen(true)
  }

  // Close delete modal
  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false)
    setExpenseToDelete(null)
  }

  const handleDelete = async () => {
    const TOKEN = getToken()
    if (!expenseToDelete) return // Safety check
    try {
      const response = await axios.delete(
        `${API_URL}/api/invoice/${expenseToDelete}`,
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${TOKEN}`
          }
        }
      )

      if (response.status === 200) {
        console.log('Expense deleted successfully')
        fetchIncome()
      } else {
        console.error('Failed to delete the expense:', response)
      }
    } catch (error) {
      console.error('Error while deleting the expense:', error)
    } finally {
      setIsDeleteModalOpen(false) // Close modal after action
      setExpenseToDelete(null) // Reset the state
    }
  }

  useEffect(() => {
    fetchIncome()
  }, [selectedDate])

  return (
    <div
      style={{ maxHeight: 'calc(100vh - 50px)' }}
      className='p-4 overflow-y-auto custom-scroll '
    >
      <div className='flex justify-between items-center'>
        <h3 className='text-[36px] text-[#BF6159]'>Expenses List</h3>
        <div className='flex gap-4'>
          <div className='relative'>
            <DatePicker
              selected={selectedDate}
              onChange={date => setSelectedDate(date)}
              placeholderText='Select Day'
              className='pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-[#D5D5D5] border rounded-md'
            />
            <FaCalendarAlt className='absolute left-3 top-3 text-gray-400' />
          </div>
          <button
            className='text-white bg-[#BF6159] px-4 py-2 rounded-md hover:bg-[red]'
            onClick={() => {
              resetModal()
              setIsModalOpen(true)
            }}
          >
            Add Expenses
          </button>
        </div>
      </div>

      <table className='min-w-full ml-2 mb-5 mt-10'>
        <thead>
          <tr>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              ID
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Date
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Total
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Details
            </th>
            <th className='p-2 border-b border-gray-300 text-center text-[20px] font-normal leading-[37px] '>
              Actions
            </th>
          </tr>
        </thead>
        <tbody>
          {expenses.map((item, index) => (
            <tr key={item.id} className=' p-t-r cursor-pointer border-b'>
              <td className='px-4 py-2 text-center'>{index + 1}</td>
              <td className='px-4 py-2 text-center'>{item.date}</td>
              <td className='px-4 py-2 text-center'>{item.amount}</td>
              <td className='px-4 py-2 text-center'>{item.details}</td>
              <td className='px-4 py-2 text-center'>
                <button
                  className='text-black px-3 py-1  ml-2 justify-center items-center'
                  onClick={() => handleEdit(item.invoiceDetailsId)}
                >
                  <FiEdit2 size={24} />
                </button>
                <button
                  className='text-[#E31B25] px-3 py-1 justify-center items-center'
                  onClick={() => openDeleteModal(item.id)}
                >
                  <FaTrash size={24} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Add / Edit Expense Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                💳 {isEditing ? 'Edit Expense Record' : 'Add New Expense'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false)
                  resetModal()
                }}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className='space-y-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Expense Amount (L.E)
                </label>
                <input
                  type='text'
                  value={expenseAmount}
                  placeholder='e.g. 500'
                  onChange={e => {
                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                      setExpenseAmount(e.target.value)
                    }
                  }}
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>
                  Expense Details / Description
                </label>
                <textarea
                  value={expenseDetails}
                  onChange={e => setExpenseDetails(e.target.value)}
                  placeholder='e.g. Medical supplies, electricity bill, maintenance...'
                  rows='3'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50 resize-none'
                />
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => {
                    setIsModalOpen(false)
                    resetModal()
                  }}
                  className='px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 bg-[#BF6159] text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200'
                >
                  {isEditing ? 'Update Expense' : 'Save Expense'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Expense Modal */}
      {isDeleteModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4'>
          <div className='bg-white rounded-2xl shadow-2xl p-6 w-full max-w-md border border-red-100 relative'>
            <h3 className='text-xl font-bold mb-3 text-gray-900'>
              Confirm Expense Deletion
            </h3>
            <p className='text-sm text-gray-600 mb-6'>
              Are you sure you want to delete this expense record? This action cannot be undone.
            </p>
            <div className='flex justify-end gap-3'>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className='px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-6 py-2.5 bg-red-600 text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200'
              >
                Delete Expense
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
