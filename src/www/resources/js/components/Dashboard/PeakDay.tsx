import { useEffect, useState } from 'react';
import {
    AreaChart,
    Area,
    CartesianGrid,
    Legend,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from 'recharts';

export default function App() {
    const [data, setData] = useState([]);
    const [services, setServices] = useState([]);
    const [isDark, setIsDark] = useState(false);

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

    useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        setIsDark(mediaQuery.matches);
        const handler = (e) => setIsDark(e.matches);
        mediaQuery.addEventListener('change', handler);
        return () => mediaQuery.removeEventListener('change', handler);
    }, []);

    return (

          <div className="flex flex-1 flex-col  rounded-xl">
                    <div className="rounded-xl bg-[var(--background)] text-[var(--foreground)] dark:border-gray-700 dark:bg-gray-800">
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
                                            stackId="1"
                                        />
                                    ))}
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

        // <div className="flex flex-1 flex-col gap-6 rounded-2xl bg-gray-50 p-6 shadow-sm dark:bg-gray-900 transition-colors duration-300">
        //     <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
        //         📊 
        //     </h2>

        //     <div className="rounded-2xl bg-white p-4 shadow-md dark:bg-gray-800 transition-colors duration-300">
        //         <h3 className="mb-2 text-center text-base font-semibold text-gray-700 dark:text-gray-200">
        //             Queue Flow (to identify Peak Day)
        //         </h3>

        //         <ResponsiveContainer width="100%" height={350}>
        //             <AreaChart
        //                 data={data}
        //                 margin={{ top: 20, right: 40, left: 0, bottom: 20 }}
        //             >
        //                 <CartesianGrid
        //                     strokeDasharray="3 3"
        //                     stroke={isDark ? '#374151' : '#e5e7eb'}
        //                 />
        //                 <XAxis
        //                     dataKey="date"
        //                     tick={{ fill: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}
        //                     axisLine={false}
        //                     tickLine={false}
        //                 />
        //                 <YAxis
        //                     tick={{ fill: isDark ? '#d1d5db' : '#6b7280', fontSize: 12 }}
        //                     label={{
        //                         value: 'Number of Tokens',
        //                         angle: -90,
        //                         position: 'insideLeft',
        //                         style: { fill: isDark ? '#d1d5db' : '#6b7280' },
        //                     }}
        //                     axisLine={false}
        //                     tickLine={false}
        //                 />
        //                 <Tooltip
        //                     contentStyle={{
        //                         backgroundColor: isDark ? '#1f2937' : '#f9fafb',
        //                         color: isDark ? '#f3f4f6' : '#111827',
        //                         borderRadius: '8px',
        //                         border: 'none',
        //                     }}
        //                     labelStyle={{ color: isDark ? '#9ca3af' : '#6b7280' }}
        //                 />
        //                 <Legend wrapperStyle={{ paddingTop: 10, color: isDark ? '#e5e7eb' : '#374151' }} />

        //                 {services.map((service, index) => (
        //                     <Area
        //                         key={service}
        //                         type="monotone"
        //                         dataKey={service}
        //                         stroke={colors[index % colors.length]}
        //                         fill={colors[index % colors.length] + '33'} // semi-transparent fill
        //                         strokeWidth={2}
        //                         stackId="1"
        //                     />
        //                 ))}
        //             </AreaChart>
        //         </ResponsiveContainer>
        //     </div>
        // </div>
    );
}
