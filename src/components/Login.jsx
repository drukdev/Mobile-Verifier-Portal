import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useForm } from 'react-hook-form';
import logo from '../assets/images/logo.png';
import rightImage from '../assets/images/right-image.png';

const Login = () => {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleExternalAuthSubmit = async (data) => {
    const { clientId, clientSecret } = data;
    const auth_api_url = import.meta.env.VITE_AUTH_API_URL;
    const role = import.meta.env.VITE_ROLE;
    //const auth_api_url = 'https://staging.bhutanndi.com/authentication/v1/authenticate'
    //const role = 'admin'
    console.log(`role is ${role}`)


    setLoading(true);
    setError('');

    try {
      const response = await fetch(auth_api_url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          grant_type: 'client_credentials',
          client_id: clientId,
          client_secret: clientSecret,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Authentication failed');
      }

      const { access_token, expires_in } = await response.json();
      const expiryTime = new Date().getTime() + expires_in * 1000;
      console.log("token tashi: " + access_token)
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('authTokenExpiry', expiryTime);
      login(access_token, expiryTime);
      if (role == "client") {
       navigate('/dashboard/verifier-role');
       console.log(`role: ${role}`);
      }
       else if (role == "admin") {
        navigate('/dashboard/create-organization');
       }
        else {
          navigate('/dashboard/')
        }
    } catch (error) {
      setError(error.message || 'Authentication failed. Please check your credentials.');
      toast.error(error.message || 'Authentication failed. Please check your credentials.', {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-white">
      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 pl-6 md:pl-10 bg-white">
        <div className="flex justify-start pl-1 md:pl-4">
          <img className="h-12 md:h-16 w-auto" src={logo} alt="Logo" />
        </div>
        <div className="flex-grow flex items-center justify-center pl-16 pb-8 md:pb-32">
          <div className="w-full max-w-sm">
            <h2 className="mt-6 text-center text-2xl md:text-3xl font-extrabold text-gray-900">Kuzuzangpo!</h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              <span className="text-emerald-400">Login</span> to your Admin Dashboard
            </p>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
            <form onSubmit={handleSubmit(handleExternalAuthSubmit)} className="mt-6 space-y-4">
              <input type="hidden" name="remember" value="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                {/* Client ID Input */}
                <div className="mb-4">
                  <label htmlFor="clientId" className="sr-only">
                    Client ID
                  </label>
                  <input
                    id="clientId"
                    type="text"
                    {...register('clientId', { required: 'Client ID is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400 transition-colors"
                    placeholder="Enter Client ID"
                  />
                  {errors.clientId && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientId.message}</p>
                  )}
                </div>
                {/* Client Secret Input */}
                <div className="mb-6">
                  <label htmlFor="clientSecret" className="sr-only">
                    Client Secret
                  </label>
                  <input
                    id="clientSecret"
                    type="password"
                    {...register('clientSecret', { required: 'Client Secret is required' })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-emerald-400 focus:border-emerald-400 hover:border-emerald-400 transition-colors"
                    placeholder="Enter Client Secret"
                  />
                  {errors.clientSecret && (
                    <p className="text-red-500 text-sm mt-1">{errors.clientSecret.message}</p>
                  )}
                </div>
              </div>
              {/* Submit Button */}
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-emerald-400 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? (
                    <div className="flex items-center justify-center">
                      <svg
                        className="animate-spin h-5 w-5 mr-3 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Authenticating...
                    </div>
                  ) : (
                    'Login'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side: Background Image */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center p-8 md:p-16 bg-white"
        style={{
          backgroundImage: `url(${rightImage})`,
          backgroundSize: '60%',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
        }}
      ></div>
    </div>
  );
};

export default Login;