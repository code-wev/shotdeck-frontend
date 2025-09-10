'use client'
import { base_url } from '@/utils/utils';
import { Route } from '@mui/icons-material';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';
import { toast } from 'react-toastify';
import Swal from 'sweetalert2';

export default function Register({email}) {
  const [formData, setFormData] = useState({
    name: '',
    password: '',
    confirmPassword: '',
    primaryIndustry: '',
    companyName: '',
    schoolName: '',
    otherDetails: ''
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const industries = [
    'Advertising',
    'Film',
    'Television',
    'Digital Media',
    'Gaming',
    'Education',
    'Other'
  ];

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const minLength = password.length >= 8;
    const hasWord = /[a-zA-Z]+/.test(password);
    return minLength && hasWord;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const newErrors = {};

      if (!formData.name) newErrors.name = 'Name is required';
      if (!validatePassword(formData.password)) newErrors.password = 'Password must be at least 8 characters and contain at least one letter';
      if (formData.password !== formData.confirmPassword) newErrors.confirmPassword = 'Passwords do not match';
      if (!formData.primaryIndustry) newErrors.primaryIndustry = 'Primary industry is required';

      setErrors(newErrors);
      
      if (Object.keys(newErrors).length === 0) {
        if (!email) {
          throw new Error('Email is required');
        }

        const output = {
          email: decodeURIComponent(email),
          name: formData.name,
          password: formData.password,
          primaryIndustry: formData.primaryIndustry,
          companyName: formData.companyName,
          schoolName: formData.schoolName,
          otherDetails: formData.otherDetails,
          others: []
        };

        console.log(output, 'this is output of the hamsa')

        if (formData.companyName) output.others.push({ companyName: formData.companyName });
        if (formData.schoolName) output.others.push({ schoolName: formData.schoolName });
        if (formData.otherDetails) output.others.push({ otherDetails: formData.otherDetails });

        const { data } = await axios.post(`${base_url}/user/create`, output);
        console.log(data, 'registration response');

        if (data.message     === "Registration successful"    ) {
          await Swal.fire({
            title: "Successfully Registered!",
            text: 'Now redirecting to login',
            icon: "success"
          });
          router.push('/sign-in');
        }
      }
    } catch (error) {
      console.error('Registration error:', error);
      await Swal.fire({
        title: "Registration Failed",
        text: error?.response?.data?.message || error.message || 'An error occurred during registration',
        icon: "error"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen px-4">
      <form onSubmit={handleSubmit} className="border border-gray-300 bg-opacity-80 p-8 rounded-lg w-full max-w-5xl">
        <h2 className="text-3xl font-bold mb-6 text-center text-white">Register</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Left Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Full Name*</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your full name"
              />
              {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Password*</label>
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="At least 8 characters"
              />
              {errors.password && <p className="text-red-500 text-xs mt-1">{errors.password}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Confirm Password*</label>
              <input
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Confirm your password"
              />
              {errors.confirmPassword && <p className="text-red-500 text-xs mt-1">{errors.confirmPassword}</p>}
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Select Your Primary Industry*</label>
              <select
                name="primaryIndustry"
                value={formData.primaryIndustry}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Industry</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {errors.primaryIndustry && <p className="text-red-500 text-xs mt-1">{errors.primaryIndustry}</p>}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your company (optional)"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">School/University Name</label>
              <input
                type="text"
                name="schoolName"
                value={formData.schoolName}
                onChange={handleChange}
                className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Your school (optional)"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-medium text-gray-300 mb-1">Other Details</label>
          <textarea
            name="otherDetails"
            value={formData.otherDetails}
            onChange={handleChange}
            className="w-full px-4 py-2 border border-gray-700 rounded-md bg-gray-800 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            rows="2"
            placeholder="Any additional information"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="px-6 cursor-pointer mt-8 bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? 'Registering...' : 'Register'}
        </button>
      </form>
    </div>
  );
}