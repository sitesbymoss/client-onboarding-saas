import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function Login() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      setMsg(error.message);
    } else if (data?.session) {
      navigate('/admin/dashboard');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 pt-10">
      <div className="w-full max-w-[420px]">
        <div className="bg-primary rounded-[2.5rem] border border-accent/10 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="relative z-10">
            <div className="mb-10 text-center">
              <div className="w-16 h-16 bg-accent rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-lg shadow-accent/20">
                <LogIn size={28} className="text-primary" />
              </div>
              <h1 className="text-3xl font-bold text-textMain mb-2 tracking-tight">Welcome Back</h1>
              <p className="text-textMuted text-sm">Sign in to manage your client portals.</p>
            </div>

            {msg && (
              <div className="mb-6 p-4 rounded-xl bg-red-500/10 text-red-500 text-sm font-semibold text-center border border-red-500/20">
                {msg}
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-5">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-2">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@company.com"
                  className="w-full p-4 rounded-2xl border border-accent/10 bg-background/50 text-sm text-textMain focus:outline-none focus:border-accent/40 focus:bg-background transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-textMain mb-2 flex justify-between">
                  <span>Password</span>
                  <a href="#" className="text-accent text-xs hover:text-textMain transition-colors">Forgot?</a>
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 rounded-2xl border border-accent/10 bg-background/50 text-sm text-textMain focus:outline-none focus:border-accent/40 focus:bg-background transition-colors"
                  required
                />
              </div>

              <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-accent text-primary font-bold hover:opacity-90 transition-all hover:scale-[1.02] shadow-xl shadow-accent/10 mt-6 text-sm disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Sign In'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-textMuted font-medium">
              Don't have an account? <Link to="/signup" className="text-accent hover:text-textMain transition-colors ml-1">Get Started</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
