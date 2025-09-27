import React from 'react';
import {
  Building2,
  Shield,
  Mail,
  Lock,
} from 'lucide-react';

const Login = ({ onLogin }) => (
  <div className="min-h-screen flex items-center justify-center p-4" style={{
    backgroundImage: 'url(https://images.unsplash.com/photo-1554224155-6726b3ff858f?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80)',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat'
  }}>
    <div className="bg-white rounded-xl shadow-2xl p-10 w-full max-w-lg bg-opacity-98 backdrop-blur-sm">
      {/* Logo Section */}
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-600 to-blue-800 rounded-full mb-4 shadow-lg">
          <Building2 className="h-10 w-10 text-white" />
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          PayrollPro
        </h1>
        <p className="text-gray-600 text-lg">Secure Salary Management System</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Email Address
          </label>
          <div className="relative">
            <input
              type="email"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              placeholder="Enter your email"
            />
            <div className="absolute left-3 top-3.5">
              <Mail className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Password
            </label>
            <a href="#" className="text-sm text-blue-600 hover:text-blue-800 hover:underline transition-colors">
              Forgot password?
            </a>
          </div>
          <div className="relative">
            <input
              type="password"
              className="w-full px-4 py-3 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all duration-200"
              placeholder="Enter your password"
            />
            <div className="absolute left-3 top-3.5">
              <Lock className="h-5 w-5 text-gray-400" />
            </div>
          </div>
        </div>

        <button
          onClick={onLogin}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 text-white py-3 rounded-lg hover:from-blue-700 hover:to-blue-800 transition-all duration-200 font-semibold text-lg shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          Sign In
        </button>

        <div className="text-center pt-4 border-t border-gray-200">
          <span className="text-gray-600">Need an account? </span>
          <a href="#" className="text-blue-600 hover:text-blue-800 hover:underline transition-colors font-medium">
            Contact Administrator
          </a>
        </div>
      </div>
    </div>
  </div>
);

export default Login;
