"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { toast } from "sonner";

type CreateInterFace = {
    name: string;
    description: string;
};
export default function ItemEdit({ title, endpoint }: { title: any, endpoint: any }) {
    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, reset, errors } =
        useForm<CreateInterFace>({
            name: "",
            description: "",
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
                        <Input
                            placeholder="Name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.name}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                        />
                        {errors.description && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.description}</p>
                        )}
                    </div>



                    <Button
                        className="bg-gradient-to-r from-blue-500 to-purple-600 text-white"
                        type="submit"
                        disabled={processing}
                    >
                        {processing ? "Submitting..." : "Submit"}
                    </Button>
                </form>
            </DialogContent>
        </Dialog>
    );
};
