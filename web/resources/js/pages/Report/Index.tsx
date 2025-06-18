import PeakHours from '@/components/Reports/PeakHours';
import PeakDay from '@/components/Reports/PeakDay';
import Summary from '@/components/Reports/Summary';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import AppLayout from '@/layouts/app-layout';
import { Head } from '@inertiajs/react';

export default function TabsScreen({ services }: { services: any }) {
    return (
        <AppLayout>
            <Head title="Report" />
            <Tabs defaultValue="summary" className="w-full">
                <TabsList className="my-2 ml-auto grid w-[30%] grid-cols-3">
                    <TabsTrigger value="summary">Summary</TabsTrigger>
                    <TabsTrigger value="peak">Peak Hours</TabsTrigger>
                    <TabsTrigger value="peak_day">Peak Day</TabsTrigger>
                </TabsList>

                <TabsContent value="summary">
                    <Summary services={services} />
                </TabsContent>

                <TabsContent value="peak">
                    <PeakHours />
                </TabsContent>
                <TabsContent value="peak_day">
                    <PeakDay />
                </TabsContent>
            </Tabs>
        </AppLayout>
    );
}
