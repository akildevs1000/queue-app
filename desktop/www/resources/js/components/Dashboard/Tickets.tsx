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
import * as React from 'react';

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

import { Button } from '@/components/ui/button';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

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
                    statusClasses += ' bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300';
                    break;
                case '3': // Corresponds to 'Served'
                    statusClasses += ' bg-blue-100 text-blue-800 dark:bg-blue-800/30 dark:text-blue-300';
                    break;
                case '0': // Corresponds to 'Pending'
                    statusClasses += ' bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300';
                    break;
                case '1': // Corresponds to 'Not Answered'
                    statusClasses += ' bg-red-100 text-red-800 dark:bg-red-800/30 dark:text-red-300';
                    break;
                default:
                    statusClasses += ' bg-gray-100 text-gray-800 dark:bg-gray-800/30 dark:text-gray-300';
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

export default function App() {
    const [sorting, setSorting] = React.useState<SortingState>([]);
    const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>([]);
    const [columnVisibility, setColumnVisibility] = React.useState<VisibilityState>({});
    const [rowSelection, setRowSelection] = React.useState({});
    const [tokens, setTokens] = React.useState([]);

    // Pagination state for server-side pagination
    const [pagination, setPagination] = React.useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Total pages returned from backend
    const [pageCount, setPageCount] = React.useState(0);

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

    React.useEffect(() => {
        // Fetch data whenever pagination changes (pageIndex or pageSize)
        const fetchData = async () => {
            try {
                // Laravel pagination uses 1-based pages, but pageIndex is 0-based
                const page = pagination.pageIndex + 1;
                const per_page = pagination.pageSize;

                const url = new URL('/get-report-data', window.location.origin);
                url.searchParams.append('page', page.toString());
                url.searchParams.append('per_page', per_page.toString());

                const res = await fetch(url.toString());
                const data = await res.json();

                setTokens(data.data); // paginated data array
                setPageCount(data.last_page); // total pages from backend

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
    }, [pagination.pageIndex, pagination.pageSize]); // re-fetch on page or size change

    return (
        <>
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
        </>
    );
}
