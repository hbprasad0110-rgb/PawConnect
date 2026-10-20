import { useApp } from '../ApiAppContext';

export default function NotFoundPage() {
  const { navigate } = useApp();

  return (
    <div className="fade-in min-h-[60vh] flex items-center justify-center px-6">
      <div className="text-center max-w-md">
        <p className="text-6xl mb-4">🐾</p>
        <h1 className="font-display font-800 text-3xl text-slate-900 mb-2">Page not found</h1>
        <p className="text-slate-500 mb-6">The page you are looking for does not exist or has moved.</p>
        <div className="flex gap-3 justify-center">
          <button onClick={() => navigate('home')} className="bg-blue-600 hover:bg-blue-700 text-white font-bold px-6 py-3 rounded-xl transition-colors">
            Back to Home
          </button>
          <button onClick={() => navigate('animals')} className="border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold px-6 py-3 rounded-xl transition-colors">
            Browse Animals
          </button>
        </div>
      </div>
    </div>
  );
}
