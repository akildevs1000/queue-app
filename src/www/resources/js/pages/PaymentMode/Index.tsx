"use client"

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, router, Link, useForm } from '@inertiajs/react';

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

import Create from '@/components/Create';
import Edit from '@/components/Edit';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Payment Mode',
        href: '/payment-modes',
    },
];

// Contact type definition
export type Contact = {
    id: number;
    name: string;
    description: string;
}

// Define Table Columns
export const columns: ColumnDef<Contact>[] = [

    {
        accessorKey: "id",
        header: "#",
    },
    {
        accessorKey: "name",
        header: "Name",
    },
    {
        accessorKey: "description",
        header: "Description",
    },

    {
        id: "actions",
        header: "Action",
        cell: ({ row }) => { // No handleDelete function here yet
            const contact = row.original;

            const { delete: destroy, setData, put } = useForm({
                id: contact.id,
                name: contact.name,
                description: contact.description,
            });

            // Function to handle delete
            const handleDelete = (id: number) => {
                if (!confirm("Are you sure you want to delete this tasks?")) return;

                destroy(`/payment-modes/${id}`, {
                    onSuccess: () => {
                    }
                });
            };

            const [open, setOpen] = React.useState(false); // State to control the dialog

            const handleEdit = (contact: any) => {
                console.log("🚀 ~ handleEdit ~ contact:", contact)
                setOpen(true);
                setData(contact)
            }

            return (
                <div> {/* Adds right padding */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="right-0 cursor-pointer">
                            <DropdownMenuItem onClick={() => handleEdit(contact)}> {/* Open dialog on click */}
                                <Pencil /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem
                                onClick={() => handleDelete(contact.id)} // Calls the handleDelete function
                                className="cursor-pointer"
                            >
                                <Trash /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <Edit title={'Payment Mode'} endpoint={'payment-modes'} open={open} setOpen={setOpen} item={contact} />
                </div>
            );
        },
    }

]

// Dashboard Component
export default function Dashboard({ items }: { items: any }) {

    const { get } = useForm();

    const handlePerPage = (per_page: number) => {
        get(route("payment-modes.index", { per_page }));
    };

    const [sorting, setSorting] = React.useState<SortingState>([])
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([])
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({})
    const [rowSelection, setRowSelection] = React.useState({})

    const data = React.useMemo(() => items.data, [items]);

    React.useEffect(() => {
        table.setPageSize(items.per_page); // Ensure table updates
    }, [items]);

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
                        value={(table.getColumn("name")?.getFilterValue() as string) ?? ""}
                        onChange={(event) =>
                            table.getColumn("name")?.setFilterValue(event.target.value)
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
                <Create title={'Payment Mode'} endpoint={'payment-modes'} />
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
