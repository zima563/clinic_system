import React, { useState } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaKey, FaHospital, FaSave } from 'react-icons/fa'

export default function Settings() {
  const [activeTab, setActiveTab] = useState('security')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    password: '',
    confirmPassword: ''
  })
  const [statusMsg, setStatusMsg] = useState({ type: '', text: '' })

  const handlePasswordChange = async e => {
    e.preventDefault()
    setStatusMsg({ type: '', text: '' })

    if (passwordData.password !== passwordData.confirmPassword) {
      setStatusMsg({ type: 'error', text: 'New passwords do not match.' })
      return
    }

    try {
      const token = getToken()
      await axios.patch(`${API_URL}/api/users/ChangePassword`, {
        currentPassword: passwordData.currentPassword,
        password: passwordData.password
      }, {
        headers: { Authorization: `Bearer ${token}` }
      })

      setStatusMsg({ type: 'success', text: 'Password updated successfully!' })
      setPasswordData({ currentPassword: '', password: '', confirmPassword: '' })
    } catch (err) {
      setStatusMsg({ type: 'error', text: err.response?.data?.message || 'Failed to update password.' })
    }
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll'>
      <div className='mb-6'>
        <h2 className='text-3xl font-bold text-[#BF6159]'>Clinic Settings</h2>
        <p className='text-sm text-gray-500 mt-1'>Manage account security, clinic profiles, and system preferences</p>
      </div>

      <div className='flex gap-6'>
        {/* Sidebar Navigation */}
        <div className='w-64 bg-white rounded-xl border border-gray-200 p-3 h-max space-y-1 shadow-sm'>
          <button
            onClick={() => setActiveTab('security')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeTab === 'security'
                ? 'bg-[#BF6159] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaKey /> Security & Password
          </button>
          <button
            onClick={() => setActiveTab('clinic')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition ${
              activeTab === 'clinic'
                ? 'bg-[#BF6159] text-white'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHospital /> Clinic Profile
          </button>
        </div>

        {/* Tab Content */}
        <div className='flex-1 bg-white rounded-xl border border-gray-200 p-6 shadow-sm'>
          {activeTab === 'security' && (
            <div>
              <h3 className='text-xl font-bold text-gray-800 mb-4 border-b pb-2'>Change Password</h3>
              {statusMsg.text && (
                <div
                  className={`p-3 rounded-lg text-sm mb-4 border ${
                    statusMsg.type === 'success'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : 'bg-red-50 text-red-700 border-red-200'
                  }`}
                >
                  {statusMsg.text}
                </div>
              )}

              <form onSubmit={handlePasswordChange} className='max-w-md space-y-4'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Current Password</label>
                  <input
                    type='password'
                    required
                    value={passwordData.currentPassword}
                    onChange={e => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                    className='w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>New Password</label>
                  <input
                    type='password'
                    required
                    value={passwordData.password}
                    onChange={e => setPasswordData({ ...passwordData, password: e.target.value })}
                    className='w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Confirm New Password</label>
                  <input
                    type='password'
                    required
                    value={passwordData.confirmPassword}
                    onChange={e => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                    className='w-full p-2.5 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
                  />
                </div>

                <button
                  type='submit'
                  className='btn-primary'
                >
                  <FaSave /> Update Password
                </button>
              </form>
            </div>
          )}

          {activeTab === 'clinic' && (
            <div>
              <h3 className='text-xl font-bold text-gray-800 mb-4 border-b pb-2'>Clinic Details</h3>
              <div className='max-w-md space-y-4 text-sm text-gray-700'>
                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Clinic Name</label>
                  <input
                    type='text'
                    defaultValue='Surgi Clinic System'
                    className='w-full p-2.5 border rounded-lg bg-gray-50'
                  />
                </div>

                <div>
                  <label className='block text-xs font-semibold text-gray-600 uppercase mb-1'>Contact Email</label>
                  <input
                    type='email'
                    defaultValue='admin@clinic.com'
                    className='w-full p-2.5 border rounded-lg bg-gray-50'
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
