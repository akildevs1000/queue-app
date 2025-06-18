import { CardContent } from '@/components/ui/card';
import { Head, useForm, usePage } from '@inertiajs/react';
import { useEffect, useRef, useState } from 'react';

import TicketPrint, { type TicketPrintProps } from '@/components/TicketPrint';

import GradientCard from '@/components/ui/GradientCard';

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

    const handleLanguageSelect = (lang: 'en' | 'ar') => {
        setData('language', lang);
        setStep('service');
        fetchServices(lang);
    };

    const handleServiceSelect = (service: Service) => {
        // Prepare new data object
        const updatedData = {
            language: data.language,
            service_id: service.id,
            code: service.code,
            service_name: service.name,
        };

        setData(updatedData);
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

    useEffect(() => {
        if (data.service_id) {
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
                },
                onFinish: () => {},
                onError: (errors) => {
                    console.error('Form submission failed', errors);
                },
            });
        }
    }, [data]);

    // Reset after 5 seconds on thankyou step
    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (step === 'thankyou') {
            timer = setTimeout(() => {
                // Reset step to language and clear form & services
                setStep('language');
                setData({
                    language: '',
                    service_id: 0,
                    service_name: '',
                    code: '',
                });
                setServices([]);
            }, 1000);
        }
        return () => clearTimeout(timer);
    }, [step, setData]);

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#f5f5f5] px-4 text-center">
            <Head title="Guest" />

            <div>
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
                )}
            </div>
            <div>
                {/* Step 3: Thank You Message */}
                {step === 'thankyou' && ticketInfo && <TicketPrint {...ticketInfo} />}
            </div>
        </div>
    );
}
