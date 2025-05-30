import { PageProps as InertiaPageProps } from '@inertiajs/core';
import { useForm, usePage } from '@inertiajs/react';
import React, { useState } from 'react';

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

    const [showSuccess, setShowSuccess] = useState(false);

    const { data, setData, reset, post, processing, errors } = useForm<{ rating: number | null }>({
        rating: null,
    });

    const handleRating = (value: number) => {
        setData('rating', value);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        if (data.rating === null) return;

        post('/feedback', {
            onSuccess: () => {
                reset('rating'); // reset only the rating field after success
                setShowSuccess(true);
                const timer = setTimeout(() => setShowSuccess(false), 5000);
                return () => clearTimeout(timer);
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

                {showSuccess && <p className="mt-1 text-xs text-green-500">{success}</p>}

                <button
                    type="submit"
                    disabled={processing || data.rating === null}
                    className="mt-4 rounded bg-blue-600 px-4 py-2 text-white hover:bg-blue-700 disabled:opacity-50"
                >
                    {processing ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default FeedbackScreen;
