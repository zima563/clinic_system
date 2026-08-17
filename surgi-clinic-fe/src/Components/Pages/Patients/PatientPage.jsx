import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  FaUserMd,
  FaHeartbeat,
  FaWeight,
  FaCalendarAlt,
  FaPhoneAlt,
  FaArrowLeft,
  FaNotesMedical,
  FaClipboardList,
  FaUser,
  FaClock,
  FaStethoscope
} from 'react-icons/fa'
import { MdOutlineMedication, MdCake, MdLocationOn } from 'react-icons/md'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import patientImage from '../../../assets/patientimg.png'

const PatientPage = () => {
  const { id } = useParams()
  const navigate = useNavigate()

  const [patient, setPatient] = useState(null)
  const [appointments, setAppointments] = useState([])
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const token = getToken()

  useEffect(() => {
    fetchPatientDetails()
  }, [id])

  const fetchPatientDetails = async () => {
    setLoading(true)
    setError(null)
    try {
      // 1. Fetch Patient details
      const patientRes = await axios.get(`${API_URL}/api/patients/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const patientData = patientRes.data
      setPatient(patientData)

      // 2. Fetch Appointments for this patient
      try {
        const appRes = await axios.get(`${API_URL}/api/appointment/all?patientId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setAppointments(appRes.data.data || patientData.appointments || [])
      } catch (e) {
        setAppointments(patientData.appointments || [])
      }

      // 3. Fetch Visits for this patient
      try {
        const visitRes = await axios.get(`${API_URL}/api/visit/all?patientId=${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        })
        setVisits(visitRes.data.visits || patientData.VisitDetail || [])
      } catch (e) {
        setVisits(patientData.VisitDetail || [])
      }
    } catch (err) {
      console.error('Error fetching patient details:', err)
      setError('Failed to load patient information.')
    } finally {
      setLoading(false)
    }
  }

  // Calculate age from birthdate
  const calculateAge = birthdateStr => {
    if (!birthdateStr) return 'N/A'
    const birthDate = new Date(birthdateStr)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--
    }
    return age > 0 ? age : 0
  }

  // Format date helper
  const formatDate = dateStr => {
    if (!dateStr) return 'N/A'
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className='p-8 flex items-center justify-center min-h-[60vh]'>
        <div className='flex flex-col items-center gap-3 text-gray-500'>
          <div className='w-10 h-10 border-4 border-[#BF6159] border-t-transparent rounded-full animate-spin'></div>
          <p className='text-sm font-semibold'>Loading patient profile...</p>
        </div>
      </div>
    )
  }

  if (error || !patient) {
    return (
      <div className='p-8 max-w-lg mx-auto text-center'>
        <div className='bg-red-50 border border-red-200 text-red-700 p-6 rounded-2xl shadow-sm'>
          <h3 className='text-lg font-bold mb-2'>Patient Not Found</h3>
          <p className='text-sm text-red-600 mb-4'>{error || 'No patient record matches this ID.'}</p>
          <button onClick={() => navigate('/PatientsTable')} className='btn-primary'>
            <FaArrowLeft /> Back to Patients
          </button>
        </div>
      </div>
    )
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Top Header Navigation */}
      <div className='flex items-center justify-between pb-2 border-b border-gray-200'>
        <div className='flex items-center gap-3'>
          <button onClick={() => navigate('/PatientsTable')} className='btn-secondary py-1.5 px-3 text-xs'>
            <FaArrowLeft /> Back
          </button>
          <h1 className='page-title text-2xl'>
            <FaUser className='text-[#BF6159]' /> Patient Profile
          </h1>
        </div>
        <button onClick={() => navigate('/Appointments')} className='btn-primary'>
          <FaCalendarAlt /> Book Appointment
        </button>
      </div>

      {/* Main Container */}
      <div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
        {/* Left Card — Patient Demographics */}
        <div className='card p-6 flex flex-col items-center text-center space-y-5 bg-white shadow-sm border border-gray-200'>
          <div className='relative'>
            <img
              src={`https://ui-avatars.com/api/?name=${encodeURIComponent(patient.name)}&background=BF6159&color=fff&bold=true&size=128`}
              alt={patient.name}
              className='w-28 h-28 rounded-full border-4 border-red-50 object-cover shadow-md'
            />
            <span
              className={`absolute bottom-0 right-0 px-2.5 py-0.5 rounded-full text-xs font-bold capitalize border ${
                patient.gender === 'male'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-pink-50 text-pink-700 border-pink-200'
              }`}
            >
              {patient.gender || 'Unknown'}
            </span>
          </div>

          <div>
            <h2 className='text-2xl font-bold text-gray-900'>{patient.name}</h2>
            <p className='text-xs font-semibold text-[#BF6159] mt-0.5'>Patient ID: #{patient.id}</p>
          </div>

          <div className='w-full space-y-3 pt-3 border-t border-gray-100 text-sm'>
            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaPhoneAlt className='text-xs text-[#BF6159]' /> Phone:
              </span>
              <span className='font-bold text-gray-800'>{patient.phone || 'N/A'}</span>
            </div>

            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <MdCake className='text-xs text-[#BF6159]' /> Age:
              </span>
              <span className='font-bold text-gray-800'>{calculateAge(patient.birthdate)} yrs</span>
            </div>

            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaCalendarAlt className='text-xs text-[#BF6159]' /> Date of Birth:
              </span>
              <span className='font-bold text-gray-800'>{formatDate(patient.birthdate)}</span>
            </div>

            <div className='flex justify-between items-center py-1.5 border-b border-gray-50'>
              <span className='text-gray-500 font-medium flex items-center gap-2'>
                <FaUser className='text-xs text-[#BF6159]' /> Created By:
              </span>
              <span className='badge-primary'>{patient.creator?.userName || 'System Admin'}</span>
            </div>
          </div>

          {patient.info && (
            <div className='w-full bg-red-50/60 border border-red-100 p-3 rounded-xl text-left'>
              <span className='block text-xs font-bold text-[#BF6159] uppercase tracking-wider mb-1'>
                Additional Info / Notes
              </span>
              <p className='text-xs text-gray-700 leading-relaxed'>{patient.info}</p>
            </div>
          )}
        </div>

        {/* Right Section — Medical History & Appointments */}
        <div className='lg:col-span-2 space-y-6'>
          {/* Medical History Card */}
          <div className='card p-6 bg-white border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-bold text-gray-900 mb-3 flex items-center gap-2 border-b pb-2'>
              <FaNotesMedical className='text-[#BF6159]' /> Medical History & Conditions
            </h3>
            {patient.medicalHistory ? (
              <div className='bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm text-gray-700 leading-relaxed font-medium'>
                <p className='whitespace-pre-line'>{patient.medicalHistory}</p>
              </div>
            ) : (
              <p className='text-xs text-gray-400 italic py-2'>No recorded medical history for this patient.</p>
            )}
          </div>

          {/* Patient Appointments History */}
          <div className='card p-6 bg-white border border-gray-200 shadow-sm'>
            <h3 className='text-lg font-bold text-gray-900 mb-4 flex items-center gap-2 border-b pb-2'>
              <FaClipboardList className='text-[#BF6159]' /> Appointments & Medical Visits ({appointments.length})
            </h3>

            {appointments.length > 0 ? (
              <div className='space-y-3 max-h-72 overflow-y-auto pr-1 custom-scroll'>
                {appointments.map(app => (
                  <div
                    key={app.id}
                    className='p-4 bg-gray-50 border border-gray-200 rounded-xl flex justify-between items-center hover:border-red-200 transition'
                  >
                    <div className='space-y-1'>
                      <div className='flex items-center gap-2'>
                        <span className='font-bold text-gray-900 text-sm'>
                          {app.schedule?.service?.title || 'Consultation'}
                        </span>
                        <span
                          className={`badge ${
                            app.status === 'confirmed'
                              ? 'badge-confirmed'
                              : app.status === 'canceled'
                              ? 'badge-canceled'
                              : 'badge-pending'
                          }`}
                        >
                          {app.status || 'pending'}
                        </span>
                      </div>
                      <p className='text-xs text-gray-500 flex items-center gap-1.5'>
                        <FaUserMd className='text-[#BF6159]' /> Dr. {app.schedule?.doctor?.name || 'Assigned Doctor'}
                      </p>
                      <p className='text-[11px] text-gray-400 flex items-center gap-1.5'>
                        <FaClock className='text-gray-400' /> {app.date?.fromTime || '09:00 AM'} -{' '}
                        {app.date?.toTime || '01:00 PM'}
                      </p>
                    </div>
                    <div className='text-right'>
                      <span className='text-xs font-bold text-gray-700 block bg-white px-3 py-1.5 rounded-lg border border-gray-200 shadow-2xs'>
                        📅 {formatDate(app.dateTime || app.createdAt)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className='py-8 text-center bg-gray-50 rounded-xl border border-dashed border-gray-200'>
                <FaStethoscope className='text-3xl text-gray-300 mx-auto mb-2' />
                <p className='text-xs font-semibold text-gray-500'>No appointment records found for this patient.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientPage
