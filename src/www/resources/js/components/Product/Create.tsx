"use client";

import React from "react";
import { useForm } from "@inertiajs/react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { GradientButton } from "@/components/ui/GradientButton";
import { toast } from "sonner";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "../ui/label";

export interface Category {
    id: number;
    name: string;
}

interface CreateProps {
    categories: Category[];
}


export interface FormInterface {
    item_number: string;
    title: string;
    price: number;
    qty: number;
    description: string;
    product_category_id: number;
    image: File | null; // ← add this
    [key: string]: string | number | File | null;
}


const Create: React.FC<CreateProps> = ({ categories }) => {

    const [open, setOpen] = React.useState(false);

    const { data, setData, post, processing, reset, errors } = useForm<FormInterface>({
        item_number: "",
        title: "",
        price: 0,
        qty: 0,
        description: "",
        product_category_id: 0,
        image: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        post("/products", {
            onSuccess: () => {
                reset();
                setOpen(false);
                toast.success("Product created successfully");
            },
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <GradientButton>Create Product</GradientButton>
            </DialogTrigger>
            <DialogContent>
                <h2 className="text-xl font-bold">Create Product</h2>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="max-w-md">
                        <Label htmlFor="item_number">Item Code</Label>
                        <Input
                            id="item_number"
                            type="text"
                            value={data.item_number}
                            onChange={(e) => setData("item_number", e.target.value)}
                        />
                        {errors.item_number && (
                            <p className="text-red-400 text-sm pt-1">{errors.item_number}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="title">Title</Label>
                        <Input
                            id="title"
                            type="text"
                            value={data.title}
                            onChange={(e) => setData("title", e.target.value)}
                        />
                        {errors.title && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.title}</p>
                        )}
                    </div>


                    <div className="max-w-md">
                        <Label htmlFor="price">Price</Label>
                        <Input
                            id="price"
                            type="number"
                            value={data.price}
                            onChange={(e) => setData("price", parseFloat(e.target.value))}
                        />
                        {errors.price && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.price}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="quantity">Quantity</Label>
                        <Input
                            id="quantity"
                            type="number"
                            value={data.qty}
                            onChange={(e) => setData("qty", parseFloat(e.target.value))}
                        />
                        {errors.qty && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.qty}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="description">Description</Label>
                        <Input
                            id="description"
                            type="text"
                            value={data.description}
                            onChange={(e) => setData("description", e.target.value)}
                        />
                        {errors.description && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.description}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="category">Category</Label>
                        <Select
                            onValueChange={(value) => setData("product_category_id", parseInt(value))}
                            value={data.product_category_id ? String(data.product_category_id) : ""}
                        >
                            <SelectTrigger className="w-full">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((category) => (
                                    <SelectItem key={category.id} value={String(category.id)}>
                                        {category.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {errors.product_category_id && (
                            <p className="text-red-400 pl-1 pt-1 text-sm">{errors.product_category_id}</p>
                        )}
                    </div>

                    <div className="max-w-md">
                        <Label htmlFor="description">Image</Label>

                        <Input
                            placeholder="Image"
                            type="file"
                            id="image"
                            onChange={(e) => setData('image', e.target.files?.[0] || null)}
                        />
                        {errors.image && <p className="text-red-400 pl-1 pt-1 text-sm">{errors.image}</p>}
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

export default Create;