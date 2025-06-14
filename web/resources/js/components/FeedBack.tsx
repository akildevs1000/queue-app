import { SharedData } from '@/types';
import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useForm, usePage } from '@inertiajs/react';
import React, { useEffect, useRef, useState } from 'react';

type Rating = {
    value: number;
    emoji: string;
};

interface PageProps extends InertiaPageProps {
    success?: string;
}

const ratings: Rating[] = [
    { value: 1, emoji: '😠' },
    { value: 2, emoji: '😦' },
    { value: 3, emoji: '😟' },
    { value: 4, emoji: '😕' },
    { value: 5, emoji: '😐' },
    { value: 6, emoji: '🙂' },
    { value: 7, emoji: '😊' },
    { value: 8, emoji: '😀' },
    { value: 9, emoji: '😃' },
    { value: 10, emoji: '😍' },
];

const FeedbackScreen: React.FC = () => {
    const { success } = usePage<PageProps>().props;
    const { auth } = usePage<SharedData>().props;

    const socketRef = useRef<WebSocket | null>(null);
    const [counter, setCounter] = useState(null);

    useEffect(() => {
        const getCounter = async () => {
            try {
                const res = await fetch(`/counter-by-user`);
                const json = await res.json();
                setCounter(json);
                console.log('🚀 ~ auth:', auth.user.counter_id, json.id);
            } catch (err) {
                console.error('Failed to fetch last login', err);
            }
        };

        getCounter();

        const socket = new WebSocket('ws://192.168.3.245:7777');
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('Connected to WS server');
        });

        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'feedback') {
                    console.log('Received token-serving event:', data);
                }
            } catch (err) {
                console.error('Failed to parse message:', event.data);
            }
        });
    }, []);

    const [showSuccess, setShowSuccess] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    const { data, setData, reset, post, processing, errors } = useForm<{ rating: number | null }>({
        rating: null,
    });

    const handleRating = (value: number) => {
        setData('rating', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (data.rating === null || cooldown) return;

        post('/feedback', {
            onSuccess: () => {
                reset('rating');
                setShowSuccess(true);
                setCooldown(true);

                const successTimer = setTimeout(() => setShowSuccess(false), 5000);
                const cooldownTimer = setTimeout(() => setCooldown(false), 60000); // 1 minute cooldown

                return () => {
                    clearTimeout(successTimer);
                    clearTimeout(cooldownTimer);
                };
            },
        });
    };

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50">
            <form onSubmit={handleSubmit} className="w-[700px] rounded-md border border-gray-300 bg-white p-4 text-center font-mono shadow-md">
                <h2 className="mb-2 text-lg font-semibold">How was your experience?</h2>
                <div className="flex flex-wrap justify-center gap-2">
                    {ratings.map(({ value, emoji }) => (
                        <button
                            key={value}
                            type="button"
                            onClick={() => handleRating(value)}
                            className={`h-12 w-10 rounded-md text-2xl transition-all ${
                                data.rating === value ? 'scale-110 bg-blue-500 text-white' : 'bg-gray-100 hover:bg-gray-200'
                            }`}
                            aria-label={`Rate ${value}`}
                        >
                            {emoji}
                        </button>
                    ))}
                </div>

                {data.rating && (
                    <p className="mt-4 text-sm">
                        You selected: <span className="font-bold">{data.rating}</span>
                    </p>
                )}

                {errors.rating && <p className="mt-1 text-xs text-red-500">{errors.rating}</p>}

                <button
                    type="submit"
                    disabled={processing || data.rating === null || cooldown}
                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? 'Submitting...' : cooldown ? 'Submit' : 'Submit'}
                </button>
            </form>
            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="animate-pop rounded-xl border border-green-300 bg-white px-10 py-6 text-center shadow-2xl">
                        <p className="mb-2 text-3xl font-bold text-green-600">🎉 Success!</p>
                        <p className="text-lg text-gray-800">{success || 'Thank you for your feedback!'}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackScreen;
