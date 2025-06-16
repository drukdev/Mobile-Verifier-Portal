import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast, ToastContainer } from 'react-toastify';
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
  const [role, setRole] = useState('client'); // 'client' or 'admin'
  const navigate = useNavigate();
  const { login } = useAuth();

  const toggleRole = () => {
    setRole(prevRole => (prevRole === 'client' ? 'admin' : 'client'));
  };

  const playSound = type => {
    try {
      const soundFile = type === 'success' ? '/sounds/success.mp3' : '/sounds/failure.mp3';
      const audio = new Audio(soundFile);
      audio.play().catch(e => console.log(`${type} sound play failed:`, e));
    } catch (e) {
      console.log(`${type} sound initialization failed:`, e);
    }
  };

  const showSuccessToast = () => {
    return new Promise(resolve => {
      toast.success('Login successful! Redirecting...', {
        position: 'top-right',
        autoClose: 2000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
        onClose: resolve,
      });
    });
  };

  const handleExternalAuthSubmit = async data => {
    const { clientId, clientSecret } = data;
    const auth_api_url = import.meta.env.VITE_AUTH_API_URL;
    setLoading(true);
    setError('');
    try {
      const response = await fetch(`${auth_api_url}/authentication/v1/authenticate`, {
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
        let errorMessage = '';
        if (response.status === 400) {
          errorMessage = 'Invalid Client ID or Secret';
        } else if (response.status === 404) {
          errorMessage = 'Backend API not found/not reachable';
        } else if (response.status === 403) {
          errorMessage = 'Forbidden: Access denied';
        } else {
          errorMessage = 'An unexpected error occurred';
        }
        throw new Error(errorMessage);
      }
      const responseData = await response.json();
      const { access_token, expires_in } = responseData;
      const expiryTime = new Date().getTime() + expires_in * 1000;
      localStorage.setItem('authToken', access_token);
      localStorage.setItem('authTokenExpiry', expiryTime);
      localStorage.setItem('userRole', role);
      login(access_token, expiryTime, role);
      playSound('success');
      await showSuccessToast();

      if (role === 'client') {
        navigate('/dashboard/verifier-role');
      } else if (role === 'admin') {
        navigate('/dashboard/create-organization');
      } else {
        navigate('/dashboard/');
      }
    } catch (error) {
      setError(error.message);
      playSound('error');
      toast.error(error.message, {
        position: 'top-right',
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: 'colored',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="colored"
      />

      {/* Left Side: Login Form */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 pl-6 md:pl-10 bg-white">
        <div className="flex justify-start pl-1 md:pl-4">
          <img className="h-12 md:h-16 w-auto" src={logo} alt="Logo" />
        </div>

        <div className="mt-8 text-center">
          <h2 className="text-2xl ml-10 md:text-3xl font-bold text-gray-700">Mobile Verifier Portal</h2>
        </div>

        <div className="flex-grow flex items-center justify-center pl-16 pb-2 md:pb-32">
          <div className="w-full max-w-sm">
            <h4 className="mt-2 text-center text-xl font-medium text-gray-700">Kuzuzangpo!</h4>

            <p className="mt-1 text-center text-lg font-semibold text-gray-700">
              Logging in as{' '}
              <span className="text-emerald-600 font-bold">
                {role === 'client' ? 'Client Admin' : 'NDI Admin'}
              </span>
            </p>

            <div className="text-center mt-8">
              <button
                onClick={toggleRole}
                className="text-emerald-600 hover:text-emerald-800 text-sm font-medium underline focus:outline-none transition-colors"
              >
                Switch to {role === 'client' ? 'NDI Admin' : 'Client Admin'}
              </button>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-md p-3 mt-4">
                <p className="text-red-700 text-sm text-center">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit(handleExternalAuthSubmit)} className="mt-6 space-y-5">
              <input type="hidden" name="remember" value="true" />
              <div className="space-y-4">
                <div>
                  <label htmlFor="clientId" className="block text-sm font-medium text-gray-700 mb-1">
                    Client ID
                  </label>
                  <input
                    id="clientId"
                    type="text"
                    {...register('clientId', {
                      required: 'Client ID is required',
                      minLength: {
                        value: 3,
                        message: 'Client ID must be at least 3 characters',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 transition-colors"
                    placeholder="Enter Client ID"
                  />
                  {errors.clientId && (
                    <p className="text-red-600 text-sm mt-1">{errors.clientId.message}</p>
                  )}
                </div>
                <div>
                  <label htmlFor="clientSecret" className="block text-sm font-medium text-gray-700 mb-1">
                    Client Secret
                  </label>
                  <input
                    id="clientSecret"
                    type="password"
                    {...register('clientSecret', {
                      required: 'Client Secret is required',
                      minLength: {
                        value: 6,
                        message: 'Client Secret must be at least 6 characters',
                      },
                    })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 hover:border-gray-400 transition-colors"
                    placeholder="Enter Client Secret"
                  />
                  {errors.clientSecret && (
                    <p className="text-red-600 text-sm mt-1">{errors.clientSecret.message}</p>
                  )}
                </div>
              </div>
              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-2 px-4 bg-emerald-600 text-white font-semibold rounded-md hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
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