import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, Check, Clock, Users } from 'lucide-react';

import CallerScreen from '@/components/Dashboard/CallerScreen';
import LoginLogs from '@/components/LoginLog/Index';
import { useEffect, useState } from 'react';

import PeakDay from '@/components/Dashboard/PeakDay';
import PeakHour from '@/components/Dashboard/PeakHour';
import Tickets from '@/components/Dashboard/Tickets';

const breadcrumbs: BreadcrumbItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
    },
];

export default function Dashboard({ items }: any) {
    console.log('🚀 ~ Dashboard ~ items:', items);
    const { auth } = usePage<SharedData>().props;

    const stats = [
        {
            title: 'Total Visits Today',
            value: items.total_visits,
            icon: <Users className="h-8 w-8 text-blue-500" />,
        },
        {
            title: 'Total in Served',
            value: items.served,
            icon: <Check className="h-8 w-8 text-green-500" />,
        },
        {
            title: 'Total in Serving',
            value: items.serving,
            icon: <Clock className="h-8 w-8 text-blue-500" />,
        },
        {
            title: 'Total in Queue',
            value: items.pending,
            icon: <Clock className="h-8 w-8 text-yellow-500" />,
        },
        // {
        //     title: 'VIP Customers',
        //     value: '8',
        //     icon: <UserCheck className="h-8 w-8 text-purple-500" />,
        // },
        {
            title: 'Avg. Wait Time',
            value: `${items.avgTimeInMinutes} Min`,
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
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
                        <div className="rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <PeakDay />
                        </div>

                        <div className="rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                            <PeakHour />
                        </div>
                    </div>
                    <div className="rounded-xl border border-gray-200 bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                        <Tickets />
                    </div>
                    <div className="w-full rounded-lg border border-gray-100 bg-[var(--background)] p-4 p-6 text-[var(--foreground)] shadow dark:border-gray-700 dark:bg-gray-900">
                        <LoginLogs />
                    </div>
                </div>
            )}

            {auth?.user?.type === 'user' && <CallerScreen />}
        </AppLayout>
    );
}
