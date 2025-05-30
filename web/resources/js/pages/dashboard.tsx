import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, Clock, UserCheck, Users } from 'lucide-react';

import CallerScreen from '@/components/Dashboard/CallerScreen';
import LoginLogs from '@/components/LoginLog/Index';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard() {
    const { auth } = usePage<SharedData>().props;

    const stats = [
        {
            title: 'Total Visits Today',
            value: '320',
            icon: <Users className="h-8 w-8 text-blue-500" />,
        },
        {
            title: 'Total in Queue',
            value: '22',
            icon: <Clock className="h-8 w-8 text-yellow-500" />,
        },
        {
            title: 'VIP Customers',
            value: '8',
            icon: <UserCheck className="h-8 w-8 text-purple-500" />,
        },
        {
            title: 'Avg. Wait Time',
            value: '5 min',
            icon: <Activity className="h-8 w-8 text-green-500" />,
        },
    ];
    const [tokens, setTokens] = useState([]);

    const fetchTokenCounts = async () => {
        try {
            const res = await fetch('/tokens');
            const json = await res.json();
            console.log('🚀 ~ fetchTokenCounts ~ json:', json);
            setTokens(json.data);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    useEffect(() => {
        fetchTokenCounts();
    }, []);


    const vipCustomers = [
        { ticket: 'V001', name: 'Mr. Khan', counter: '1', status: 'Serving' },
        { ticket: 'V002', name: 'Dr. Ayesha', counter: 'VIP Lounge', status: 'Waiting' },
    ];

    const counters = [
        { name: 'Counter A', ticket: 'A101', status: 'Serving' },
        { name: 'Counter B', ticket: 'B205', status: 'Idle' },
        { name: 'Counter C', ticket: 'C309', status: 'Serving' },
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Queue Management Dashboard" />

            {auth?.user?.type === 'master' && (
                <div className="flex h-full flex-1 flex-col gap-6 p-4">
                    {/* Cards Section */}
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                        {stats.map((item, index) => (
                            <div key={index} className="flex items-center justify-between rounded-xl border p-4 shadow-sm dark:border-gray-700">
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</h3>
                                    <p className="mt-2 text-2xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                                </div>
                                <div className="ml-4">{item.icon}</div>
                            </div>
                        ))}
                    </div>

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        {/* Regular Customers */}
                        <div className="h-80 overflow-auto rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Regular Customers</h3>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                        <th className="p-2 font-medium">Ticket No.</th>
                                        <th className="p-2 font-medium">Counter</th>
                                        {/* <th className="p-2 font-medium">Status</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {tokens.map((customer, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-2 font-mono">{customer?.token_number_display}</td>
                                            <td className="p-2">Counter {customer?.counter?.name}</td>
                                            {/* <td className="p-2">
                                                <span
                                                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                                        customer.status === 2
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                                                    }`}
                                                >
                                                    {customer.status}
                                                </span>
                                            </td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* VIP Customers */}
                        <div className="h-80 overflow-auto rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">VIP Customers</h3>
                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                        <th className="p-2 font-medium">Ticket No.</th>
                                        <th className="p-2 font-medium">Name</th>
                                        <th className="p-2 font-medium">Counter</th>
                                        <th className="p-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {vipCustomers.map((customer, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-2 font-mono">{customer.ticket}</td>
                                            <td className="p-2">{customer.name}</td>
                                            <td className="p-2">{customer.counter}</td>
                                            <td className="p-2">
                                                <span
                                                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                                        customer.status === 'Serving'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                                                    }`}
                                                >
                                                    {customer.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="h-80 overflow-auto rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Counters</h3>

                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                        <th className="p-2 font-medium">Counter</th>
                                        <th className="p-2 font-medium">Ticket No.</th>
                                        <th className="p-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {counters.map((counter, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-2">{counter.name}</td>
                                            <td className="p-2 font-mono">{counter.ticket}</td>
                                            <td className="p-2">
                                                <span
                                                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                                        counter.status === 'Serving'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                                                    }`}
                                                >
                                                    {counter.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="h-80 overflow-auto rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white">Counters</h3>

                            <table className="min-w-full text-sm">
                                <thead>
                                    <tr className="border-b border-gray-200 text-left dark:border-gray-700">
                                        <th className="p-2 font-medium">Counter</th>
                                        <th className="p-2 font-medium">Ticket No.</th>
                                        <th className="p-2 font-medium">Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {counters.map((counter, index) => (
                                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                                            <td className="p-2">{counter.name}</td>
                                            <td className="p-2 font-mono">{counter.ticket}</td>
                                            <td className="p-2">
                                                <span
                                                    className={`inline-block rounded px-2 py-1 text-xs font-semibold ${
                                                        counter.status === 'Serving'
                                                            ? 'bg-green-100 text-green-800 dark:bg-green-800/30 dark:text-green-300'
                                                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-800/30 dark:text-yellow-300'
                                                    }`}
                                                >
                                                    {counter.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        <div className="w-full rounded-lg border border-gray-100 bg-[var(--background)] p-4 p-6 text-[var(--foreground)] shadow dark:border-gray-700 dark:bg-gray-900">
                            <LoginLogs />
                        </div>
                    </div>
                </div>
            )}

            {auth?.user?.type === 'user' && <CallerScreen />}
        </AppLayout>
    );
}
