import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Rocket, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

export default function SignUp() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSignUp = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg('');

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    });

    if (error) {
      setMsg(error.message);
    } else {
      // Supabase default usually requires email confirmation if not disabled in dashboard
      // However, if auto-confirm is on in local dev, session is returned
      if (data?.session) {
        navigate('/admin/dashboard');
      } else {
        setMsg('Success! Please check your email inbox to confirm your account.');
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-[85vh] flex items-center justify-center px-4 pt-10">
      <div className="w-full max-w-[420px]">
        <div className="bg-primary rounded-[2.5rem] border border-accent/10 p-8 md:p-10 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-32 -left-32 w-64 h-64 bg-accent/10 rounded-full blur-[64px] pointer-events-none" />

          <div className="relative z-10">
            <div className="mb-10 text-center">
              <h1 className="text-3xl font-bold text-textMain mb-2 tracking-tight">Get Started</h1>
              <p className="text-textMuted text-sm">Create your organization and onboard faster.</p>
            </div>

            {msg && (
              <div className="mb-6 p-4 rounded-xl bg-accent/10 text-accent text-sm font-semibold text-center border border-accent/20">
                {msg}
              </div>
            )}

            <form onSubmit={handleSignUp} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-textMain mb-2">Full Name</label>
                <input
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="John Doe"
                  className="w-full p-4 rounded-2xl border border-accent/10 bg-background/50 text-sm text-textMain focus:outline-none focus:border-accent/40 focus:bg-background transition-colors"
                  required
                />
              </div>

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
                <label className="block text-sm font-semibold text-textMain mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-4 rounded-2xl border border-accent/10 bg-background/50 text-sm text-textMain focus:outline-none focus:border-accent/40 focus:bg-background transition-colors"
                  required
                  minLength={6}
                />
              </div>

              <button disabled={loading} type="submit" className="w-full flex justify-center items-center gap-2 py-4 rounded-2xl bg-accent text-primary font-bold hover:opacity-90 transition-all hover:scale-[1.02] shadow-xl shadow-accent/10 mt-6 text-sm disabled:opacity-70">
                {loading ? <Loader2 className="animate-spin" size={16} /> : 'Create Account'}
                {!loading && <ArrowRight size={16} />}
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-textMuted font-medium">
              Already have an account? <Link to="/login" className="text-accent hover:text-textMain transition-colors ml-1">Log in</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
