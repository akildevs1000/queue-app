'use client';

import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useEffect, useState } from 'react';

export default function LoginLogs() {
    const [logs, setLogs] = useState([]);
    const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0 });
    const [loading, setLoading] = useState(true);

    const fetchLogs = async (page = 1) => {
        try {
            setLoading(true);
            const res = await fetch(`/login-logs?page=${page}`);
            const json = await res.json();
            setLogs(json.data);
            setMeta({
                current_page: json.current_page,
                last_page: json.last_page,
                total: json.total,
            });
        } catch (err) {
            console.error('Failed to fetch login logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLogs();
    }, []);

    return (
        <>
            <div className="mb-4 font-bold">Login History</div>

            <Table>
                <TableHeader>
                    <TableRow>
                        <TableHead>Date</TableHead>
                        <TableHead>IP Address</TableHead>
                        {/* <TableHead>Device</TableHead> */}
                    </TableRow>
                </TableHeader>
                <TableBody>
                    {logs.length ? (
                        logs.map((log: any, index: number) => (
                            <TableRow key={index}>
                                <TableCell>{log.formatted_logged_in_at}</TableCell>
                                <TableCell>{log.ip_address}</TableCell>
                                {/* <TableCell className="max-w-sm truncate">{log.user_agent}</TableCell> */}
                            </TableRow>
                        ))
                    ) : (
                        <TableRow>
                            <TableCell colSpan={3} className="py-6 text-center">
                                {loading ? 'Loading...' : 'No login records found.'}
                            </TableCell>
                        </TableRow>
                    )}
                </TableBody>
            </Table>

            <div className="mt-4 flex justify-between">
                <div>
                    Page {meta.current_page} of {meta.last_page}
                </div>
                <div className="space-x-2">
                    <Button variant="outline" disabled={meta.current_page === 1} onClick={() => fetchLogs(meta.current_page - 1)}>
                        Previous
                    </Button>
                    <Button variant="outline" disabled={meta.current_page === meta.last_page} onClick={() => fetchLogs(meta.current_page + 1)}>
                        Next
                    </Button>
                </div>
            </div>
        </>
    );
}
