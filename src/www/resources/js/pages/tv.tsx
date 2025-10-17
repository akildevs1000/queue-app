import { useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { type TicketPrintProps } from '@/components/TicketPrint';

import { GradientButton } from '@/components/ui/GradientButton';
import { Button } from '@/components/ui/button';

type PageProps = {
    ticketInfo: TicketPrintProps;
};

type Service = {
    id: number;
    name: string;
    code: string;
};

export default function Welcome() {
    const { ticketInfo } = usePage<PageProps>().props;

    const [step, setStep] = useState<'language' | 'service' | 'thankyou'>('language');
    const [services, setServices] = useState<Service[]>([]);
    const socketRef = useRef<WebSocket | null>(null);

    const { data, setData, post } = useForm({
        language: '',
        service_id: 0,
        service_name: '',
        code: '',
    });

    const fetchServices = async (lang: string) => {
        try {
            const res = await fetch(`/service-list?language=${lang}`);
            const json = await res.json();
            setServices(json);
        } catch (err) {
            console.error('Failed to fetch services', err);
        }
    };

    useEffect(() => {
        const fetchSocketIpAndPort = async () => {
            try {
                const res = await fetch(`/socket-ip-and-port`);
                const json = await res.json();
                const socket = new WebSocket(`ws://${json.ip}:${json.port}`);
                socketRef.current = socket;

                socket.addEventListener('open', () => {
                    console.log('Connected to WS server');
                });

                socket.addEventListener('error', (error) => {
                    console.error('WebSocket error:', error);
                });
            } catch (err) {
                console.error('Failed to fetch services', err);
            }
        };

        fetchSocketIpAndPort();
    }, []);

    return (
        <div className="flex h-screen w-full text-gray-800 dark:bg-gray-900 dark:text-gray-900">
            {/* Left Section */}
            <div className="flex w-1/2 flex-col">
                {/* Header (sticks to top) */}
                <div className="w-full bg-gradient-to-r from-blue-500 to-purple-600 p-4 text-xl font-bold text-indigo-700 text-white dark:text-indigo-300">Emirates Islamic Bank</div>
                <div className="w-full p-4 text-xl font-bold text-white dark:text-indigo-300">
                    <div className="mt-2 flex w-full gap-2">
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-500 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                TOKEN
                            </Button>
                        </div>
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-500 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                COUNTER
                            </Button>
                        </div>
                    </div>

                    <div className="mt-2 flex w-full gap-2">
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                P5041
                            </Button>
                        </div>
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                Counter 2
                            </Button>
                        </div>
                    </div>
                      <div className="mt-2 flex w-full gap-2">
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                P5041
                            </Button>
                        </div>
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                Counter 2
                            </Button>
                        </div>
                    </div>
                      <div className="mt-2 flex w-full gap-2">
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                P5041
                            </Button>
                        </div>
                        <div className="flex w-[50%] justify-center">
                            <Button className="w-full text-2xl rounded-lg bg-blue-900 p-7 font-semibold text-white transition hover:bg-indigo-700 dark:border-gray-600 dark:bg-gray-800">
                                Counter 2
                            </Button>
                        </div>
                    </div>
                 
                </div>
            </div>

            {/* Divider */}
            <div className="w-px bg-gray-300 dark:bg-gray-600"></div>

            <div className="flex h-screen w-1/2 items-center justify-center bg-blue-900">
                <div className="flex h-64 w-[600px] overflow-hidden rounded-xl shadow-2xl">
                    <div className="flex w-1/2 items-center justify-center bg-white text-2xl font-bold text-blue-500">
                        <div className="text-purple text-center">
                            <div>Number</div>
                            <div>D7044</div>
                        </div>
                    </div>
                    <div className="flex w-1/2 items-center justify-center bg-blue-500 px-6 text-center text-2xl font-bold break-words text-white">
                        <div>
                            <div>Please proceed to counter</div>
                            <div>5</div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
