import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaStethoscope,
  FaPhoneAlt,
  FaArrowLeft,
  FaUserMd,
  FaCalendarCheck,
  FaClock,
  FaMoneyBillWave,
  FaCheckCircle,
  FaStar,
  FaInfoCircle
} from 'react-icons/fa'
import { MdOutlineMedicalServices } from 'react-icons/md'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import docImage from '../../../assets/docimage.png'

export default function DoctorPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [doctor, setDoctor] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = getToken()

  useEffect(() => {
    fetchDoctorDetails()
  }, [id])

  const fetchDoctorDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Doctor details
      const docRes = await axios.get(`${API_URL}/api/doctors/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setDoctor(docRes.data)

      // 2. Fetch Schedules for this Doctor
      try {
        const schedRes = await axios.get(`${API_URL}/api/schedule`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        const docSchedules = (schedRes.data.data || []).filter(
          s => s.doctorId === Number(id) || s.doctor?.id === Number(id)
        )
        setSchedules(docSchedules)
      } catch (e) {
        setSchedules(docRes.data.schedules || [])
      }
    } catch (err) {
      console.error('Error fetching doctor details:', err)
      setError('Failed to load doctor details.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className='p-8 flex items-center justify-center min-h-[60vh]'>
        <div className='flex flex-col items-center gap-3 text-gray-500'>
          <div className='w-10 h-10 border-4 border-[#BF6159] border-t-transparent rounded-full animate-spin'></div>
          <p className='text-sm font-semibold'>Loading doctor profile...</p>
        </div>
      </div>
    )
  }

  if (error || !doctor) {
    return (
      <div className='p-8 max-w-lg mx-auto text-center'>
        <div className='bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm'>
          <h3 className='text-lg font-bold mb-2'>Doctor Not Found</h3>
          <p className='text-sm text-red-600 mb-4'>{error || 'No doctor record matches this ID.'}</p>
          <button onClick={() => navigate('/Doctors')} className='btn-primary'>
            <FaArrowLeft /> Back to Doctors
          </button>
        </div>
      </div>
    )
  }

  const doctorImgSrc = doctor.image && doctor.image.startsWith('http')
    ? doctor.image
    : docImage

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Navigation */}
      <div className='flex items-center justify-between pb-2 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <button onClick={() => navigate('/Doctors')} className='btn-secondary py-1.5 px-3 text-xs'>
            <FaArrowLeft /> Back
          </button>
          <h1 className='page-title text-2xl'>
            <FaUserMd className='text-[#BF6159]' /> Doctor Profile
          </h1>
        </div>
        <button onClick={() => navigate('/Appointments')} className='btn-primary'>
          <FaCalendarCheck /> Book Appointment
        </button>
      </div>

      {/* Main Grid */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Column — Doctor Profile Card */}
        <div className='card p-6 flex flex-col items-center text-center space-y-5 bg-white border border-gray-200 shadow-sm'>
          <div className='relative'>
            <img
              src={doctorImgSrc}
              alt={doctor.name}
              className='w-32 h-32 rounded-full border-4 border-red-50 object-cover shadow-md'
              onError={e => {
                e.target.src = docImage
              }}
            />
            <span
              className={`absolute bottom-1 right-1 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                doctor.isActive
                  ? 'badge-confirmed'
                  : 'badge-canceled'
              }`}
            >
              {doctor.isActive ? 'Active' : 'Inactive'}
            </span>
          </div>

          <div>
            <h2 className='text-2xl font-bold text-gray-900'>Dr. {doctor.name}</h2>
            <p className='text-xs font-bold text-[#BF6159] mt-1 bg-red-50 px-3 py-1 rounded-full border border-red-100 inline-block'>
              {doctor.specialty?.title || 'Medical Specialist'}
            </p>
          </div>

          {/* Rating Badges */}
          <div className='flex items-center gap-1 text-amber-400 text-sm font-bold bg-amber-50 px-3 py-1 rounded-full border border-amber-200'>
            <FaStar /> <span>5.0 Rating</span>
          </div>

          <div className='w-full space-y-3 pt-3 border-t border-gray-100 text-sm'>
            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaPhoneAlt className='text-xs text-[#BF6159]' /> Phone:
              </span>
              <span className='font-bold text-gray-800'>{doctor.phone || 'N/A'}</span>
            </div>

            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaStethoscope className='text-xs text-[#BF6159]' /> Specialty ID:
              </span>
              <span className='font-bold text-gray-800'>#{doctor.specialtyId || 1}</span>
            </div>

            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaUserMd className='text-xs text-[#BF6159]' /> Registered By:
              </span>
              <span className='badge-primary'>{doctor.creator?.userName || 'System Admin'}</span>
            </div>
          </div>

          {/* Highlights / Badges */}
          <div className='flex flex-wrap justify-center gap-1.5 pt-2'>
            <span className='badge badge-info'>Friendly Service</span>
            <span className='badge badge-available'>Experienced</span>
            <span className='badge badge-primary'>Certified</span>
          </div>
        </div>

        {/* Right Column — Information & Schedules */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Doctor Bio / Info Card */}
          <div className='card p-6 bg-white border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2'>
              <FaInfoCircle className='text-[#BF6159]' /> About Doctor & Background
            </h3>
            <div className='bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-700 leading-relaxed font-medium'>
              <p>{doctor.info || 'Professional medical specialist providing comprehensive diagnostic and treatment care.'}</p>
            </div>
          </div>

          {/* Doctor Schedules & Services */}
          <div className='card p-6 bg-white border border-gray-200 shadow-sm space-y-4'>
            <h3 className='text-lg font-bold text-gray-900 flex items-center gap-2 border-b pb-2'>
              <MdOutlineMedicalServices className='text-[#BF6159]' /> Doctor Working Schedules & Services ({schedules.length})
            </h3>

            {schedules.length > 0 ? (
              <div className='space-y-4 max-h-80 overflow-y-auto pr-1 custom-scroll'>
                {schedules.map(sched => (
                  <div key={sched.id} className='bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-3 hover:border-red-200 transition'>
                    <div className='flex justify-between items-center'>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-gray-900 text-base'>
                          {sched.service?.title || 'General Consultation'}
                        </span>
                      </div>
                      <span className='text-base font-extrabold text-[#BF6159] bg-white px-3 py-1 rounded-lg border border-red-100 shadow-2xs'>
                        {sched.price} L.E
                      </span>
                    </div>

                    {/* Available Days & Time Slots */}
                    <div>
                      <span className='block text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5'>
                        Available Days & Slots:
                      </span>
                      <div className='flex flex-wrap gap-2'>
                        {sched.dates && sched.dates.length > 0 ? (
                          sched.dates.map(d => (
                            <div
                              key={d.id}
                              className='bg-white border border-gray-200 rounded-lg px-3 py-1.5 text-xs font-semibold text-gray-700 flex items-center gap-2 shadow-2xs'
                            >
                              <span className='text-[#BF6159] uppercase font-bold'>{d.day}</span>
                              <span className='text-gray-400'>|</span>
                              <span className='flex items-center gap-1 text-gray-600'>
                                <FaClock className='text-[10px] text-gray-400' /> {d.fromTime} - {d.toTime}
                              </span>
                            </div>
                          ))
                        ) : (
                          <span className='text-xs text-gray-400 italic'>No working slots assigned.</span>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200'>
                <FaCalendarCheck className='text-3xl text-gray-300 mx-auto mb-2' />
                <p className='text-xs font-semibold text-gray-500'>No active schedules available for this doctor yet.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
