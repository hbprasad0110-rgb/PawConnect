import { useState } from 'react';
import { useApp } from '../AppContext';

export default function LoginPage() {
  const { login, navigate, loginError, setLoginError } = useApp();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [postLoginPage, setPostLoginPage] = useState<Parameters<typeof navigate>[0] | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const success = login(email, password);
    if (success) {
      navigate('home');
    }
  };

  const quickLogin = (preset: 'adopter' | 'admin') => {
    const creds = preset === 'adopter'
      ? { email: 'sarah@example.com', password: 'password123' }
      : { email: 'admin@pawconnect.edu', password: 'admin123' };
    setEmail(creds.email);
    setPassword(creds.password);
    const success = login(creds.email, creds.password);
    if (success) {
      navigate(preset === 'admin' ? 'admin-dashboard' : 'home');
    }
  };

  return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex">
      {/* Left panel */}
      <div className="hidden lg:flex flex-col justify-between w-[420px] bg-gradient-to-b from-blue-700 to-blue-600 p-12 text-white">
        <div>
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center mb-8">
            <svg className="w-6 h-6" viewBox="0 0 32 32" fill="currentColor">
              <ellipse cx="8" cy="10" rx="3.2" ry="4" />
              <ellipse cx="14" cy="7" rx="3" ry="4" />
              <ellipse cx="20" cy="7" rx="3" ry="4" />
              <ellipse cx="26" cy="10" rx="3.2" ry="4" />
              <path d="M16 14c-5 0-9 3.5-9 8 0 3 1.5 5 4 5 1.5 0 3-1 5-1s3.5 1 5 1c2.5 0 4-2 4-5 0-4.5-4-8-9-8z" />
            </svg>
          </div>
          <h2 className="font-display font-800 text-3xl mb-3">Welcome back</h2>
          <p className="text-blue-200 leading-relaxed">Sign in to manage your adoption applications, schedule appointments, and track your adoption journey.</p>
        </div>

        <div className="space-y-4">
          <div className="bg-white/10 rounded-2xl p-4 backdrop-blur-sm">
            <div className="flex items-center gap-3 mb-2">
              <img
                src="https://images.unsplash.com/photo-1583786693544-e352f898888d?w=48&h=48&fit=crop"
                alt="Buddy"
                className="w-12 h-12 rounded-xl object-cover"
              />
              <div>
                <p className="font-display font-700 text-white">Buddy is waiting!</p>
                <p className="text-blue-200 text-sm">Golden Retriever · 2 years</p>
              </div>
            </div>
            <p className="text-blue-100 text-sm">Sign in to apply for adoption and start your journey.</p>
          </div>
          <p className="text-blue-300 text-xs text-center">🐾 120+ happy adoptions and counting</p>
        </div>
      </div>

      {/* Right panel */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <h1 className="font-display font-800 text-2xl text-slate-900 mb-1">Sign in to PawConnect</h1>
            <p className="text-slate-500 text-sm mb-6">Enter your credentials to access your account.</p>

            {/* Demo quick login */}
            <div className="bg-blue-50 rounded-2xl p-4 mb-6 border border-blue-100">
              <p className="text-xs font-semibold text-blue-700 mb-3 uppercase tracking-wide">Demo Accounts</p>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => quickLogin('adopter')}
                  className="bg-white border border-blue-200 rounded-xl px-3 py-2.5 text-left hover:border-blue-400 transition-colors group"
                >
                  <p className="text-xs font-bold text-blue-600 group-hover:text-blue-700">Adopter Login</p>
                  <p className="text-xs text-slate-500 mt-0.5">sarah@example.com</p>
                </button>
                <button
                  type="button"
                  onClick={() => quickLogin('admin')}
                  className="bg-white border border-orange-200 rounded-xl px-3 py-2.5 text-left hover:border-orange-400 transition-colors group"
                >
                  <p className="text-xs font-bold text-orange-600 group-hover:text-orange-700">Admin Login</p>
                  <p className="text-xs text-slate-500 mt-0.5">admin@pawconnect.edu</p>
                </button>
              </div>
            </div>

            <div className="flex items-center gap-3 mb-6">
              <div className="flex-1 h-px bg-slate-200" />
              <span className="text-xs text-slate-400 font-medium">or sign in manually</span>
              <div className="flex-1 h-px bg-slate-200" />
            </div>

            {/* Error state */}
            {loginError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-3 mb-4 flex items-start gap-2.5">
                <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-red-700 text-sm">{loginError}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
                <input
                  type="email"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setLoginError(''); }}
                  placeholder="you@example.com"
                  required
                  className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${loginError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => { setPassword(e.target.value); setLoginError(''); }}
                    placeholder="••••••••"
                    required
                    className={`w-full px-4 py-3 pr-10 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${loginError ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300'}`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(p => !p)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword
                      ? <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" /></svg>
                      : <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                    }
                  </button>
                </div>
              </div>
              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors duration-200 mt-2 shadow-md shadow-blue-600/20"
              >
                Sign In
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Don't have an account?{' '}
              <button onClick={() => navigate('register')} className="text-blue-600 font-semibold hover:text-blue-700">
                Create one free
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
