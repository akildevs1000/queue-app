import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CounterList, ServiceList } from '@/types';
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
        number: item?.number || '',
        email: item?.email || '',
        service_id: item?.service_id || 0,
        counter_id: item?.counter_id || 0,
    });
    console.log('🚀 ~ item?.service_id:', item?.service_id);
    console.log('🚀 ~ item?.counter_id:', item?.counter_id);

    const [services, setServices] = useState<ServiceList[]>([]);
    const [counters, setCounters] = useState<CounterList[]>([]);

    const {
        setData: setPasswordData,
        put: putPassword,
        processing: processingPassword,
        data: passwordData,
        errors: passwordErrors,
    } = useForm({
        password: '',
        password_confirmation: '',
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
    const initializeForm = async () => {
        if (!open || !item) return;

        // 1. Set form data
        setData({
            id: item.id ?? '',
            name: item.name ?? '',
            number: item.number ?? '',
            email: item.email ?? '',
            service_id: item.service_id ?? 0,
            counter_id: item.counter_id ?? 0,
        });

        // 2. Fetch services
        try {
            const res = await fetch('/service-list');
            const serviceList = await res.json();
            setServices(serviceList);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }

        // 3. Fetch counters for the service
        if (item.service_id) {
            try {
                const res = await fetch(`/counter-list-by-service-id/${item.service_id}`);
                const counterList = await res.json();
                setCounters(counterList);
            } catch (err) {
                console.error('Failed to fetch counters', err);
            }
        }
    };

    initializeForm();
}, [open, item]);


    const handleServiceChange = async (service_id: string) => {
        setData('service_id', parseInt(service_id));

        try {
            const res = await fetch(`/counter-list-by-service-id/${service_id}`);
            const json = await res.json();
            console.log('🚀 ~ handleServiceChange ~ json:', json);
            setCounters(json);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const handleCounterChange = async (service_id: string) => {
        setData('counter_id', parseInt(service_id));
    };

    const handleProfileSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(endpoint + '/' + data.id, {
            onSuccess: () => setOpen(false),
        });
    };

    const handlePasswordSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        putPassword('update-password/' + data.id, {
            onSuccess: () => setOpen(false),
        });
    };

 

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="max-w-xl">
                <DialogHeader>
                    <DialogTitle>Edit {title}</DialogTitle>
                </DialogHeader>

                <Tabs defaultValue="profile" className="mt-4 w-full">
                    <TabsList className="inline-flex w-full justify-center gap-2">
                        <TabsTrigger value="profile">Profile</TabsTrigger>
                        <TabsTrigger value="password">Password</TabsTrigger>
                    </TabsList>

                    {/* Profile Tab */}
                    <TabsContent value="profile">
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
                                <Select onValueChange={handleCounterChange} value={data.counter_id ? String(data.counter_id) : ''}>
                                    <SelectTrigger className="w-full">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {counters.map((counter) => (
                                            <SelectItem key={counter.id} value={String(counter.id)}>
                                                {counter.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                {errors.counter_id && <p className="pt-1 pl-1 text-sm text-red-400">{errors.counter_id}</p>}
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
                                <Label htmlFor="number">Number</Label>
                                <Input
                                    id="number"
                                    value={data.number}
                                    onChange={(e) => setData('number', e.target.value)}
                                    disabled={processing}
                                    placeholder="971123456789"
                                />
                                <InputError message={errors.number} />
                            </div>

                            <div>
                                <Label htmlFor="email">Email</Label>
                                <Input
                                    id="email"
                                    type="email"
                                    value={data.email}
                                    onChange={(e) => setData('email', e.target.value)}
                                    disabled={processing}
                                    placeholder="email@example.com"
                                />
                                <InputError message={errors.email} />
                            </div>

                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                                {processing ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </form>
                    </TabsContent>

                    {/* Password Tab */}
                    <TabsContent value="password">
                        <form onSubmit={handlePasswordSubmit} className="mt-4 space-y-4">
                            <div>
                                <Label htmlFor="password">New Password</Label>
                                <Input
                                    id="password"
                                    type="password"
                                    value={passwordData.password}
                                    onChange={(e) => setPasswordData('password', e.target.value)}
                                    disabled={processingPassword}
                                    placeholder="Enter new password"
                                />
                                <InputError message={passwordErrors.password} />
                            </div>

                            <div>
                                <Label htmlFor="password_confirmation">Confirm Password</Label>
                                <Input
                                    id="password_confirmation"
                                    type="password"
                                    value={passwordData.password_confirmation}
                                    onChange={(e) => setPasswordData('password_confirmation', e.target.value)}
                                    disabled={processingPassword}
                                    placeholder="Re-enter new password"
                                />
                                <InputError message={passwordErrors.password_confirmation} />
                            </div>

                            <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processingPassword}>
                                {processingPassword ? 'Updating...' : 'Update Password'}
                            </Button>
                        </form>
                    </TabsContent>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
}
