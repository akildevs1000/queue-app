'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import InputError from '../input-error';
import { Label } from '../ui/label';

type CreateInterFace = {
    name: string;
    email: string;
    phone: string;
    whatsapp: string;
    address: string;
    vip_number: string;
    date_of_birth: string;
    rfid: string | null;
};
export default function Create({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        name: '',
        email: '',
        phone: '',
        whatsapp: '',
        address: '',
        vip_number: '',
        date_of_birth: '',
        rfid: '',
    });

    const fetchServices = async () => {
        try {
            const res = await fetch('/next-vipnumber');
            const json = await res.json();
            setData('vip_number', json.vip_number);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    useEffect(() => {
        fetchServices();
    }, []);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        console.log(data);
        e.preventDefault();
        post(endpoint, {
            onSuccess: () => {
                reset();
                setOpen(false);
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <GradientButton>Create {title} </GradientButton>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-xl font-bold">Create {title}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-md">
                        <Label htmlFor="vip_number">Vip Number</Label>
                        <Input
                            id="vip_number"
                            required
                            tabIndex={3}
                            autoComplete="vip_number"
                            value={data.vip_number}
                            disabled={processing}
                            readOnly
                        />
                        <InputError message={errors.vip_number} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                            id="name"
                            required
                            tabIndex={3}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.name} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="email">Email address</Label>
                        <Input
                            id="email"
                            type="email"
                            required
                            tabIndex={3}
                            autoComplete="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.email} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="phone">Phone</Label>
                        <Input
                            id="phone"
                            required
                            tabIndex={3}
                            autoComplete="phone"
                            value={data.phone}
                            onChange={(e) => setData('phone', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.phone} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="whatsapp">Whatsapp</Label>
                        <Input
                            id="whatsapp"
                            required
                            tabIndex={3}
                            autoComplete="whatsapp"
                            value={data.whatsapp}
                            onChange={(e) => setData('whatsapp', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.whatsapp} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="address">Address</Label>
                        <Input
                            id="address"
                            required
                            tabIndex={3}
                            autoComplete="address"
                            value={data.address}
                            onChange={(e) => setData('address', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.address} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="date_of_birth">Date Of Birth</Label>
                        <Input
                            id="date_of_birth"
                            required
                            tabIndex={3}
                            autoComplete="date_of_birth"
                            value={data.date_of_birth}
                            onChange={(e) => setData('date_of_birth', e.target.value)}
                            disabled={processing}
                        />
                        <InputError message={errors.date_of_birth} />
                    </div>
                    <div className="max-w-md">
                        <Label htmlFor="rfid">RFID</Label>
                        <Input
                            id="rfid"
                            required
                            autoComplete="rfid"
                            value={data.rfid || ''}
                            disabled={processing}
                            onChange={(e) => setData('rfid', e.target.value)}
                        />
                        <InputError message={errors.rfid} />
                    </div>
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
