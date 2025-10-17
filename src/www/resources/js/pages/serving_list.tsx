import { useEffect, useState } from 'react';

type Counter = {
    name: string;
};

type Token = {
    token_number_display: string;
    counter: Counter;
};

export default function Welcome() {
    const [tokens, setTokens] = useState<Token[]>([]);

    const fetchTokenCounts = async () => {
        try {
            const res = await fetch('/tokens');
            const json = await res.json();
            console.log('🚀 ~ fetchTokenCounts ~ json:', json);
            setTokens(json.data);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    useEffect(() => {
        const interval = setInterval(
            () => {
                fetchTokenCounts(); // your function to refresh the token counts
            },
            5 * 1 * 1000,
        ); // 5 minutes in milliseconds

        return () => clearInterval(interval); // cleanup when component unmounts
    }, []);

    return (
        <div className="flex h-screen bg-gray-100 dark:bg-gray-900">
            {/* Left Section - Placeholder for video */}
            <div className="flex w-1/2 items-center justify-center border-r border-gray-300 dark:border-gray-700">
                <div className="text-gray-400 italic dark:text-gray-600">Video area (coming soon)</div>
            </div>

            {/* Right Section - Table */}
            <div className="flex w-1/2 justify-center">
                <div className="w-full rounded-2xl bg-white shadow-lg dark:bg-gray-800">
                    <div className="overflow-x-hidden">
                        <table className="w-full table-auto rounded-md border border-gray-200 text-left text-sm dark:border-gray-700">
                            <thead className="bg-gray-100 dark:bg-gray-700">
                                <tr>
                                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-200">Ticket No.</th>
                                    <th className="p-3 text-center font-semibold text-gray-700 dark:text-gray-200">Counter</th>
                                </tr>
                            </thead>
                            <tbody>
                                {tokens.length > 0 ? (
                                    tokens.map((customer, index) => (
                                        <tr
                                            key={index}
                                            className="border-t border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-600 dark:hover:bg-gray-700"
                                        >
                                            <td className="p-3 text-center font-mono text-gray-800 dark:text-gray-100">{customer?.token_number_display}</td>
                                            <td className="p-3 text-center text-gray-700 dark:text-gray-300">Counter {customer?.counter?.name}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <></>
                                )}
                            </tbody>
                        </table>
                    </div>
                    <div className="flex h-full w-full items-center justify-center p-3 text-center text-gray-500 dark:text-gray-400">
                        No customers found.
                    </div>
                </div>
            </div>
        </div>
    );
}
