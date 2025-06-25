import UiMode from '@/components/ui-mode';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import { useEffect, useState } from 'react';
import { NavUser } from './top-nav-user';
import ServiceByUser from './User/ServiceByUser';

export function AppSidebarHeader() {

    const [counter, setCounter] = useState(null);

    useEffect(() => {
        const getCounter = async () => {
            try {
                const res = await fetch(`/counter-by-user`);
                const json = await res.json();
                setCounter(json);
            } catch (err) {
                console.error('Failed to counter-by-user', err);
            }
        };

        getCounter();
    }, []);
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Left side: Sidebar trigger + Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} />  */}
               
                <div className="flex items-center gap-1 text-gray-500">
                    Counter: <span className="font-medium dark:text-gray-400">{counter && counter?.name}, </span>
                </div>
                 <div className="flex items-center gap-1 text-gray-500">
                    Service: <span className="font-medium dark:text-gray-400"><ServiceByUser /></span>
                </div>
            </div>

            {/* Right side: UiMode toggle */}
            <div className="flex items-center">
                <UiMode />
                <NavUser />
            </div>
        </header>
    );
}
