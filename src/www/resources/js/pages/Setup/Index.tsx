'use client';

import CounterTable from '@/components/Counter/CounterTable';
import ServiceTable from '@/components/Service/ServiceTable';
import UserTable from '@/components/User/UserTable';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';
import { ReactNode, useState } from 'react';

type ActiveSection = 'service' | 'counter' | 'user';

interface NavLinkProps {
    active: boolean;
    children: ReactNode;
    onClick: () => void;
}

const NavLink = ({ active, children, onClick }: NavLinkProps) => (
    <button
        onClick={onClick}
        className={`w-full rounded-xl px-6 py-3 text-left text-sm font-semibold transition duration-200 ease-in-out ${
            active ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-xl' : 'hover:bg-gray-700'
        }`}
    >
        {children}
    </button>
);

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
            default:
                return null;
        }
    };

    return (
        <AppLayout>
            <Head title="Setup" />
            <div className="relative flex min-h-screen flex-col items-center p-4">
                <div className="w-full">
                    <div className="flex min-h-[70vh] overflow-hidden rounded-2xl bg-white shadow-2xl dark:bg-gray-800">
                        <aside className="w-64 bg-gray-900 p-6 text-white">
                            <h2 className="mb-6 text-2xl font-bold">Configuration</h2>
                            <nav className="space-y-3">
                                <NavLink active={activeSection === 'service'} onClick={() => setActiveSection('service')}>
                                    Service Management
                                </NavLink>
                                <NavLink active={activeSection === 'counter'} onClick={() => setActiveSection('counter')}>
                                    Counter Management
                                </NavLink>
                                <NavLink active={activeSection === 'user'} onClick={() => setActiveSection('user')}>
                                    User Management
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
