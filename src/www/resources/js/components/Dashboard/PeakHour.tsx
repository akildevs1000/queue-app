import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function App() {
    const [data, setData] = useState([]);
    const [services, setServices] = useState([]);
    const [selectedService, setSelectedService] = useState('all'); // 'all' means show all

    const colors = [
        '#6366F1', // Indigo
        '#10B981', // Emerald
        '#F59E0B', // Amber
        '#EF4444', // Red
        '#8B5CF6', // Violet
        '#14B8A6', // Teal
        '#3B82F6', // Blue
        '#F97316', // Orange
    ];

    useEffect(() => {
        const fetchData = async () => {
            try {
                const url = new URL('/peak-hour-report', window.location.origin);
                const res = await fetch(url.toString());
                const data = await res.json();
                setData(data);

                if (data.length > 0) {
                    const first = data[0];
                    const dynamicServices = Object.keys(first).filter((key) => key !== 'time');
                    setServices(dynamicServices);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    // Filtered services based on dropdown
    const filteredServices = selectedService === 'all' ? services : [selectedService];

    return (
        <div className="flex flex-1 flex-col rounded-xl">
            <div className="rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700 dark:bg-gray-800">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="text-lg font-semibold">Peak Hours (Yesterday)</h2>
                    <Select value={selectedService} onValueChange={setSelectedService}>
                        <SelectTrigger  className="w-[180px] bg-white dark:bg-gray-900">
                            <SelectValue placeholder="Select Service" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">All Services</SelectItem>
                            {services.map((service) => (
                                <SelectItem key={service} value={service}>
                                    {service}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div>
                    <h3 style={{ textAlign: 'center' }}>Queue Flow (to identify peak Hours)</h3>
                    <ResponsiveContainer height={350}>
                        <AreaChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 20 }}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="time" />
                            <YAxis
                                label={{
                                    value: 'Number Of Tokens',
                                    angle: -90,
                                    position: 'insideLeft',
                                    offset: 10,
                                }}
                            />
                            <Tooltip />
                            <Legend />

                           {filteredServices.map((service) => {
                                // get original index from full services array
                                const originalIndex = services.indexOf(service);
                                return (
                                    <Area
                                        key={service}
                                        type="monotone"
                                        dataKey={service}
                                        stroke={colors[originalIndex % colors.length]}
                                        fill={colors[originalIndex % colors.length] + '33'}
                                        strokeWidth={2}
                                    />
                                );
                            })}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
