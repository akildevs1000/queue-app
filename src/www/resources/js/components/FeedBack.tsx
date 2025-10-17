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
    error?: string;
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
    const { success, error } = usePage<PageProps>().props;
    const { auth } = usePage<SharedData>().props;

    const socketRef = useRef<WebSocket | null>(null);

    useEffect(() => {

        let url = `ws://${auth?.user?.ip}:${auth?.user?.port}`;
        const socket = new WebSocket(url);
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('Connected to WS server');
        });

        socket.addEventListener('message', (e) => {
            try {
                const { event, data } = JSON.parse(e.data);

                if (event === 'feedback' && auth.user.counter_id == data.counter_id) {
                    setData('token_id', data.token_id);
                }
            } catch (err) {
                console.error('Failed to parse message:', e.data);
            }
        });
    }, []);

    const [showAlert, setShowAlert] = useState(false);
    const [cooldown, setCooldown] = useState(false);

    const { data, setData, reset, post, processing, errors } = useForm<{ rating: number | null; token_id: number | null }>({
        rating: null,
        token_id: null,
    });

    const handleRating = (value: number) => {
        setData('rating', value);
    };

    useEffect(() => {
        if (success || error) {
            setShowAlert(true);

            const successTimer = setTimeout(() => {
                setShowAlert(false);
            }, 5000);

            return () => clearTimeout(successTimer);
        }
    }, [success, error]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.rating === null || data.token_id === null || cooldown) return;

        post('/feedback', {
            onSuccess: () => {
                reset();
                setShowAlert(true);
                setCooldown(true);

                const successTimer = setTimeout(() => setShowAlert(false), 5000);
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
            {showAlert && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div
                        className={`animate-pop rounded-xl border px-10 py-6 text-center shadow-2xl ${
                            success ? 'border-green-300 bg-white' : 'border-red-300 bg-white'
                        }`}
                    >
                        <p className={`mb-2 text-3xl font-bold ${success ? 'text-green-600' : 'text-red-600'}`}>{success ? 'Success!' : 'Error!'}</p>
                        <p className="text-lg text-gray-800">{success || error}</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default FeedbackScreen;
