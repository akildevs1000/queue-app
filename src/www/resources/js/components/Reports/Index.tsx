'use client';

import { type BreadcrumbItem } from '@/types';
import { Download } from 'lucide-react'; // If you're using lucide-react

import {
    ColumnDef,
    ColumnFiltersState,
    SortingState,
    VisibilityState,
    flexRender,
    getCoreRowModel,
    getPaginationRowModel,
    useReactTable,
} from '@tanstack/react-table';
import { useEffect, useState } from 'react';

import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { addDays, format } from 'date-fns';
import { DateRange } from 'react-day-picker';

// utils/statusMappings.ts or directly in your component file

// Breadcrumbs
const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Report',
        href: '/Report',
    },
];

// Contact type definition
export type Contact = {
    id: number;
    name: string;
    description: string;
    service: {
        name: string;
    };
    token_number_display: string;
    counter: {
        name: string;
    };
    user: {
        name: string;
    };
    language: string;
    status: string;
    total_serving_time_display: string | null;
};

export const columns: ColumnDef<Contact>[] = [
    {
        cell: ({ row }) => row.index + 1,
        header: '#',
    },
    {
        accessorKey: 'service.name',
        header: 'Service',
        id: 'serviceName', // <--- Add a unique ID here
    },
    {
        accessorKey: 'token_number_display',
        header: 'Token',
    },
    {
        accessorKey: 'counter.name',
        header: 'Counter',
        id: 'counterName',
    },
    {
        accessorKey: 'user.name',
        header: 'User',
    },
    {
        accessorKey: 'language',
        header: 'Language',
    },
    {
        accessorKey: 'status',
        header: 'Status',
        cell: ({ getValue }) => {
            const STATUS_MAP: { [key: string]: string } = {
                '0': 'Pending',
                '1': 'Not Answered',
                '2': 'Serving',
                '3': 'Served',
            };

            const statusId = getValue() as string;
            const statusText = STATUS_MAP[statusId] || 'Unknown Status';

            let statusClasses = 'inline-block rounded px-2 py-1 text-xs font-semibold';

            switch (statusId) {
                case '2': // Corresponds to 'Serving'
                    statusClasses += 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
                    break;
                case '3': // Corresponds to 'Served'
                    statusClasses += 'bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
                    break;
                case '0': // Corresponds to 'Pending'
                    statusClasses += 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
                    break;
                case '1': // Corresponds to 'Not Answered'
                    statusClasses += 'bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
                    break;
                default:
                    statusClasses += 'bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
                    break;
            }

            return <span className={statusClasses}>{statusText}</span>;
        },
    },
    {
        accessorKey: 'total_serving_time_display',
        header: 'Serving Time',
        cell: ({ getValue }) => {
            const serving_time = getValue() as string;
            return serving_time === null ? '---' : serving_time;
        },
    },
    {
        accessorKey: 'created_at_formatted',
        header: 'Date Time',
    },
];

