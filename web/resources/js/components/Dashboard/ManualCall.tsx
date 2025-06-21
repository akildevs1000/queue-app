'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { GradientButton } from '@/components/ui/GradientButton';
import { Input } from '@/components/ui/input';
import { useForm } from '@inertiajs/react';
import { FormEvent, useState } from 'react';

type CreateInterFace = {
    token_number_display: string;
};

export default function ManualCall({
    title,
    onSubmitData,
}: {
    title: any;
    onSubmitData: (value: string) => void; // 👈 Add this type
}) {
    const [open, setOpen] = useState(false);

    const { data, setData, processing } = useForm<CreateInterFace>({
        token_number_display: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        onSubmitData(data.token_number_display);
        setOpen(false);
        setData('token_number_display', '');

        // post(endpoint, {
        //     onSuccess: () => {
        //         reset();
        //         setOpen(false);
        //     },
        // });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <GradientButton className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                    {title}
                </GradientButton>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-xl font-bold">{title}</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-md">
                        <Input
                            placeholder="Token"
                            type="text"
                            value={data.token_number_display}
                            onChange={(e) => setData('token_number_display', e.target.value)}
                        />
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        Call
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
