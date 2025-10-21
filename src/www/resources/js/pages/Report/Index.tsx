// import PeakHours from '@/components/Reports/PeakHours';
// import PeakDay from '@/components/Reports/PeakDay';
import PeakDay from '@/components/Dashboard/PeakDay';
import PeakHours from '@/components/Dashboard/PeakHour';
import Summary from '@/components/Reports/Summary';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TabsScreen({ services }: { services: any }) {
    return (
        <AppLayout>
            <Head title="Report" />
            <Tabs defaultValue="summary" className="w-full p-4">
                <TabsList className="ml-auto bg-white p-4 dark:bg-gray-900">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="peak">Peak Hours</TabsTrigger>
                    <TabsTrigger value="peak_day">Peak Day</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <div
                        className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800"
                        style={{ borderBottom: `2px solid #6366f1` }}
                    >
                        <Summary services={services} />
                    </div>
                </TabsContent>

                <TabsContent value="peak">
                    <div
                        className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800"
                        style={{ borderBottom: `2px solid #6366f1` }}
                    >
                        <PeakHours />
                    </div>
                </TabsContent>
                <TabsContent value="peak_day">
                    <div
                        className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] shadow-md dark:border-gray-700 dark:bg-gray-800"
                        style={{ borderBottom: `2px solid #6366f1` }}
                    >
                        <PeakDay />
                    </div>
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
