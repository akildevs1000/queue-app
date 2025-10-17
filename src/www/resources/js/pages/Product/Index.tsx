"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link, useForm, usePage } from '@inertiajs/react';

import * as React from "react"
import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getFilteredRowModel,
    getPaginationRowModel,
    getSortedRowModel,
    useReactTable,
} from "@tanstack/react-table"
import { ArrowUpDown, ChevronDown, MoreVertical, Pencil, Send, Trash } from "lucide-react";

import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

import { Button } from "@/components/ui/button"

import {
    DropdownMenu,
    DropdownMenuCheckboxItem,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"

import Create from '@/components/Product/Create';
import Edit from '@/components/Product/Edit';
import { Dialog, DialogContent, DialogTrigger } from '@radix-ui/react-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@radix-ui/react-avatar';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Product',
        href: '/products',
    },
];

interface Category {
    id: number;
    name: string;
}

export type Item = {
    id: number;
    item_number: string;
    title: string;
    price: string;
    qty: string;
    description: string;
    product_category_id: string;

}


// Dashboard Component
export default function Dashboard({ items }: { items: any }) {
    const { props } = usePage<{ categories: Category[] }>();
    const categories = props.categories;

    const { get } = useForm();

    const handlePerPage = (per_page: number) => {
        get(route("product-categories.index", { per_page }));
    };

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const data = React.useMemo(() => items.data, [items]);

    React.useEffect(() => {
        table.setPageSize(items.per_page); // Ensure table updates
    }, [items]);

    const columns: ColumnDef<Item>[] = [
        {
            accessorKey: "id",
            header: "#",
        },
        {
            accessorKey: "user_id",
            header: "User Id",
        },
        {
            accessorKey: "item_number",
            header: "Item Number",
        },
        {
            accessorKey: "image",
            header: "Image",
            cell: ({ row }) => {
                const image = row.getValue("image") as string;

                return image && image.trim() !== "" ? (
                    <img
                        src={image}
                        alt="Product"
                        className="w-14 h-14 rounded-md object-cover cursor-pointer hover:scale-105 transition-transform"
                    />
                ) : (
                    <span className="text-sm text-gray-500 italic">Image not available</span>
                );
            },
        },
        {
            accessorKey: "title",
            header: "Title",
        },
        {
            accessorKey: "price",
            header: "Price",
        },
        {
            accessorKey: "qty",
            header: "Qty",
        },
        {
            accessorKey: "description",
            header: "Description",
        },
        {
            accessorKey: "product_category.name",
            header: "Category",
        },

        {
            id: "actions",
            header: "Action",
            cell: ({ row }) => {
                const item = row.original;

                const { delete: destroy, setData, put } = useForm({
                    id: item.id,
                    item_number: item.item_number,
                    title: item.title,
                    price: item.price,
                    qty: item.qty,
                    description: item.description,
                    product_category_id: item.product_category_id,
                });

                const handleDelete = (id: number) => {
                    if (!confirm("Are you sure you want to delete this tasks?")) return;
                    destroy(`/products/${id}`);
                };

                const [open, setOpen] = React.useState(false);
                const handleEdit = (item: any) => {
                    setOpen(true);
                    setData(item);
                };

                return (
                    <div>
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button variant="ghost" className="h-8 w-8 p-0">
                                    <span className="sr-only">Open menu</span>
                                    <MoreVertical />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="right-0 cursor-pointer">
                                <DropdownMenuItem onClick={() => handleEdit(item)}>
                                    <Pencil /> Edit
                                </DropdownMenuItem>
                                <DropdownMenuItem onClick={() => handleDelete(item.id)}>
                                    <Trash /> Delete
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>

                        {/* ✅ No TS error now because categories is in scope */}
                        <Edit item={item} categories={categories} />
                    </div>
                );
            },
        }
    ];

    const table = useReactTable({
        data,
        columns,
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getFilteredRowModel: getFilteredRowModel(),
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
        },
    })

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Tasks" />
            <div className="w-full p-6 rounded-lg shadow flex justify-between items-center">
                <div className="flex items-center py-4">
                    <Input
                        placeholder="Filter titles..."
                        value={(table.getColumn("title")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("title")?.setFilterValue(event.target.value)
                        }
                        className="max-w-sm  mr-1"
                    />
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="outline">
                                Columns <ChevronDown />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            {table
                                .getAllColumns()
                                .filter((column) => column.getCanHide())
                                .map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        className="capitalize"
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                    >
                                        {column.id}
                                    </DropdownMenuCheckboxItem>
                                ))}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
                <Create categories={categories} />
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div>
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            ))}
                        </TableHeader>
                        <TableBody>
                            {table.getRowModel().rows.length ? (
                                table.getRowModel().rows.map((row) => (
                                    <TableRow key={row.id}>
                                        {row.getVisibleCells().map((cell) => (
                                            <TableCell key={cell.id}>
                                                {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))
                            ) : (
                                <TableRow>
                                    <TableCell colSpan={columns.length} className="h-24 text-center">
                                        No results.
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>

                    <div className="flex items-center justify-between mt-4">
                        <div className="flex items-center gap-2">
                            <span>Rows per page:</span>
                            <Select
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                    handlePerPage(Number(value)); // Call handlePerPage here
                                }}
                                value={String(table.getState().pagination.pageSize)}
                            >
                                <SelectTrigger className="w-[120px]">
                                    <SelectValue placeholder="Per Page" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectLabel>Per Page</SelectLabel>
                                        {[5, 10, 20, 50, 100].map((pageSize) => (
                                            <SelectItem key={pageSize} value={String(pageSize)}>
                                                {pageSize}
                                            </SelectItem>
                                        ))}
                                    </SelectGroup>
                                </SelectContent>
                            </Select>

                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => table.previousPage()}
                                disabled={!table.getCanPreviousPage()}
                            >
                                Previous
                            </Button>
                            <span>
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                            <Button
                                variant="outline"
                                onClick={() => table.nextPage()}
                                disabled={!table.getCanNextPage()}
                            >
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}