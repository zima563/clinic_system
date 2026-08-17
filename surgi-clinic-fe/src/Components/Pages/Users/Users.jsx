import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaUserPlus, FaSearch, FaUserShield, FaToggleOn, FaToggleOff, FaTrash } from 'react-icons/fa'

export default function Users() {
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    roleId: ''
  })
  const [errorMsg, setErrorMsg] = useState('')

  useEffect(() => {
    fetchUsers()
    fetchRoles()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      const token = getToken()
      const res = await axios.get(`${API_URL}/api/users/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setUsers(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch users:', err)
    } finally {
      setLoading(false)
    }
  }

  const fetchRoles = async () => {
    try {
      const token = getToken()
      const res = await axios.get(`${API_URL}/api/roles/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoles(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddUser = async e => {
    e.preventDefault()
    setErrorMsg('')
    try {
      const token = getToken()
      await axios.post(`${API_URL}/api/users`, formData, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setIsModalOpen(false)
      setFormData({ userName: '', email: '', phone: '', password: '', roleId: '' })
      fetchUsers()
    } catch (err) {
      setErrorMsg(err.response?.data?.message || 'Failed to create user')
    }
  }

  const toggleUserActive = async (userId) => {
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/api/users/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to toggle user status:', err)
    }
  }

  const deleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      const token = getToken()
      await axios.patch(`${API_URL}/api/users/soft/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  const filteredUsers = users.filter(
    u =>
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
  )

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll'>
      <div className='flex justify-between items-center mb-6'>
        <div>
          <h2 className='text-3xl font-bold text-[#BF6159]'>Users Management</h2>
          <p className='text-sm text-gray-500 mt-1'>Manage system operators, permissions, and roles</p>
        </div>

        <div className='flex gap-4'>
          <div className='relative'>
            <input
              type='text'
              placeholder='Search users...'
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className='pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#BF6159]'
            />
            <FaSearch className='absolute left-3 top-3 text-gray-400' />
          </div>
          <button
            onClick={() => setIsModalOpen(true)}
            className='flex items-center gap-2 bg-[#BF6159] text-white px-4 py-2 rounded-lg hover:bg-red-600 transition font-medium'
          >
            <FaUserPlus /> Add User
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className='bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden'>
        <table className='min-w-full text-left text-sm'>
          <thead className='bg-gray-50 border-b border-gray-200 text-gray-700 font-semibold'>
            <tr>
              <th className='py-3 px-4'>#</th>
              <th className='px-4'>User</th>
              <th className='px-4'>Email</th>
              <th className='px-4'>Phone</th>
              <th className='px-4'>Role</th>
              <th className='px-4'>Status</th>
              <th className='px-4 text-center'>Actions</th>
            </tr>
          </thead>
          <tbody className='divide-y divide-gray-100'>
            {loading ? (
              <tr>
                <td colSpan={7} className='py-6 text-center text-gray-500'>
                  Loading users...
                </td>
              </tr>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user, idx) => (
                <tr key={user.id} className='hover:bg-gray-50 transition'>
                  <td className='py-3 px-4 font-medium text-gray-600'>{idx + 1}</td>
                  <td className='px-4 font-semibold text-gray-800 flex items-center gap-2 py-3'>
                    <div className='w-8 h-8 rounded-full bg-red-100 text-[#BF6159] flex items-center justify-center font-bold text-sm'>
                      {user.userName?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    {user.userName}
                  </td>
                  <td className='px-4 text-gray-600'>{user.email}</td>
                  <td className='px-4 text-gray-600'>{user.phone}</td>
                  <td className='px-4'>
                    <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 flex items-center gap-1 w-max'>
                      <FaUserShield /> {user.userRoles?.[0]?.role?.name || 'Operator'}
                    </span>
                  </td>
                  <td className='px-4'>
                    {user.isActive ? (
                      <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800'>
                        Active
                      </span>
                    ) : (
                      <span className='px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600'>
                        Inactive
                      </span>
                    )}
                  </td>
                  <td className='px-4 text-center'>
                    <div className='flex items-center justify-center gap-3'>
                      <button
                        onClick={() => toggleUserActive(user.id)}
                        className='text-xl text-gray-600 hover:text-[#BF6159]'
                        title='Toggle Active'
                      >
                        {user.isActive ? <FaToggleOn className='text-green-600' /> : <FaToggleOff className='text-gray-400' />}
                      </button>
                      <button
                        onClick={() => deleteUser(user.id)}
                        className='text-red-500 hover:text-red-700'
                        title='Delete User'
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={7} className='py-6 text-center text-gray-500'>
                  No users found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add User Modal */}
      {isModalOpen && (
        <div className='fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto'>
          <div className='bg-white w-full max-w-lg rounded-2xl shadow-2xl p-6 relative border border-red-100 my-8'>
            {/* Header */}
            <div className='flex justify-between items-center pb-3 mb-4 border-b border-gray-100'>
              <h2 className='text-2xl font-bold text-[#BF6159] flex items-center gap-2'>
                <FaUserPlus /> Add System User
              </h2>
              <button
                onClick={() => setIsModalOpen(false)}
                className='text-gray-400 hover:text-gray-600 text-xl font-bold w-8 h-8 rounded-full hover:bg-gray-100 flex items-center justify-center transition'
              >
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-sm font-medium'>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} className='space-y-4'>
              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Username</label>
                <input
                  type='text'
                  name='userName'
                  required
                  value={formData.userName}
                  onChange={handleInputChange}
                  placeholder='e.g. John Operator'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                />
              </div>

              <div>
                <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Email Address</label>
                <input
                  type='email'
                  name='email'
                  required
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder='user@clinic.com'
                  className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                />
              </div>

              <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Phone Number</label>
                  <input
                    type='text'
                    name='phone'
                    required
                    value={formData.phone}
                    onChange={handleInputChange}
                    placeholder='01012345678'
                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                  />
                </div>

                <div>
                  <label className='block text-xs font-bold text-gray-700 uppercase tracking-wider mb-1'>Password</label>
                  <input
                    type='password'
                    name='password'
                    required
                    value={formData.password}
                    onChange={handleInputChange}
                    placeholder='••••••••'
                    className='w-full border border-gray-300 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-[#BF6159] focus:outline-none bg-gray-50/50'
                  />
                </div>
              </div>

              {/* Actions */}
              <div className='flex justify-end gap-3 pt-4 border-t border-gray-100'>
                <button
                  type='button'
                  onClick={() => setIsModalOpen(false)}
                  className='px-5 py-2.5 bg-gray-100 text-gray-700 text-sm font-semibold rounded-xl hover:bg-gray-200 transition'
                >
                  Cancel
                </button>
                <button
                  type='submit'
                  className='px-6 py-2.5 bg-[#BF6159] text-white text-sm font-semibold rounded-xl hover:bg-red-700 transition shadow-md shadow-red-200'
                >
                  Create User
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
