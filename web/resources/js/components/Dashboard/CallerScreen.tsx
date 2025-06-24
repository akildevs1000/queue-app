import { SharedData, TokenCounts } from '@/types';
import { usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';
import { Button } from '../ui/button';

import ManualCall from './ManualCall';

interface TokenInfo {
    id: number;
    token_number_display: string;
}

interface TokenData {
    token: string;
    counter?: number;
    [key: string]: any; // Optional: allows additional fields
}

interface AnnouncerPayload {
    data: TokenData;
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
    const [socketAlert, setSocketAlert] = useState(null);
    const [counter, setCounter] = useState(null);
    const [isServing, setIsServing] = useState<boolean>(false);
    const [totalElapsed, setTotalElapsed] = useState<number>(0);
    const [displayTime, setDisplayTime] = useState<number>(0);
    const [announcerPayload, setAnnouncerPayload] = useState<AnnouncerPayload | null>(null);
    const socketRef = useRef<WebSocket | null>(null);

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

    const handleDataFromManualCall = async (token_number_display: string) => {
        try {
            const nextToken = await fetch(`/manual-call/${token_number_display}`);

            let ticketInfo = await nextToken.json();

            if (!ticketInfo?.id) return;

            setTokenInfo(ticketInfo);

            setStartTime(Date.now()); // timer doest not start sometime
            setIsServing(true);

            const res = await fetch(`/start-serving/${ticketInfo.id}`);
            const json = await res.json();
            if (json && json.counter) {
                const socket = socketRef.current;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const socketPacket: any = {
                        event: 'token-serving',
                        data: json,
                    };
                    setAnnouncerPayload(socketPacket);
                    socket.send(JSON.stringify(socketPacket));

                    socket.send(
                        JSON.stringify({
                            event: 'feedback',
                            data: { counter_id: counter?.id || 0, token_id: ticketInfo.id, ...json },
                        }),
                    );
                } else {
                    console.warn('WebSocket is not open.');
                }
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
            console.error('Failed to fetch feedback-by-counter', err);
        }
    };

    const reCall = async () => {
        if (!tokenInfo?.token_number_display) {
            return;
        }

        setRecallLabel(`Recalling ${tokenInfo?.token_number_display}`);
        setCalling(true);

        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            console.log('🚀 ~ reCall ~ announcerPayload:', announcerPayload);
            socket.send(JSON.stringify(announcerPayload));
        } else {
            console.warn('WebSocket is not open.');
        }

        let timer: ReturnType<typeof setTimeout>;
        timer = setTimeout(() => {
            setCalling(false);
            setRecallLabel(`Recall`);
        }, 5000);
        return () => clearTimeout(timer);
    };

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

            setTokenInfo(null);

            if (!announcerPayload?.data) return;

            const socket = socketRef.current;
            if (socket?.readyState === WebSocket.OPEN) {
                const endServingSocket = {
                    event: 'token-serving-end',
                    data: announcerPayload.data,
                };

                console.log('🚀 Sending token-serving-end event:', endServingSocket);
                socket.send(JSON.stringify(endServingSocket));
                fetchTokenCounts();
            } else {
                console.warn('⚠️ WebSocket is not open.');
            }
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

        if (!announcerPayload?.data) return;

        const socket = socketRef.current;
        if (socket?.readyState === WebSocket.OPEN) {
            const endServingSocket = {
                event: 'token-serving-end',
                data: announcerPayload.data,
            };

            console.log('🚀 Sending token-serving-end event:', endServingSocket);
            socket.send(JSON.stringify(endServingSocket));
        } else {
            console.warn('⚠️ WebSocket is not open.');
        }

        try {
            await fetch(`/no-show-serving/${tokenInfo?.id}`);

            setTotalElapsed(0);
            setStartTime(null);
            setIsServing(false);
            setDisplayTime(0);
            setTokenInfo(null);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    const nextToken = async () => {
        if (tokenInfo?.token_number_display) return;

        setCalling(true);

        setNextLabel(`Calling Next`);

        try {
            const nextToken = await fetch('/next-token');

            let ticketInfo = await nextToken.json();

            if (!ticketInfo?.id) return;

            setTokenInfo(ticketInfo);
            setStartTime(Date.now()); // timer doest not start sometime
            setIsServing(true);

            const res = await fetch(`/start-serving/${ticketInfo.id}`);
            const json = await res.json();
            if (json && json.counter) {
                const socket = socketRef.current;
                if (socket && socket.readyState === WebSocket.OPEN) {
                    const socketPacket: any = {
                        event: 'token-serving',
                        data: json,
                    };
                    console.log('🚀 ~ nextToken ~ socketPacket:', socketPacket);
                    setAnnouncerPayload(socketPacket);
                    socket.send(JSON.stringify(socketPacket));

                    socket.send(
                        JSON.stringify({
                            event: 'feedback',
                            data: { counter_id: counter?.id || 0, token_id: ticketInfo.id, ...json },
                        }),
                    );
                } else {
                    console.warn('WebSocket is not open.');
                }
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

    const handleSocketConnect = async () => {

        const res = await fetch(`/socket-ip-and-port`);
        
        const json = await res.json();

        if (!json?.ip || !json?.port) {
            console.log("🚀 ~ handleSocketConnect ~ auth?.user:", auth?.user)
            setSocketAlert('Socket not connected');
            return;
        }

        setSocketAlert(null);

        let url = `ws://${json.ip}:${json.port}`;

        const socket = new WebSocket(url);

        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('Connected to WS server');
        });

        socket.addEventListener('message', (event) => {
            try {
                const data = JSON.parse(event.data);
                if (data.event === 'new-ticket') {
                    console.log('Received new-ticket event:', data);
                    fetchTokenCounts();
                } else {
                    // console.log('Received other event:', data);
                }
            } catch (err) {
                console.error('Failed to parse message:', event.data);
            }
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => {
            socket.close();
        };
    };

    useEffect(() => {
        handleSocketConnect();

        const getCounter = async () => {
            try {
                const res = await fetch(`/counter-by-user`);
                const json = await res.json();
                setCounter(json);
            } catch (err) {
                console.error('Failed to fetch last login', err);
            }
        };

        feedbackByCounter();

        getCounter();

        fetchTokenCounts();
    }, []);

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

    return (
        <div className="flex h-full w-full px-15 text-gray-800 dark:bg-gray-900 dark:text-gray-900">
            {/* Left Section - Token Display */}
            <div className="mt-15 flex w-1/2 flex-col">
                <div>
                    <div className="flex flex-col items-center">
                        <h2 className="mb-2 text-lg font-medium text-orange-600 dark:text-orange-400">Current Serving</h2>
                        <h1 className="mb-2 text-2xl font-bold text-blue-900 dark:text-blue-300">Token Number</h1>
                        <div className="w-fit rounded-xl border-2 border-orange-500 px-12 text-[64px] font-bold text-orange-600 dark:border-orange-400 dark:text-orange-400">
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
                {socketAlert && (
                    <div className="mb-4 flex w-full justify-center">
                        <Button
                            onClick={() => {
                                handleSocketConnect();
                            }}
                            className="rounded-lg bg-orange-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                        >
                            {socketAlert} Reconnect
                        </Button>
                    </div>
                )}

                {!socketAlert && (
                    <>
                        {/* Top: User Info */}
                        <div className="mb-0 flex flex-wrap gap-6 lg:flex-nowrap">
                            {/* Profile Info - wider section */}
                            {/* <div className="w-full rounded-xl p-6 lg:w-3/2">
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
                                {counter && counter?.name}
                            </div>
                        </div>
                    </div> */}

                            {/* Performance Status - narrower section */}
                            {/* <div className="w-full rounded-xl p-6 lg:w-1/3">
                        <h2 className="mb-4 text-xl font-semibold text-blue-900 dark:text-blue-300">Performance</h2>
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium text-orange-600 dark:text-orange-400">
                                <b>{performance}</b>
                            </span>
                        </div>
                    </div> */}
                        </div>

                        {/* Bottom: Buttons */}
                        {/* Socket Alert */}

                        <div className="flex flex-col items-center space-y-4">
                            {/* Buttons Grid */}
                            <div className="grid w-full max-w-xl grid-cols-2 gap-4">
                                <Button
                                    onClick={nextToken}
                                    className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                                >
                                    {nextLabel}
                                </Button>
                                <Button
                                    onClick={endServing}
                                    className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                                >
                                    End
                                </Button>
                                <Button
                                    onClick={noShowServing}
                                    className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                                >
                                    No Show
                                </Button>
                                <Button
                                    onClick={reCall}
                                    className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                                >
                                    {recallLabel}
                                </Button>
                                <Button
                                    onClick={toggleServing}
                                    className="rounded-lg bg-indigo-500 p-6 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800"
                                >
                                    {!isServing ? 'Pause' : 'Resume'}
                                </Button>

                                <ManualCall title="Manual Call" onSubmitData={handleDataFromManualCall} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default TokenDisplay;
