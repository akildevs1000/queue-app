import UiMode from '@/components/ui-mode';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { type BreadcrumbItem as BreadcrumbItemType } from '@/types';
import LastLogin from './LoginLog/LastLogin';
import { NavUser } from './top-nav-user';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center justify-between border-b px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Left side: Sidebar trigger + Breadcrumbs */}
            <div className="flex items-center gap-2">
                <SidebarTrigger className="-ml-1" />
                {/* <Breadcrumbs breadcrumbs={breadcrumbs} />  */}
                Last Login: <LastLogin />
            </div>

            {/* Right side: UiMode toggle */}
            <div className="flex items-center">
                <UiMode />
                <NavUser />
            </div>
        </header>
    );
}
