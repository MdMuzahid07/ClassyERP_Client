import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';
import React from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router';
import { toast } from 'sonner';
import * as z from 'zod';
import { useAppDispatch } from '../../app/hooks';
import { ParticlesBackground } from '../../components/shared/ParticlesBackground';
import { useLoginMutation } from '../../redux/features/auth/authApi';
import { setCredentials } from '../../redux/features/auth/authSlice';

import { ClassyLogo } from '../../components/shared/ClassyLogo';

const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password cannot be empty'),
});

type LoginSchemaType = z.infer<typeof loginSchema>;

export const LoginPage: React.FC = () => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [login, { isLoading }] = useLoginMutation();
  const [showPassword, setShowPassword] = React.useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
    setError,
  } = useForm<LoginSchemaType>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginSchemaType) => {
    try {
      const result = await login(data).unwrap();
      dispatch(setCredentials({ user: result.user, token: result.token }));

      toast.success(`Welcome back, ${result.user.name}!`);

      const targetPath = result.user.role === 'Employee' ? '/products' : '/dashboard';
      void navigate(targetPath);
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      const errMsg = err?.data?.message ?? 'Login failed. Please check your credentials.';
      toast.error(errMsg);
      setError('root', { message: errMsg });
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      <ParticlesBackground />
      <div className="relative w-full max-w-sm space-y-8 z-10">
        <div className="text-center flex flex-col items-center">
          <ClassyLogo className="h-14 mb-2" />
          <p className="text-sm text-slate-500 font-medium">Inventory & Sales Management System</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl ring-1 ring-slate-900/5 p-6 sm:p-8">
          <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-1">
                Email address
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  {...register('email')}
                  className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                    errors.email
                      ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                      : 'border-slate-200'
                  }`}
                  placeholder="name@company.com"
                  disabled={isLoading}
                />
              </div>
              {errors.email && (
                <p className="mt-1.5 text-xs text-red-600">{errors.email.message}</p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-1">
                Password
              </label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  {...register('password')}
                  className={`block w-full rounded-lg border pl-10 pr-10 py-2.5 text-sm text-slate-900 bg-white placeholder-slate-400 focus:outline-none focus:ring-4 focus:ring-blue-600/5 focus:border-blue-500 transition-all ${
                    errors.password
                      ? 'border-red-200 focus:ring-red-600/5 focus:border-red-500'
                      : 'border-slate-200'
                  }`}
                  placeholder="••••••••"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600 focus:outline-none"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-xs text-red-600">{errors.password.message}</p>
              )}
            </div>

            {errors.root && (
              <div className="rounded-lg bg-red-50 border border-red-200 p-3">
                <p className="text-xs text-red-600">{errors.root.message}</p>
              </div>
            )}

            <div className="space-y-4">
              <button
                type="submit"
                disabled={isLoading}
                className="flex w-full justify-center items-center rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-xs hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-600/20 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors cursor-pointer"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-slate-200"></div>
                <span className="flex-shrink mx-4 text-slate-400 text-[10px] font-medium uppercase tracking-wider">
                  Dev Sandbox
                </span>
                <div className="flex-grow border-t border-slate-200"></div>
              </div>

              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'admin@classyerp.com');
                    setValue('password', 'AdminPass123!');
                    toast.success('Admin credentials loaded!');
                  }}
                  className="flex justify-center items-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/70 py-1.5 text-[10px] font-semibold text-blue-600 transition-colors cursor-pointer"
                >
                  Admin
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'alice.manager@classyerp.com');
                    setValue('password', 'UserPass123!');
                    toast.success('Manager credentials loaded!');
                  }}
                  className="flex justify-center items-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/70 py-1.5 text-[10px] font-semibold text-blue-600 transition-colors cursor-pointer"
                >
                  Manager
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setValue('email', 'charlie.emp@classyerp.com');
                    setValue('password', 'UserPass123!');
                    toast.success('Employee credentials loaded!');
                  }}
                  className="flex justify-center items-center rounded-lg border border-dashed border-blue-200 bg-blue-50/30 hover:bg-blue-50/70 py-1.5 text-[10px] font-semibold text-blue-600 transition-colors cursor-pointer"
                >
                  Employee
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};
export default LoginPage;
