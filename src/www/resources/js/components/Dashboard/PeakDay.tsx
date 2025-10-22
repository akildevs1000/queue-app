import { useEffect, useState } from 'react';
import { Area, AreaChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function App() {
    const [data, setData] = useState([]);
    const [services, setServices] = useState([]);

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
                const url = new URL('/peak-day-report', window.location.origin);
                const res = await fetch(url.toString());
                const data = await res.json();
                setData(data);

                if (data.length) {
                    const serviceKeys = Object.keys(data[0]).filter((key) => key !== 'date');
                    setServices(serviceKeys);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="flex flex-1 flex-col rounded-xl">
            <div className="rounded-xl bg-[var(--background)] p-1 text-[var(--foreground)] dark:border-gray-700 dark:bg-gray-800">
                <h2 className="mb-4 text-lg font-semibold">Peak Day (Last Week)</h2>
                <div>
                    <h3 style={{ textAlign: 'center' }}>Queue Flow (to identify peak Day)</h3>
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

                            {services.map((service, index) => (
                                <Area
                                    key={service}
                                    type="monotone"
                                    dataKey={service}
                                    stroke={colors[index % colors.length]}
                                    fill={colors[index % colors.length] + '33'} // semi-transparent fill
                                    strokeWidth={2}
                                />
                            ))}
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
}
