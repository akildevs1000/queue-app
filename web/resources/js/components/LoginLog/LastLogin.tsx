'use client';

import { useEffect, useState } from 'react';

export default function LastLogin() {
    const [log, setLog] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const fetchLastLogin = async () => {
        try {
            setLoading(true);
            const res = await fetch(`/last-login`);
            const json = await res.json();
            setLog(json);
        } catch (err) {
            console.error('Failed to fetch last login', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // fetchLastLogin();
    }, []);

    return (
        <div className="">
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : log ? (
                <div className="space-y-2 text-sm">
                    <p> {log.formatted_logged_in_at}</p>
                </div>
            ) : (
                <p className="text-gray-500">No login record found.</p>
            )}
        </div>
    );
}
