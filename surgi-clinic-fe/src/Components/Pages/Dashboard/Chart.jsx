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

// Sample Data
const data = [
  { day: 1, visits: 140, provisions: 160 },
  { day: 5, visits: 180, provisions: 200 },
  { day: 10, visits: 200, provisions: 220 },
  { day: 15, visits: 260, provisions: 250 },
  { day: 20, visits: 220, provisions: 210 },
  { day: 25, visits: 180, provisions: 170 },
  { day: 30, visits: 140, provisions: 150 }
]

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className='p-2 bg-white border rounded-md text-sm shadow-md'>
        <p className='font-semibold'>{`Day: ${label}`}</p>
        <p>{`Visits: ${payload[0].value}M`}</p>
        <p>{`Provisions: ${payload[1].value}M`}</p>
      </div>
    )
  }
  return null
}

// Ensure you're using this declaration
const Chart = () => {
  return (
    <div className='w-full h-64'>
      <h3 className='text-lg font-semibold mb-2'>Total Visits</h3>
      <ResponsiveContainer width='100%' height='100%'>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray='3 3' stroke='#E0E0E0' />
          <XAxis dataKey='day' tick={{ fontSize: 12 }} />
          <YAxis
            tickFormatter={value => `${value}M`}
            tick={{ fontSize: 12 }}
            domain={[140, 260]}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line
            type='monotone'
            dataKey='visits'
            stroke='#D66D75'
            strokeWidth={3}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type='monotone'
            dataKey='provisions'
            stroke='#F8B400'
            strokeWidth={2}
            strokeDasharray='5 5'
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

export default Chart // This should remain as default export
