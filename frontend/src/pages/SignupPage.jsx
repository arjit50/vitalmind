import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const SignupPage = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { register } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await register(username, email, password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-emerald-600/10 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Navbar / Back Button */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-6 max-w-7xl mx-auto w-full">
        <Link to="/" className="flex items-center gap-2 group cursor-pointer text-gray-400 hover:text-white transition-colors">
          <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
          <span className="text-sm font-medium">Back to Home</span>
        </Link>
        
        <div className="flex items-center gap-2">
           <HeartPulse className="w-6 h-6 text-emerald-400" />
           <span className="font-bold tracking-wide">VitalMind</span>
        </div>
      </nav>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md">
          
          {/* Header Typography */}
          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-2">
              New <span className="font-serif italic text-emerald-400">Account.</span>
            </h2>
            <p className="text-gray-400 text-sm">Begin your journey to better health.</p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Form */}
          <form className="space-y-5" onSubmit={handleSubmit}>
            
            {/* Username Input */}
            <div className="group">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-emerald-400 transition-colors">Username</label>
              <div className="relative">
                <User className="absolute left-0 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="text" 
                  placeholder="johndoe"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Email Input */}
            <div className="group">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-emerald-400 transition-colors">Email Address</label>
              <div className="relative">
                <Mail className="absolute left-0 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="email" 
                  placeholder="name@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            {/* Password Input */}
            <div className="group">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-emerald-400 transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="Create a strong password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>


            {/* Submit Button */}
            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold py-4 rounded-sm transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating Account...' : 'Create Profile'}
            </button>

          </form>

          {/* Footer Switch */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Already a member? <Link to="/login" className="text-white underline decoration-emerald-400 decoration-2 underline-offset-4 hover:text-emerald-300 transition-colors">Log In</Link>
          </p>

        </div>
      </main>

     
    </div>
  );
};

export default SignupPage;