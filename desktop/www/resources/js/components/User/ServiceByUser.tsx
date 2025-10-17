'use client';

import { useEffect, useState } from 'react';

export default function ServiceByUser() {
    const [item, setItem] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchLastLogin = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/service-by-user`);
            const json = await res.json();
            setItem(json);
        } catch (err) {
            console.error('Failed to fetch service-by-user', err);
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
               <p> {item.name}</p>
            ) : (
                <p className="text-gray-500">No login record found.</p>
            )}
        </div>
    );
}
