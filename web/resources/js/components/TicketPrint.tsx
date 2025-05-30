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
    return (
        <div className="mx-auto w-[260px] border border-dashed border-gray-300 bg-white p-2 font-mono text-sm text-black shadow-md">
            <div className="text-sm font-semibold">{name}</div>
            <div className="text-md mt-2">Ticket</div>
            <div className="my-1 text-3xl font-bold"> {token_number_display}</div>
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
    );
};

export default TicketPrint;
