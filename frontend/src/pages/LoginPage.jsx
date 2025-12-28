import React, { useState } from 'react';
import { HeartPulse, ArrowLeft, Mail, Lock } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    
    setLoading(false);
    
    if (result.success) {
      navigate('/chat');
    } else {
      setError(result.error);
    }
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white font-sans selection:bg-emerald-500 selection:text-black flex flex-col relative overflow-hidden">
      

      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/15 rounded-full blur-[120px] pointer-events-none"></div>


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


      <main className="flex-1 flex items-center justify-center relative z-10 px-4">
        <div className="w-full max-w-md">
          
      
          <div className="mb-10 text-center">
            <h2 className="text-4xl md:text-5xl font-light mb-2">
              Welcome <span className="font-serif italic text-emerald-400">Back.</span>
            </h2>
            <p className="text-gray-400 text-sm">Log in to access your health dashboard.</p>
          </div>

     
          {error && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/50 rounded text-red-400 text-sm">
              {error}
            </div>
          )}

    
          <form className="space-y-5" onSubmit={handleSubmit}>
            
     
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

        
            <div className="group">
              <label className="block text-xs uppercase tracking-wider text-gray-500 mb-2 group-focus-within:text-emerald-400 transition-colors">Password</label>
              <div className="relative">
                <Lock className="absolute left-0 top-3 w-5 h-5 text-gray-500 group-focus-within:text-emerald-400 transition-colors" />
                <input 
                  type="password" 
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full bg-transparent border-b border-gray-700 py-3 pl-8 text-white placeholder-gray-600 focus:outline-none focus:border-emerald-400 transition-colors"
                />
              </div>
            </div>

            <button 
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-400 hover:bg-emerald-300 text-black font-bold py-4 rounded-sm transition-all duration-300 mt-4 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Access Account'}
            </button>

          </form>

          {/* Footer Switch */}
          <p className="text-center text-gray-500 text-sm mt-8">
            Don't have an account? <Link to="/signup" className="text-white underline decoration-emerald-400 decoration-2 underline-offset-4 hover:text-emerald-300 transition-colors">Sign Up</Link>
          </p>
        </div>
      </main>

       

    </div>
  );
};

export default LoginPage;