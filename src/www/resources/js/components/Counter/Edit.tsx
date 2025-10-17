import React, { useEffect, useState,FormEvent } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../ui/select";

type Service = {
    id: string;
    name: string;
};

export default function ItemEdit({ title, endpoint, item, open, setOpen }: { title: any, endpoint: any, item: any, open: boolean, setOpen: (open: boolean) => void }) {
    
    const [services, setServices] = useState<Service[]>([]);

    const { setData, put, processing, data, errors } = useForm({
        id: item?.id || "",
        name: item?.name || "",
        service_id: item?.service_id || 0,
        description: item?.description || "",
    });

    const fetchServices = async () => {
        try {
            const res = await fetch("/service-list");
            const json = await res.json();
            setServices(json);
        } catch (err) {
            console.error("Failed to fetch services", err);
        }
    };

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put(endpoint + '/' + data.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    useEffect(() => {
        setData({
            id: item?.id || "",
            name: item?.name || "",
            service_id: item?.service_id || 0,
            description: item?.description || "",
        });

        fetchServices();
    }, [item]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit {title} </DialogTitle>
                </DialogHeader>
                <form onSubmit={handleSubmit} className="space-y-4">

                     <div className="max-w-md">
                        <Select
                            onValueChange={(value) => setData("service_id", parseInt(value))}
                            value={data.service_id ? String(data.service_id) : ""}
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

                        {errors.service_id && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.service_id}</p>
                        )}
                    </div>

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