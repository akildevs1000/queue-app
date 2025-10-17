import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, router, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef, useState } from 'react';

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
        title: 'Tv Settings',
        href: '/settings/tv-settings',
    },
];

type Form = {
    ip: string;
    port: string;
    media_type: string;
    media_url: File[]; // now an array of files
    media_height: string;
    media_width: string;
};

export default function Profile({ tv_settings }) {
    const { auth } = usePage<SharedData>().props;

    const [mediaSizeError, setMediaSizeError] = useState<string | undefined>(undefined);

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm<Required<Form>>({
        ip: auth.user.ip,
        port: auth.user.port,
        media_type: auth.user.media_type || 'image', // default
        media_url: [], // start with empty array
        media_height: auth.user.media_height,
        media_width: auth.user.media_width,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        if (mediaSizeError) return;

        const formData = new FormData();
        formData.append('ip', data.ip);
        formData.append('port', data.port);
        formData.append('media_type', data.media_type);
        formData.append('media_height', data.media_height);
        formData.append('media_width', data.media_width);

        // Append each file
        data.media_url.forEach((file, index) => {
            formData.append(`media_url[${index}]`, file); // use array syntax
        });

        router.post(route('tv_settings.update'), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                // handleSocketConnect();
            },
        });
    };

    const socketRef = useRef<WebSocket | null>(null);

    const handleSocketConnect = () => {
        if (!data?.ip || !data?.port) {
            console.warn('Missing IP or port');
            return;
        }

        const url = `ws://${data.ip}:${data.port}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('✅ Connected to WS server');

            const sanitizedHeight = parseInt(data.media_height, 10);
            const sanitizedWidth = parseInt(data.media_width, 10);

            if (tv_settings) {
                const payload = {
                    event: 'trigger-settings',
                    data: {
                        ...tv_settings,
                        media_height: isNaN(sanitizedHeight) ? 0 : sanitizedHeight,
                        media_width: isNaN(sanitizedWidth) ? 0 : sanitizedWidth,
                    },
                };
                console.log("🚀 ~ socket.addEventListener ~ payload:", payload)

                socket.send(JSON.stringify(payload));
                return;
            }


            const payload = {
                event: 'trigger-settings',
                data: {
                    // ...data,
                    media_height: isNaN(sanitizedHeight) ? 0 : sanitizedHeight,
                    media_width: isNaN(sanitizedWidth) ? 0 : sanitizedWidth,
                    // media_url: data.media_url,
                },
            };

            socket.send(JSON.stringify(payload));
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        socket.addEventListener('close', () => {
            console.log('WebSocket connection closed');
        });
    };

    const handleSocketDisconnect = () => {
        if (socketRef.current) {
            socketRef.current.close();
            socketRef.current = null;
        }
    };

    // Call on mount
    useEffect(() => {
        // handleSocketConnect();

        return () => {
            // handleSocketDisconnect();
        };
    }, []);
    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="TV settings" />

            <SettingsLayout>
                <div className="space-y-6">
                    <HeadingSmall title="Update your tv settings" description="update ip and port to connect to tv" />

                    <form onSubmit={submit} className="space-y-6">
                        <div className="grid gap-2">
                            <Label htmlFor="ip">Ip Address</Label>

                            <Input
                                id="ip"
                                className="mt-1 block w-full"
                                value={data.ip}
                                onChange={(e) => setData('ip', e.target.value)}
                                required
                                autoComplete="ip"
                                placeholder="Ip Address"
                            />

                            <InputError className="mt-2" message={errors.ip} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="port">Port</Label>

                            <Input
                                id="port"
                                className="mt-1 block w-full"
                                value={data.port}
                                onChange={(e) => setData('port', e.target.value)}
                                required
                                autoComplete="port"
                                placeholder="Port"
                            />

                            <InputError className="mt-2" message={errors.port} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="media_type">Media Type</Label>

                            <Select value={data.media_type} onValueChange={(value) => setData('media_type', value)}>
                                <SelectTrigger className="w-full">
                                    <SelectValue placeholder="Select media type" />
                                </SelectTrigger>

                                <SelectContent>
                                    <SelectItem value="youtube">YouTube</SelectItem>
                                    <SelectItem value="video">Video</SelectItem>
                                    <SelectItem value="gif">GIF</SelectItem>
                                    <SelectItem value="image">Image (Multiple URLs)</SelectItem>
                                </SelectContent>
                            </Select>

                            <InputError className="mt-2" message={errors.media_type} />
                        </div>

                        <div className="grid gap-2">
                            <Label htmlFor="media_url">Upload Media</Label>
                            <Input
                                id="media_url"
                                type="file"
                                multiple
                                className="mt-1 block w-full"
                                accept="image/gif,image/jpeg,image/png,video/mp4"
                                onChange={(e) => {
                                    const files = Array.from(e.target.files ?? []);
                                    const MAX_MB = 2;
                                    const MAX_BYTES = MAX_MB * 1024 * 1024;

                                    const oversizedFiles = files.filter((file) => file.size > MAX_BYTES);

                                    if (oversizedFiles.length > 0) {
                                        setMediaSizeError(`Some files exceed ${MAX_MB}MB and were not selected.`);
                                        const validFiles = files.filter((file) => file.size <= MAX_BYTES);
                                        setData('media_url', validFiles);
                                    } else {
                                        setMediaSizeError(undefined);
                                        setData('media_url', files);
                                    }
                                }}
                            />

                            <InputError className="mt-2" message={errors.media_url} />
                            <InputError className="mt-2" message={mediaSizeError ?? undefined} />
                        </div>

                        {data.media_url.length > 0 && (
                            <div className="mt-2 flex flex-wrap gap-2">
                                {data.media_url.map((file, index) => {
                                    const url = URL.createObjectURL(file);

                                    return data.media_type === 'image' || data.media_type === 'gif' ? (
                                        <img key={index} src={url} alt={`preview-${index}`} className="h-24 w-24 rounded object-cover shadow" />
                                    ) : data.media_type === 'video' ? (
                                        <video key={index} src={url} controls className="h-24 w-32 rounded shadow" />
                                    ) : null;
                                })}
                            </div>
                        )}

                        <div className="grid gap-2">
                            <Label htmlFor="port">Media Height</Label>

                            <Input
                                id="media_height"
                                className="mt-1 block w-full"
                                value={data.media_height}
                                onChange={(e) => setData('media_height', e.target.value)}
                                autoComplete="media_height"
                                placeholder="Media Height"
                            />

                            <InputError className="mt-2" message={errors.media_height} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="port">Media Width</Label>
                            <Input
                                id="media_width"
                                className="mt-1 block w-full"
                                value={data.media_width}
                                onChange={(e) => setData('media_width', e.target.value)}
                                autoComplete="media_width"
                                placeholder="Media Width"
                            />

                            <InputError className="mt-2" message={errors.media_width} />
                        </div>

                        <div className="flex items-center gap-4">
                            <Button disabled={processing}>Save & Connect</Button>

                            <Transition
                                show={recentlySuccessful}
                                enter="transition ease-in-out"
                                enterFrom="opacity-0"
                                leave="transition ease-in-out"
                                leaveTo="opacity-0"
                            >
                                <p className="text-sm text-neutral-600">Saved</p>
                            </Transition>
                        </div>
                    </form>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
