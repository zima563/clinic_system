import React from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer
} from 'recharts'

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='p-2 bg-white border rounded-md text-sm shadow-md'>
        <p className='font-semibold'>{`Month: ${label}`}</p>
        <p className='text-green-600'>{`Income: ${payload[0]?.value || 0} L.E`}</p>
        <p className='text-red-500'>{`Expenses: ${payload[1]?.value || 0} L.E`}</p>
      </div>
    )
  }
  return null
}

const Chart = ({ data = [] }) => {
  return (
    <div className='w-full h-64'>
      <h3 className='text-lg font-semibold mb-2 text-gray-700'>Financial Trend (Income & Expenses)</h3>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data.length > 0 ? data : [
          { month: 'Jan', income: 0, expenses: 0 },
          { month: 'Feb', income: 0, expenses: 0 },
          { month: 'Mar', income: 0, expenses: 0 }
        ]}>
          <CartesianGrid strokeDasharray='3 3' stroke='#E0E0E0' />
          <XAxis dataKey='month' tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={value => `${value}`}
            tick={{ fontSize: 12 }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type='monotone'
            dataKey='income'
            name='Income'
            stroke='#10B981'
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='expenses'
            name='Expenses'
            stroke='#EF4444'
            strokeWidth={2}
            strokeDasharray='5 5'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart
