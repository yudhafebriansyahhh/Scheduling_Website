import { useEffect } from 'react';
import Checkbox from '@/Components/Checkbox';
import LoginGuestLayout from '@/Layouts/LoginGuestLayout';
import InputError from '@/Components/InputError';
import InputLabel from '@/Components/InputLabel';
import PrimaryButton from '@/Components/PrimaryButton';
import TextInput from '@/Components/TextInput';
import { Head, Link, useForm } from '@inertiajs/react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    useEffect(() => {
        return () => {
            reset('password');
        };
    }, []);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'));
    };

    return (
        <LoginGuestLayout>
            <Head title="Log in" />

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-300 via-blue-500 to-blue-800">
                <div className="w-full max-w-md">
                    <div className="bg-white/5 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-white/20">
                        <div className="text-center mb-8">
                            <h2 className="text-3xl font-bold text-white">Login</h2>
                        </div>

                        {status && (
                            <div className="mb-4 font-medium text-sm text-green-400">
                                {status}
                            </div>
                        )}

                        <form onSubmit={submit}>
                            <div className="mb-6">
                                <TextInput
                                    id="email"
                                    type="email"
                                    name="email"
                                    value={data.email}
                                    className="mt-1 block w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:border-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="Email"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2 text-red-300" />
                            </div>

                            <div className="mb-6">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full px-4 py-3 bg-white/10 border border-white/30 rounded-lg text-white placeholder-white/70 focus:border-white/50 focus:bg-white/20 focus:outline-none focus:ring-2 focus:ring-white/20"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2 text-red-300" />
                            </div>

                            <div className="block mb-6">
                                <label className="flex items-center">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-white/30 text-blue-600 shadow-sm focus:ring-blue-500"
                                    />
                                    <span className="ms-2 text-sm text-white/80">Remember me</span>
                                </label>
                            </div>

                            <div className="mb-6">
                                <PrimaryButton
                                    className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-white/20 disabled:opacity-50 disabled:cursor-not-allowed justify-center"
                                    disabled={processing}
                                >
                                    {processing ? 'Logging in...' : 'Login'}
                                </PrimaryButton>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-white/80 hover:text-white transition duration-200"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}

                                <div className="text-sm text-white/80">
                                    Don't have an account?{' '}
                                    <Link
                                        href={route('register')}
                                        className="text-white hover:underline font-semibold transition duration-200"
                                    >
                                        Sign up
                                    </Link>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </LoginGuestLayout>
    );
}
