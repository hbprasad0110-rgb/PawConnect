import { useState } from 'react';
import { useApp } from '../ApiAppContext';
import { api, ApiClientError } from '../api';

const readToken = () => new URLSearchParams(window.location.hash.split('?')[1] || '').get('token') || '';

export default function ResetPasswordPage() {
  const { logout, navigate } = useApp();
  const [token] = useState(readToken);
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState(token ? '' : 'This password reset link is missing its secure token.');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (password !== confirmation) {
      setError('Passwords do not match.');
      return;
    }
    setIsSubmitting(true);
    try {
      const result = await api.resetPassword(token, password);
      setMessage(result.message);
      setPassword('');
      setConfirmation('');
    } catch (requestError) {
      setError(requestError instanceof ApiClientError ? requestError.message : 'Unable to reset your password.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const returnToLogin = async () => {
    await logout();
    navigate('login');
  };

  return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-6 py-12">
      <div className="w-full max-w-md bg-white border border-slate-200 rounded-2xl shadow-sm p-8">
        <h1 className="font-display font-800 text-2xl text-slate-900 mb-2">Create a new password</h1>
        <p className="text-sm text-slate-500 mb-6">Choose a password with at least 8 characters.</p>

        {message && <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg p-3 text-sm mb-5" role="status">{message}</div>}
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-3 text-sm mb-5" role="alert">{error}</div>}

        {!message && <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-password" className="block text-sm font-semibold text-slate-700 mb-1.5">New Password</label>
            <input id="new-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} required minLength={8} autoComplete="new-password" disabled={!token} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <div>
            <label htmlFor="confirm-password" className="block text-sm font-semibold text-slate-700 mb-1.5">Confirm Password</label>
            <input id="confirm-password" type="password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} required minLength={8} autoComplete="new-password" disabled={!token} className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-sm focus:ring-2 focus:ring-blue-500/30" />
          </div>
          <button type="submit" disabled={isSubmitting || !token} className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white font-bold py-3 rounded-xl transition-colors">
            {isSubmitting ? 'Updating...' : 'Reset password'}
          </button>
        </form>}

        {message && <button type="button" onClick={returnToLogin} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">Sign in</button>}
      </div>
    </div>
  );
}
