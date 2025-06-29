import React from "react";
import { Link } from "react-router-dom";
import { useState } from "react";
import toast, { Toaster } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { setCredentials } from '../store/authSlice';
import { useDispatch } from "react-redux";

export default function LoginPage() {
  const dispatch = useDispatch();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');

    // Basic validation
    if (!formData.email.trim() || !formData.password.trim()) {
      setError('All fields are required');
      return;
    }

    const url = new URLSearchParams();
    url.append('email', formData.email);
    url.append('password', formData.password);
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/auth/login",
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: url.toString()
        }
      );

      const data = await response.json();

      if (response.ok) {
        toast.success("Login successful!");
        dispatch(setCredentials({
          user: { _id: data.user._id, name: data.user.name, email: data.user.email },
          token: data.token
        }));
        navigate('/dashboard');
      } else {
        toast.error(data.message || 'Login failed. Please check your credentials.');
      }

    } catch (err) {
      setError('Network error. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-900 relative overflow-hidden">
      {/* Floating shapes */}
      <Toaster />
      <div className="absolute top-10 left-10 w-32 h-32 bg-pink-400 bg-opacity-30 rounded-full blur-2xl animate-float-slow" />
      <div className="absolute bottom-20 right-20 w-40 h-40 bg-indigo-400 bg-opacity-20 rounded-full blur-2xl animate-float" />
      <div className="absolute top-1/2 left-1/2 w-24 h-24 bg-purple-400 bg-opacity-20 rounded-full blur-2xl animate-float-delayed" />
      <div className="relative z-10 w-full max-w-md p-8 bg-white/10 backdrop-blur-lg rounded-3xl shadow-2xl border border-white/20 flex flex-col items-center animate-pop-in">
        <div className="text-5xl mb-4 animate-bounce">🔐</div>
        <h2 className="text-3xl font-bold text-white mb-2">Welcome Back!</h2>
        <p className="text-purple-200 mb-6 text-center italic">"Creativity is intelligence having fun."<br /><span className="text-purple-300 font-semibold">- Albert Einstein</span></p>

        {/* Error Message */}
        {error && (
          <div className="w-full mb-4 p-3 bg-red-500/20 border border-red-400/50 rounded-lg text-red-200 text-sm">
            {error}
          </div>
        )}

        <form className="w-full flex flex-col gap-4" onSubmit={handleLogin}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleInputChange}
            className="px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            autoComplete="email"
            disabled={isLoading}
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleInputChange}
            className="px-4 py-3 rounded-xl bg-white/30 text-white placeholder-purple-200 focus:outline-none focus:ring-2 focus:ring-pink-400 transition"
            autoComplete="current-password"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="mt-2 bg-gradient-to-r from-indigo-500 to-pink-500 text-white font-bold py-3 rounded-xl shadow-lg hover:scale-105 transition-transform text-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            {isLoading ? 'Signing In...' : 'Login'}
          </button>
        </form>
        <div className="mt-6 text-purple-200">
          New here?{' '}
          <Link to="/register" className="text-pink-300 font-semibold hover:underline">
            Create an account
          </Link>
        </div>
      </div>
      <style>{`
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-20px); }
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-float-delayed {
          animation: float 3s ease-in-out infinite 1.5s;
        }
        .animate-float-slow {
          animation: float 5s ease-in-out infinite 2s;
        }
        @keyframes pop-in {
          0% { opacity: 0; transform: scale(0.8); }
          100% { opacity: 1; transform: scale(1); }
        }
        .animate-pop-in {
          animation: pop-in 0.7s cubic-bezier(0.4,0,0.2,1) both;
        }
        @keyframes bounce {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }
        .animate-bounce {
          animation: bounce 1.2s infinite;
        }
      `}</style>
    </div>
  );
} 