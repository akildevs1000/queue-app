'use client';

import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem } from '@/types';
import { Head, useForm } from '@inertiajs/react';

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

import Create from '@/components/User/Create';
import Edit from '@/components/User/Edit';

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'User',
        href: '/users',
    },
];

// Contact type definition
export type Contact = {
    id: number;
    name: string;
    description: string;
};

// Define Table Columns
export const columns: ColumnDef<Contact>[] = [
    {
        accessorKey: 'id',
        header: '#',
    },
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'email',
        header: 'Email',
    },
    {
        accessorKey: 'number',
        header: 'Number',
    },

    {
        accessorKey: 'service.name',
        header: 'Service',
    },

     {
        accessorKey: 'counter.name',
        header: 'Counter',
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

                destroy(`/users/${id}`, {
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
                    <Edit title={'User'} endpoint={'users'} open={open} setOpen={setOpen} item={contact} />
                </div>
            );
        },
    },
];

export default function App({ items }: { items: any }) {
    const { get } = useForm();

    const handlePerPage = (per_page: number) => {
        get(route('users.index', { per_page }));
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
            <Head title="User" />
            {/* Header and Controls */}
            <div className="flex w-full items-center justify-between rounded-lg p-5">
                <div className="flex items-center">
                    {/* Filter Input */}
                    <Input
                        placeholder="Filter titles..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="mr-1 max-w-sm"
                    />

                    {/* Column Visibility Dropdown */}
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

                {/* Create Button */}
                <Create title="User" endpoint="users" />
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
