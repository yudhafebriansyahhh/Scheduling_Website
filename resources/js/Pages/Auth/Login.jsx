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

            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-600 via-gray-800 to-gray-900">
                <div className="w-full max-w-md">
                    <div className="bg-gray-900/95 backdrop-blur-md rounded-2xl shadow-2xl p-8 border border-gray-700/50">
                        {/* Logo Section */}
                        <div className="text-center mb-8">
                            <div className="mb-6">
                                <img
                                    src="/act.png"
                                    alt="Application Logo"
                                    className="h-16 w-auto mx-auto"
                                />
                            </div>
                            <h2 className="text-3xl font-bold text-white">Login</h2>
                        </div>

                        {status && (
                            <div className="mb-4 font-medium text-sm text-green-400 bg-green-400/10 border border-green-400/20 rounded-lg p-3">
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
                                    className="mt-1 block w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gray-500 focus:bg-gray-700/60 focus:outline-none focus:ring-1 focus:ring-gray-500/30 transition-all duration-200"
                                    autoComplete="username"
                                    isFocused={true}
                                    placeholder="Email"
                                    onChange={(e) => setData('email', e.target.value)}
                                />
                                <InputError message={errors.email} className="mt-2 text-red-400" />
                            </div>

                            <div className="mb-6">
                                <TextInput
                                    id="password"
                                    type="password"
                                    name="password"
                                    value={data.password}
                                    className="mt-1 block w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-gray-500 focus:bg-gray-700/60 focus:outline-none focus:ring-1 focus:ring-gray-500/30 transition-all duration-200"
                                    autoComplete="current-password"
                                    placeholder="Password"
                                    onChange={(e) => setData('password', e.target.value)}
                                />
                                <InputError message={errors.password} className="mt-2 text-red-400" />
                            </div>

                            <div className="block mb-6">
                                <label className="flex items-center cursor-pointer">
                                    <Checkbox
                                        name="remember"
                                        checked={data.remember}
                                        onChange={(e) => setData('remember', e.target.checked)}
                                        className="rounded border-gray-600 bg-gray-800 text-blue-600 shadow-sm focus:ring-blue-500 focus:ring-offset-gray-900"
                                    />
                                    <span className="ms-2 text-sm text-gray-300 select-none">Remember me</span>
                                </label>
                            </div>

                            <div className="mb-6">
                                <PrimaryButton
                                    className="w-full bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-semibold py-3 px-4 rounded-lg transition duration-300 ease-in-out transform hover:scale-[1.01] focus:outline-none focus:ring-1 focus:ring-gray-500/30 focus:ring-offset-1 focus:ring-offset-gray-900 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none justify-center shadow-lg"
                                    disabled={processing}
                                >
                                    {processing ? (
                                        <div className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Logging in...
                                        </div>
                                    ) : 'Login'}
                                </PrimaryButton>
                            </div>

                            <div className="flex flex-col items-center space-y-4">
                                {canResetPassword && (
                                    <Link
                                        href={route('password.request')}
                                        className="text-sm text-gray-400 hover:text-gray-300 transition duration-200 underline-offset-4 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                )}

                                <div className="text-sm text-gray-400">
                                    Don't have an account?{' '}
                                    <Link
                                        className="text-gray-300 hover:text-white font-semibold transition duration-200 underline-offset-4 hover:underline"
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
