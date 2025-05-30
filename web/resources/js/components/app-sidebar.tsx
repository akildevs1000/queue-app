import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { BadgeDollarSign, LayoutDashboard, Monitor, Users } from 'lucide-react';
import AppLogo from './app-logo';
import LastLogin from './LoginLog/LastLogin';
import { NavMain } from './nav-main';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutDashboard,
    },
    {
        title: 'Users',
        href: '/users',
        icon: Users,
    },
    {
        title: 'Service',
        href: '/services',
        icon: BadgeDollarSign,
    },
    {
        title: 'Counters',
        href: '/counters',
        icon: Monitor,
    },
];

export function AppSidebar() {
    const page = usePage();

    const user = page.props.auth?.user;

    return (
        <>
            {user?.type === 'master' && (
                <Sidebar collapsible="icon" variant="inset">
                    <SidebarHeader>
                        <SidebarMenu>
                            <SidebarMenuItem>
                                <SidebarMenuButton size="lg" asChild>
                                    <Link href="/dashboard" prefetch>
                                        <AppLogo />
                                    </Link>
                                </SidebarMenuButton>
                            </SidebarMenuItem>
                        </SidebarMenu>
                    </SidebarHeader>

                    {/* Only show SidebarContent if user.type is 'master' */}
                    <SidebarContent>
                        {user?.type === 'master' && (
                            <>
                                <NavMain items={mainNavItems} />
                            </>
                        )}
                    </SidebarContent>

                    <SidebarFooter>
                        {user?.type === 'master' && (
                            <>
                                {/* <LastLogin /> */}
                            </>
                        )}
                        {/* Other footer stuff */}
                    </SidebarFooter>
                </Sidebar>
            )}
        </>
    );
}
