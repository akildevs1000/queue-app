import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ServiceList } from '@/types';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect, useState } from 'react';
import InputError from '../input-error';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

export default function ItemEdit({
    title,
    endpoint,
    item,
    open,
    setOpen,
}: {
    title: any;
    endpoint: any;
    item: any;
    open: boolean;
    setOpen: (open: boolean) => void;
}) {
    const { setData, put, processing, data, errors } = useForm({
        id: item?.id || '',
        name: item?.name || '',
        service_id: item?.service_id || 0,
        login_pin: item?.login_pin,
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

    useEffect(() => {
        const initializeForm = async () => {
            if (!open || !item) return;

            // 1. Set form data
            setData({
                id: item.id ?? '',
                name: item.name ?? '',
                service_id: item.service_id ?? 0,
                login_pin: item.login_pin ?? null
            });
        };

        initializeForm();
    }, [open, item]);


    const handleServiceChange = async (service_id: string) => {
        setData('service_id', parseInt(service_id));
    };

    const handleProfileSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(endpoint + '/' + data.id, {
            onSuccess: () => setOpen(false),
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit {title}</DialogTitle>
                </DialogHeader>

                <form onSubmit={handleProfileSubmit} className="mt-4 space-y-4">
                    <div>
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

                    <div>
                        <Label htmlFor="name">Name</Label>
                        <Input
                            id="name"
                            value={data.name}
                            onChange={(e) => setData('name', e.target.value)}
                            disabled={processing}
                            placeholder="John"
                        />
                        <InputError message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="login_pin">Login Pin</Label>
                        <Input
                            id="login_pin"
                            value={data.login_pin ?? ''}
                            onChange={(e) => setData('login_pin', e.target.value)}
                            disabled={processing}
                            placeholder="1234"
                        />
                        <InputError message={errors.login_pin} />
                    </div>

                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Saving...' : 'Save Profile'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
