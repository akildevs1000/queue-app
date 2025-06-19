import { type BreadcrumbItem, type SharedData } from '@/types';
import { Transition } from '@headlessui/react';
import { Head, useForm, usePage } from '@inertiajs/react';
import { FormEventHandler, useEffect, useRef } from 'react';

import HeadingSmall from '@/components/heading-small';
import InputError from '@/components/input-error';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Tv Settings',
        href: '/settings/tv-settings',
    },
];

type ProfileForm = {
    ip: string;
    port: string;
    media_url: string;
    media_height: string;
    media_width: string;
};

export default function Profile() {
    const { auth } = usePage<SharedData>().props;

    const { data, setData, put, errors, processing, recentlySuccessful } = useForm<Required<ProfileForm>>({
        ip: auth.user.ip,
        port: auth.user.port,
        media_url: auth.user.media_url,
        media_height: auth.user.media_height,
        media_width: auth.user.media_width,
    });

    const submit: FormEventHandler = (e) => {
        e.preventDefault();

        put(route('tv_settings.update'), {
            preserveScroll: true,

            onSuccess: () => {
                const socket = socketRef.current;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    let payload = {
                        event: 'trigger-settings',
                        data: data,
                    };
                    socket.send(JSON.stringify(payload));
                } else {
                    console.warn('WebSocket is not open.');
                }
            },
        });
    };

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {
        const socket = new WebSocket('ws://192.168.3.245:7777');
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('Connected to WS server');
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => {
            socket.close();
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
                            <Label htmlFor="port">Media Url</Label>

                            <Input
                                id="media_url"
                                className="mt-1 block w-full"
                                value={data.media_url}
                                onChange={(e) => setData('media_url', e.target.value)}
                                required
                                autoComplete="media_url"
                                placeholder="media_url"
                            />

                            <InputError className="mt-2" message={errors.media_url} />
                        </div>
                        <div className="grid gap-2">
                            <Label htmlFor="port">Media Height</Label>

                            <Input
                                id="media_height"
                                className="mt-1 block w-full"
                                value={data.media_height}
                                onChange={(e) => setData('media_height', e.target.value)}
                                required
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
                                required
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
