import { CardContent } from '@/components/ui/card';
import { Head, useForm } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import { type TicketPrintProps } from '@/components/TicketPrint';

import GradientCard from '@/components/ui/GradientCard';
import { Input } from '@/components/ui/input';

type PageProps = {
    ticketInfo: TicketPrintProps;
};

type Service = {
    id: number;
    name: string;
    code: string;
};

export default function Welcome() {
    const [qrCode, setQrCode] = useState<string | null>(null);
    const lastQrRef = useRef<string | null>(null);

    const [step, setStep] = useState<'language' | 'service' | 'thankyou'>('language');
    const [services, setServices] = useState<Service[]>([]);
    const socketRef = useRef<WebSocket | null>(null);
    const [retrying, setRetrying] = useState(false);
    const socketRetryTimeout = useRef<NodeJS.Timeout | null>(null);

    const { data, setData, post } = useForm({
        language: '',
        service_id: 0,
        service_name: '',
        code: '',
        vip_number: null,
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
        fetchServices('en');
    }, []);

    const handleLanguageSelect = (lang: 'en' | 'ar') => {
        setData('language', lang);
        setStep('service');
    };

    const handleServiceSelect = (service: Service) => {
        const updatedData: any = {
            language: data.language,
            service_id: service.id,
            code: service.code,
            service_name: service.name,
        };

        // Only include vip_number if qrCode has a value
        if (qrCode) {
            updatedData.vip_number = qrCode;
        }

        setData(updatedData);
    };

    useEffect(() => {
        const SOCKET_RETRY_INTERVAL = 5000; // 5 seconds
        const connectSocket = async () => {
            try {
                const res = await fetch(`/socket-ip-and-port`);
                const json = await res.json();
                if (!json?.ip || !json?.port) {
                    setRetrying(true);
                    socketRetryTimeout.current = setTimeout(connectSocket, SOCKET_RETRY_INTERVAL);
                    return;
                }
                setRetrying(false);
                const socket = new WebSocket(`ws://${json.ip}:${json.port}`);
                socketRef.current = socket;

                socket.addEventListener('open', () => {
                    console.log('Connected to WS server');
                    setRetrying(false);
                    if (socketRetryTimeout.current) {
                        clearTimeout(socketRetryTimeout.current);
                        socketRetryTimeout.current = null;
                    }
                });

                const retrySocket = () => {
                    setRetrying(true);
                    socketRetryTimeout.current = setTimeout(connectSocket, SOCKET_RETRY_INTERVAL);
                };

                socket.addEventListener('close', retrySocket);
                socket.addEventListener('error', retrySocket);
            } catch (err) {
                setRetrying(true);
                socketRetryTimeout.current = setTimeout(connectSocket, SOCKET_RETRY_INTERVAL);
                console.error('Failed to fetch services', err);
            }
        };

        connectSocket();

        return () => {
            if (socketRetryTimeout.current) {
                clearTimeout(socketRetryTimeout.current);
            }
        };
    }, []);

    useEffect(() => {
        if (data.service_id) {
            console.log('🚀 ~ Welcome ~ data:', data);
            post('/tokens', {
                onSuccess: () => {
                    setStep('thankyou');

                    const socket = socketRef.current;
                    if (socket && socket.readyState === WebSocket.OPEN) {
                        const endServingSocket = {
                            event: 'new-ticket',
                        };

                        socket.send(JSON.stringify(endServingSocket));
                    } else {
                        console.warn('WebSocket is not open.');
                    }

                    setQrCode(null);

                    setStep('language');

                    setData({
                        language: '',
                        service_id: 0,
                        service_name: '',
                        code: '',
                        vip_number: null,
                    });
                },
                onFinish: () => {},
                onError: (errors) => {
                    console.error('Form submission failed', errors);
                },
            });
        }
    }, [data]);

    useEffect(() => {
        if (qrCode && qrCode !== lastQrRef.current) {
            const timer = setTimeout(() => {
                console.log('🚀 Updating code with QR value:', qrCode);
                // Only update if it's a new QR code
                setData((prev) => ({ ...prev, vip_number: qrCode }));
                lastQrRef.current = qrCode;
            }, 1000); // 1 second delay

            // Cleanup if qrCode changes before timeout finishes
            return () => clearTimeout(timer);
        }
    }, [qrCode, setData]);

    const handleQrCodeChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setQrCode(newValue);
        console.log('✅ QR Code set:', newValue);
    };

    return (
        <div className="relative flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center">
            <Head title="Guest" />

            <div>
                {retrying && (
                    <div className="fixed top-0 left-0 z-50 w-full bg-yellow-500 py-1 text-center text-sm text-white shadow">
                        Retrying connection to server...
                    </div>
                )}
                {/* Step 1: Language Selection */}
                {step === 'language' && (
                    <div className="space-y-6">
                        <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">Please choose your language</h1>
                        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                            <GradientCard onClick={() => handleLanguageSelect('en')}>
                                <CardContent className="py-10 text-xl font-semibold">English</CardContent>
                            </GradientCard>
                            <GradientCard onClick={() => handleLanguageSelect('ar')}>
                                <CardContent className="py-10 text-xl font-semibold">العربية</CardContent>
                            </GradientCard>
                        </div>
                    </div>
                )}
                {step === 'service' && data.language && (
                    <>
                        <div className="space-y-6">
                            <h1 className="text-3xl font-bold text-gray-800 dark:text-gray-100">
                                {data.language === 'en' ? 'Please select a service' : 'الرجاء اختيار الخدمة'}
                            </h1>
                            <div className="mx-auto grid max-w-md grid-cols-1 gap-6 md:grid-cols-2">
                                {services.map((service) => (
                                    <GradientCard
                                        key={service.id}
                                        onClick={() => handleServiceSelect(service)}
                                        className="cursor-pointer transition-transform hover:scale-105"
                                    >
                                        <CardContent className="py-10 text-xl font-semibold">{service.name}</CardContent>
                                    </GradientCard>
                                ))}
                            </div>
                        </div>
                        <div className="absolute left-[500px]">
                            <Input value={qrCode || ''} onChange={handleQrCodeChange} autoFocus />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
}
