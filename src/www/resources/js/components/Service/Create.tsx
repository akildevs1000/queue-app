'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import React from 'react';

type CreateInterFace = {
    name: string;
    code: string;
    description: string;
    starting_number: number | null;
};
export default function ItemEdit({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        name: '',
        code: '',
        description: '',
        starting_number: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
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
                        <Input placeholder="Name" type="text" value={data.name} onChange={(e) => setData('name', e.target.value)} />
                        {errors.name && <p className="pt-1 pl-1 text-sm text-red-400">{errors.name}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input placeholder="Prefix" type="text" value={data.code} onChange={(e) => setData('code', e.target.value)} />
                        {errors.code && <p className="pt-1 pl-1 text-sm text-red-400">{errors.code}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Starting Number (e.g., 1000)"
                            // Use 'number' type for mobile keyboards and basic validation
                            type="number"
                            value={data.starting_number || ""}
                            onChange={(e) =>
                                // Convert value to a number for the state
                                setData('starting_number', Number(e.target.value || 0))
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
