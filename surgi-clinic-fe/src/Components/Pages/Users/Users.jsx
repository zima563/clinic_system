import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { toast } from 'react-toastify'
import {
  FaUserPlus,
  FaSearch,
  FaUserShield,
  FaToggleOn,
  FaToggleOff,
  FaTrash,
  FaKey,
  FaPlus,
  FaCheckSquare,
  FaEdit,
  FaShieldAlt,
  FaUsers
} from 'react-icons/fa'
import { IoIosSave } from 'react-icons/io'

// Permission Category Mapping for clean UX
const PERMISSION_GROUPS = [
  {
    category: '👥 Patients Management',
    permissions: ['addPatient', 'updatePatient', 'listPatient', 'getPatient']
  },
  {
    category: '👨‍⚕️ Doctors Management',
    permissions: ['addDoctor', 'updateDoctor', 'listDoctors', 'showDoctorDetails', 'DeactiveDoctor']
  },
  {
    category: '🩺 Services & Specialties',
    permissions: ['addService', 'allServices', 'updateService', 'getService', 'deactiveService', 'createSpecialty', 'updateSpecialty', 'allSpecialtys', 'getOneSpecialty']
  },
  {
    category: '📅 Schedules & Appointments',
    permissions: ['addSchedule', 'listSchedules', 'showScheduleDetails', 'updateSchedule', 'deleteSchedule', 'addAppointment', 'getAppointment', 'showAppointmnetDetail', 'updateStatus', 'updateAppointment']
  },
  {
    category: '📋 Visits Care',
    permissions: ['createVisit', 'getAllVisits', 'showVisitDetails', 'appendVisitDetails', 'removeVisitDetails', 'deleteVisit']
  },
  {
    category: '💳 Invoices & Finance',
    permissions: ['createInvoice', 'listInvoice', 'updateInvoiceDetail', 'Show_Invoice_Details', 'List_Invoice_Details', 'Append_Invoice_Details', 'Remove_Invoice_Details', 'deleteInvoice']
  },
  {
    category: '📊 Reports & Analytics',
    permissions: ['summarized_report', 'downloadPdf']
  },
  {
    category: '⚙️ User & System Security',
    permissions: ['addUser', 'allUsers', 'getOneUser', 'updateUser', 'deactiveUser', 'DeleteUser', 'createRole', 'allRoles', 'updateRole', 'deleteRole', 'ListPermissions', 'assignRoleToUser']
  }
]

