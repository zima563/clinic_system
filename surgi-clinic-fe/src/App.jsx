import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import Layout from './Components/Layout/Layout.jsx'
import Dashboard from './Components/Pages/Dashboard/Dashboard.jsx'
import PatientsTable from './Components/Pages/Patients/PatientsTable.jsx'
import PatientPage from './Components/Pages/Patients/PatientPage.jsx'
import DoctorPage from './Components/Pages/Doctors/DoctorPage.jsx'
import Requests from './Components/Pages/Requests/Requests.jsx'
import Users from './Components/Pages/Users/Users.jsx'
import Specialties from './Components/Pages/Specialties/Specialties.jsx'
import Services from './Components/Pages/Services/Services.jsx'
import Doctors from './Components/Pages/Doctors/Doctors.jsx'
import Reports from './Components/Pages/Reports/Reports.jsx'
import Settings from './Components/Pages/Settings/Settings.jsx'
import Appointments from './Components/Pages/Appointments/Appointments.jsx'
import Schedule from './Components/Pages/Schedule/Schedule.jsx'
import Visits from './Components/Pages/Visits/Visits.jsx'
import Login from './Components/Login/Login.jsx'
import Income from './Components/Pages/Income/Income.jsx'
import Expenses from './Components/Pages/Expenses/Expenses.jsx'
import Unauthorized from './Components/Unauthorized/Unauthorized.jsx'
import PrivateRoute from './Components/PrivateRoute'

const routes = [
  { path: '/', element: <Dashboard />, permissions: ['getAppointment'] },
  {
    path: '/PatientsTable',
    element: <PatientsTable />,
    permissions: ['listPatient']
  },
  {
    path: '/patient/:id',
    element: <PatientPage />,
    permissions: ['getPatient']
  },
  {
    path: '/doctor/:id',
    element: <DoctorPage />,
    permissions: ['showDoctorDetails']
  },
  { path: '/Doctors', element: <Doctors />, permissions: ['listDoctors'] },
  {
    path: '/Specialties',
    element: <Specialties />,
    permissions: ['allSpecialtys']
  },
  { path: '/Services', element: <Services />, permissions: ['allServices'] },
  {
    path: '/Appointments',
    element: <Appointments />,
    permissions: ['getAppointment']
  },
  { path: '/Schedule', element: <Schedule />, permissions: ['listSchedules'] },
  { path: '/Visits', element: <Visits />, permissions: ['getAllVisits'] },
  {
    path: '/Reports',
    element: <Reports />,
    permissions: ['summarized_report']
  },
  { path: '/Settings', element: <Settings />, permissions: ['allUsers'] },
  { path: '/requests', element: <Requests />, permissions: ['getRequests'] },
  { path: '/users', element: <Users />, permissions: ['allUsers'] },
  { path: '/Income', element: <Income />, permissions: ['listInvoice'] },
  { path: '/Expenses', element: <Expenses />, permissions: ['listInvoice'] }
]

import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

function App () {
  return (
    <Router>
      <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} newestOnTop closeOnClick pauseOnFocusLoss draggable pauseOnHover theme="colored" />
      <Routes>
        {/* Public Routes */}
        <Route path='/login' element={<Login />} />
        <Route path='/unauthorized' element={<Unauthorized />} />

        {/* Protected Routes */}
        <Route
          path='*'
          element={
            <PrivateRoute>
              <Layout>
                <Routes>
                  {routes.map(({ path, element, permissions }) => (
                    <Route
                      key={path}
                      path={path}
                      element={
                        <PrivateRoute requiredPermissions={permissions}>
                          {element}
                        </PrivateRoute>
                      }
                    />
                  ))}
                </Routes>
              </Layout>
            </PrivateRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
