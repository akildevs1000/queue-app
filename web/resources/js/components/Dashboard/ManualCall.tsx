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

export default function ManualCall({ title, endpoint }: { title: any; endpoint: any }) {
    const [open, setOpen] = useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<CreateInterFace>({
        token_number_display: '',
    });

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        console.log('🚀 ~ handleSubmit ~ token_number_display:', data.token_number_display);

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
                <GradientButton className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
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
                        {errors.token_number_display && <p className="pt-1 pl-1 text-sm text-red-400">{errors.token_number_display}</p>}
                    </div>

                    <Button className="w-full bg-gradient-to-r from-blue-500 to-purple-600 text-white" type="submit" disabled={processing}>
                        {processing ? 'Submitting...' : 'Submit'}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
