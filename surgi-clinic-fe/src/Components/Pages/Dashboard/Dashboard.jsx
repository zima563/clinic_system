import React, { useState, useEffect } from 'react'
import { FaArrowUp, FaUserMd, FaUserInjured, FaCalendarCheck, FaMoneyBillWave } from 'react-icons/fa'
import Chart from './Chart'
import CalendarComponent from './CalendarComponent'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'

const Dashboard = () => {
  const [value, setValue] = useState(new Date())
  const [stats, setStats] = useState({
    totalPatients: 0,
    totalDoctors: 0,
    totalAppointments: 0,
    totalServices: 0,
    totalIncome: 0,
    totalExpenses: 0,
    netProfit: 0,
    chartData: [],
    appointmentDates: [],
    upcomingAppointments: []
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardStats()
  }, [])

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${getToken()}` }
      })
      setStats(response.data)
    } catch (error) {
      console.error('Failed to load dashboard stats:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      style={{ maxHeight: 'calc(100vh - 100px)' }}
      className='overflow-y-auto custom-scroll'
    >
      <div className='p-4 flex flex-wrap gap-4'>
        {/* Main Section */}
        <div className='flex-1 flex flex-col gap-4'>
          {/* Header & Stats Section */}
          <div className='flex gap-4'>
            {/* Stats Section */}
            <div className='grid grid-cols-4 gap-4 w-full'>
              <div className='flex flex-col items-center bg-red-50 border border-red-200 p-4 rounded-md w-full'>
                <h2 className='text-sm font-semibold text-red-500 flex items-center gap-1'>
                  <FaCalendarCheck /> Total Appointments
                </h2>
                <p className='text-3xl font-bold text-gray-800 mt-1'>{stats.totalAppointments}</p>
              </div>

              <div className='flex flex-col items-center bg-blue-50 border border-blue-200 p-4 rounded-md w-full'>
                <h2 className='text-sm font-semibold text-blue-500 flex items-center gap-1'>
                  <FaUserMd /> Total Doctors
                </h2>
                <p className='text-3xl font-bold text-gray-800 mt-1'>{stats.totalDoctors}</p>
              </div>

              <div className='flex flex-col items-center bg-green-50 border border-green-200 p-4 rounded-md w-full'>
                <h2 className='text-sm font-semibold text-green-500 flex items-center gap-1'>
                  <FaUserInjured /> Total Patients
                </h2>
                <p className='text-3xl font-bold text-gray-800 mt-1'>{stats.totalPatients}</p>
              </div>

              <div className='flex flex-col items-center bg-purple-50 border border-purple-200 p-4 rounded-md w-full'>
                <h2 className='text-sm font-semibold text-purple-600 flex items-center gap-1'>
                  <FaMoneyBillWave /> Net Profit
                </h2>
                <p className='text-3xl font-bold text-gray-800 mt-1'>{stats.netProfit} L.E</p>
              </div>
            </div>
          </div>

          {/* Chart Section */}
          <div className='bg-gray-50 border border-gray-200 p-4 rounded-md w-full h-72 flex items-center justify-center'>
            <Chart data={stats.chartData} />
          </div>
        </div>

        {/* Calendar Section */}
        <div className='w-80 bg-white rounded-md border border-gray-200 p-2'>
          <CalendarComponent
            appointmentDates={stats.appointmentDates}
          />
        </div>
      </div>

      <div className='flex gap-6 p-4 '>
        {/* Upcoming Appointments Overview */}
        <div className='w-3/4 bg-white p-4 rounded-lg border border-gray-200'>
          <h3 className='text-lg font-semibold text-gray-700'>
            Upcoming Appointments
          </h3>
          <div className='mt-4 overflow-auto'>
            <table className='min-w-full text-left text-sm'>
              <thead className='border-b bg-gray-50'>
                <tr>
                  <th className='py-2 px-3'>#</th>
                  <th className='px-3'>Patient</th>
                  <th className='px-3'>Doctor</th>
                  <th className='px-3'>Service</th>
                  <th className='px-3'>Date & Time</th>
                  <th className='px-3'>Status</th>
                </tr>
              </thead>
              <tbody>
                {stats.upcomingAppointments && stats.upcomingAppointments.length > 0 ? (
                  stats.upcomingAppointments.map((app, index) => (
                    <tr key={app.id || index} className='border-b hover:bg-gray-50'>
                      <td className='py-2 px-3'>{index + 1}</td>
                      <td className='px-3 font-medium'>{app.patient?.name || 'N/A'}</td>
                      <td className='px-3'>{app.schedule?.doctor?.name || 'N/A'}</td>
                      <td className='px-3'>{app.schedule?.service?.title || 'General'}</td>
                      <td className='px-3'>{new Date(app.dateTime).toLocaleString()}</td>
                      <td className='px-3'>
                        <span className='px-2 py-1 bg-yellow-100 text-yellow-800 rounded text-xs capitalize'>
                          {app.status || 'pending'}
                        </span>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className='py-4 text-center text-gray-500'>
                      No upcoming appointments found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Financial Summary */}
        <div className='bg-white w-1/4 p-4 rounded-lg border border-gray-200 flex flex-col justify-between'>
          <div>
            <h3 className='text-lg font-semibold text-gray-700 mb-4'>Financial Summary</h3>
            <div className='space-y-4'>
              <div className='p-3 bg-green-50 border border-green-200 rounded-md'>
                <p className='text-sm text-green-700 font-medium'>Total Income</p>
                <p className='text-2xl font-bold text-green-800'>{stats.totalIncome} L.E</p>
              </div>
              <div className='p-3 bg-red-50 border border-red-200 rounded-md'>
                <p className='text-sm text-red-700 font-medium'>Total Expenses</p>
                <p className='text-2xl font-bold text-red-800'>{stats.totalExpenses} L.E</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Dashboard
