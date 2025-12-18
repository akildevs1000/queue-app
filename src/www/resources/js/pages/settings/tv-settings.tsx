import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useRef, useState } from 'react';

export default function Profile() {
    const { auth } = usePage().props;

    const { data, setData, errors, post, reset, processing, recentlySuccessful } = useForm({
        media_type: auth.user.media_type || 'youtube', // youtube | image
        media_url: auth.user.media_url || '',          // youtube ID/URL or base64 image
    });

    const inputRef = useRef<HTMLInputElement>(null);
    const [imageError, setImageError] = useState<string | null>(null);

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        post(route('tv_settings.update'), {
            preserveScroll: true,
            onSuccess: () => reset(),
            onError: (errors) => {
                if (errors.media_url) {
                    reset('media_url');
                    inputRef.current?.focus();
                }
            },
        });
    };

    /** Validate image size (900x600) and convert to base64 */
    const handleImageUpload = (file: File) => {
        setImageError(null);

        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            if (img.width !== 900 || img.height !== 600) {
                setImageError('Image must be exactly 900 × 600 pixels');
                setData('media_url', '');
                URL.revokeObjectURL(objectUrl);
                return;
            }

            const reader = new FileReader();
            reader.onloadend = () => {
                setData('media_url', reader.result as string);
            };
            reader.readAsDataURL(file);

            URL.revokeObjectURL(objectUrl);
        };

        img.onerror = () => {
            setImageError('Invalid image file');
            URL.revokeObjectURL(objectUrl);
        };

        img.src = objectUrl;
    };

    return (
        <AppLayout breadcrumbs={[]}>
            <Head title="TV settings" />

            <SettingsLayout>
                <div className="space-y-6 rounded-xl p-5 dark:bg-gray-700">
                    <HeadingSmall
                        title="Update your media settings"
                        description="Select media type and provide YouTube video or image"
                    />

                    <form onSubmit={submit} className="space-y-6">

                        {/* Media Type */}
                        <div className="grid gap-2">
                            <Label>Media Type</Label>
                            <select
                                value={data.media_type}
                                onChange={(e) => {
                                    setData('media_type', e.target.value);
                                    setData('media_url', '');
                                    setImageError(null);
                                }}
                                className="rounded-md border p-2 dark:bg-gray-800 dark:text-white"
                            >
                                <option value="youtube">YouTube</option>
                                <option value="image">Image</option>
                            </select>
                        </div>

                        {/* YouTube Input */}
                        {data.media_type === 'youtube' && (
                            <div className="grid gap-2">
                                <Label>YouTube Video ID / URL</Label>
                                <Input
                                    ref={inputRef}
                                    type="text"
                                    placeholder="e.g. 2sh8rCvijrY"
                                    value={data.media_url}
                                    onChange={(e) => setData('media_url', e.target.value)}
                                />
                                <InputError message={errors.media_url} />
                            </div>
                        )}

                        {/* Image Upload */}
                        {data.media_type === 'image' && (
                            <div className="grid gap-2">
                                <Label>Upload Image (900 × 600)</Label>
                                <Input
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => {
                                        if (e.target.files?.[0]) {
                                            handleImageUpload(e.target.files[0]);
                                        }
                                    }}
                                />

                                {(imageError || errors.media_url) && (
                                    <InputError message={imageError || errors.media_url} />
                                )}
                            </div>
                        )}

                        {/* Submit */}
                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>
                                Save
                            </Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600 dark:text-white">
                                    Saved
                                </p>
                            </Transition>
                        </div>

                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
