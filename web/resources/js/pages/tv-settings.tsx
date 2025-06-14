import { CardContent } from '@/components/ui/card';
import GradientCard from '@/components/ui/GradientCard';
import { Head } from '@inertiajs/react';
import { useEffect, useRef } from 'react';

type Service = {
    id: number;
    name: string;
    code: string;
};

export default function Welcome() {
    const socketRef = useRef<WebSocket | null>(null);

    const sendTriggerForTvSettings = () => {
        const socket = socketRef.current;
        if (socket && socket.readyState === WebSocket.OPEN) {
            let payload = {
                event: 'trigger-settings',
            };
            socket.send(JSON.stringify(payload));
        } else {
            console.warn('WebSocket is not open.');
        }
    };

    useEffect(() => {
        const socket = new WebSocket('ws://192.168.3.245:7777');
        socketRef.current = socket;

        socket.addEventListener('open', () => {
            console.log('Connected to WS server');
        });

        socket.addEventListener('error', (error) => {
            console.error('WebSocket error:', error);
        });

        return () => {
            socket.close();
        };
    }, []);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center">
            <Head title="Tv Setting" />
            <div>
                <div className="space-y-6">
                    <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Please Open the TV settings</h1>
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-1">
                        <GradientCard onClick={() => sendTriggerForTvSettings()}>
                            <CardContent className="py-10 text-xl font-semibold">Send Trigger</CardContent>
                        </GradientCard>
                    </div>
                </div>
            </div>
        </div>
    );
}
