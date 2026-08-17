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
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-xl rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                🩺 Add New Specialty
              </h2>
              <button
                onClick={closeModal}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSubmit} className='space-y-4'>
              {/* Icon / Image Upload */}
              <div className='flex justify-center mb-6'>
                <div className='relative w-24 h-24'>
                  <div className='w-full h-full rounded-2xl bg-red-50 border-2 border-red-200 flex items-center justify-center overflow-hidden shadow-inner'>
                    {image ? (
                      <img
                        src={URL.createObjectURL(image)}
                        alt='Selected'
                        className='w-full h-full object-cover'
                      />
                    ) : (
                      <img src={special1} className='w-12 h-12 object-contain opacity-70' alt='Specialty Placeholder' />
                    )}
                  </div>
                  <label
                    htmlFor='imageInput'
                    className='absolute bottom-0 right-0 bg-[#BF6159] hover:bg-red-700 text-white p-2 rounded-full cursor-pointer shadow-md transition'
                    title='Upload Specialty Icon'
                  >
                    <IoCameraOutline className='text-base' />
                    <input
                      type='file'
                      id='imageInput'
                      accept='image/*'
                      onChange={handleImageChange}
                      className='hidden'
                    />
                  </label>
                </div>
              </div>

              {/* Specialty Title */}
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Specialty Name</label>
                <input
                  type='text'
                  value={specialtyName}
                  onChange={e => setSpecialtyName(e.target.value)}
                  placeholder='e.g. Cardiology, Orthopedics, Pediatrics'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                />
              </div>

              {Error && (
                <div className='p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-medium'>
                  ⚠️ {Error}
                </div>
              )}

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
                  <IoIosSave className='text-lg' /> Save Specialty
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default Specialties
