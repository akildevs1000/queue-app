'use client';

import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ChartArea, ChartAreaIcon } from 'lucide-react';
import { useEffect, useState } from 'react';

export default function ServedAndPendingStats() {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(false);

    const ServicesStats = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/service-stats`);

            const json = await res.json();
            setServices(json);

        } catch (err) {
            console.error('Failed to fetch login logs', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        ServicesStats();
    }, []);

    return (
        <>
            {/* Header */}
            <div className="pl-2 pb-5 border-b border-slate-100 dark:border-slate-700/50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-500/10 flex items-center justify-center text-primary dark:text-primary-dark">
                        <ChartAreaIcon />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-slate-800 dark:text-white">
                            Stats By Service
                        </h2>
                        <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                            Stats for all services
                        </p>
                    </div>
                </div>
            </div>

            {/* Table Header */}
            <div className="px-6 py-3 bg-slate-50/80 dark:bg-slate-900/30 border-b border-slate-100 dark:border-slate-700/50 grid grid-cols-12 gap-4">
                <div className="col-span-7 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider flex items-center">
                    Service Type
                </div>
                <div className="col-span-5 text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider text-right">
                    Served / Pending
                </div>
            </div>

            {services.length ? (
                services.map((service: any, index: number) => (
                    <div className="px-6 py-4 grid grid-cols-12 gap-4 border-b border-slate-100 dark:border-slate-700/50 items-center hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors group cursor-pointer">

                        <div key={index} className="col-span-7 flex items-center gap-3">
                            <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center font-bold text-sm border border-blue-100 dark:border-blue-500/20">
                                    {service.code}
                                </div>
                            </div>
                            <div>
                                <p className="font-semibold text-slate-800 dark:text-slate-200 text-sm group-hover:text-primary dark:group-hover:text-primary-dark transition-colors">
                                    {service.name}
                                </p>
                            </div>
                        </div>

                        <div className="col-span-5 flex justify-end gap-2">
                            <div className="flex flex-col items-end gap-1">
                                <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-100 dark:border-emerald-500/20">
                                    <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400">
                                        {service.stats}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                ))
            ) : (
                <div className="py-6 flex items-center justify-center">
                    {loading ? 'Loading...' : 'No records found.'}
                </div>
            )}



        </>
    );
}
