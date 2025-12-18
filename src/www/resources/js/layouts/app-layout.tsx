import AppLayoutTemplate from '@/layouts/app/app-sidebar-layout';
import { type BreadcrumbItem } from '@/types';
import { type ReactNode } from 'react';

interface AppLayoutProps {
    children: ReactNode;
    breadcrumbs?: BreadcrumbItem[];
}

export default ({ children, breadcrumbs, ...props }: AppLayoutProps) => (
    <AppLayoutTemplate breadcrumbs={breadcrumbs} {...props}>
        <div className="min-h-[95vh] transition-colors duration-300  dark:bg-gray-900">{children}</div>

        {/* <footer className="absolute bottom-12 left-0 w-full border-t bg-white p-2 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
            Powered By{' '}
            <a href="https://xtremeguard.org/" className="text-blue-600 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">
                SmartQueue
            </a>
        </footer> */}
    </AppLayoutTemplate>
);
