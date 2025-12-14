'use client';

import { useForm } from '@inertiajs/react';
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

import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

import Create from '@/components/User/Create';
import Edit from '@/components/User/Edit';

// Type definition for the data rows
export type User = {
    id: number;
    name: string;
    email: string;
    number: string;
    service: {
        name: string;
    };
    counter: {
        name: string;
    };
    // Include other user properties if necessary
    [key: string]: any;
};

// Define Table Columns
export const columns: ColumnDef<User>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        // Access nested property for Service Name
        accessorKey: 'service.name',
        header: 'Service',
        cell: (info) => info.getValue(),
    },
    {
        accessorKey: 'login_pin',
        header: 'Login Pin',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const user = row.original;

            const { delete: destroy, setData } = useForm({
                id: user.id,
                name: user.name,
                email: user.email,
                number: user.number,
                // You might need to include service_id and counter_id for the edit form
                // service_id: user.service?.id,
                // counter_id: user.counter?.id,
            });

            // Function to handle delete
            const handleDelete = (id: number) => {
                if (!confirm('Are you sure you want to delete this user?')) return;

                destroy(`/users/${id}`, {
                    onSuccess: () => { },
                });
            };

            const [open, setOpen] = React.useState(false); // State to control the dialog

            const handleEdit = (item: User) => {
                // Set the form data and open the edit dialog
                setData(item);
                setOpen(true);
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
                            <DropdownMenuItem onClick={() => handleEdit(user)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleDelete(user.id)} className="cursor-pointer text-red-600 hover:text-red-700">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* The Edit component is placed here */}
                    <Edit title={'User'} endpoint={'users'} open={open} setOpen={setOpen} item={user} />
                </div>
            );
        },
    },
];

// Define the expected props for the component
interface UserTableProps {
    items: {
        data: User[];
        per_page: number;
        [key: string]: any;
    };
}

export default function UserTable({ items }: UserTableProps) {
    const { get } = useForm();

    // Handler to change rows per page, using Inertia's GET request
    const handlePerPage = (per_page: number) => {
        // Assuming 'route' is available for named routes
        get(route('users.index', { per_page }));
    };

    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});

    // Memoize the data array
    const data = React.useMemo(() => items.data, [items]);

    // Initialize and manage the table instance
    const table = useReactTable({
        data,
        columns: columns as ColumnDef<User, unknown>[], // Cast is often needed
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

    // Update table page size when 'items.per_page' changes from the server
    React.useEffect(() => {
        if (items.per_page !== table.getState().pagination.pageSize) {
            table.setPageSize(items.per_page);
        }
    }, [items, table]);

    return (
        <div className="flex h-full flex-1 flex-col gap-4">
            <div className="flex w-full items-center justify-between rounded-lg">
                <div className="flex items-center">
                    {/* Filter Input */}
                    <Input
                        placeholder="Search..."
                        value={(table.getColumn('name')?.getFilterValue() as string) ?? ''}
                        onChange={(event) => table.getColumn('name')?.setFilterValue(event.target.value)}
                        className="mr-1 max-w-sm border border-white/20"
                    />
                </div>

                {/* Create Button */}
                <Create title="User" endpoint="users" />
            </div>

            <div className="rounded-xl bg-white p-4 text-[var(--foreground)] dark:bg-gray-900">
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

                {/* Pagination Controls */}
                <div className="mt-4 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Rows per page:</span>
                        <Select
                            onValueChange={(value) => {
                                table.setPageSize(Number(value));
                                handlePerPage(Number(value)); // Call handlePerPage to update the server/Inertia
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
    );
}
