import React from 'react'
import { Navigate } from 'react-router-dom'

// Helper to check permissions
export const hasPermission = requiredPermissions => {
  const userPermissions = JSON.parse(localStorage.getItem('permissions')) || []
  return requiredPermissions.every(permission =>
    userPermissions.includes(permission)
  )
}

const PrivateRoute = ({ children, requiredPermissions = [] }) => {
  const isLoggedIn = localStorage.getItem('isLoggedIn') === 'true'

  if (!isLoggedIn) {
    return <Navigate to='/login' />
  }

  if (!hasPermission(requiredPermissions)) {
    return <Navigate to='/unauthorized' /> // Redirect to an "Unauthorized" page
  }

  return children
}

export default PrivateRoute
