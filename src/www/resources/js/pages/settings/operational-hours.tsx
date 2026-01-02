import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, Link, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';


const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Profile settings',
        href: '/settings/profile',
    },
];

type ProfileForm = {
    name: string;
    email: string;
    operational_start_time: any;
    operational_end_time: any;
};

export default function Profile({ mustVerifyEmail, status }: { mustVerifyEmail: boolean; status?: string }) {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, patch, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        name: auth.user.name,
        email: auth.user.email,
        operational_start_time: auth.user.operational_start_time,
        operational_end_time: auth.user.operational_end_time,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        patch(route('operationalHours.update'), {
            preserveScroll: true,
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Profile settings" />

            <SettingsLayout>
                <div className="space-y-6 rounded-xl p-5 dark:bg-gray-700">
                    <HeadingSmall title="Profile information" description="Update your name and email address" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="operational_start_time">Start </Label>

                            <Select value={data.operational_start_time || ''} onValueChange={(value) => setData('operational_start_time', value)}>
                                <SelectTrigger className="bg-white dark:bg-gray-900">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, '0');
                                        return <SelectItem key={hour} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.operational_start_time} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="operational_end_time">End</Label>

                            <Select value={data.operational_end_time || ''} onValueChange={(value) => setData('operational_end_time', value)}>
                                <SelectTrigger className="bg-white dark:bg-gray-900">
                                    <SelectValue placeholder="Select time" />
                                </SelectTrigger>
                                <SelectContent>
                                    {Array.from({ length: 24 }, (_, i) => {
                                        const hour = i.toString().padStart(2, '0');
                                        return <SelectItem key={hour} value={`${hour}:00`}>{`${hour}:00`}</SelectItem>;
                                    })}
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.operational_end_time} />
                        </div>

                        {mustVerifyEmail && auth.user.email_verified_at === null && (
                            <div>
                                <p className="text-muted-foreground -mt-4 text-sm">
                                    Your email address is unverified.{' '}
                                    <Link
                                        href={route('verification.send')}
                                        method="post"
                                        as="button"
                                        className="text-foreground underline decoration-neutral-300 underline-offset-4 transition-colors duration-300 ease-out hover:decoration-current! dark:decoration-neutral-500"
                                    >
                                        Click here to resend the verification email.
                                    </Link>
                                </p>

                                {status === 'verification-link-sent' && (
                                    <div className="mt-2 text-sm font-medium text-green-600">
                                        A new verification link has been sent to your email address.
                                    </div>
                                )}
                            </div>
                        )}

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-white">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>

                {/* <DeleteUser /> */}
            </SettingsLayout>
        </AppLayout>
    );
}
