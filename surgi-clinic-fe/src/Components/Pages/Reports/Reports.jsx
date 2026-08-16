import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { API_URL, getToken } from '../../../config'
import { FaFileInvoiceDollar, FaChartPie, FaCalendarCheck, FaPrint } from 'react-icons/fa'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchReportData()
  }, [])

  const fetchReportData = async () => {
    try {
      const token = getToken()
      const res = await axios.get(`${API_URL}/api/dashboard/stats`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      setStats(res.data)
    } catch (err) {
      console.error('Failed to load report metrics:', err)
    } finally {
      setLoading(false)
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div style={{ maxHeight: 'calc(100vh - 50px)' }} className='p-6 overflow-y-auto custom-scroll print:p-0'>
      <div className='flex justify-between items-center mb-6 print:hidden'>
        <div>
          <h2 className='text-3xl font-bold text-[#BF6159]'>System Reports</h2>
          <p className='text-sm text-gray-500 mt-1'>Comprehensive financial & operational performance summary</p>
        </div>
        <button
          onClick={handlePrint}
          className='flex items-center gap-2 bg-gray-800 text-white px-4 py-2 rounded-lg hover:bg-black transition font-medium'
        >
          <FaPrint /> Print Report
        </button>
      </div>

      {loading ? (
        <div className='p-8 text-center text-gray-500'>Generating reports...</div>
      ) : stats ? (
        <div className='space-y-6'>
          {/* Executive Summary Cards */}
          <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
            <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
              <div className='flex items-center gap-3 text-green-600 mb-2'>
                <FaFileInvoiceDollar className='text-xl' />
                <span className='text-sm font-semibold uppercase tracking-wider'>Total Income</span>
              </div>
              <p className='text-2xl font-bold text-gray-900'>{stats.totalIncome} L.E</p>
            </div>

            <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
              <div className='flex items-center gap-3 text-red-500 mb-2'>
                <FaFileInvoiceDollar className='text-xl' />
                <span className='text-sm font-semibold uppercase tracking-wider'>Total Expenses</span>
              </div>
              <p className='text-2xl font-bold text-gray-900'>{stats.totalExpenses} L.E</p>
            </div>

            <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
              <div className='flex items-center gap-3 text-purple-600 mb-2'>
                <FaChartPie className='text-xl' />
                <span className='text-sm font-semibold uppercase tracking-wider'>Net Revenue</span>
              </div>
              <p className='text-2xl font-bold text-gray-900'>{stats.netProfit} L.E</p>
            </div>

            <div className='bg-white p-5 rounded-xl border border-gray-200 shadow-sm'>
              <div className='flex items-center gap-3 text-blue-600 mb-2'>
                <FaCalendarCheck className='text-xl' />
                <span className='text-sm font-semibold uppercase tracking-wider'>Total Appointments</span>
              </div>
              <p className='text-2xl font-bold text-gray-900'>{stats.totalAppointments}</p>
            </div>
          </div>

          {/* Monthly Breakdown Table */}
          <div className='bg-white rounded-xl shadow-sm border border-gray-200 p-6'>
            <h3 className='text-lg font-bold text-gray-800 mb-4'>Monthly Financial Breakdown</h3>
            <div className='overflow-x-auto'>
              <table className='min-w-full text-left text-sm'>
                <thead className='bg-gray-50 border-b text-gray-700 font-semibold'>
                  <tr>
                    <th className='py-3 px-4'>Month</th>
                    <th className='px-4'>Income (L.E)</th>
                    <th className='px-4'>Expenses (L.E)</th>
                    <th className='px-4'>Net Balance</th>
                  </tr>
                </thead>
                <tbody className='divide-y divide-gray-100'>
                  {stats.chartData.map((row, idx) => (
                    <tr key={idx} className='hover:bg-gray-50'>
                      <td className='py-3 px-4 font-medium text-gray-700'>{row.month}</td>
                      <td className='px-4 text-green-600 font-semibold'>{row.income}</td>
                      <td className='px-4 text-red-500 font-semibold'>{row.expenses}</td>
                      <td className={`px-4 font-bold ${row.income - row.expenses >= 0 ? 'text-gray-900' : 'text-red-600'}`}>
                        {row.income - row.expenses} L.E
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className='p-8 text-center text-gray-500'>Unable to load reports.</div>
      )}
    </div>
  )
}
