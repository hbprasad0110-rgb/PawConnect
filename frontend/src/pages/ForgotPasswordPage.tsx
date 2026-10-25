import { useState } from 'react';
import { useApp } from '../ApiAppContext';
import { api, ApiClientError } from '../api';

export default function ForgotPasswordPage() {
  const { navigate } = useApp();
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsSubmitting(true);
    try {
      const result = await api.forgotPassword(email);
      setMessage(result.message);
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to request a password reset.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <button type="button" onClick={() => navigate('login')} className="text-sm font-semibold text-blue-600 hover:text-blue-700 mb-6">
          Back to sign in
        </button>
        <h1 className="font-display font-800 text-2xl text-slate-900 mb-2">Forgot your password?</h1>
        <p className="text-sm text-slate-500 mb-6">Enter your account email and we will send you a secure reset link.</p>

        {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm mb-5" role="status">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-5" role="alert">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="reset-email" className="block text-sm font-semibold text-slate-700 mb-1.5">Email Address</label>
            <input
              id="reset-email"
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@example.com"
              required
              autoComplete="email"
              className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30"
            />
          </div>
          <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors">
            {isSubmitting ? 'Sending...' : 'Send reset link'}
          </button>
        </form>
      </div>
    </div>
  );
}
