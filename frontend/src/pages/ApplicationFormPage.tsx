import { useState } from 'react';
import { useApp } from '../AppContext';

export default function ApplicationFormPage() {
  const { animals, selectedAnimalId, currentUser, applyForAdoption, navigate } = useApp();
  const animal = animals.find(a => a.id === selectedAnimalId);

  const [form, setForm] = useState({
    reason: '',
    experience: '',
    livingArrangement: '',
    hasYard: false,
    hasOtherPets: false,
    otherPetsDescription: '',
    employmentStatus: '',
    references: '',
  });
  const [submitted, setSubmitted] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  if (!animal || !currentUser) return null;

  const set = (field: string, value: string | boolean) =>
    setForm(f => ({ ...f, [field]: value }));

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.reason.trim()) e.reason = 'Please explain why you want to adopt.';
    if (!form.experience.trim()) e.experience = 'Please describe your pet experience.';
    if (!form.livingArrangement.trim()) e.livingArrangement = 'Please describe your living situation.';
    if (!form.employmentStatus.trim()) e.employmentStatus = 'Please provide your employment status.';
    if (!form.references.trim()) e.references = 'Please provide at least one reference.';
    if (form.hasOtherPets && !form.otherPetsDescription.trim()) e.otherPetsDescription = 'Please describe your other pets.';
    return e;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    applyForAdoption(animal.id, form);
    setSubmitted(true);
  };

  if (submitted) return (
    <div className="fade-in min-h-[calc(100vh-4rem)] bg-slate-50 flex items-center justify-center px-6">
      <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-12 text-center max-w-md">
        <div className="w-20 h-20 bg-emerald-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="font-display font-800 text-2xl text-slate-900 mb-2">Application Submitted!</h2>
        <p className="text-slate-500 mb-2">Your application for <strong>{animal.name}</strong> has been received. Our team will review it within 2-3 business days.</p>
        <p className="text-slate-400 text-sm mb-8">You'll receive an email when your application status changes.</p>
        <div className="flex gap-3">
          <button onClick={() => navigate('my-applications')} className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl transition-colors">
            View My Applications
          </button>
          <button onClick={() => navigate('animals')} className="flex-1 border border-slate-200 text-slate-600 hover:bg-slate-50 font-semibold py-3 rounded-xl transition-colors">
            Browse More
          </button>
        </div>
      </div>
    </div>
  );

  const TextArea = ({ label, field, placeholder, rows = 3 }: { label: string; field: string; placeholder?: string; rows?: number }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-1.5">{label}</label>
      <textarea
        rows={rows}
        value={(form as Record<string, string | boolean>)[field] as string}
        onChange={e => set(field, e.target.value)}
        placeholder={placeholder}
        className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all resize-none ${errors[field] ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
      />
      {errors[field] && <p className="text-red-600 text-xs mt-1">{errors[field]}</p>}
    </div>
  );

  return (
    <div className="fade-in min-h-screen bg-slate-50">
      {/* Header */}
      <div className="bg-white border-b border-slate-100">
        <div className="max-w-4xl mx-auto px-6 py-6">
          <button onClick={() => navigate('animal-profile', animal.id)} className="text-slate-400 hover:text-slate-700 text-sm mb-4 flex items-center gap-1 transition-colors">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
            Back to {animal.name}'s profile
          </button>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl overflow-hidden bg-slate-100">
              <img src={animal.photo} alt={animal.name} className="w-full h-full object-cover" />
            </div>
            <div>
              <p className="text-xs font-semibold text-blue-600 uppercase tracking-wide mb-0.5">Adoption Application</p>
              <h1 className="font-display font-800 text-2xl text-slate-900">Apply to Adopt {animal.name}</h1>
              <p className="text-slate-500 text-sm">{animal.breed} · {animal.gender} · {animal.age}</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-6 py-8">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-3 gap-8">
            {/* Form */}
            <div className="col-span-2 space-y-6">
              {/* About You */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
                <h2 className="font-display font-700 text-lg text-slate-900 mb-5">About Your Lifestyle</h2>
                <div className="space-y-4">
                  <TextArea
                    label="Why do you want to adopt this animal? *"
                    field="reason"
                    placeholder="Tell us why you'd like to adopt and what kind of home you'll provide..."
                    rows={4}
                  />
                  <TextArea
                    label="Describe your experience with pets *"
                    field="experience"
                    placeholder="Have you owned pets before? What types? Any training experience?"
                    rows={3}
                  />
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Living Arrangement *</label>
                    <select
                      value={form.livingArrangement}
                      onChange={e => set('livingArrangement', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.livingArrangement ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
                    >
                      <option value="">Select your living situation...</option>
                      <option>House with large fenced yard</option>
                      <option>House with small yard</option>
                      <option>House without yard</option>
                      <option>Apartment (large)</option>
                      <option>Apartment (small)</option>
                      <option>Condo or townhouse</option>
                    </select>
                    {errors.livingArrangement && <p className="text-red-600 text-xs mt-1">{errors.livingArrangement}</p>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <label className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border border-slate-200">
                      <input
                        type="checkbox"
                        checked={form.hasYard}
                        onChange={e => set('hasYard', e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-700">I have a fenced yard</span>
                    </label>
                    <label className="flex items-center gap-3 bg-slate-50 rounded-xl px-4 py-3 cursor-pointer hover:bg-blue-50 transition-colors border border-slate-200">
                      <input
                        type="checkbox"
                        checked={form.hasOtherPets}
                        onChange={e => set('hasOtherPets', e.target.checked)}
                        className="w-4 h-4 accent-blue-600"
                      />
                      <span className="text-sm font-medium text-slate-700">I have other pets</span>
                    </label>
                  </div>

                  {form.hasOtherPets && (
                    <TextArea
                      label="Describe your other pets *"
                      field="otherPetsDescription"
                      placeholder="Types, breeds, ages, temperament..."
                      rows={2}
                    />
                  )}
                </div>
              </div>

              {/* Employment & References */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-7">
                <h2 className="font-display font-700 text-lg text-slate-900 mb-5">Employment & References</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 mb-1.5">Employment Status *</label>
                    <select
                      value={form.employmentStatus}
                      onChange={e => set('employmentStatus', e.target.value)}
                      className={`w-full px-4 py-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500/30 transition-all ${errors.employmentStatus ? 'border-red-300 bg-red-50' : 'border-slate-200 bg-slate-50 hover:border-slate-300 focus:border-blue-400'}`}
                    >
                      <option value="">Select status...</option>
                      <option>Full-time employed</option>
                      <option>Full-time remote worker</option>
                      <option>Part-time employed</option>
                      <option>Self-employed / Freelancer</option>
                      <option>Student</option>
                      <option>Retired</option>
                      <option>Stay-at-home parent</option>
                    </select>
                    {errors.employmentStatus && <p className="text-red-600 text-xs mt-1">{errors.employmentStatus}</p>}
                  </div>
                  <TextArea
                    label="References *"
                    field="references"
                    placeholder="Name, relationship, phone number (e.g. Dr. Amy Williams, vet: (555) 111-2222)"
                    rows={3}
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl transition-colors shadow-lg shadow-blue-600/20 text-lg"
              >
                Submit Application
              </button>
            </div>

            {/* Sidebar */}
            <div className="space-y-5">
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden sticky top-24">
                <img src={animal.photo} alt={animal.name} className="w-full aspect-square object-cover" />
                <div className="p-5">
                  <h3 className="font-display font-800 text-xl text-slate-900 mb-1">{animal.name}</h3>
                  <p className="text-slate-500 text-sm mb-4">{animal.breed} · {animal.age}</p>
                  <div className="bg-blue-50 rounded-xl p-3 text-xs text-blue-700 leading-relaxed border border-blue-100">
                    <strong>What happens next?</strong> Our team reviews your application within 2-3 business days. If approved, you'll be invited to schedule a meet-and-greet appointment.
                  </div>
                </div>
              </div>

              <div className="bg-amber-50 rounded-2xl border border-amber-100 p-4">
                <p className="text-xs font-semibold text-amber-700 mb-1">Applicant Info</p>
                <p className="text-sm text-slate-700 font-medium">{currentUser.name}</p>
                <p className="text-xs text-slate-500">{currentUser.email}</p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
