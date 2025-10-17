import React, { useState } from "react";
import { useForm } from "@inertiajs/react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { DialogTitle } from "@radix-ui/react-dialog";

import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Label } from "../ui/label";


export default function ItemEdit({
    item,
    categories,
}: {
    item: any,
    categories: { id: number, name: string }[],
}) {

    const [showImage] = useState(item?.image || "");
    const [open,setOpen] = useState(false);

    const { setData, put, processing, data, errors } = useForm<{
        id: number | string;
        item_number: string;
        title: string;
        price: number | string;
        qty: number | string;
        description: string;
        product_category_id: number | string;
        image: string | File | null;
    }>({
        id: item?.id || "",
        item_number: item?.item_number || "",
        title: item?.title || "",
        price: item?.price || "",
        qty: item?.qty || "",
        description: item?.description || "",
        product_category_id: item?.product_category_id || "",
        image: null,
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        put('/products/' + data.id, {
            onSuccess: () => {
                setOpen(false);
            },
        });
    };

    React.useEffect(() => {
        setData({
            id: item?.id || "",
            item_number: item?.item_number || "",
            title: item?.title || "",
            price: item?.price || "",
            qty: item?.qty || "",
            description: item?.description || "",
            product_category_id: item?.product_category_id || "",
            image: item?.image || "",
        });
    }, [item]);

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit Product</DialogTitle>
                </DialogHeader>
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

                        <img
                            src={showImage}
                            alt="Product"
                            className="h-100 py-5 rounded-md object-cover cursor-pointer hover:scale-105 transition-transform"
                        />

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
}