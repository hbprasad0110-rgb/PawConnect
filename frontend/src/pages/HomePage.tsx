import { useApp } from '../AppContext';
import { AnimalStatusBadge } from '../components/StatusBadge';

function PawIcon({ className = 'w-5 h-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" fill="currentColor">
      <ellipse cx="8" cy="10" rx="3.2" ry="4" />
      <ellipse cx="14" cy="7" rx="3" ry="4" />
      <ellipse cx="20" cy="7" rx="3" ry="4" />
      <ellipse cx="26" cy="10" rx="3.2" ry="4" />
      <path d="M16 14c-5 0-9 3.5-9 8 0 3 1.5 5 4 5 1.5 0 3-1 5-1s3.5 1 5 1c2.5 0 4-2 4-5 0-4.5-4-8-9-8z" />
    </svg>
  );
}

const STATS = [
  { value: '120+', label: 'Animals Rehomed' },
  { value: '8', label: 'Currently Available' },
  { value: '5', label: 'Foster Families' },
  { value: '3', label: 'Partner Vets' },
];

export default function HomePage() {
  const { animals, navigate } = useApp();
  const featured = animals.filter(a => a.status === 'AVAILABLE').slice(0, 3);

  return (
    <div className="fade-in">
      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-blue-500 text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-8 left-12 w-32 h-32 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-8 right-20 w-48 h-48 rounded-full bg-white blur-3xl" />
          <div className="absolute top-1/2 left-1/2 w-24 h-24 rounded-full bg-white blur-2xl" />
        </div>

        <div className="max-w-7xl mx-auto px-6 py-20 grid grid-cols-2 gap-12 items-center relative">
          <div>
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm rounded-full px-4 py-1.5 mb-6 text-sm font-semibold">
              <PawIcon className="w-4 h-4" />
              PawConnect Animal Shelter
            </div>
            <h1 className="font-display font-900 text-6xl leading-tight mb-4">
              Find Your<br />
              <span className="text-yellow-300">FurEver</span> Friend
            </h1>
            <p className="text-xl text-blue-100 font-medium mb-2">Adopt. Don't Shop.</p>
            <p className="text-blue-200 mb-8 max-w-md leading-relaxed">
              Give a shelter animal the loving home they deserve. Browse our available dogs and cats and start your adoption journey today.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('animals')}
                className="bg-white text-blue-700 font-bold px-7 py-3.5 rounded-xl hover:bg-blue-50 transition-all duration-200 shadow-lg shadow-blue-900/20"
              >
                Browse Animals
              </button>
              <button
                onClick={() => navigate('register')}
                className="bg-white/15 backdrop-blur-sm border border-white/30 text-white font-bold px-7 py-3.5 rounded-xl hover:bg-white/25 transition-all duration-200"
              >
                Create Account
              </button>
            </div>
          </div>

          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/40 aspect-[4/3]">
              <img
                src="https://images.unsplash.com/photo-1594004844563-536a03a6e532?w=700&h=525&fit=crop&auto=format"
                alt="Person holding a dog at animal shelter"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-blue-900/30 to-transparent" />
            </div>
            {/* Floating card */}
            <div className="absolute -bottom-4 -left-6 bg-white text-slate-800 rounded-2xl shadow-xl px-5 py-3.5 flex items-center gap-3">
              <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              </div>
              <div>
                <p className="text-xs text-slate-500 font-medium">This month</p>
                <p className="font-bold font-display text-slate-900">14 adoptions!</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-4 gap-6">
          {STATS.map(s => (
            <div key={s.label} className="text-center">
              <p className="font-display font-900 text-3xl text-blue-600">{s.value}</p>
              <p className="text-slate-500 text-sm font-medium mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Animals */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="font-display font-800 text-3xl text-slate-900">Meet Our Animals</h2>
            <p className="text-slate-500 mt-1">A few of the wonderful friends waiting to meet you.</p>
          </div>
          <button
            onClick={() => navigate('animals')}
            className="text-blue-600 font-semibold text-sm hover:text-blue-700 flex items-center gap-1 transition-colors"
          >
            View all animals
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
          </button>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {featured.map(animal => (
            <button
              key={animal.id}
              onClick={() => navigate('animal-profile', animal.id)}
              className="animal-card bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md hover:border-blue-100 transition-all duration-200 text-left group"
            >
              <div className="overflow-hidden aspect-[4/3] bg-slate-100">
                <img
                  src={animal.photo}
                  alt={animal.name}
                  className="animal-card-img w-full h-full object-cover transition-transform duration-300"
                />
              </div>
              <div className="p-5">
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-display font-800 text-xl text-slate-900">{animal.name}</h3>
                  <AnimalStatusBadge status={animal.status} />
                </div>
                <p className="text-slate-500 text-sm mb-1">{animal.breed}</p>
                <p className="text-slate-400 text-xs mb-4">{animal.gender} · {animal.age}</p>
                <div className="flex items-center gap-2 text-blue-600 font-semibold text-sm group-hover:gap-3 transition-all duration-200">
                  View Details
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-blue-50 py-16">
        <div className="max-w-7xl mx-auto px-6">
          <h2 className="font-display font-800 text-3xl text-slate-900 text-center mb-3">How It Works</h2>
          <p className="text-slate-500 text-center mb-12 max-w-lg mx-auto">Our streamlined adoption process makes it easy to find and welcome your new companion home.</p>
          <div className="grid grid-cols-4 gap-6">
            {[
              { step: '01', icon: '🔍', title: 'Browse Animals', desc: 'Explore our available dogs and cats by breed, age, and personality.' },
              { step: '02', icon: '📝', title: 'Apply to Adopt', desc: 'Submit an adoption application telling us about your home and lifestyle.' },
              { step: '03', icon: '✅', title: 'Get Approved', desc: 'Our team reviews your application and schedules a meet-and-greet.' },
              { step: '04', icon: '🏠', title: 'Welcome Home!', desc: 'Finalize the adoption and bring your new family member home.' },
            ].map(item => (
              <div key={item.step} className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100 text-center">
                <div className="text-3xl mb-3">{item.icon}</div>
                <div className="text-xs font-bold text-blue-400 font-display mb-2">STEP {item.step}</div>
                <h3 className="font-display font-700 text-slate-900 mb-2">{item.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-12 flex items-center justify-between">
          <div>
            <h2 className="font-display font-800 text-3xl text-white mb-2">Ready to make a difference?</h2>
            <p className="text-slate-400 text-lg">Every adoption saves a life. Start your journey today.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => navigate('animals')}
              className="bg-blue-500 hover:bg-blue-400 text-white font-bold px-7 py-3.5 rounded-xl transition-colors duration-200"
            >
              Browse Animals
            </button>
            <button
              onClick={() => navigate('register')}
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-7 py-3.5 rounded-xl border border-white/20 transition-colors duration-200"
            >
              Create Account
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-100 bg-white">
        <div className="max-w-7xl mx-auto px-6 py-8 flex items-center justify-between text-slate-400 text-sm">
          <div className="flex items-center gap-2">
            <PawIcon className="w-4 h-4 text-blue-500" />
            <span className="font-display font-700 text-slate-600">PawConnect</span>
            <span>· PawConnect Animal Shelter</span>
          </div>
          <p>© 2026 PawConnect. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
