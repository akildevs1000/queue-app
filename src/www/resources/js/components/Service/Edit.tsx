import React from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

export default function ItemEdit({ title, endpoint, item, open, setOpen }: { title: any, endpoint: any, item: any, open: boolean, setOpen: (open: boolean) => void }) {
    const { setData, put, processing, data, errors } = useForm({
        id: item?.id || "",
        name: item?.name || "",
        code: item?.code || "",
        description: item?.description || "",
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
            id: item?.id || "",
            name: item?.name || "",
            code: item?.code || "",
            description: item?.description || "",
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
                        <Input
                            placeholder="Name"
                            type="text"
                            value={data.name}
                            onChange={(e) => setData("name", e.target.value)}
                        />
                        {errors.name && <p className="text-red-400 pl-1 pt-1 text-sm">{errors.name}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Code"
                            type="text"
                            value={data.code}
                            onChange={(e) => setData("code", e.target.value)}
                        />
                        {errors.code && <p className="text-red-400 pl-1 pt-1 text-sm">{errors.code}</p>}
                    </div>

                    <div className="max-w-md">
                        <Input
                            placeholder="Description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                        />
                        {errors.description && <p className="text-red-400 pl-1 pt-1 text-sm">{errors.description}</p>}
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
}