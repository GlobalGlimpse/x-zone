import React, { useState } from 'react';
import { router } from '@inertiajs/react';
import { Mail, Loader2 } from 'lucide-react';
import ParticlesBackground from '@/components/ParticlesBackground';

const ForgotPasswordPage: React.FC<{ status?: string }> = ({ status }) => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ email?: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validateEmail = (email: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { email?: string } = {};
    if (!email) newErrors.email = 'Email requis';
    else if (!validateEmail(email)) newErrors.email = 'Email invalide';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setIsLoading(true);

    router.post(
      route('password.email'),
      { email },
      {
        onError: (err) => setErrors(err),
        onFinish: () => setIsLoading(false),
      }
    );
  };

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-white via-slate-100 to-slate-200 dark:from-[#0a0420] dark:via-[#0e0a32] dark:to-[#1B1749] transition-colors duration-500">
      <ParticlesBackground />

      <div className="relative z-10 flex min-h-screen items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
        <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-slate-200 dark:bg-white/5 dark:border-slate-700 backdrop-blur-md flex flex-col">
          <div className="p-8 bg-white dark:bg-transparent rounded-t-xl">
            <div className="mb-6 text-center">
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white md:text-3xl">
                Mot de passe oublié
              </h1>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Entrez votre email pour recevoir un lien de réinitialisation
              </p>
            </div>

            {status && (
              <div className="mb-4 rounded-lg bg-green-100 dark:bg-green-600/10 px-4 py-3 text-sm text-green-700 dark:text-green-400 text-center">
                {status}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1"
                >
                  Adresse e-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                  <input
                    id="email"
                    name="email"
                    type="email"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      if (errors.email) setErrors({ email: undefined });
                    }}
                    placeholder="email@example.com"
                    className={`w-full rounded-lg border py-3 pl-10 pr-3 bg-white dark:bg-slate-800 ${
                      errors.email
                        ? 'border-red-500 text-red-500'
                        : 'border-slate-300 text-slate-900 dark:text-white dark:border-slate-700'
                    } focus:ring-1 focus:ring-red-500 focus:outline-none`}
                  />
                </div>
                {errors.email && (
                  <p className="mt-1 text-sm text-red-500">{errors.email}</p>
                )}
              </div>

              <div>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="group relative flex w-full justify-center rounded-lg bg-gradient-to-r from-red-600 to-red-500 px-4 py-3 text-sm font-semibold text-white shadow-md transition-all hover:from-red-500 hover:to-red-600 focus:ring-2 focus:ring-red-500 disabled:opacity-70"
                >
                  {isLoading && <Loader2 className="mr-2 h-5 w-5 animate-spin" />}
                  {isLoading ? 'Envoi en cours...' : 'Envoyer le lien de réinitialisation'}
                </button>
              </div>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
              Vous vous souvenez de votre mot de passe ?{' '}
              <a
                href={route('login')}
                className="font-medium text-red-500 hover:text-red-400"
              >
                Se connecter
              </a>
            </p>
          </div>

          <div className="border-t border-slate-200 dark:border-slate-700 bg-white text-center text-sm text-slate-500 dark:bg-white/5 dark:text-slate-300 py-4 rounded-b-xl">
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

export default ForgotPasswordPage;
