'use client';

import { useEffect, useState } from 'react';

export default function LastLogin() {
    const [performance, setPerformance] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    const feedbackByCounter = async () => {
        try {
            const res = await fetch('/feedback-by-counter');
            const json = await res.json();
            setPerformance(json);
        } catch (err) {
            console.error('Failed to fetch feedback-by-counter', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        feedbackByCounter();
    }, []);

    return (
        <div className="">
            {loading ? (
                <p className="text-gray-500">Loading...</p>
            ) : performance ? (
                <p>{performance}</p>
            ) : (
                <p className="text-gray-500">No Performance.</p>
            )}
        </div>
    );
}
