import AppLayout from '@/layouts/app-layout';
import { SharedData, type BreadcrumbItem } from '@/types';
import { Head, usePage } from '@inertiajs/react';
import { Activity, Check, Clock, Users } from 'lucide-react';

import CallerScreen from '@/components/Dashboard/CallerScreen';
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
   
    const { auth } = usePage<SharedData>().props;

    const stats = [
        {
            title: 'Total Visits Today',
            value: items.total_visits,
            icon: <Users className="h-8 w-8 text-indigo-500" />,
            borderColor: '#6366f1', // dynamic color
        },
        {
            title: 'Total in Served',
            value: items.served,
            icon: <Check className="h-8 w-8 text-green-300" />,
            borderColor: '#06b400ff',
        },
        {
            title: 'Total in Serving',
            value: items.serving,
            icon: <Clock className="h-8 w-8 text-blue-500" />,
            borderColor: '#3b82f6',
        },
        {
            title: 'Total in Queue',
            value: items.pending,
            icon: <Clock className="h-8 w-8 text-orange-300" />,
            borderColor: '#f59e0b',
        },
        {
            title: 'Avg. Wait Time',
            value: `${items.avgTimeInMinutes} Min`,
            icon: <Activity className="h-8 w-8 text-indigo-500" />,
            borderColor: '#6366f1',
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

    return (
        <AppLayout breadcrumbs={breadcrumbs}>
            <Head title="Queue Management Dashboard" />

            {auth?.user?.type === 'master' && (
                <div className="flex h-full flex-1 flex-col gap-6 p-4">
                    {/* Cards Section */}
                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-5">
                        {stats.map((item, index) => (
                            <div
                                key={index}
                                className="relative flex items-center justify-between rounded-xl bg-white p-6 shadow-md transition-all hover:shadow-lg dark:bg-gray-800"
                                style={{ borderBottom: `2px solid ${item.borderColor}` }}
                            >
                                <div>
                                    <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{item.title}</h3>
                                    <p className="mt-2 text-3xl font-semibold text-gray-900 dark:text-white">{item.value}</p>
                                </div>

                                <div className="ml-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gray-100 transition-transform hover:scale-110 dark:bg-gray-700">
                                    {item.icon}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Tables Section */}
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                        <div
                            className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800"
                            style={{ borderBottom: `2px solid #6366f1` }}
                        >
                            <PeakDay />
                        </div>

                        <div
                            className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800"
                            style={{ borderBottom: `2px solid #6366f1` }}
                        >
                            <PeakHour />
                        </div>
                    </div>
                    <div className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800">
                        <Tickets />
                    </div>
                    {/* <div className="w-full rounded-lg border border-gray-100 bg-[var(--background)] p-4 p-6 text-[var(--foreground)] shadow dark:border-gray-700 dark:bg-gray-900">
                        <LoginLogs />
                    </div> */}
                </div>
            )}

            {auth?.user?.type === 'user' && <CallerScreen />}
        </AppLayout>
    );
}
