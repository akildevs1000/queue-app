import { SharedData, TokenCounts } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useState } from 'react';
import { Button } from '../ui/button';

import CounterByUser from '../User/CounterByUser';
import ServiceByUser from '../User/ServiceByUser';
import ManualCall from './ManualCall';

interface TokenInfo {
    id: number;
    token_number_display: string;
}

const TokenDisplay = () => {
    const { auth } = usePage<SharedData>().props;

    const [tokenCounts, setTokenCounts] = useState<TokenCounts | null>(null);
    const [tokenInfo, setTokenInfo] = useState<TokenInfo | null>(null);
    const [calling, setCalling] = useState(false);
    const [nextLabel, setNextLabel] = useState('Next');
    const [recallLabel, setRecallLabel] = useState('Recall');

    const [startTime, setStartTime] = useState<number | null>(null);
    const [performance, setPerformance] = useState(null);
    const [isServing, setIsServing] = useState<boolean>(false);
    const [isPreviousToken, setIsPreviousToken] = useState<boolean>(false);
    const [totalElapsed, setTotalElapsed] = useState<number>(0);
    const [displayTime, setDisplayTime] = useState<number>(0);

    // Assuming you have `auth.user` available like:
    const user = auth.user || {
        name: 'John Doe',
        email: 'john@example.com',
    };

    const fetchTokenCounts = async () => {
        try {
            const res = await fetch('/token-counts');
            const json = await res.json();
            setTokenCounts(json);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const getLastserving = async () => {
        try {
            const res = await fetch('/get-last-serving');
            const json = await res.json();
            if (json) {
                setTokenInfo(json);
            }
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const feedbackByCounter = async () => {
        try {
            const res = await fetch('/feedback-by-counter');
            const json = await res.json();
            setPerformance(json);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const announceTheToken = (ticketInfo: any) => {
        const token = ticketInfo?.token_number_display;

        if (token) {
            const message = `Token ${token}, please proceed to the counter.`;
            console.log(message);

            // Voice announcement
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.lang = 'en-US'; // Optional: set the language/accent
            speechSynthesis.speak(utterance);
        } else {
            console.warn('No token information available to announce.');
        }
    };

    const reCall = async () => {
        if (!tokenInfo?.token_number_display) {
            return;
        }
        setRecallLabel(`Recalling ${tokenInfo?.token_number_display}`);
        announceTheToken(tokenInfo);
        setCalling(true);
        let timer: ReturnType<typeof setTimeout>;
        timer = setTimeout(() => {
            setCalling(false);
            setRecallLabel(`Recall`);
        }, 5000);
        return () => clearTimeout(timer);
    };

    // Start serving: begin timer

    // Pause serving: add elapsed time since last start, stop timer
    const pauseServing = () => {
        if (isServing && startTime !== null) {
            const now = Date.now();
            const elapsed = Math.floor((now - startTime) / 1000);
            setTotalElapsed((prev) => prev + elapsed);
            setStartTime(null);
            setIsServing(false);
        }
    };

    const resumeServing = () => {
        if (!isServing && tokenInfo) {
            setStartTime(Date.now()); // this is the correct point in time from now
            setIsServing(true);
        }
    };

    const toggleServing = () => {
        if (isServing) {
            // Pause if currently serving
            pauseServing();
        } else {
            // Resume if currently paused
            resumeServing();
        }
    };

    const notFoundToken = () => {
        if (!tokenCounts?.pending) {
            console.log('Not found new token');
            return true;
        }

        return false;
    };

    const endServing = async () => {
        if (!tokenInfo?.token_number_display) return;

        let finalElapsed = totalElapsed;
        if (isServing && startTime !== null) {
            const now = Date.now();
            finalElapsed += Math.floor((now - startTime) / 1000);
        }
        console.log('Total time served:', formatTime(finalElapsed));

        try {
            await fetch(`/end-serving/${tokenInfo?.id}?total_serving_time_display=${formatTime(finalElapsed)}`);

            setTotalElapsed(0);
            setStartTime(null);
            setIsServing(false);
            setDisplayTime(0);

            getLastserving();
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const noShowServing = async () => {
        let finalElapsed = totalElapsed;
        if (isServing && startTime !== null) {
            const now = Date.now();
            finalElapsed += Math.floor((now - startTime) / 1000);
        }

        try {
            await fetch(`/no-show-serving/${tokenInfo?.id}`);

            setTotalElapsed(0);
            setStartTime(null);
            setIsServing(false);
            setDisplayTime(0);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const nextToken = async () => {
        if (!tokenInfo?.token_number_display) return;

        setCalling(true);

        setNextLabel(`Calling Next`);

        try {
            console.log('🚀 ~ noShowServing ~ tokenInfo:', tokenInfo);

            let ticketInfo = null;

            if (tokenInfo) {
                ticketInfo = tokenInfo;
            } else {
                const res = await fetch('/next-token');
                ticketInfo = await res.json();
            }

            if (ticketInfo?.id) {
                setTokenInfo(ticketInfo);

                setStartTime(Date.now()); // timer doest not start sometime
                setIsServing(true);

                const res = await fetch(`/start-serving/${ticketInfo.id}`);
                const json = await res.json();
                console.log('Started serving:', json);
                announceTheToken(ticketInfo);
            } else {
                console.warn('No next token received.');
            }
        } catch (err) {
            console.error('Failed to fetch services', err);
        } finally {
            let timer: ReturnType<typeof setTimeout>;
            timer = setTimeout(() => {
                setCalling(false);
                setNextLabel(`Next`);
            }, 1000);
            return () => clearTimeout(timer);
        }
    };

    const formatTime = (totalSeconds: number): string => {
        const hrs = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
        const mins = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
        const secs = String(totalSeconds % 60).padStart(2, '0');
        return `${hrs}:${mins}:${secs}`;
    };

    useEffect(() => {
        let interval: NodeJS.Timeout;

        if (isServing && startTime !== null) {
            interval = setInterval(() => {
                const now = Date.now();
                const sessionSeconds = Math.floor((now - startTime) / 1000);
                setDisplayTime(totalElapsed + sessionSeconds);
            }, 1000);
        } else {
            // When paused or stopped, show the saved totalElapsed time
            setDisplayTime(totalElapsed);
        }

        return () => clearInterval(interval);
    }, [isServing, startTime, totalElapsed]);

    useEffect(() => {
        getLastserving();
        fetchTokenCounts();

        const interval = setInterval(() => {
            feedbackByCounter();
            fetchTokenCounts();
        }, 5000);

        return () => clearInterval(interval); // cleanup when component unmounts

        // isPreviousTokenExist();
    }, []);

    return (
        <div className="flex h-full w-full px-15 text-gray-800 dark:bg-gray-900 dark:text-gray-900">
            {/* Left Section - Token Display */}
            <div className="flex w-1/2 flex-col justify-center">
                <div>
                    <div className="flex flex-col items-center">
                        <h2 className="mb-2 text-lg font-medium text-orange-600 dark:text-orange-400">Current Serving</h2>
                        <h1 className="mb-4 text-2xl font-bold text-blue-900 dark:text-blue-300">Token Number</h1>
                        <div className="w-fit rounded-xl border-2 border-orange-500 px-12 py-6 text-[64px] font-bold text-orange-600 dark:border-orange-400 dark:text-orange-400">
                            {tokenInfo?.token_number_display ?? '---'}
                        </div>
                        <div className="mt-6 text-center">
                            <p className="mb-1 text-sm text-gray-500 dark:text-gray-400">Serving Time</p>
                            <p className="text-3xl font-bold text-blue-900 dark:text-blue-300"> {formatTime(displayTime)}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-8 flex justify-between text-center">
                    <div>
                        <p className="mb-1 text-lg font-medium text-gray-500 dark:text-gray-400">Total Served Tokens</p>
                        <p className="text-xl font-bold text-blue-900 dark:text-blue-300">{tokenCounts?.served}</p>
                    </div>
                    <div>
                        <p className="mb-1 text-lg font-medium text-gray-500 dark:text-gray-400">Total Pending</p>
                        <p className="text-xl font-bold text-orange-600 dark:text-orange-400">{tokenCounts?.pending}</p>
                    </div>
                </div>
            </div>

            <div className="mx-4 w-px bg-gray-300 dark:bg-gray-600"></div>

            {/* this right section make it nice and show profole info also like name email last login i have user info in auth.user */}

            {/* Right Section - User Info & Buttons */}
            <div className="flex h-full w-1/2 flex-col justify-center px-15">
                {/* Top: User Info */}
                <div className="mb-10 flex flex-wrap gap-6 lg:flex-nowrap">
                    {/* Profile Info - wider section */}
                    <div className="w-full rounded-xl p-6 lg:w-3/2">
                        <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-300">Profile Info</h2>
                        <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                            <p>
                                <span className="font-medium text-gray-500 dark:text-gray-400">Name:</span> {user.name}
                            </p>
                            <p>
                                <span className="font-medium text-gray-500 dark:text-gray-400">Email:</span> {user.email}
                            </p>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-500 dark:text-gray-400">Service:</span>
                                <div>
                                    <ServiceByUser />
                                </div>
                            </div>
                            <div className="flex items-center gap-1">
                                <span className="font-medium text-gray-500 dark:text-gray-400">Counter:</span>
                                <CounterByUser />
                            </div>
                        </div>
                    </div>

                    {/* Performance Status - narrower section */}
                    <div className="w-full rounded-xl p-6 lg:w-1/3">
                        <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-300">Performance</h2>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                                <b>{performance}</b>
                            </span>
                        </div>
                    </div>
                </div>

                {/* Bottom: Buttons */}
                <div className="flex flex-col items-center space-y-2">
                    <Button
                        onClick={nextToken}
                        className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                    >
                        {nextLabel}
                    </Button>
                    <Button
                        onClick={endServing}
                        className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                    >
                        End
                    </Button>
                    <Button
                        onClick={noShowServing}
                        className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                    >
                        No Show
                    </Button>
                    <Button
                        onClick={reCall}
                        className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                    >
                        {recallLabel}
                    </Button>
                    {/* Call for previous token */}

                    <ManualCall title="Call Manual" endpoint="call_manual" />

                    <Button
                        onClick={toggleServing}
                        className="w-1/2 rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                    >
                        {!isServing ? 'Pause' : 'Resume'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default TokenDisplay;
