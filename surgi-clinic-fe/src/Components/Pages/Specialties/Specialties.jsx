import React, { useState, useEffect } from 'react'
import axios from 'axios'
import special1 from '../../../assets/special.png'
import { FaSearch, FaWindowClose } from 'react-icons/fa'
import { IoIosSave } from 'react-icons/io'
import { IoCameraOutline } from 'react-icons/io5'
import { API_URL, getToken } from '../../../config'

const APIURL = `${API_URL}/api/specialist`
const TOKEN = getToken()

function Specialties () {
  const [specialtiesData, setSpecialtiesData] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [image, setImage] = useState(null)
  const [specialtyName, setSpecialtyName] = useState('')
  const [Error, setError] = useState('')

  // Fetch specialties data
  const fetchSpecialties = async () => {
    try {
      const response = await axios.get(`${APIURL}/all`, {
        headers: {
          Authorization: `Bearer ${TOKEN}`
        }
      })
      setSpecialtiesData(response.data.data || [])
      console.log(response.data.data)
    } catch (error) {}
  }

  useEffect(() => {
    fetchSpecialties()
  }, [])

  // Modal toggle functions
  const openModal = () => setIsModalOpen(true)
  const closeModal = () => {
    setImage(null)
    setSpecialtyName('')
    setIsModalOpen(false)
  }

  const handleImageChange = e => {
    const file = e.target.files[0]
    if (file && file.type.startsWith('image/')) {
      setImage(file) // Store the file in state
    } else {
      alert('Please upload a valid image file.')
    }
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!specialtyName.trim()) {
      alert('Please enter a specialty name')
      return
    }

    if (!image) {
      alert('Please upload an image')
      return
    }

    const formData = new FormData()
    formData.append('title', specialtyName)
    formData.append('icon', image) // Append the file directly

    try {
      const response = await axios.post(APIURL, formData, {
        headers: {
          Authorization: `Bearer ${TOKEN}`,
          'Content-Type': 'multipart/form-data' // Important for file uploads
        }
      })
      console.log('Specialty added successfully:', response.data)
      fetchSpecialties() // Reload specialties after successful submission
      setImage(null)
      setSpecialtyName('')
      closeModal() // Close the modal
    } catch (error) {
      setError(error)
    }
  }

  return (
    <div className='container mx-auto mt-10'>
      {/* Header */}
      <div className='flex items-center ps-10 pe-10 justify-between mb-4'>
        <h3 className='text-2xl font-semibold text-red-600'>
          Specialties List
        </h3>
        <div className='flex gap-4'>
          <div className='relative'>
            <FaSearch className='absolute left-4 top-3 text-gray-400' />
            <input
              type='text'
              value={searchTerm}
              placeholder='Search by Name'
              onChange={e => setSearchTerm(e.target.value)}
              className='p-s-i pl-12 pr-4 py-2 w-full focus:outline-none focus:ring-2 focus:ring-[#D5D5D5]'
            />
          </div>
          <button
            onClick={openModal}
            className='bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md'
          >
            + Add Specialties
          </button>
        </div>
      </div>
      {/* Grid of Specialties */}
      <div className='grid grid-cols-2 md:grid-cols-4 mt-14'>
        {specialtiesData
          .filter(s => s.title?.toLowerCase().includes(searchTerm.toLowerCase()))
          .map(specialty => (
            <div
              key={specialty.id}
              className='flex flex-col py-6 items-center glass-card m-3 transform transition-all duration-300 hover:-translate-y-1 hover:shadow-lg rounded-2xl cursor-pointer'
            >
              <div className='w-24 h-24 rounded-full bg-red-50 border-2 border-red-200 flex items-center justify-center text-red-600 text-4xl mb-3 shadow-inner overflow-hidden'>
                {specialty.icon && specialty.icon.startsWith('http') ? (
                  <img
                    src={specialty.icon}
                    alt={specialty.title}
                    className='w-full h-full object-cover'
                    onError={(e) => { e.target.style.display = 'none' }}
                  />
                ) : (
                  <span className='text-3xl font-bold'>🩺</span>
                )}
              </div>
              <div className='text-base font-bold text-slate-800 text-center px-2'>{specialty.title}</div>
            </div>
          ))}
      </div>

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
              Add Specialties
            </h2>
            <form onSubmit={handleSubmit}>
              <div className='relative w-36 h-36 mb-6 mx-auto border rounded-full'>
                {image ? (
                  <img
                    src={URL.createObjectURL(image)}
                    alt='Selected'
                    className='w-full h-full rounded-full'
                  />
                ) : (
                  <img
                    src={special1}
                    alt='Add Specialty'
                    className='w-full h-full rounded-full'
                  />
                )}
                <label
                  htmlFor='imageInput'
                  className='absolute bottom-0 right-0 bg-red-500 text-white p-2 rounded-full cursor-pointer'
                >
                  <IoCameraOutline />
                  <input
                    type='file'
                    id='imageInput'
                    accept='image/*'
                    onChange={handleImageChange}
                    className='hidden'
                  />
                </label>
              </div>
              <div className='mb-4'>
                <label className='block text-gray-700 mb-2'>Name</label>
                <input
                  type='text'
                  value={specialtyName}
                  onChange={e => setSpecialtyName(e.target.value)}
                  placeholder='e.g., Cardiology'
                  className='w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-red-500'
                />
              </div>
              <button
                type='submit'
                className='bg-red-500 text-white px-6 py-2 rounded-md hover:bg-red-600'
              >
                <IoIosSave className='inline-block mr-2' />
                Save
              </button>
              <div>
                {Error && <span className='text-red-500 text-sm'>{Error}</span>}
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Specialties