export default function Report() {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: addDays(new Date(), 0),
        to: new Date(),
    });
    const [open, setOpen] = useState(false);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState<string | null>(null);
    const [selectedService, setSelectedService] = useState<string | null>(null);
    const [selectedCounter, setSelectedCounter] = useState<string | null>(null);

    const [statusses, setStatusses] = useState([
        { id: null, name: 'All Statuses' },
        { id: '0', name: 'Pending' },
        { id: '1', name: 'Not Answered' },
        { id: '2', name: 'Serving' },
        { id: '3', name: 'Served' },
    ]);
    const [users, setUsers] = useState([]);
    const [counters, setCounters] = useState([]);
    const [services, setServices] = useState([]);

    const [tokens, setTokens] = useState([]);

    // Pagination state for server-side pagination
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Total pages returned from backend
    const [pageCount, setPageCount] = useState(0);

    const table = useReactTable({
        data: tokens,
        columns,
        state: {
            sorting,
            columnFilters,
            columnVisibility,
            rowSelection,
            pagination,
        },
        onSortingChange: setSorting,
        onColumnFiltersChange: setColumnFilters,
        onColumnVisibilityChange: setColumnVisibility,
        onRowSelectionChange: setRowSelection,
        onPaginationChange: setPagination,
        manualPagination: true, // important: we handle pagination on server
        pageCount,
        getCoreRowModel: getCoreRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
    });

    useEffect(() => {
        // Fetch data whenever pagination changes (pageIndex or pageSize)
        const fetchData = async () => {
            try {
                // Laravel pagination uses 1-based pages, but pageIndex is 0-based
                const page = pagination.pageIndex + 1;
                const per_page = pagination.pageSize;

                const url = new URL('/get-report-data', window.location.origin);
                url.searchParams.append('page', page.toString());
                url.searchParams.append('per_page', per_page.toString());

                // Add filters
                if (selectedService !== null) {
                    url.searchParams.append('service_id', selectedService.toString());
                }
                if (selectedCounter !== null) {
                    url.searchParams.append('counter_id', selectedCounter.toString());
                }

                if (selectedUser !== null) {
                    url.searchParams.append('user_id', selectedUser.toString());
                }
                if (selectedStatus !== null) {
                    url.searchParams.append('status', selectedStatus.toString());
                }

                // Add date range filter (from/to)
                if (dateRange?.from) {
                    url.searchParams.append('start_date', format(dateRange.from, 'yyyy-MM-dd'));
                }
                if (dateRange?.to) {
                    url.searchParams.append('end_date', format(dateRange.to, 'yyyy-MM-dd'));
                }

                const res = await fetch(url.toString());
                const data = await res.json();

                setTokens(data.data); // paginated data array
                setPageCount(1); // total pages from backend

                // Optionally sync pagination state if backend sends a different current page
                if (data.current_page !== page) {
                    setPagination((old) => ({
                        ...old,
                        pageIndex: data.current_page - 1,
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch tokens:', error);
            }
        };

        fetchData();
    }, [pagination.pageIndex, pagination.pageSize, selectedService, selectedCounter, dateRange, selectedUser, selectedStatus]); // re-fetch on page or size change

    useEffect(() => {
        const fetchCounters = async () => {
            try {
                const res = await fetch(`/counter-list`);
                setCounters(await res.json());
            } catch (err) {
                console.error('Failed to fetch counters', err);
            }
        };
        const fetchServices = async () => {
            try {
                const res = await fetch(`/service-list`);
                setServices(await res.json());
            } catch (err) {
                console.error('Failed to fetch counters', err);
            }
        };

        const fetchUsers = async () => {
            try {
                const res = await fetch(`/user-list`);
                setUsers(await res.json());
            } catch (err) {
                console.error('Failed to fetch counters', err);
            }
        };
        fetchUsers();
        fetchServices();
        fetchCounters();
    }, []);

    const handleDownload = () => {
        const params = new URLSearchParams();

        if (selectedService !== null) {
            params.append('service_id', selectedService.toString());
        }
        if (selectedCounter !== null) {
            params.append('counter_id', selectedCounter.toString());
        }

        if (selectedUser !== null) {
            params.append('user_id', selectedUser.toString());
        }
        if (selectedStatus !== null) {
            params.append('status', selectedStatus.toString());
        }

        if (dateRange?.from) params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange?.to) params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'));

        const downloadUrl = `/report/download?${params.toString()}`;
        window.open(downloadUrl, '_blank');
    };

    const handleServiceFilterChange = async (serviceId: any) => {
        setSelectedService(serviceId);
    };

    const handleCounterFilterChange = (counterId: any) => {
        setSelectedCounter(counterId);
    };

    const handleUserFilterChange = async (userId: any) => {
        setSelectedUser(userId);
    };

    const handleStatusFilterChange = async (statusId: any) => {
        setSelectedStatus(statusId);
    };

    return (
        <>
            <div className="flex w-full flex-wrap items-center justify-between p-4">
                {/* Left Filters Group */}
                <div className="flex flex-wrap items-center gap-2">
                    {/* Service Filter */}
                    <Select onValueChange={handleServiceFilterChange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Filter by Service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Services</SelectLabel>
                                {services.map((service: any) => (
                                    <SelectItem key={service.id} value={service.id}>
                                        {service.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Counter Filter */}
                    <Select onValueChange={handleCounterFilterChange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Filter by Counter" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Counter</SelectLabel>
                                {counters?.map((counter: any) => (
                                    <SelectItem key={counter.id} value={counter.id}>
                                        {counter.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Select onValueChange={handleUserFilterChange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Filter by User" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>User</SelectLabel>
                                {users?.map((user: any) => (
                                    <SelectItem key={user.id} value={user.id}>
                                        {user.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    <Select onValueChange={handleStatusFilterChange}>
                        <SelectTrigger className="w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Filter by Status" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Status</SelectLabel>
                                {statusses?.map((status: any) => (
                                    <SelectItem key={status.id} value={status.id}>
                                        {status.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>

                    {/* Date Range Picker */}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    'w-[260px] justify-start rounded-md border bg-white px-4 py-1 text-left font-normal dark:bg-gray-900',
                                    !dateRange?.from && !dateRange?.to && 'text-muted-foreground',
                                )}
                            >
                                {dateRange?.from
                                    ? dateRange.to
                                        ? `${format(dateRange.from, 'LLL dd, yyyy')} - ${format(dateRange.to, 'LLL dd, yyyy')}`
                                        : format(dateRange.from, 'LLL dd, yyyy')
                                    : 'Pick a date range'}
                            </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                                mode="range"
                                selected={dateRange}
                                onSelect={(range) => {
                                    setDateRange(range);
                                    if (range?.from && range?.to) setOpen(false);
                                }}
                                numberOfMonths={2}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                {/* Right Button */}
                <div>
                    <button
                        onClick={handleDownload}
                        className="inline-flex items-center gap-2 rounded-md bg-blue-600 px-4 py-2 text-white transition-all hover:bg-blue-700"
                    >
                        <Download className="h-3 w-3" />
                        Print/Download
                    </button>
                </div>
            </div>
            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="text-[var(--foreground) rounded-xl bg-white p-4 dark:bg-gray-900">
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
                                value={String(table.getState().pagination.pageSize)}
                                onValueChange={(value) => {
                                    table.setPageSize(Number(value));
                                    setPagination((old) => ({ ...old, pageIndex: 0, pageSize: Number(value) }));
                                }}
                            >
                                <SelectTrigger className="w-[100px]">
                                    <SelectValue />
                                </SelectTrigger>

                                <SelectContent>
                                    {[5, 10, 20, 50, 100].map((pageSize) => (
                                        <SelectItem key={pageSize} value={String(pageSize)}>
                                            {pageSize}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button variant="outline">Previous</Button>
                            <span>Page 1 of 1</span>
                            <Button variant="outline">Next</Button>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
