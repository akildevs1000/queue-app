import { Head, useForm } from '@inertiajs/react';
import { LoaderCircle } from 'lucide-react';
import { FormEventHandler } from 'react';

import InputError from '@/components/input-error';
import TextLink from '@/components/text-link';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AuthLayout from '@/layouts/auth-layout';
import AppLogoIcon from '@/components/app-logo-icon';

type LoginForm = {
    email: string;
    password: string;
    remember: boolean;
};

interface LoginProps {
    status?: string;
    canResetPassword: boolean;
}

export default function Login({ status, canResetPassword }: LoginProps) {
    const { data, setData, post, processing, errors, reset } = useForm<Required<LoginForm>>({
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
        <div className="bg-background flex min-h-svh flex-col items-center justify-center gap-6 p-6 md:p-10">
            <div className="w-full max-w-sm">
                <div className="flex flex-col gap-8">
                    <form
                        className="flex flex-col gap-8 bg-white dark:bg-gray-900 p-8 rounded-xl shadow-lg max-w-md mx-auto"
                        onSubmit={submit}
                    >
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2 font-medium">
                                <div className="flex h-9 w-9 items-center justify-center rounded-md">
                                    <AppLogoIcon className="size-9 fill-current text-[var(--foreground)] dark:text-white" />
                                </div>
                            </div>
                            <h2 className="text-2xl font-semibold text-center text-gray-800 dark:text-gray-100">
                                Welcome Back!
                            </h2>
                            <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                                Enter your credentials to access your account
                            </p>
                        </div>

                        <div className="grid gap-6">
                            <div className="grid gap-2">
                                <Label htmlFor="email" className="text-gray-700 dark:text-gray-200">
                                    User Name
                                </Label>
                                <Input
                                    id="email"
                                    required
                                    autoFocus
                                    tabIndex={1}
                                    autoComplete="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    placeholder="admin"
                                    className="rounded-md border-gray-300 dark:border-gray-700 focus:border-primary focus:ring focus:ring-primary/30 dark:bg-gray-800"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <div className="grid gap-2">
                                <div className="flex items-center">
                                    <Label htmlFor="password" className="text-gray-700 dark:text-gray-200">
                                        Password
                                    </Label>
                                    {/* {canResetPassword && (
                                        <TextLink
                                            href={route('password.request')}
                                            className="ml-auto text-sm text-primary hover:underline"
                                            tabIndex={5}
                                        >
                                            Forgot password?
                                        </TextLink>
                                    )} */}
                                </div>
                                <Input
                                    id="password"
                                    type="password"
                                    required
                                    tabIndex={2}
                                    autoComplete="current-password"
                                    value={data.password}
                                    onChange={(e) => setData('password', e.target.value)}
                                    placeholder="Your password"
                                    className="rounded-md border-gray-300 dark:border-gray-700 focus:border-primary focus:ring focus:ring-primary/30 dark:bg-gray-800"
                                />
                                <InputError message={errors.password} />
                            </div>

                            {/* <div className="flex items-center space-x-3">
                                <Checkbox
                                    id="remember"
                                    name="remember"
                                    checked={data.remember}
                                    onClick={() => setData('remember', !data.remember)}
                                    tabIndex={3}
                                />
                                <Label htmlFor="remember" className="text-gray-700 dark:text-gray-200">
                                    Remember me
                                </Label>
                            </div> */}

                            <Button
                                type="submit"
                                className="mt-4 w-full flex items-center justify-center gap-2 bg-primary hover:bg-primary/90  font-medium rounded-md py-2 transition-all duration-200"
                                tabIndex={4}
                                disabled={processing}
                            >
                                {processing && <LoaderCircle className="h-5 w-5 animate-spin" />}
                                Log in
                            </Button>
                        </div>

                        {/* Optional sign-up link */}
                        {/* <div className="text-muted-foreground text-center text-sm">
                    Don't have an account?{' '}
                    <TextLink href={route('register')} tabIndex={5}>
                        Sign up
                    </TextLink>
                </div> */}

                        {status && (
                            <div className="mt-4 text-center text-sm font-medium text-green-600 dark:text-green-400">
                                {status}
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
}
