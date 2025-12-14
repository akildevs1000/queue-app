'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { CounterList, ServiceList } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import InputError from '../input-error';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type CreateInterFace = {
    name: string;
    number: string;
    email: string;
    password: string;
    password_confirmation: string;
    service_id: number;
    counter_id: number;
    login_pin: null | string;
};
export default function Create({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        name: '',
        number: '',
        email: '',
        password: '',
        password_confirmation: '',
        service_id: 0,
        counter_id: 0,
        login_pin: null,
    });

    const [services, setServices] = useState<ServiceList[]>([]);

    const fetchServices = async () => {
        try {
            const res = await fetch('/service-list');
            const json = await res.json();
            setServices(json);
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

    const handleServiceChange = async (service_id: string) => {
        setData('service_id', parseInt(service_id));
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
                        <Select onValueChange={handleServiceChange} value={data.service_id ? String(data.service_id) : ''}>
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {services.map((service) => (
                                    <SelectItem key={service.id} value={String(service.id)}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.service_id && <p className="pt-1 pl-1 text-sm text-red-400">{errors.service_id}</p>}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            required
                            tabIndex={1}
                            autoComplete="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="Jhon"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="email">Login Pin</Label>
                        <Input
                            id="login_pin"
                            required
                            tabIndex={2}
                            value={data.login_pin ?? ''}
                            onChange={(e) => setData('login_pin', e.target.value)}
                            disabled={processing}
                            placeholder="1234"
                        />
                        <InputError message={errors.login_pin} />
                    </div>
              
                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
