import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../api/api.client';
import { cn } from '../lib/utils';
import { Lock, User, Loader2, ArrowRight } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await api.post('/auth/login', { username, password });
      login(res.data.token, res.data.user);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden flex items-center justify-center p-4 bg-slate-50">
      {/* Decorative Background Elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-primary/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-primary/15 rounded-full blur-[120px] animate-pulse" style={{ animationDelay: '1s' }} />
      
      <div className="w-full max-w-[440px] relative z-10">
        <div className="bg-white/70 backdrop-blur-xl rounded-3xl border border-white/40 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.1)] overflow-hidden transition-all duration-500 hover:shadow-[0_48px_80px_-24px_rgba(0,0,0,0.12)]">
          {/* Header/Logo Section */}
          <div className="px-8 pt-10 pb-6 text-center">
            <div className="inline-flex items-center justify-center p-1 bg-white rounded-2xl shadow-sm mb-6 group transition-transform duration-500 hover:scale-105">
              <img 
                src="/logo.jpg" 
                alt="Sri Ganesh Dental Care Logo" 
                className="h-20 w-auto rounded-xl object-contain"
              />
            </div>
            <h1 className="text-3xl font-heading font-black text-slate-900 tracking-tight mb-2">
              Sri Ganesh <span className="text-primary">Dental Care</span>
            </h1>
            <p className="text-slate-500 text-sm font-medium tracking-wide uppercase">
              Lighting up your smiles
            </p>
          </div>

          <div className="px-8 pb-10">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="username" className="text-[13px] font-bold text-slate-700 ml-1">Username</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <User size={18} />
                  </div>
                  <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="Enter your username"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="password" className="text-[13px] font-bold text-slate-700 ml-1">Password</label>
                <div className="relative group">
                  <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors">
                    <Lock size={18} />
                  </div>
                  <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    required
                    className="w-full pl-11 pr-4 py-3 bg-white/50 border border-slate-200 rounded-xl text-slate-900 text-sm focus:outline-none focus:ring-4 focus:ring-primary/10 focus:border-primary transition-all placeholder:text-slate-400"
                  />
                </div>
              </div>

              {error && (
                <div className="p-3.5 bg-red-50/50 border border-red-100 rounded-xl text-red-600 text-sm font-medium animate-in fade-in slide-in-from-top-1 duration-300">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className={cn(
                  "w-full group relative overflow-hidden py-3.5 px-4 bg-primary text-white rounded-xl font-bold text-sm shadow-[0_8px_16px_-4px_rgba(var(--primary),0.3)] transition-all",
                  loading ? "opacity-80 cursor-not-allowed" : "hover:shadow-[0_12px_24px_-4px_rgba(var(--primary),0.4)] hover:-translate-y-0.5 active:translate-y-0 active:scale-[0.98]"
                )}
              >
                <div className="relative flex items-center justify-center gap-2">
                  {loading ? (
                    <Loader2 className="animate-spin" size={18} />
                  ) : (
                    <>
                      <span>Secure Sign In</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </>
                  )}
                </div>
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
              <p className="text-xs text-slate-400 font-medium">
                DENOVA 1.0
              </p>
            </div>
          </div>
        </div>
        
        <p className="text-center text-[11px] text-slate-400 mt-8 leading-relaxed">
          &copy; {new Date().getFullYear()} Sri Ganesh Dental Care. All rights reserved.<br/>
          Confidential and Proprietary.
        </p>
      </div>
    </div>
  );
};

