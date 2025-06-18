import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';

export default function App() {
    const [data, setData] = useState([]);
    const [services, setServices] = useState([]);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a569bd', '#f4d03f', '#5dade2', '#48c9b0'];

    useEffect(() => {
        // // Fetch data whenever pagination changes (pageIndex or pageSize)
        const fetchData = async () => {
            try {
                const url = new URL('/peak-day-report', window.location.origin);
                const res = await fetch(url.toString());
                const data = await res.json();
                setData(data);
                if (data.length) {
                    const serviceKeys: any = Object.keys(data[0]).filter((key) => key !== 'date');
                    setServices(serviceKeys);
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []); // re-fetch on page or size change

    return (
       <div className="flex flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="gap-4 rounded-xl bg-[var(--background)] p-1 text-[var(--foreground)] dark:border-gray-700">
                    <h2 className="mb-4 text-lg font-semibold">Peak Day (Last Week)</h2>
                    <div>
                        <h3 style={{ textAlign: 'center' }}>Queue Flow (to identify peak Day)</h3>
                        <ResponsiveContainer height={300}>
                            <BarChart data={data} margin={{ top: 20, right: 50, left: 50,  }} barCategoryGap={10} barGap={1}>
                                <XAxis dataKey="date" />
                                <YAxis
                                    label={{
                                        value: 'Number Of Token',
                                        angle: -90,
                                        position: 'insideLeft',
                                        offset: 10,
                                    }}
                                />
                                <Tooltip />
                                <Legend />

                                {services.map((service, index) => (
                                    <Bar key={service} dataKey={service} fill={colors[index % colors.length]} barSize={5} />
                                ))}
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
    );
}
