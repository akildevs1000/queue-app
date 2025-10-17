import { useEffect, useRef, useState } from 'react';
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis,Legend } from 'recharts';
import { GradientButton } from '../ui/GradientButton';

export default function App() {
    const [data, setData] = useState([]);

    const [services, setServices] = useState([]);

    const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7f50', '#a569bd', '#f4d03f', '#5dade2', '#48c9b0'];

    // Pagination state for server-side pagination
    const [pagination, setPagination] = useState({
        pageIndex: 0,
        pageSize: 10,
    });

    // Total pages returned from backend

    useEffect(() => {
        // Fetch data whenever pagination changes (pageIndex or pageSize)
        const fetchData = async () => {
            try {
                // Laravel pagination uses 1-based pages, but pageIndex is 0-based
                const page = pagination.pageIndex + 1;

                const url = new URL('/peak-hour-report', window.location.origin);
                const res = await fetch(url.toString());
                const data = await res.json();

                setData(data); // paginated data array

                if (data.length > 0) {
                    const first = data[0];
                    const dynamicServices: any = Object.keys(first).filter((key) => key !== 'time');
                    setServices(dynamicServices);
                }

                // Optionally sync pagination state if backend sends a different current page
                if (data.current_page !== page) {
                    setPagination((old) => ({
                        ...old,
                        pageIndex: data.current_page - 1,
                    }));
                }
            } catch (error) {
                console.error('Failed to fetch data:', error);
            }
        };

        fetchData();
    }, []); // re-fetch on page or size change

    const handleDownloadChart = () => {
        const svgElement = chartRef.current?.querySelector('svg');
        if (!svgElement) return;

        const serializer = new XMLSerializer();
        const svgString = serializer.serializeToString(svgElement);

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const svg = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
        const url = URL.createObjectURL(svg);

        const img = new Image();
        img.onload = () => {
            canvas.width = svgElement.clientWidth;
            canvas.height = svgElement.clientHeight;
            ctx?.drawImage(img, 0, 0);
            URL.revokeObjectURL(url);

            const pngUrl = canvas.toDataURL('image/png');
            const downloadLink = document.createElement('a');
            downloadLink.href = pngUrl;
            downloadLink.download = 'peak-hours-chart.png';
            downloadLink.click();
        };
        img.src = url;
    };

    const chartRef = useRef(null);

    return (
        <>
            <div className="flex w-full flex-wrap items-center justify-between gap-2 rounded-lg p-5">
                <div></div>
                <div>
                    <GradientButton onClick={handleDownloadChart}>Print/Download </GradientButton>
                </div>
            </div>

            <div className="flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                <div className="gap-4 rounded-xl bg-[var(--background)] p-4 text-[var(--foreground)] dark:border-gray-700">
                    <h2 className="mb-4 text-lg font-semibold">Peak Hours Report (Yesterday)</h2>

                    <div ref={chartRef} style={{ width: '90%', height: 400, margin: 'auto' }}>
                        <h3 style={{ textAlign: 'center' }}>Queue Flow (to identify peak Hours)</h3>
                        <ResponsiveContainer width="100%" height={500}>
                            <BarChart data={data} margin={{ top: 20, right: 50, left: 50, bottom: 20 }} barCategoryGap={10} barGap={1}>
                                <XAxis dataKey="time" />
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
        </>
    );
}
