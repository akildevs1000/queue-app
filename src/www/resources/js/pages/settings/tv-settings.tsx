import { useState } from 'react';
import { Head, useForm, usePage, router } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

export default function Profile() {
    const { auth } = usePage().props;

    const { data, setData, errors, processing, recentlySuccessful } = useForm({
        media_url: auth.user.media_url || '', // string for YouTube ID or file URL
    });

    const submit = (e: React.FormEvent) => {
        e.preventDefault();

        const formData = new FormData();
        formData.append('media_url', data.media_url);

        router.post(route('tv_settings.update'), formData, { forceFormData: true });
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="TV settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall
                        title="Update your media settings"
                        description="Enter the media URL or YouTube video ID"
                    />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="media_url">YouTube Video ID</Label>

                            <Input
                                id="media_url"
                                type="text"
                                placeholder="Enter media URL or YouTube video ID"
                                value={data.media_url}
                                onChange={(e) => setData('media_url', e.target.value)}
                                className="mt-1 block w-full"
                            />

                            <InputError message={errors.media_url} />
                        </div>

                        <Button disabled={processing}>Save & Connect</Button>
                        {recentlySuccessful && <p className="text-sm text-neutral-600">Saved</p>}
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
