import { Head, useForm } from '@inertiajs/react';
import { FormEventHandler } from 'react';
import { LoaderCircle } from 'lucide-react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface LoginProps {
  status?: string;
  canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
  const { data, setData, post, processing, errors, reset } = useForm({
    email: '',
    password: '',
    remember: false,
  });

  const submit: FormEventHandler = (e) => {
    e.preventDefault();
    post(route('login'), {
      onFinish: () => reset('password'),
    });
  };

  return (
    <>
      <Head title="Connexion" />

      <div className="min-h-screen bg-[#0e0a32] bg-[url('/storage/background/pattern.png')] bg-cover bg-center flex items-center justify-center px-6 py-12 relative font-['Montserrat']">
        {/* Overlay */}
        <div className="absolute inset-0 bg-black/60 z-0" />

        {/* Form Card */}
        <div className="relative z-10 w-full max-w-4xl grid grid-cols-1 md:grid-cols-2 bg-white/5 backdrop-blur-md rounded-xl shadow-2xl overflow-hidden animate-fade-in-down">

          {/* Left Illustration / Branding */}
          <div className="hidden md:flex flex-col justify-center items-center p-8 text-white bg-gradient-to-br from-[#1B1749] to-[#0e0a32]">
            <img src="/storage/logos/xzone_white.png" alt="X-Zone Logo" className="w-32 mb-6 animate-fade-in" />
            <h2 className="text-2xl font-bold leading-snug text-center">X-Zone Technologie</h2>
            <p className="mt-2 text-sm text-[#AFAFD4] text-center">
              Vente & location de matériel informatique, Intégration, Support, Réseaux, Maintenance.
            </p>
          </div>

          {/* Right Form */}
          <div className="p-8 md:p-12">
            <form onSubmit={submit} className="space-y-6 animate-fade-in-up">
              <div className="text-center">
                <h1 className="text-2xl font-bold text-white">Connexion à votre compte</h1>
                <p className="text-sm text-[#AFAFD4] mt-1">Accédez à vos services informatiques</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="email" className="text-white">Adresse e-mail</Label>
                  <Input
                    id="email"
                    type="email"
                    value={data.email}
                    onChange={(e) => setData('email', e.target.value)}
                    placeholder="admin@xzone.com"
                    required
                    className="bg-white text-[#1B1749]"
                  />
                  <InputError message={errors.email} />
                </div>

                <div>
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password" className="text-white">Mot de passe</Label>
                    {canResetPassword && (
                      <TextLink href={route('password.request')} className="text-[#E92B26] text-sm">Oublié ?</TextLink>
                    )}
                  </div>
                  <Input
                    id="password"
                    type="password"
                    value={data.password}
                    onChange={(e) => setData('password', e.target.value)}
                    placeholder="••••••••"
                    required
                    className="bg-white text-[#1B1749]"
                  />
                  <InputError message={errors.password} />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    name="remember"
                    checked={data.remember}
                    onClick={() => setData('remember', !data.remember)}
                  />
                  <Label htmlFor="remember" className="text-white">Se souvenir de moi</Label>
                </div>
              </div>

              <Button
                type="submit"
                disabled={processing}
                className="w-full bg-[#E92B26] hover:bg-white hover:text-[#E92B26] font-semibold transition-colors"
              >
                {processing && <LoaderCircle className="h-4 w-4 animate-spin mr-2" />}
                Connexion
              </Button>

              {status && (
                <div className="text-sm text-green-400 text-center">{status}</div>
              )}

              <p className="text-sm text-[#AFAFD4] text-center">
                Pas encore de compte ?{' '}
                <TextLink href={route('register')} className="text-[#E92B26] font-medium">
                  Inscrivez-vous
                </TextLink>
              </p>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
