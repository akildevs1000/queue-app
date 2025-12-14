'use client';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';
import { QRCodeSVG } from 'qrcode.react';

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
} from '@tanstack/react-table';
import { ChevronDown, MoreVertical, Pencil, Trash } from 'lucide-react';
import * as React from 'react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import Create from '@/components/Customer/Create';
import Edit from '@/components/Customer/Edit';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Customer',
        href: '/customers',
    },
];

export type Contact = {
    vip_number: string;
};

// Define Table Columns
export const columns: ColumnDef<Contact>[] = [
    {
        accessorKey: 'rfid',
        header: 'RFID',
        cell: () => {
            let width = 30,
                height = 30,
                color = '#000';
            return (
                <svg width={width} height={height} viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    {/* Card rectangle */}
                    <rect x="2" y="8" width="60" height="48" rx="4" stroke={color} strokeWidth="2" fill="white" />

                    {/* Profile circle */}
                    <circle cx="16" cy="24" r="8" stroke={color} strokeWidth="2" fill="#eee" />

                    {/* Name line */}
                    <line x1="28" y1="20" x2="56" y2="20" stroke={color} strokeWidth="2" strokeLinecap="round" />

                    {/* Info lines */}
                    <line x1="28" y1="28" x2="56" y2="28" stroke={color} strokeWidth="2" strokeLinecap="round" />
                    <line x1="28" y1="36" x2="48" y2="36" stroke={color} strokeWidth="2" strokeLinecap="round" />
                </svg>
            );
        },
    },
    {
        id: 'qrcode',
        header: 'QrCode',
        cell: ({ row }) => {
            const item = row.original;
            const vip_number = item.vip_number;

            return (
                <QRCodeSVG
                    value={vip_number} // encode VIP number directly
                    size={30} // adjust size
                    bgColor="#ffffff"
                    fgColor="#000000"
                />
            );
        },
    },
    {
        accessorKey: 'name',
        header: 'Full Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'phone',
        header: 'Phone',
    },
    {
        accessorKey: 'whatsapp',
        header: 'Whatsapp',
    },
    {
        accessorKey: 'address',
        header: 'Address',
    },
    {
        accessorKey: 'date_of_birth',
        header: 'Date Of Birth',
    },

    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            // No handleDelete function here yet
            const contact = row.original;

            const {
                delete: destroy,
                setData,
                put,
            } = useForm({
                id: contact.id,
                name: contact.name,
                description: contact.description,
            });

            // Function to handle delete
            const handleDelete = (id: number) => {
                if (!confirm('Are you sure you want to delete this tasks?')) return;

                destroy(`/customers/${id}`, {
                    onSuccess: () => {},
                });
            };

            const [open, setOpen] = React.useState(false); // State to control the dialog

            const handleEdit = (contact: any) => {
                console.log('🚀 ~ handleEdit ~ contact:', contact);
                setOpen(true);
                setData(contact);
            };

            return (
                <div>
                    {' '}
                    {/* Adds right padding */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                                <span className="sr-only">Open menu</span>
                                <MoreVertical />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="right-0 cursor-pointer">
                            <DropdownMenuItem onClick={() => handleEdit(contact)}>
                                {' '}
                                {/* Open dialog on click */}
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
                    <Edit title={'Customer'} endpoint={'customers'} open={open} setOpen={setOpen} item={contact} />
                </div>
            );
        },
    },
];

export default function App({ items }: { items: any }) {
    const { get } = useForm();

    const handlePerPage = (per_page: number) => {
        get(route('customers.index', { per_page }));
    };

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

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
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Customer" />
            {/* Header and Controls */}
            <div className="flex w-full items-center justify-between rounded-lg p-5">
                <div className="flex items-center">
                    {/* Filter Input */}
                    <Input
                        placeholder="Search..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="mr-1 max-w-sm"
                    />
                </div>

                {/* Create Button */}
                <Create title="Customer" endpoint="customers" />
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="gap-4 rounded-xl p-4 text-[var(--foreground) bg-white dark:bg-gray-900">
                    <Table>
                        <TableHeader>
                            {table.getHeaderGroups().map((headerGroup) => (
                                <TableRow key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <TableHead key={header.id}>
                                            {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
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
                                            <TableCell key={cell.id}>{flexRender(cell.column.columnDef.cell, cell.getContext())}</TableCell>
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

                    <div className="mt-4 flex items-center justify-between">
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
                            <Button variant="outline" onClick={() => table.previousPage()} disabled={!table.getCanPreviousPage()}>
                                Previous
                            </Button>
                            <span>
                                Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                            </span>
                            <Button variant="outline" onClick={() => table.nextPage()} disabled={!table.getCanNextPage()}>
                                Next
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
