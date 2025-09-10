'use client';
import { base_url } from '@/utils/utils';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import Swal from 'sweetalert2';

export default function OtpVerificationForm({ email }) {
  const [otp, setOtp] = useState('');
  const [resending, setResending] = useState(false);
  const [countdown, setCountdown] = useState(60); // 1 minute in seconds
  const router = useRouter();

  useEffect(() => {
    let timer;
    if (countdown > 0) {
      timer = setTimeout(() => setCountdown(countdown - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [countdown]);

  const handleOtpSubmit = async (e) => {
    e.preventDefault();
    const verificationData = {
      email: decodeURIComponent(email),
      otp
    };

    const resp = await axios.post(`${base_url}/user/otp-verification`, verificationData);

    if (resp.status === 201) {
     await Swal.fire({
  title: "Verification Successful!",
  text: "Please complete the registration process within 30 minutes",
  icon: "success"
});
      router.push(`/register/${email}`);
    }
  };

  const handleResendClick = async () => {
    try {
      setResending(true);
      const emailData = {
        email: decodeURIComponent(email)
      };
      
      const resp = await axios.post(`${base_url}/user/otp`, emailData);
      
      if (resp.status === 200) {
        await Swal.fire({
          title: "Verification Code Sent!",
          text: "Please check your email!",
          icon: "success"
        });
        // Reset countdown
        setCountdown(60);
      }
    } catch (error) {
      await Swal.fire({
        title: "Something went wrong!",
        text: error.message,
        icon: "error"
      });
    } finally {
      setResending(false);
    }
  };

  // Format countdown to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="flex justify-center  items-center min-h-screen bg-gray-900 px-4">
      <div className="bg-black bg-opacity-70 p-8 rounded-lg max-w-md w-full shadow-xl">
        <h2 className="text-white text-2xl font-bold mb-4 text-center">
          Please Complete Verification
        </h2>
        <p className="text-gray-300 mb-6 text-center">
          Please check your email and enter your confirmation code below.
        </p>

        <form onSubmit={handleOtpSubmit} className="space-y-5">
          <div>
            <label htmlFor="email" className="block text-sm text-gray-300 mb-1">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              value={decodeURIComponent(email)}
              readOnly
              disabled
              className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white placeholder-gray-400 cursor-not-allowed"
            />
          </div>

          <div>
            <label htmlFor="otp" className="block text-sm text-gray-300 mb-1">
              Confirmation Code
            </label>
            <input
              type="text"
              id="otp"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="Enter your code"
              className="w-full px-4 py-3 rounded-md bg-gray-800 border border-gray-700 text-white focus:bg-gray-700 focus:outline-none placeholder-gray-400 transition duration-200"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md transition duration-200 transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50"
          >
            Verify Code
          </button>

          <div className="text-center mt-4">
            <p className="text-sm text-gray-400 mb-1">
              Didn't receive the code?
            </p>

            {countdown > 0 ? (
              <button
                type="button"
                disabled
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md cursor-not-allowed opacity-70"
              >
                Resend Code in {formatTime(countdown)}
              </button>
            ) : (
              <button
                type="button"
                onClick={handleResendClick}
                disabled={resending}
                className="w-full bg-primary text-white font-bold py-3 px-4 rounded-md transition duration-200 transform cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {resending ? 'Sending...' : 'Resend Code'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}