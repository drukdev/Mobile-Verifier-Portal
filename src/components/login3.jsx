import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify'; // For toast notifications
import 'react-toastify/dist/ReactToastify.css'; // Toast styles
import logo from '../assets/images/logo.png'; // Path to your logo
import rightImage from '../assets/images/right-image.png'; // Path to your right-side image

const Login = () => {
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [error, setError] = useState(''); // For inline error messages
  const [loading, setLoading] = useState(false); // Loading state
  const navigate = useNavigate();
  const { login } = useAuth();

  // Existing mock authentication handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Mock authentication for demonstration
    if (clientId === 'admin' && clientSecret === 'password') {
      const token = 'mock-token';
      const expiryTime = new Date().getTime() + 3600 * 1000; // 1 hour from now
      login(token, expiryTime);
      navigate('/dashboard');
    } else {
      setError('Invalid credentials');
    }
  };

  return (
    <div className="min-h-screen flex bg-gray-50">
      {/* Left Side - Login Form */}
      <div className="w-full md:w-1/2 flex flex-col p-6 md:p-8 pl-6 md:pl-10 bg-gray-50">
        {/* Logo at Top Left with Reduced Left Padding */}
        <div className="flex justify-start pl-1 md:pl-4">
          <img className="h-12 md:h-16 w-auto" src={logo} alt="Logo" />
        </div>

        {/* Login Form with Bottom Padding */}
        <div className="flex-grow flex items-center justify-center pl-16 pb-8 md:pb-32">
          <div className="w-full max-w-sm">
            <h2 className="mt-6 text-center text-2xl md:text-3xl font-extrabold text-gray-900">
              Kuzuzangpo!
            </h2>
            <p className="mt-2 text-center text-sm text-gray-600">
              <span className="text-green-500">Login</span> to your Admin Dashboard
            </p>
            {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}{' '}
            {/* Display error message */}
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <input type="hidden" name="remember" value="true" />
              <div className="rounded-md shadow-sm -space-y-px">
                {/* Client ID Field */}
                <div className="relative mb-4">
                  <label
                    htmlFor="clientId"
                    className={`absolute left-3 transition-all duration-200 ${
                      clientId
                        ? 'text-xs -top-3 text-green-600 bg-white px-1'
                        : 'text-sm top-2 text-gray-500'
                    }`}
                  >
                    Enter Client ID
                  </label>
                  <input
                    id="clientId"
                    type="text"
                    required
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition-colors"
                  />
                </div>

                {/* Client Secret Field */}
                <div className="relative mb-6">
                  <label
                    htmlFor="clientSecret"
                    className={`absolute left-3 transition-all duration-200 ${
                      clientSecret
                        ? 'text-xs -top-3 text-green-600 bg-white px-1'
                        : 'text-sm top-2 text-gray-500'
                    }`}
                  >
                    Enter Client Secret
                  </label>
                  <input
                    id="clientSecret"
                    type="password"
                    required
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 hover:border-green-500 transition-colors"
                  />
                </div>
              </div>

              <div className="mt-6">
                <button
                  type="submit"
                  disabled={loading} // Disable button while loading
                  className="w-full py-2 px-4 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Authenticating...' : 'Login'} {/* Show loading text */}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>

      {/* Right Side - Image (50% width with padding and reduced size) */}
      <div
        className="hidden md:block w-1/2 bg-cover bg-center p-8 md:p-16 bg-gray-50"
        style={{
          backgroundImage: `url(${rightImage})`,
          backgroundSize: '60%', // Reduce the size of the image
          backgroundPosition: 'center', // Center the image
          backgroundRepeat: 'no-repeat', // Prevent the image from repeating
        }}
      >
        {/* Optional: Add content or overlay here */}
      </div>
    </div>
  );
};

export default Login;