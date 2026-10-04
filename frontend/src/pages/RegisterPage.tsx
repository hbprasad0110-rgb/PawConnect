import { useState } from 'react';
import { useApp } from '../AppContext';

export default function RegisterPage() {
  const { register, navigate } = useApp();
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '', phone: '', address: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [success, setSuccess] = useState(false);

  const set = (field: string, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    if (errors[field]) setErrors(e => ({ ...e, [field]: '' }));
  };

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.name.trim()) e.name = 'Full name is required.';
    if (!form.email.trim()) e.email = 'Email is required.';
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Enter a valid email address.';
    if (form.password.length < 8) e.password = 'Password must be at least 8 characters.';
    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match.';
    if (!form.phone.trim()) e.phone = 'Phone number is required.';
    if (!form.address.trim()) e.address = 'Address is required.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    register(form.name, form.email, form.password, form.phone, form.address);
    setSuccess(true);
    setTimeout(() => navigate('animals'), 1500);
  };

  const Field = ({ label, field, type = 'text', placeholder }: { label: string; field: string; type?: string; placeholder?: string }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <input
        type={type}
        value={(form as Record<string, string>)[field]}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
      />
      {errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-lg">
        {success ? (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center">
            <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="font-display font-800 text-2xl text-slate-900 mb-2">Account Created!</h2>
            <p className="text-slate-500">Welcome to PawConnect, {form.name.split(' ')[0]}! Redirecting you to browse animals...</p>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-8">
            <div className="text-center mb-7">
              <h1 className="font-display font-800 text-2xl text-slate-900 mb-1">Create Your Account</h1>
              <p className="text-slate-500 text-sm">Join PawConnect and start your adoption journey.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <Field label="Full Name" field="name" placeholder="Sarah Johnson" />
              <Field label="Email Address" field="email" type="email" placeholder="you@example.com" />
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={form.password}
                    onChange={e => set('password', e.target.value)}
                    placeholder="Min. 8 characters"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.password ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
                  />
                  {errors.password && <p className="text-red-600 text-xs mt-1">{errors.password}</p>}
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
                  <input
                    type="password"
                    value={form.confirmPassword}
                    onChange={e => set('confirmPassword', e.target.value)}
                    placeholder="Repeat password"
                    className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.confirmPassword ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
                  />
                  {errors.confirmPassword && <p className="text-red-600 text-xs mt-1">{errors.confirmPassword}</p>}
                </div>
              </div>
              <Field label="Phone Number" field="phone" type="tel" placeholder="(555) 234-5678" />
              <Field label="Home Address" field="address" placeholder="123 Main St, Springfield, IL 62701" />

              <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
                <p className="text-xs text-blue-700">
                  By creating an account, you agree to PawConnect's Terms of Service and Privacy Policy. Your information will only be used for adoption processing.
                </p>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors duration-200 shadow-md shadow-blue-600/20"
              >
                Create Account
              </button>
            </form>

            <p className="text-center text-sm text-slate-500 mt-5">
              Already have an account?{' '}
              <button onClick={() => navigate('login')} className="text-blue-600 font-semibold hover:text-blue-700">
                Sign in
              </button>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
