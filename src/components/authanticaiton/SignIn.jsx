'use client'
import React, { useState } from 'react';
import Link from 'next/link';
import {signIn} from 'next-auth/react'
import { useRouter } from 'next/navigation';
import axios from 'axios';
import Swal from 'sweetalert2';
import coverImg from '@/assets/cover/cover.jpg'
import { base_url } from '@/utils/utils';

export default function SignIn() {

  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };
const handleSubmit = async (e) => {
  e.preventDefault();
  setLoading(true);
  
  const newErrors = {};
  if (!formData.email) newErrors.email = 'Email is required';
  if (!formData.password) newErrors.password = 'Password is required';
  
  setErrors(newErrors);
  
  if (Object.keys(newErrors).length === 0) {
    try {
      const { data } = await axios.post(`${base_url}/user/login`, formData);
      const { id, token, role } = data.userData;
      console.log(id, token, role)

    
    

     const res = await signIn("credentials", {
      redirect: false, 
      id,
      token,
      role,
    
    });

    console.log(res, 'logine')

    if(res.status===200){
       await Swal.fire({
        title: 'Login Successful!',
        icon: 'success',
        timer: 1500
      });

router.push('/')
    }
     
      
      // router.push('/dashboard');
    } catch (error) {
      Swal.fire({
        title: 'Login Failed',
        text: error.response?.data?.message || error.message || 'Invalid credentials',
        icon: 'error'
      });
    }
  }
  setLoading(false);
};



  const handleForgotPassword = () => {
    Swal.fire({
      title: 'Reset Password',
      input: 'email',
      inputPlaceholder: 'Enter your email address',
      showCancelButton: true,
      confirmButtonText: 'Reset Password',
      showLoaderOnConfirm: true,
      
      preConfirm: async (email) => {

           const hi =   await axios.post(`${base_url}/user/reset-pass`, { email });
           console.log(hi, 'hi opi')
        try {
          await axios.post(`${base_url}/user/reset-pass`, { email });
          return { success: true };
        } catch (error) {
          Swal.showValidationMessage(
            `Request failed: ${error.response?.data?.message || error.message}`
          );
        }
      },
      allowOutsideClick: () => !Swal.isLoading()
    }).then((result) => {
      if (result.isConfirmed && result.value?.success) {
        Swal.fire(
          'Email Sent!',
          'Check your email for password reset instructions',
          'success'
        );
      }
    });
  };

  return (
    <div     className="w-full h-screen min-h-screen bg-cover bg-center my-auto  "
          style={{ backgroundImage: `url(${coverImg.src})` }}>
      <form onSubmit={handleSubmit} className=" bg-opacity-70 p-8 rounded-lg shadow-lg w-full  max-w-2xl mx-auto pt-52   space-y-4">
        <h2 className="text-2xl font-bold mb-6 text-center text-white">Sign In</h2>
        
        <div className=''>
          <label className="block text-sm font-medium text-gray-300 mb-1">Email*</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="your@email.com"
          />
          {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-1">Password*</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="••••••••"
          />
          {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
        </div>
        
        <div className="flex justify-between items-center">
          <div className="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              className="h-4 w-4 rounded border-gray-700 bg-gray-800 focus:ring-blue-500"
            />
            <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>
          
          <button
            type="button"
            onClick={handleForgotPassword}
            className="text-sm text-blue-400 hover:text-blue-300"
          >
            Forgot password?
          </button>
        </div>
        
        <button
          type="submit"
          disabled={loading}
          className={`w-full py-2 px-4 rounded-md text-white font-medium ${loading ? 'bg-gray-700' : 'bg-gray-600 hover:bg-gray-700'} transition duration-200`}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
        
        <div className="text-center text-sm text-gray-400">
          Don't have an account?{' '}
          <Link href="/sign-up" className="text-blue-400 hover:text-blue-300">
            Register here
          </Link>
        </div>
      </form>
    </div>
  );
}