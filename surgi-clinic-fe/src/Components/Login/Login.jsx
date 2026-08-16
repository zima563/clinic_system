import React, { useState } from 'react'
import './LoginPage.css'
import LoginPhoto from '../../assets/login-photo.png' // Adjust path as needed
import Logo from '../../assets/Logo.png' // Adjust path for your logo
import { Formik, Form, Field, ErrorMessage } from 'formik'
import * as Yup from 'yup'
import { API_URL } from '../../config'

import axios from 'axios'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom' // Import useNavigate

export default function Login () {
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(false)
  const navigate = useNavigate() // Initialize useNavigate

  // Validation Schema
  const validationSchema = Yup.object().shape({
    emailOrPhone: Yup.string()
      .required('Email or Phone is required')
      .test('email-or-phone', 'Email or Phone must be valid', value => {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/
        const phoneRegex = /^[0-9]{10}$/ // Adjust phone format as necessary
        return emailRegex.test(value) || phoneRegex.test(value)
      }),

    password: Yup.string()
      .min(8, 'Password must be at least 8 characters')
      .matches(/[A-Z]/, 'Password must contain at least one uppercase letter')
      .matches(/[0-9]/, 'Password must contain at least one number')
      .matches(
        /[^A-Za-z0-9]/,
        'Password must contain at least one special character'
      )
      .required('Password is required')
  })

  // Form Submission Handler
  const handleSubmit = async values => {
    console.log('Form values:', values)
    try {
      const response = await axios.post(
        `${API_URL}/api/users/login`,
        {
          emailOrPhone: values.emailOrPhone,
          password: values.password
        },
        {
          headers: {
            'Content-Type': 'application/json'
          }
        }
      )

      console.log('Login successful:', response.data)
      toast.success('Login successful!')

      // Store login state (token, permissions, etc.)
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('token', response.data.token)
      localStorage.setItem(
        'permissions',
        JSON.stringify(response.data.permissions)
      ) // Storing permissions as JSON

      // Ensure navigate is called after setting the localStorage values
      navigate('/') // Redirect to Dashboard
    } catch (error) {
      console.error('Login failed:', error)
      toast.error('Login failed')
    }
  }

  return (
    <>
      <div className='LoginPageContainer flex h-screen w-full justify-between'>
        {/* Left Side (Form Section) */}
        <div className='LeftSection relative flex flex-col justify-center px-8 w-1/2'>
          {/* Logo */}
          <div className='LogoContainer flex absolute ps-[74px] left-0 top-0 justify-center'>
            <img src={Logo} alt='Logo' className='m-auto' />
          </div>

          {/* Formik Form */}
          <Formik
            initialValues={{ emailOrPhone: '', password: '' }}
            validationSchema={validationSchema}
            onSubmit={handleSubmit}
          >
            {({ errors, touched }) => (
              <Form className='FormContainer space-y-6'>
                <div className='Content text-center mb-[28px]'>
                  <h3 className='text-[51.23px] font-[700] w-full '>
                    Welcome back
                  </h3>
                  <p className='text-nowrap'>
                    Already know Marina Clinic?{' '}
                    <a
                      href='#'
                      className='text-[#BF6159] text-[21.35px] font-[500] leading-[40px] underline'
                    >
                      Log in
                    </a>
                  </p>
                </div>

                {/* Email or Phone Field */}
                <div>
                  <label className='block text-black text-[15px] font-[400] leading-[28px] mb-1'>
                    Email or Phone
                  </label>
                  <Field
                    type='text'
                    name='emailOrPhone'
                    placeholder='Email or Phone'
                    className={`placeholder-black w-full p-3 border-[1.07px] rounded-[10.67px] mb-[14.9] focus:outline-none ${
                      errors.emailOrPhone && touched.emailOrPhone
                        ? 'border-red-500'
                        : 'border-[#B6B6B8]'
                    }`}
                  />
                  <ErrorMessage
                    name='emailOrPhone'
                    component='div'
                    className='text-red-500 text-sm mt-1'
                  />
                </div>

                {/* Password Field */}
                <div>
                  <label className='block text-black text-[15px] font-[400] leading-[28px] mb-1'>
                    Your password
                  </label>
                  <div className='relative'>
                    <Field
                      type={showPassword ? 'text' : 'password'}
                      name='password'
                      placeholder='•••••••••'
                      className={`w-full p-3 border-[1.07px] rounded-[10.67px] mb-[14.9] focus:outline-none ${
                        errors.password && touched.password
                          ? 'border-red-500'
                          : 'border-[#B6B6B8]'
                      }`}
                    />
                    <button
                      type='button'
                      onClick={() => setShowPassword(!showPassword)}
                      className='absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-600 focus:outline-none'
                    >
                      {showPassword ? '🔒' : '👁'}
                    </button>
                  </div>
                  <ErrorMessage
                    name='password'
                    component='div'
                    className='text-red-500 text-sm mt-1'
                  />
                </div>

                {/* Submit Button */}
                <button
                  type='submit'
                  className='w-full h-[51.75px] text-[17px] font-[700] bg-[#BF6159] rounded-[10.67px] leading-[23.48px] text-white py-3 hover:bg-[#AC5750] transition'
                >
                  Log in
                </button>

                {/* Remember Me & Forgot Password */}
                <div className='flex justify-between items-center mt-2 text-sm'>
                  <label className='flex items-center space-x-2'>
                    <Field
                      type='checkbox'
                      className='w-[25px] h-[25px] border-[#E5E5E5] rounded-[4.27px] border-[1.07px]'
                      name='remember'
                      checked={rememberMe}
                      onChange={() => setRememberMe(!rememberMe)}
                    />
                    <span className='text-[17px] font-[400] leading-[32px]'>
                      Remember me
                    </span>
                  </label>
                  <a
                    href='#'
                    className='text-[#BF6159] text-[17px] font-[500] leading-[23.48px] decoration-none'
                  >
                    Forgot password?
                  </a>
                </div>
              </Form>
            )}
          </Formik>
        </div>

        {/* Right Side (Image Section) */}
        <div className='w-1/2 h-screen flex items-center justify-end'>
          <img src={LoginPhoto} className='w-full h-full object-fit' />
        </div>
      </div>
    </>
  )
}