export default function Users() {
  const [activeTab, setActiveTab] = useState('users') // 'users' | 'roles'

  // Users State
  const [users, setUsers] = useState([])
  const [roles, setRoles] = useState([])
  const [allPermissions, setAllPermissions] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Roles State & Modals
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false)
  const [newRoleName, setNewRoleName] = useState('')

  const [selectedRoleForPerms, setSelectedRoleForPerms] = useState(null)
  const [isPermModalOpen, setIsPermModalOpen] = useState(false)
  const [rolePermissions, setRolePermissions] = useState([])
  const [savingPerms, setSavingPerms] = useState(false)

  const [formData, setFormData] = useState({
    userName: '',
    email: '',
    phone: '',
    password: '',
    roleId: ''
  })
  const [errorMsg, setErrorMsg] = useState('')

  const token = getToken()

  useEffect(() => {
    fetchUsers()
    fetchRoles()
    fetchAllPermissions()
  }, [])

  const fetchUsers = async () => {
    try {
      setLoading(true)
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
      const res = await axios.get(`${API_URL}/api/roles/all`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setRoles(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch roles:', err)
    }
  }

  const fetchAllPermissions = async () => {
    try {
      const res = await axios.get(`${API_URL}/api/permissions`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setAllPermissions(res.data.data || [])
    } catch (err) {
      console.error('Failed to fetch permissions:', err)
    }
  }

  const handleInputChange = e => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleAddUser = async e => {
    e.preventDefault()
    setErrorMsg('')
    try {
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

  const toggleUserActive = async userId => {
    try {
      await axios.patch(`${API_URL}/api/users/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to toggle user status:', err)
    }
  }

  const deleteUser = async userId => {
    if (!window.confirm('Are you sure you want to delete this user?')) return
    try {
      await axios.patch(`${API_URL}/api/users/soft/${userId}`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      })
      fetchUsers()
    } catch (err) {
      console.error('Failed to delete user:', err)
    }
  }

  // Handle Role Creation
  const handleCreateRole = async e => {
    e.preventDefault()
    if (!newRoleName.trim()) return
    try {
      await axios.post(
        `${API_URL}/api/roles`,
        { name: newRoleName.trim() },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      toast.success('Custom role created successfully!')
      setNewRoleName('')
      setIsRoleModalOpen(false)
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create role')
    }
  }

  // Handle Role Deletion
  const handleDeleteRole = async roleId => {
    if (!window.confirm('Are you sure you want to delete this role?')) return
    try {
      await axios.delete(`${API_URL}/api/roles/${roleId}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      toast.success('Role deleted successfully.')
      fetchRoles()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to delete role')
    }
  }

  // Open Permission Matrix Modal for a Role
  const openPermissionModal = async role => {
    setSelectedRoleForPerms(role)
    setIsPermModalOpen(true)
    try {
      const res = await axios.get(`${API_URL}/api/permissions/role/${role.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const permNames = (res.data.data || []).map(rp => rp.permission?.name).filter(Boolean)
      setRolePermissions(permNames)
    } catch (err) {
      setRolePermissions([])
    }
  }

  // Toggle single permission for selected role
  const togglePermission = permName => {
    if (rolePermissions.includes(permName)) {
      setRolePermissions(rolePermissions.filter(p => p !== permName))
    } else {
      setRolePermissions([...rolePermissions, permName])
    }
  }

  // Select / Deselect All in Category
  const toggleCategoryPermissions = categoryPerms => {
    const allSelected = categoryPerms.every(p => rolePermissions.includes(p))
    if (allSelected) {
      setRolePermissions(rolePermissions.filter(p => !categoryPerms.includes(p)))
    } else {
      const combined = new Set([...rolePermissions, ...categoryPerms])
      setRolePermissions(Array.from(combined))
    }
  }

  // Save Role Permissions
  const handleSaveRolePermissions = async () => {
    if (!selectedRoleForPerms) return
    setSavingPerms(true)
    try {
      await axios.post(
        `${API_URL}/api/permissions/assignToRole/${selectedRoleForPerms.id}`,
        { permissionNames: rolePermissions },
        { headers: { Authorization: `Bearer ${token}` } }
      )
      setIsPermModalOpen(false)
      toast.success(`Permissions updated successfully for ${selectedRoleForPerms.name}`)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update role permissions')
    } finally {
      setSavingPerms(false)
    }
  }

  const filteredUsers = users.filter(
    u =>
      u.userName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.phone?.includes(searchTerm)
  )

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll space-y-6'>
      {/* Header & Tabs */}
      <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-4 border-b border-gray-200'>
        <div>
          <h2 className='text-3xl font-bold text-[#BF6159] flex items-center gap-2'>
            <FaUserShield /> Access Control & RBAC
          </h2>
          <p className='text-sm text-gray-500 mt-1'>Manage user accounts, clinic roles, and granular security permissions</p>
        </div>

        {/* Navigation Tabs */}
        <div className='flex bg-gray-100 p-1 rounded-xl border border-gray-200'>
          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'users' ? 'bg-[#BF6159] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaUsers /> User Accounts ({users.length})
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-bold rounded-lg transition ${
              activeTab === 'roles' ? 'bg-[#BF6159] text-white shadow-sm' : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <FaShieldAlt /> Roles & Permissions ({roles.length})
          </button>
        </div>
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className='space-y-4'>
          <div className='flex justify-between items-center gap-4'>
            <div className='search-wrap'>
              <span className='search-icon'>🔍</span>
              <input
                type='text'
                placeholder='Search users...'
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
            <button onClick={() => setIsModalOpen(true)} className='btn-primary'>
              <FaUserPlus /> Add User Account
            </button>
          </div>

          {/* Users Table */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden'>
            <table className='data-table'>
              <thead>
                <tr>
                  <th>#</th>
                  <th>User Name</th>
                  <th>Email</th>
                  <th>Phone</th>
                  <th>Assigned Role</th>
                  <th>Status</th>
                  <th className='text-center'>Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={7} className='py-6 text-center text-gray-500'>
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length > 0 ? (
                  filteredUsers.map((user, idx) => (
                    <tr key={user.id}>
                      <td className='font-medium text-gray-600'>{idx + 1}</td>
                      <td className='font-semibold text-gray-800 flex items-center gap-2 py-3'>
                        <div className='w-8 h-8 rounded-full bg-red-100 text-[#BF6159] flex items-center justify-center font-bold text-sm shadow-2xs'>
                          {user.userName?.charAt(0).toUpperCase() || 'U'}
                        </div>
                        {user.userName}
                      </td>
                      <td className='text-gray-600'>{user.email}</td>
                      <td className='text-gray-600'>{user.phone}</td>
                      <td>
                        <span className='badge badge-primary'>
                          <FaUserShield className='text-[10px]' /> {user.userRoles?.[0]?.role?.name || 'Operator'}
                        </span>
                      </td>
                      <td>
                        {user.isActive ? (
                          <span className='badge badge-confirmed'>Active</span>
                        ) : (
                          <span className='badge badge-canceled'>Inactive</span>
                        )}
                      </td>
                      <td className='text-center'>
                        <div className='flex items-center justify-center gap-2'>
                          <button onClick={() => toggleUserActive(user.id)} className='btn-ghost' title='Toggle Status'>
                            {user.isActive ? <FaToggleOn className='text-green-600 text-lg' /> : <FaToggleOff className='text-gray-400 text-lg' />}
                          </button>
                          <button onClick={() => deleteUser(user.id)} className='btn-icon danger' title='Delete User'>
                            <FaTrash />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={7} className='py-6 text-center text-gray-400'>
                      No users found matching your search.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ROLES & PERMISSIONS MATRIX */}
      {activeTab === 'roles' && (
        <div className='space-y-6'>
          <div className='flex justify-between items-center'>
            <div>
              <h3 className='text-lg font-bold text-gray-900'>System Clinic Roles</h3>
              <p className='text-xs text-gray-500'>Manage predefined and custom clinic roles and configure permission matrices</p>
            </div>
            <button onClick={() => setIsRoleModalOpen(true)} className='btn-primary'>
              <FaPlus /> Create New Role
            </button>
          </div>

          {/* Roles Grid */}
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5'>
            {roles.map(role => (
              <div key={role.id} className='card p-5 bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-4'>
                <div className='space-y-2'>
                  <div className='flex justify-between items-start'>
                    <div className='w-10 h-10 rounded-xl bg-red-50 border border-red-100 flex items-center justify-center text-[#BF6159] text-lg font-bold'>
                      <FaShieldAlt />
                    </div>
                    {role.name !== 'Admin' && (
                      <button onClick={() => handleDeleteRole(role.id)} className='btn-icon danger' title='Delete Role'>
                        <FaTrash className='text-xs' />
                      </button>
                    )}
                  </div>
                  <h4 className='text-lg font-bold text-gray-900'>{role.name}</h4>
                  <p className='text-xs text-gray-500'>
                    {role.name === 'Admin'
                      ? 'Full Unrestricted System Access'
                      : role.name === 'Doctor'
                      ? 'Patient Intake, Appointments & Visits View'
                      : role.name === 'Receptionist'
                      ? 'Patient Scheduling, Appointments & Visits'
                      : role.name === 'Accountant'
                      ? 'Invoices, Income & Expense Financial Control'
                      : 'Custom System Access Role'}
                  </p>
                </div>

                <button onClick={() => openPermissionModal(role)} className='btn-secondary w-full justify-center text-xs'>
                  <FaKey /> Configure Permissions
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL 1: ADD USER */}
      {isModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaUserPlus /> Add New User Account
              </h3>
              <button onClick={() => setIsModalOpen(false)} className='modal-close'>
                ✕
              </button>
            </div>

            {errorMsg && (
              <div className='mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs font-semibold'>
                ⚠️ {errorMsg}
              </div>
            )}

            <form onSubmit={handleAddUser} className='space-y-4'>
              <div>
                <label className='form-label'>Full User Name</label>
                <input
                  type='text'
                  name='userName'
                  required
                  placeholder='e.g. John Doe'
                  value={formData.userName}
                  onChange={handleInputChange}
                  className='form-input'
                />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Email Address</label>
                  <input
                    type='email'
                    name='email'
                    required
                    placeholder='user@clinic.com'
                    value={formData.email}
                    onChange={handleInputChange}
                    className='form-input'
                  />
                </div>
                <div>
                  <label className='form-label'>Phone Number</label>
                  <input
                    type='text'
                    name='phone'
                    required
                    placeholder='01012345678'
                    value={formData.phone}
                    onChange={handleInputChange}
                    className='form-input'
                  />
                </div>
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                <div>
                  <label className='form-label'>Password</label>
                  <input
                    type='password'
                    name='password'
                    required
                    placeholder='••••••••'
                    value={formData.password}
                    onChange={handleInputChange}
                    className='form-input'
                  />
                </div>

                <div>
                  <label className='form-label'>Assign System Role</label>
                  <select
                    name='roleId'
                    required
                    value={formData.roleId}
                    onChange={handleInputChange}
                    className='form-input'
                  >
                    <option value=''>-- Select Role --</option>
                    {roles.map(r => (
                      <option key={r.id} value={r.id}>
                        {r.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={() => setIsModalOpen(false)} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Create User Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CREATE ROLE */}
      {isRoleModalOpen && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-sm'>
            <div className='modal-header'>
              <h3 className='modal-title'>
                <FaShieldAlt /> Create Custom Role
              </h3>
              <button onClick={() => setIsRoleModalOpen(false)} className='modal-close'>
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateRole} className='space-y-4'>
              <div>
                <label className='form-label'>Role Name</label>
                <input
                  type='text'
                  required
                  placeholder='e.g. Lab Technician'
                  value={newRoleName}
                  onChange={e => setNewRoleName(e.target.value)}
                  className='form-input'
                />
              </div>

              <div className='modal-footer'>
                <button type='button' onClick={() => setIsRoleModalOpen(false)} className='btn-secondary'>
                  Cancel
                </button>
                <button type='submit' className='btn-primary'>
                  Save Role
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: CONFIGURE PERMISSIONS MATRIX */}
      {isPermModalOpen && selectedRoleForPerms && (
        <div className='modal-overlay'>
          <div className='modal-panel max-w-2xl max-h-[85vh] flex flex-col'>
            <div className='modal-header'>
              <div>
                <h3 className='modal-title'>
                  <FaKey /> Configure Permissions — {selectedRoleForPerms.name}
                </h3>
                <p className='text-xs text-gray-500 mt-0.5'>Toggle allowed permissions for users assigned to this role</p>
              </div>
              <button onClick={() => setIsPermModalOpen(false)} className='modal-close'>
                ✕
              </button>
            </div>

            {/* Permissions Group Grid */}
            <div className='flex-1 overflow-y-auto custom-scroll space-y-4 pr-1 my-2'>
              {PERMISSION_GROUPS.map((group, idx) => {
                const allSelected = group.permissions.every(p => rolePermissions.includes(p))
                return (
                  <div key={idx} className='bg-gray-50 border border-gray-200 p-4 rounded-xl space-y-3'>
                    <div className='flex justify-between items-center border-b pb-2 border-gray-200'>
                      <h4 className='text-sm font-bold text-gray-900'>{group.category}</h4>
                      <button
                        type='button'
                        onClick={() => toggleCategoryPermissions(group.permissions)}
                        className='text-xs font-bold text-[#BF6159] hover:underline flex items-center gap-1'
                      >
                        <FaCheckSquare className='text-[11px]' /> {allSelected ? 'Deselect All' : 'Select All'}
                      </button>
                    </div>

                    <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                      {group.permissions.map(perm => {
                        const isChecked = rolePermissions.includes(perm)
                        return (
                          <label
                            key={perm}
                            className={`flex items-center gap-2.5 p-2 rounded-lg border text-xs font-medium cursor-pointer transition select-none ${
                              isChecked
                                ? 'bg-red-50/70 border-red-200 text-[#BF6159]'
                                : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                            }`}
                          >
                            <input
                              type='checkbox'
                              checked={isChecked}
                              onChange={() => togglePermission(perm)}
                              className='rounded border-gray-300 text-[#BF6159] focus:ring-[#BF6159] w-4 h-4'
                            />
                            <span>{perm}</span>
                          </label>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>

            <div className='modal-footer border-t pt-3'>
              <button type='button' onClick={() => setIsPermModalOpen(false)} className='btn-secondary'>
                Cancel
              </button>
              <button
                type='button'
                onClick={handleSaveRolePermissions}
                disabled={savingPerms}
                className='btn-primary'
              >
                <IoIosSave className='text-base' /> {savingPerms ? 'Saving...' : 'Save Permissions Matrix'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
