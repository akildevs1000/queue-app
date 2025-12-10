import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { DialogTitle } from '@radix-ui/react-dialog';
import React from 'react';

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
        code: item?.code || '',
        description: item?.description || '',
        starting_number: item?.starting_number || null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(endpoint + '/' + data.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    React.useEffect(() => {
        setData({
            id: item?.id || '',
            name: item?.name || '',
            code: item?.code || '',
            description: item?.description || '',
            starting_number: item?.starting_number,
        });
    }, [item]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {title} </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-md">
                        <Input placeholder="Name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="pt-1 pl-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input placeholder="Code" type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        {errors.code && <p className="pt-1 pl-1 text-sm text-red-400">{errors.code}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Starting Number (e.g., 1000)"
                            // Use 'number' type for mobile keyboards and basic validation
                            type="number"
                            value={data.starting_number || ''}
                            onChange={(e) =>
                                // Convert value to a number for the state
                                setData('starting_number', Number(e.target.value))
                            }
                        />
                        {errors.starting_number && <p className="pt-1 pl-1 text-sm text-red-400">{errors.starting_number}</p>}
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
