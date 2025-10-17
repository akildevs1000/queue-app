import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useForm } from '@inertiajs/react';
import { FormEvent, useEffect } from 'react';
import InputError from '../input-error';

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
        email: item?.email || '',
        phone: item?.phone || '',
        whatsapp: item?.whatsapp || '',

        address: item?.address || '',
        vip_number: item?.vip_number || '',
        date_of_birth: item?.date_of_birth || '',
    });

    useEffect(() => {
        const initializeForm = async () => {
            if (!open || !item) return;

            // 1. Set form data
            setData({
                id: item?.id || '',
                name: item?.name || '',
                email: item?.email || '',
                phone: item?.phone || '',
                whatsapp: item?.whatsapp || '',

                address: item?.address || '',
                vip_number: item?.vip_number || '',
                date_of_birth: item?.date_of_birth || '',
            });
        };

        initializeForm();
    }, [open, item]);

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
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

                    <Button className="bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
