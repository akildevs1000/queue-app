'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

import { type ServiceList } from '@/types';

type CreateInterFace = {
    name: string;
    service_id: number;
    description: string;
};

export default function Item({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = useState(false);

    const [services, setServices] = useState<ServiceList[]>([]);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        name: '',
        service_id: 0,
        description: '',
    });

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
                        <Select
                            onValueChange={(value) => setData('service_id', parseInt(value))}
                            value={data.service_id ? String(data.service_id) : ''}
                        >
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
                        <Input placeholder="Name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="pt-1 pl-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData('description', e.target.value)}
                        />
                        {errors.description && <p className="pt-1 pl-1 text-sm text-red-400">{errors.description}</p>}
                    </div>

                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
