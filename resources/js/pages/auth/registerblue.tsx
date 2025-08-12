import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Loader2, Mail, LockKeyhole, User } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';

const RegisterPage: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<Partial<typeof form>>({});
  const [isLoading, setIsLoading] = useState(false);

  const validate = () => {
    const newErrors: Partial<typeof form> = {};
    if (!form.name) newErrors.name = 'Nom requis';
    if (!form.email) newErrors.email = 'Email requis';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = 'Email invalide';
    if (!form.password) newErrors.password = 'Mot de passe requis';
    else if (form.password.length < 6) newErrors.password = '6 caractères min.';
    if (form.password_confirmation !== form.password) newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setIsLoading(true);

    router.post(route('register'), form, {
      onError: (err) => setErrors(err),
      onFinish: () => {
        setForm({ ...form, password: '', password_confirmation: '' });
        setIsLoading(false);
      },
    });
  };

  const handleChange = (field: keyof typeof form, value: string) => {
    setForm({ ...form, [field]: value });
    if (errors[field]) setErrors({ ...errors, [field]: undefined });
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#0a0420] via-[#0e0a32] to-[#1B1749]">
      <ParticlesBackground />
      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl bg-white/5 shadow-xl backdrop-blur-md border border-slate-700 flex flex-col">
          <div className="p-8">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold text-white md:text-3xl">Créer un compte</h1>
              {/* <p className="mt-2 text-sm text-slate-400">Entrez vos informations pour vous inscrire</p> */}
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Nom */}
              <div>
                <label htmlFor="name" className="block text-sm text-slate-300 mb-1">Nom complet</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="name"
                    type="text"
                    value={form.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="Jean Dupont"
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 bg-slate-800 ${
                      errors.name ? 'border-red-500 text-red-500' : 'border-slate-700 text-white'
                    } focus:ring-1 focus:ring-red-500 focus:outline-none`}
                  />
                </div>
                {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
              </div>

              {/* Email */}
              <div>
                <label htmlFor="email" className="block text-sm text-slate-300 mb-1">Adresse e-mail</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    type="email"
                    value={form.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="email@example.com"
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 bg-slate-800 ${
                      errors.email ? 'border-red-500 text-red-500' : 'border-slate-700 text-white'
                    } focus:ring-1 focus:ring-red-500 focus:outline-none`}
                  />
                </div>
                {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
              </div>

              {/* Mot de passe */}
              <div>
                <label htmlFor="password" className="block text-sm text-slate-300 mb-1">Mot de passe</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password"
                    type="password"
                    value={form.password}
                    onChange={(e) => handleChange('password', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 bg-slate-800 ${
                      errors.password ? 'border-red-500 text-red-500' : 'border-slate-700 text-white'
                    } focus:ring-1 focus:ring-red-500 focus:outline-none`}
                  />
                </div>
                {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
              </div>

              {/* Confirmation */}
              <div>
                <label htmlFor="password_confirmation" className="block text-sm text-slate-300 mb-1">Confirmez le mot de passe</label>
                <div className="relative">
                  <LockKeyhole className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="password_confirmation"
                    type="password"
                    value={form.password_confirmation}
                    onChange={(e) => handleChange('password_confirmation', e.target.value)}
                    placeholder="••••••••"
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 bg-slate-800 ${
                      errors.password_confirmation ? 'border-red-500 text-red-500' : 'border-slate-700 text-white'
                    } focus:ring-1 focus:ring-red-500 focus:outline-none`}
                  />
                </div>
                {errors.password_confirmation && (
                  <p className="mt-1 text-sm text-red-500">{errors.password_confirmation}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? 'Création en cours...' : 'Créer un compte'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-400">
              Vous avez déjà un compte ?{' '}
              <a href={route('login')} className="font-medium text-red-500 hover:text-red-400">
                Connectez-vous
              </a>
            </p>
          </div>

          <div className="border-t border-slate-700 py-4 text-center text-sm text-slate-300 bg-white/5">
            Conception et Développement par{' '}
            <a
              href="https://globalglimpse.ma"
              target="_blank"
              rel="noopener noreferrer"
              className="text-red-500 hover:underline"
            >
              @Globalglimpse.ma
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;
