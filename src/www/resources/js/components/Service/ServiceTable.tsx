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

import Create from '@/components/Service/Create';
import Edit from '@/components/Service/Edit';

// Type definition for the data rows (renamed to Service for clarity)
export type Service = {
    id: number;
    name: string;
    description: string;
};

// Define Table Columns
export const columns: ColumnDef<Service>[] = [
    {
        accessorKey: 'name',
        header: 'Name',
    },
    {
        accessorKey: 'code',
        header: 'Prefix',
    },
    {
        accessorKey: 'starting_number',
        header: 'Starting Number',
    },
    {
        accessorKey: 'description',
        header: 'Description',
    },
    {
        id: 'actions',
        header: 'Action',
        cell: ({ row }) => {
            const service = row.original;

            const {
                delete: destroy,
                setData,
                // put is available but not used directly in the action handlers below
            } = useForm({
                id: service.id,
                name: service.name,
                description: service.description,
            });

            // Function to handle delete
            const handleDelete = (id: number) => {
                if (!confirm('Are you sure you want to delete this service?')) return;

                destroy(`/services/${id}`, {
                    onSuccess: () => {},
                });
            };

            const [open, setOpen] = React.useState(false); // State to control the dialog

            const handleEdit = (item: Service) => {
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
                            <DropdownMenuItem onClick={() => handleEdit(service)}>
                                <Pencil className="mr-2 h-4 w-4" /> Edit
                            </DropdownMenuItem>

                            <DropdownMenuItem onClick={() => handleDelete(service.id)} className="cursor-pointer text-red-600 hover:text-red-700">
                                <Trash className="mr-2 h-4 w-4" /> Delete
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                    {/* The Edit component is placed here */}
                    <Edit title={'Services'} endpoint={'services'} open={open} setOpen={setOpen} item={service} />
                </div>
            );
        },
    },
];

interface ServiceTableProps {
    items: {
        data: Service[];
        per_page: number;
        [key: string]: any;
    };
}

export default function ServiceTable({ items }: ServiceTableProps) {
    const { get } = useForm();

    // Handler to change rows per page, using Inertia's GET request
    const handlePerPage = (per_page: number) => {
        get(route('setup', { per_page }));
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
        columns: columns as ColumnDef<Service, unknown>[], // Cast is needed due to the generic nature of the columns array
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
                <Create title={'Services'} endpoint={'services'} />
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
