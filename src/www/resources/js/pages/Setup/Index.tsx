'use client';

import CounterTable from '@/components/Counter/CounterTable';
import ServiceTable from '@/components/Service/ServiceTable';
import License from '@/components/License/Index';
import UserTable from '@/components/User/UserTable';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

type ActiveSection = 'service' | 'counter' | 'user' | 'license';

interface NavLinkProps {
    active: boolean;
    children: ReactNode;
    onClick: () => void;
}

const NavLink = ({ active = false, onClick, children }: NavLinkProps) => {
    return (
        <button
            type="button"
            onClick={onClick}
            className={`flex w-full items-center rounded-xl px-4 py-2 text-left text-sm font-semibold transition duration-200 ease-in-out ${active ? 'bg-gray-100 dark:bg-gray-800' : ''} border-b border-gray-200 shadow-sm hover:bg-gray-200 focus:ring-2 focus:ring-white/30 focus:outline-none dark:border-gray-700 dark:shadow-sm dark:hover:bg-gray-700`}
        >
            {children}
        </button>
    );
};

export default function Setup({ counters, services, users }: any) {
    const [activeSection, setActiveSection] = useState<ActiveSection>('service');

    const renderContent = () => {
        switch (activeSection) {
            case 'service':
                return <ServiceTable items={services} />;
            case 'counter':
                return <CounterTable items={counters} />;
            case 'user':
                return <UserTable items={users} />;
            case 'license':
                return <License items={users} />;
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Setup" />
            <div className="relative flex min-h-screen flex-col p-4">
                <h2 className="mb-6 text-2xl font-bold">Initial Setup</h2>
                <div className="w-full">
                    <div className="flex min-h-[90vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                        <aside className="w-64 border-r p-6 dark:bg-gray-900 dark:text-white">
                            <nav className="space-y-3">
                                <NavLink active={activeSection === 'service'} onClick={() => setActiveSection('service')}>
                                    Service
                                </NavLink>
                                <NavLink active={activeSection === 'counter'} onClick={() => setActiveSection('counter')}>
                                    Counter
                                </NavLink>
                                <NavLink active={activeSection === 'user'} onClick={() => setActiveSection('user')}>
                                    User
                                </NavLink>
                                <NavLink active={activeSection === 'license'} onClick={() => setActiveSection('license')}>
                                    License
                                </NavLink>
                            </nav>
                        </aside>
                        <div className="flex-1 overflow-auto p-4 md:p-8">{renderContent()}</div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
