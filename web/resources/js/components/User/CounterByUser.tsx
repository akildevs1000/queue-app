'use client';

import { useEffect, useState } from 'react';

export default function CounterByUser() {
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchLastLogin = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/counter-by-user`);
            const json = await res.json();
            setItem(json);
        } catch (err) {
            console.error('Failed to fetch last login', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchLastLogin();
    }, []);

    return (
        <div className="">
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : item ? (
                <div className="space-y-2 text-sm">
                    <p> {item.name}</p>
                </div>
            ) : (
                <p className="text-gray-500">---</p>
            )}
        </div>
    );
}
