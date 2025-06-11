import React, { useEffect } from 'react';

export type TicketPrintProps = {
    name: string;
    token_number_display: number;
    service: string;
    already_waiting_count: number;
    estimated_wait_time: number;
    date: string;
    time: string;
    code: string;
};

const TicketPrint = ({
    name = 'ABC Hospital',
    token_number_display,
    service,
    already_waiting_count,
    estimated_wait_time,
    date,
    time,
    code,
}: TicketPrintProps) => {
    useEffect(() => {
        // Automatically open the print dialog
        window.print();
    }, []);

    return (
        <>
            {/* Optional inline CSS to control print layout (not global) */}
            <style>
                {`@media print {
                    @page {
                        size: auto;
                        margin: 0;
                    }
                    body {
                        margin: 0;
                        padding: 0;
                        overflow: hidden;
                    }
                }`}
            </style>

            <div
                className="
                    mx-auto 
                    w-[260px] 
                    border border-dashed border-gray-300 
                    bg-white 
                    p-2 
                    font-mono 
                    text-sm 
                    text-black 
                    shadow-md

                    print:w-full
                    print:max-w-full
                    print:border-none
                    print:shadow-none
                    print:p-0
                    print:m-0
                    print:overflow-hidden
                    print:h-[50vh]
                    print:break-after-avoid
                "
            >
                <div className="text-sm font-semibold">{name}</div>
                <div className="text-md mt-2">Ticket</div>
                <div className="my-1 text-3xl font-bold">{token_number_display}</div>
                <div className="mb-2 text-sm">
                    {time} {date}
                </div>
                <div className="text-sm">You will be Served</div>
                <div className="text-sm font-semibold">
                    {service} {'SEC'} {code}
                </div>
                <div className="mt-4 text-xs">
                    Total: {already_waiting_count} token waiting for service
                    <br />
                    Average waiting time {estimated_wait_time}
                </div>
            </div>
        </>
    );
};

export default TicketPrint;
