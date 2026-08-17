import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaCalendarAlt, FaCheckCircle, FaClock } from 'react-icons/fa'

export default function Requests() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchRequests()
  }, [])

  const fetchRequests = async () => {
    try {
      const token = getToken()
      const res = await axios.get(`${API_URL}/api/appointment/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const appsList = res.data.data || (Array.isArray(res.data) ? res.data : [])
      setAppointments(appsList)
    } catch (err) {
      console.error('Failed to fetch appointment requests:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll'>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-[#BF6159]'>Booking Requests</h2>
        <p className='text-sm text-gray-500 mt-1'>Review and manage patient booking requests</p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='min-w-full text-left text-sm'>
          <thead className='bg-gray-50 border-b text-gray-700 font-semibold'>
            <tr>
              <th className='py-3 px-4'>#</th>
              <th className='px-4'>Patient Name</th>
              <th className='px-4'>Phone</th>
              <th className='px-4'>Service & Doctor</th>
              <th className='px-4'>Requested Date</th>
              <th className='px-4'>Status</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              <tr>
                <td colSpan={6} className='py-6 text-center text-gray-500'>
                  Loading requests...
                </td>
              </tr>
            ) : appointments.length > 0 ? (
              appointments.map((app, idx) => (
                <tr key={app.id || idx} className='hover:bg-gray-50'>
                  <td className='py-3 px-4 font-medium text-gray-600'>{idx + 1}</td>
                  <td className='px-4 font-semibold text-gray-800'>{app.patient?.name || 'N/A'}</td>
                  <td className='px-4 text-gray-600'>{app.patient?.phone || 'N/A'}</td>
                  <td className='px-4'>
                    <div className='font-medium text-gray-900'>{app.schedule?.service?.title || 'Consultation'}</div>
                    <div className='text-xs text-gray-500'>DR. {app.schedule?.doctor?.name || 'Doctor'}</div>
                  </td>
                  <td className='px-4 text-gray-600 flex items-center gap-1.5 py-4'>
                    <FaCalendarAlt className='text-gray-400' />
                    {new Date(app.dateTime).toLocaleString()}
                  </td>
                  <td className='px-4'>
                    <span className='px-2.5 py-1 rounded-full text-xs font-semibold bg-yellow-100 text-yellow-800 capitalize inline-flex items-center gap-1'>
                      <FaClock /> {app.status || 'pending'}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={6} className='py-6 text-center text-gray-500'>
                  No pending booking requests found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
