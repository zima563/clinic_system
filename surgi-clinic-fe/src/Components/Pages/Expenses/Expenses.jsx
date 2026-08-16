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

      {isModalOpen && (
        <div className='fixed inset-0   flex items-center justify-center bg-black bg-opacity-50'>
          <div className='bg-white border-[#BF6159] border-4  max-w-3xl p-6 rounded-lg shadow-lg w-[629px] h-[375px] '>
            {' '}
            <div className='relative flex justify-between items-center mb-8'>
              <button
                onClick={() => setIsModalOpen(false)}
                className='absolute top-1 right-1 text-gray-400 hover:text-red-500'
              >
                <FaWindowClose className='text-3xl' />
              </button>
              <h3 className='text-xl font-semibold'>
                {isEditing ? 'Edit Expense' : 'Add Expense'}
              </h3>
            </div>
            <form onSubmit={handleSave} className='flex flex-col gap-4'>
              <div className='flex justify-between '>
                <div className='mb-4'>
                  <label className='block text-sm font-medium text-gray-700'>
                    {' '}
                    Details{' '}
                  </label>
                  <textarea
                    value={expenseDetails}
                    onChange={e => setExpenseDetails(e.target.value)}
                    className='add-p-i pl-6 pr-8 mr-6 w-[383px] h-[145px] py-2 resize-none focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                </div>
                <div className='mb-4'>
                  <label className='block  text-sm font-medium text-gray-700'>
                    Amount
                  </label>
                  <input
                    type='text'
                    value={expenseAmount}
                    onChange={e => {
                      if (/^\d*\.?\d*$/.test(e.target.value)) {
                        setExpenseAmount(e.target.value)
                      }
                    }}
                    className='w-full border rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                </div>
              </div>

              <button
                type='submit'
                className='w-[139px]  bg-[#BF6159] text-white py-2 rounded-md hover:bg-red-500'
              >
                {isEditing ? 'Update' : 'Save'}
              </button>
            </form>
          </div>
        </div>
      )}

      {isDeleteModalOpen && (
        <div className='fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50'>
          <div className='bg-white rounded-lg shadow-lg p-6 w-full max-w-md'>
            <h3 className='text-xl font-semibold mb-4'>
              Are you sure you want to delete this expense?
            </h3>
            <div className='flex justify-end gap-4'>
              <button
                onClick={() => setIsDeleteModalOpen(false)}
                className='px-4 py-2 bg-gray-300 text-gray-700 rounded hover:bg-gray-400'
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                className='px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600'
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Expenses
