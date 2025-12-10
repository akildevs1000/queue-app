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

// Define Table Columns
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
        accessorKey: 'name',
        header: 'Counter',
        id: 'counterName',
    },
    {
        accessorKey: 'user.name',
        header: 'User',
    },
    {
        accessorKey: 'not_show_count',
        header: 'No Show',
    },
    {
        accessorKey: 'served_count',
        header: 'Served',
    },
    {
        accessorKey: 'no_show_count_plus_served_count',
        header: 'Total',
    },
    {
        accessorKey: 'avgTime',
        header: 'Avg Time',
    },
    {
        accessorKey: 'feedback',
        header: 'Feedback',
    },
];

export default function App({ services }: { services: any }) {
    const [dateRange, setDateRange] = useState<DateRange>({
        from: addDays(new Date(), 0),
        to: new Date(),
    });
    const [open, setOpen] = useState(false);

    const [sorting, setSorting] = useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = useState({});

    const [selectedService, setSelectedService] = useState<number | null>(null);
    const [selectedServiceName, setSelectedServiceName] = useState<number | null>(null);
    const [selectedCounter, setSelectedCounter] = useState<string | null>(null);

    const [counters, setCounters] = useState([]);

    const [tokens, setTokens] = useState([]);

    const [stats, setStats] = useState([]);
    const [totalVisits, setTotalVisits] = useState([]);

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

                const url = new URL('/get-summary-report-data', window.location.origin);
                url.searchParams.append('page', page.toString());
                url.searchParams.append('per_page', per_page.toString());

                // Add filters
                if (selectedService !== null) {
                    url.searchParams.append('service_id', selectedService.toString());
                }
                if (selectedCounter !== null) {
                    url.searchParams.append('counter_id', selectedCounter.toString());
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

                setTotalVisits(data.total_visits); // paginated data array
                setStats(data.stats); // paginated data array
                setTokens(data.records); // paginated data array
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
    }, [pagination.pageIndex, pagination.pageSize, selectedService, selectedCounter, dateRange]); // re-fetch on page or size change

    const handleServiceFilterChange = async (serviceId: any) => {
        setSelectedService(serviceId);

        const serviceName = services.find((e) => e.id == serviceId)?.name;

        setSelectedServiceName(serviceName);

        // Fetch counters for the selected service
        try {
            const res = await fetch(`/counter-list-by-service-id/${serviceId}`);
            const counterList = await res.json();
            setCounters(counterList);
        } catch (err) {
            console.error('Failed to fetch counters', err);
        }
    };

    const handleDownload = () => {
        if (selectedService == null) return;

        const params = new URLSearchParams();
        if (selectedService) params.append('service_id', selectedService);
        if (selectedCounter) params.append('counter_id', selectedCounter);
        if (dateRange?.from) params.append('start_date', format(dateRange.from, 'yyyy-MM-dd'));
        if (dateRange?.to) params.append('end_date', format(dateRange.to, 'yyyy-MM-dd'));

        const downloadUrl = `/summary/download?${params.toString()}`;
        window.open(downloadUrl, '_blank');
    };

    const handleCounterFilterChange = (counterId: any) => {
        setSelectedCounter(counterId);
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

                    {/* Date Range Picker */}
                    <Popover open={open} onOpenChange={setOpen}>
                        <PopoverTrigger asChild>
                            <button
                                className={cn(
                                    'w-[260px] justify-start rounded-md border px-4 py-1 text-left font-normal bg-white dark:bg-gray-900',
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
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-6">
                    <div className="flex items-center justify-between rounded-xl p-4 shadow-md shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                        <div>
                            <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Visits Today</h3>
                            <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{totalVisits}</p>
                        </div>
                        {/* <div className="ml-4">{item.icon}</div> */}
                    </div>
                    {stats.map((item, index) => (
                        <div key={index} className="flex items-center justify-between rounded-xl p-4 shadow-md shadow-sm bg-white dark:bg-gray-900 dark:border-gray-700">
                            <div>
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.service_name}</h3>
                                <p className="mt-2 text-2xl text-gray-900 dark:text-white">{item.service_count}</p>
                            </div>
                            <div className="text-center">
                                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">AvgTime</h3>
                                <p className="mt-2 text-gray-900 dark:text-white">{item.avgTime}</p>
                            </div>
                        </div>
                    ))}
                </div>

               <div className="rounded-xl p-4 text-[var(--foreground) bg-white dark:bg-gray-900">
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
