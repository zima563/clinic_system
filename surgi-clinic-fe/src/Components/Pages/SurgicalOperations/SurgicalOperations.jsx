import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaUserMd, FaUserInjured, FaProcedures } from 'react-icons/fa'

export default function SurgicalOperations() {
  const [visits, setVisits] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchSurgicalVisits()
  }, [])

  const fetchSurgicalVisits = async () => {
    try {
      const token = getToken()
      const res = await axios.get(`${API_URL}/api/visit/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const visitList = res.data.visits || res.data.data || (Array.isArray(res.data) ? res.data : [])
      setVisits(visitList)
    } catch (err) {
      console.error('Failed to fetch surgical operations:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll'>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-[#BF6159]'>Surgical Operations & Procedures</h2>
        <p className='text-sm text-gray-500 mt-1'>Track completed and scheduled surgical operations</p>
      </div>

      <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
        <table className='min-w-full text-left text-sm'>
          <thead className='bg-gray-50 border-b text-gray-700 font-semibold'>
            <tr>
              <th className='py-3 px-4'>Ref #</th>
              <th className='px-4'>Patient</th>
              <th className='px-4'>Procedure & Doctor</th>
              <th className='px-4'>Date</th>
              <th className='px-4'>Total Amount</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              <tr>
                <td colSpan={5} className='py-6 text-center text-gray-500'>
                  Loading operations...
                </td>
              </tr>
            ) : visits.length > 0 ? (
              visits.map((v, idx) => (
                <tr key={v.id || idx} className='hover:bg-gray-50'>
                  <td className='py-3 px-4 font-mono font-bold text-[#BF6159]'>{v.rf?.substring(0, 8)}</td>
                  <td className='px-4 font-semibold text-gray-800 flex items-center gap-2 py-4'>
                    <FaUserInjured className='text-gray-400' />
                    {v.details?.[0]?.patient?.name || 'Patient'}
                  </td>
                  <td className='px-4'>
                    <div className='font-medium text-gray-900 flex items-center gap-1.5'>
                      <FaProcedures className='text-blue-500' />
                      {v.details?.[0]?.schedule?.service?.title || 'Surgical Procedure'}
                    </div>
                    <div className='text-xs text-gray-500 flex items-center gap-1 mt-0.5'>
                      <FaUserMd /> DR. {v.details?.[0]?.schedule?.doctor?.name || 'Surgeon'}
                    </div>
                  </td>
                  <td className='px-4 text-gray-600'>{new Date(v.createdAt).toLocaleDateString()}</td>
                  <td className='px-4 font-bold text-gray-900'>{v.total} L.E</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className='py-6 text-center text-gray-500'>
                  No surgical operations recorded yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
