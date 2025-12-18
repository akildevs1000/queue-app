import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef } from 'react';

export default function Profile() {
    const { auth } = usePage().props;

    const { data, setData, errors, post, reset, processing, recentlySuccessful } = useForm({
        media_url: auth.user.media_url || '', // string for YouTube ID or file URL
    });

    const mediaUrlInput = useRef<HTMLInputElement>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tv_settings.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.media_url) {
                    reset('media_url');
                    mediaUrlInput.current?.focus();
                }
            },
        });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="TV settings" />

            <SettingsLayout>
                <div className="space-y-6 rounded-xl p-5 dark:bg-gray-700">
                    <HeadingSmall title="Update your media settings" description="Enter the media URL or YouTube video ID" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="media_url">YouTube Video ID</Label>

                            <Input
                                ref={mediaUrlInput}
                                id="media_url"
                                type="text"
                                placeholder="Enter media URL or YouTube video ID"
                                value={data.media_url}
                                onChange={(e) => setData('media_url', e.target.value)}
                                className="mt-1 block w-full dark:border-white dark:text-white"
                            />

                            <InputError message={errors.media_url} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save password</Button>

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
            </SettingsLayout>
        </AppLayout>
    );
}
